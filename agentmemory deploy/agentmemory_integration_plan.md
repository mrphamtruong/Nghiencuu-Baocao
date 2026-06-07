# Nghiên cứu Dự án `agentmemory` và Phương án Tích hợp với Antigravity

Dự án `agentmemory` (phát triển bởi [rohitg00](https://github.com/rohitg00/agentmemory)) là một giải pháp bộ nhớ bền vững (persistent memory system) được thiết kế riêng cho các AI coding agent (như Claude Code, Cursor, Gemini CLI, Cline, v.v.). Nó giải quyết vấn đề phân mảnh ngữ cảnh và hiện tượng "mất trí nhớ" (forgetfulness) của AI giữa các session làm việc khác nhau trên cùng một dự án.

Tài liệu này phân tích chi tiết về dự án `agentmemory` và đề xuất các phương án tích hợp hệ thống này vào trợ lý lập trình **Antigravity**.

---

## 1. Tổng quan về `agentmemory`

### Ý tưởng cốt lõi
Khi làm việc trên một dự án lớn, các AI coding agent thường mất rất nhiều token để đọc lại mã nguồn hoặc quên đi những quyết định thiết kế quan trọng, convention của dự án, hoặc các bug lịch sử đã được giải quyết ở session trước. `agentmemory` đóng vai trò là một **Shared Memory Layer** (Lớp bộ nhớ chia sẻ) chạy ở chế độ nền (background service).
* **Chia sẻ chéo Agent:** Nếu người dùng sử dụng đồng thời Cursor, Claude Code và Antigravity trên cùng một máy, tất cả các agent này đều có thể truy cập chung một kho lưu trữ ngữ cảnh.
* **Nén ngữ cảnh thông minh:** Thay vì đưa toàn bộ lịch sử chat dài dặc vào prompt, nó tự động trích xuất các "facts" (sự thật), "patterns" (mẫu thiết kế) và lưu lại dưới dạng có cấu trúc để nạp lại dạng Top-K (những ký ức liên quan nhất) khi bắt đầu session mới.

### Kiến trúc Kỹ thuật
* **Storage Layer (Lớp lưu trữ):** Sử dụng cơ sở dữ liệu **SQLite** (`./data/state_store.db`) được quản lý thông qua `iii-engine` (StateModule). Hệ thống lưu trữ các dữ liệu có cấu trúc bao gồm các session, metadata, timeline và quan hệ tri thức (knowledge graph).
* **Giao tiếp:**
  * **REST API:** Chạy mặc định tại `http://localhost:3111/agentmemory/*` với hơn 100 endpoints giúp bất kỳ ứng dụng nào cũng có thể gửi/nhận bộ nhớ thông qua các request HTTP tiêu chuẩn.
  * **MCP Server (Model Context Protocol):** Cung cấp 53 công cụ (tools), 6 tài nguyên (resources) và 3 prompts cho các AI client tương thích với giao thức MCP.
* **Giao diện Trực quan (Real-time Viewer):** Chạy mặc định trên cổng `http://localhost:3113`, cho phép người dùng xem trực quan các ký ức đã lưu, các mối quan hệ (knowledge graph), và lịch sử hoạt động của agent theo thời gian thực.

---

## 2. Các Công cụ (Tools) Chính trong `agentmemory`

Hệ thống cung cấp một tập hợp phong phú các công cụ quản lý vòng đời bộ nhớ:
1. **Ghi nhớ & Tra cứu:**
   * `memory_save`: Lưu một tri thức hoặc quyết định thiết kế cụ thể.
   * `memory_recall` / `memory_smart_search`: Tìm kiếm ngữ nghĩa (semantic) kết hợp từ khóa (keyword/BM25) để lấy ra các ký ức liên quan nhất đến ngữ cảnh hiện tại.
2. **Quản lý file & Lịch sử:**
   * `memory_file_history`: Truy vấn lịch sử các quan sát và thay đổi đối với một file cụ thể (giúp agent hiểu vì sao file đó được thiết kế như vậy).
   * `memory_compress_file`: Nén các file markdown để tiết kiệm token tối đa khi nạp vào context.
3. **Phân tích Hành vi & Đồ thị:**
   * `memory_patterns`: Phát hiện các pattern lặp đi lặp lại trong hoạt động của agent.
   * `memory_relations`: Truy vấn đồ thị tri thức để tìm mối quan hệ giữa các khái niệm trong dự án.
   * `memory_timeline`: Xem tiến trình hoạt động theo trình tự thời gian.
4. **Quản trị (Governance):**
   * `memory_governance_delete`: Xóa các ký ức sai lệch hoặc không còn phù hợp để tránh làm loãng context của AI.

---

## 3. Khả năng Tích hợp và Giá trị mang lại cho Antigravity

Hiện tại, Antigravity sử dụng hệ thống **Knowledge Items (KIs)** tĩnh (lưu trong `<appDataDir>\knowledge`) và lịch sử hội thoại dạng file phẳng `transcript.jsonl`. Việc tích hợp `agentmemory` mang lại những giá trị lớn:

* **Tự động hóa Knowledge Items:** KIs hiện tại cần được cập nhật thủ công hoặc theo các quy trình tĩnh. Với `agentmemory`, các bài học rút ra sau mỗi task thành công có thể tự động được ghi nhớ thông qua `memory_save` và sẵn sàng cho các lần chạy sau.
* **Đồng bộ tri thức đa công cụ:** Người dùng có thể sử dụng Antigravity để code và Cursor/Claude Code để chat. Tri thức tích lũy từ Antigravity sẽ ngay lập tức có hiệu lực trên các công cụ khác và ngược lại.
* **Tránh sửa lỗi lặp lại:** Khi đối mặt với một lỗi hệ thống, Antigravity có thể truy vấn nhanh các session trước để xem lỗi này đã từng xuất hiện chưa và cách xử lý là gì, từ đó đưa ra giải pháp ngay lập tức mà không mất thời gian thử nghiệm lại.

---

## 4. Các Phương án Tích hợp Chi tiết với Antigravity

Chúng ta có 3 phương án chính để tích hợp `agentmemory` vào kiến trúc hiện tại của Antigravity:

### Phương án A: Tích hợp thông qua MCP Client (Khuyên dùng)
Antigravity sẽ đóng vai trò là một MCP Client, kết nối trực tiếp đến MCP Server do `@agentmemory/mcp` cung cấp.

* **Cách triển khai:**
  1. Yêu cầu user khởi chạy server nền thông qua lệnh `npx @agentmemory/agentmemory` hoặc Antigravity tự động kích hoạt nó như một sub-process khi khởi động.
  2. Đăng ký MCP server `@agentmemory/mcp` vào cấu hình MCP của Antigravity:
     ```json
     "agentmemory": {
       "command": "npx",
       "args": ["-y", "@agentmemory/mcp"],
       "env": {
         "AGENTMEMORY_URL": "http://localhost:3111"
       }
     }
     ```
  3. Khi kết nối thành công, Antigravity sẽ tự động thừa hưởng 53 tools của `agentmemory`. Agent có thể tự động quyết định gọi `memory_save` khi giải quyết xong một lỗi khó hoặc `memory_smart_search` trước khi bắt đầu lập kế hoạch (planning mode).
* **Đánh giá:**
  * *Ưu điểm:* Cực kỳ sạch sẽ, tận dụng giao thức chuẩn MCP, không cần viết lại code logic giao tiếp dữ liệu.
  * *Nhược điểm:* Phụ thuộc vào hạ tầng MCP Client của Antigravity.

---

### Phương án B: Xây dựng REST API Wrapper (Tích hợp sâu vào mã nguồn Antigravity)
Nếu Antigravity chưa có hoặc không muốn mở rộng MCP client động, chúng ta có thể tự viết một module client nhỏ trong codebase của Antigravity để gọi trực tiếp các endpoint REST API của `agentmemory` chạy tại `http://localhost:3111`.

* **Cách triển khai:**
  1. Tạo file `agentMemoryClient.ts` trong thư mục dịch vụ của Antigravity.
  2. Implement các method chính:
     ```typescript
     class AgentMemoryClient {
       private baseUrl = "http://localhost:3111/agentmemory";

       async saveMemory(content: string, metadata: any) {
         return fetch(`${this.baseUrl}/save`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ content, metadata })
         });
       }

       async smartSearch(query: string, limit = 5) {
         const res = await fetch(`${this.baseUrl}/smart-search`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ query, limit })
         });
         return res.json();
       }
       
       // Thêm các hàm recall, file_history...
     }
     ```
  3. Gắn hooks vào vòng đời của Antigravity:
     * **Pre-task Hook:** Tự động gọi `smartSearch` với mô tả nhiệm vụ của user, lấy ngữ cảnh liên quan nạp vào System Prompt.
     * **Post-task Hook:** Tự động tổng hợp kết quả (ví dụ từ file `walkthrough.md`) và gọi `saveMemory` để lưu lại kiến thức vừa học được.
* **Đánh giá:**
  * *Ưu điểm:* Kiểm soát hoàn toàn luồng dữ liệu, dễ dàng custom định dạng dữ liệu lưu trữ, độc lập với giao thức MCP.
  * *Nhược điểm:* Phải bảo trì mã nguồn wrapper và xử lý thủ công các trường hợp lỗi kết nối API.

---

### Phương án C: Sử dụng như Công cụ Ngoại vi thông qua CLI (Tích hợp nhanh không can thiệp Codebase)
Tận dụng việc Antigravity có sẵn công cụ chạy Terminal (`run_command`), chúng ta có thể tương tác với `agentmemory` thông qua các lệnh `curl` hoặc chạy các CLI command của `agentmemory`.

* **Cách triển khai:**
  1. Antigravity hướng dẫn người dùng chạy lệnh khởi động server `agentmemory` ở một terminal riêng biệt.
  2. Khi cần lưu hoặc đọc thông tin, Antigravity tự động sinh và thực thi các lệnh shell (ví dụ: `curl -X POST http://localhost:3111/agentmemory/save -d ...` hoặc gọi các command-line tool).
  3. Parse kết quả trả về từ console để đưa vào ngữ cảnh làm việc.
* **Đánh giá:**
  * *Ưu điểm:* Có thể thực hiện ngay lập tức mà không cần sửa đổi bất kỳ dòng code nào trong lõi Antigravity. Rất thích hợp cho việc demo hoặc thử nghiệm nhanh.
  * *Nhược điểm:* Phải xin quyền chạy command từ user nhiều lần, trải nghiệm sử dụng bị gián đoạn và hiệu năng thấp do overhead của tiến trình terminal.

---

## 5. Kế hoạch Thử nghiệm & Triển khai Đề xuất

Để kiểm chứng tính hiệu quả, đề xuất triển khai theo lộ trình **3 bước** sau:

### Bước 1: Thử nghiệm độc lập và Thiết lập Môi trường (Manual Verification)
1. Cài đặt toàn cục `agentmemory`:
   ```bash
   npm install -g @agentmemory/agentmemory
   ```
2. Khởi chạy server nền và truy cập vào Dashboard (`http://localhost:3113`) để làm quen với giao diện.
3. Thử nghiệm lưu một vài "fact" về dự án `d:\Nghiencuu-Baocao` thông qua REST API hoặc UI để kiểm tra tính năng lưu trữ của SQLite.

### Bước 2: Triển khai Tích hợp Bán tự động (Phương án C)
* Viết một script Node.js/Python nhỏ đặt trong thư mục `d:\Nghiencuu-Baocao\scratch` để làm cầu nối giữa file log hội thoại (`transcript.jsonl` của Antigravity) và `agentmemory`.
* Script này sẽ phân tích cú pháp `transcript.jsonl`, trích xuất các câu lệnh, quyết định thiết kế và tự động đẩy lên `http://localhost:3111/agentmemory/save`.
* Đo lường hiệu quả nén dữ liệu và khả năng tìm kiếm ngữ nghĩa thông qua dashboard.

### Bước 3: Đóng gói thành Tính năng Chính thức (Phương án A hoặc B)
* Đưa mã nguồn tích hợp vào codebase chính thức của Antigravity (dưới dạng MCP Client cấu hình sẵn hoặc Client SDK gọi REST API).
* Thiết lập cấu hình tự động bật/tắt dịch vụ `agentmemory` đi kèm với vòng đời của ứng dụng Antigravity.

---

> [!IMPORTANT]
> **Khuyến nghị từ Antigravity:** 
> Phương án **A (MCP Integration)** là phương án tối ưu nhất về lâu dài vì nó tận dụng được tính mở và chuẩn hóa của Model Context Protocol, giúp Antigravity giao tiếp mượt mà với 53 công cụ quản lý của `agentmemory` mà không làm phình to codebase. Tuy nhiên, để thử nghiệm nhanh ngay hôm nay trên workspace của bạn mà không cần code phức tạp, chúng ta có thể bắt đầu với **Bước 1 & Bước 2** của kế hoạch thử nghiệm.
