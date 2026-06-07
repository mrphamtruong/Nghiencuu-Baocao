/**
 * agentmemory_bridge.js
 * 
 * Script Node.js đóng vai trò cầu nối (Bridge) để đồng bộ hóa lịch sử hội thoại
 * và các tri thức của Antigravity vào hệ thống bộ nhớ persistent 'agentmemory'.
 * 
 * Cách chạy:
 *   node agentmemory_bridge.js [đường_dẫn_đến_transcript.jsonl]
 * 
 * Mặc định, nếu không truyền đối số, script sẽ tự động tìm file transcript.jsonl
 * của session hiện tại dựa trên cấu trúc mặc định của Antigravity.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const http = require('http');

// Cấu hình kết nối mặc định đến agentmemory
const AGENTMEMORY_URL = process.env.AGENTMEMORY_URL || 'http://localhost:3111';
const CONVERSATION_ID = '144e240c-a27a-45cb-b8b0-f56df4498011';

// Lấy đường dẫn file log từ đối số command-line hoặc tự động suy luận
// Mặc định tìm file log trong thư mục appData của Antigravity
const defaultLogPath = path.resolve(
  process.env.APPDATA || path.join(require('os').homedir(), '.gemini', 'antigravity-ide'),
  'brain',
  CONVERSATION_ID,
  '.system_generated',
  'logs',
  'transcript.jsonl'
);
const logFilePath = process.argv[2] || defaultLogPath;

console.log('=== Khởi chạy Bridge agentmemory ===');
console.log(`- File log nguồn: ${logFilePath}`);
console.log(`- Server agentmemory: ${AGENTMEMORY_URL}`);
console.log(`- Conversation ID: ${CONVERSATION_ID}`);

if (!fs.existsSync(logFilePath)) {
  console.error(`Error: Không tìm thấy file log tại: ${logFilePath}`);
  process.exit(1);
}

// Hàm gửi POST Request đến REST API của agentmemory
function postToAgentMemory(endpoint, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${AGENTMEMORY_URL}${endpoint}`);
    const postData = JSON.stringify(payload);

    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ success: true, raw: data });
          }
        } else {
          reject(new Error(`Server trả về HTTP Status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// Hàm kiểm tra xem server agentmemory có đang chạy hay không (Health check)
function checkHealth() {
  return new Promise((resolve) => {
    const url = new URL(`${AGENTMEMORY_URL}/agentmemory/health`);
    http.get(url, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    }).on('error', () => {
      resolve(false);
    });
  });
}

// Hàm chính xử lý trích xuất tri thức từ file log
async function processLogs() {
  const isServerRunning = await checkHealth();
  if (!isServerRunning) {
    console.warn(`[Cảnh báo] Không thể kết nối tới server agentmemory tại ${AGENTMEMORY_URL}/agentmemory/health.`);
    console.warn('Hãy chắc chắn rằng bạn đã khởi chạy server bằng lệnh: npx @agentmemory/agentmemory');
    console.warn('Script vẫn sẽ tiến hành trích xuất tri thức nhưng không thể lưu lên server.');
  }

  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const memoriesToSave = [];
  let lineCount = 0;

  for await (const line of rl) {
    lineCount++;
    if (!line.trim()) continue;

    try {
      const step = JSON.parse(line);
      const { source, type, content, tool_calls } = step;

      // 1. Trích xuất yêu cầu rõ ràng từ người dùng
      if (type === 'USER_INPUT' && content) {
        memoriesToSave.push({
          content: `[User Request] Người dùng yêu cầu: ${content.trim()}`,
          metadata: {
            conversationId: CONVERSATION_ID,
            type: 'user_request',
            line: lineCount,
            timestamp: new Date().toISOString()
          }
        });
      }

      // 2. Trích xuất các quyết định thiết kế hoặc bài học rút ra từ phản hồi của Agent
      if (source === 'MODEL' && content && content.includes('#')) {
        // Lọc ra các tiêu đề hoặc kết luận quan trọng (thường chứa ký tự Markdown #)
        const summaryLines = content.split('\n')
          .filter(l => l.startsWith('#') || l.includes('tích hợp') || l.includes('phương án'))
          .join('\n');
        
        if (summaryLines.trim().length > 30) {
          memoriesToSave.push({
            content: `[Agent Solution Summary]\n${summaryLines.trim()}`,
            metadata: {
              conversationId: CONVERSATION_ID,
              type: 'agent_solution_summary',
              line: lineCount,
              timestamp: new Date().toISOString()
            }
          });
        }
      }

      // 3. Trích xuất thông tin sửa đổi file quan trọng
      if (tool_calls && Array.isArray(tool_calls)) {
        for (const tool of tool_calls) {
          if (['write_to_file', 'replace_file_content', 'multi_replace_file_content'].includes(tool.name)) {
            const args = tool.arguments || {};
            const targetFile = args.TargetFile || args.TargetFile;
            const desc = args.Description || 'Không có mô tả chi tiết';

            if (targetFile) {
              const fileName = path.basename(targetFile);
              memoriesToSave.push({
                content: `[File Mutation] Agent đã chỉnh sửa file: ${fileName}. Mục đích: ${desc}`,
                metadata: {
                  conversationId: CONVERSATION_ID,
                  type: 'file_mutation',
                  fileName: fileName,
                  filePath: targetFile,
                  line: lineCount,
                  timestamp: new Date().toISOString()
                }
              });
            }
          }
        }
      }

    } catch (err) {
      console.error(`[Lỗi] Lỗi parse JSON tại dòng ${lineCount}:`, err.message);
    }
  }

  console.log(`\n- Tổng số dòng đã quét: ${lineCount}`);
  console.log(`- Tổng số ký ức đã trích xuất: ${memoriesToSave.length}`);

  if (memoriesToSave.length === 0) {
    console.log('Không tìm thấy ký ức nào phù hợp để đồng bộ.');
    return;
  }

  if (!isServerRunning) {
    console.log('\nChi tiết các ký ức trích xuất được (Chưa lưu vì server off):');
    memoriesToSave.forEach((m, i) => {
      console.log(`\n--- Ký ức #${i + 1} (${m.metadata.type}) ---`);
      console.log(m.content);
    });
    return;
  }

  console.log('\nĐang tiến hành gửi các ký ức lên server agentmemory...');
  let successCount = 0;

  for (const memory of memoriesToSave) {
    try {
      // Gọi REST API của agentmemory để lưu
      // Thường endpoint của agentmemory là /agentmemory/save
      const result = await postToAgentMemory('/agentmemory/save', memory);
      if (result) {
        successCount++;
      }
    } catch (e) {
      console.error(`- Lỗi khi lưu ký ức (${memory.metadata.type}):`, e.message);
      
      // Thử endpoint fallback khác nếu /agentmemory/save bị đổi trong version mới
      try {
        const fallbackResult = await postToAgentMemory('/agentmemory/create', memory);
        if (fallbackResult) {
          successCount++;
        }
      } catch (fallbackError) {
        console.error(`- Thử lại với endpoint /create cũng lỗi:`, fallbackError.message);
      }
    }
  }

  console.log(`\n=== Kết quả đồng bộ ===`);
  console.log(`- Thành công: ${successCount}/${memoriesToSave.length}`);
  console.log(`- Bạn có thể truy cập http://localhost:3113 để xem trực quan các ký ức này.`);
}

// Bắt đầu xử lý
processLogs().catch(err => {
  console.error('Lỗi nghiêm trọng trong tiến trình:', err);
});
