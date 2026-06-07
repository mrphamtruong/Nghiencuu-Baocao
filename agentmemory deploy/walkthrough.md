# Hướng dẫn Vận hành & Nghiệm thu Tích hợp agentmemory

Tài liệu này hướng dẫn bạn cách tự cấu hình môi trường, chạy thử nghiệm hệ thống bộ nhớ persistent `agentmemory` và đồng bộ hóa lịch sử hội thoại của trợ lý Antigravity vào cơ sở dữ liệu tri thức dùng chung.

Vì lý do bảo mật và kiểm soát hệ thống, bạn sẽ tự khởi chạy các dịch vụ này trên terminal của mình theo các bước dưới đây.

---

## 1. Thành phần đã triển khai trong Workspace

* **Kế hoạch Tích hợp:** [agentmemory_integration_plan.md](file:///d:/Nghiencuu-Baocao/agentmemory%20deploy/agentmemory_integration_plan.md)
* **Bảng nhiệm vụ:** [task.md](file:///d:/Nghiencuu-Baocao/agentmemory%20deploy/task.md)
* **Script cầu nối (Bridge Script):** [agentmemory_bridge.js](file:///d:/Nghiencuu-Baocao/agentmemory%20deploy/agentmemory_bridge.js) (Chứa toàn bộ logic trích xuất logs và giao tiếp qua REST API của `agentmemory`).

---

## 2. Hướng dẫn các bước tự thực hiện

### Bước 1: Khởi chạy Server `agentmemory` trên máy của bạn
Bạn có thể khởi chạy server nhanh chóng mà không cần cài đặt cố định bằng cách mở Terminal (PowerShell hoặc Command Prompt) và chạy lệnh sau:

```bash
npx @agentmemory/agentmemory
```

* **Cổng dịch vụ API:** `http://localhost:3111`
* **Kiểm tra trạng thái (Health Check):** Truy cập `http://localhost:3111/agentmemory/health` trên trình duyệt hoặc chạy `curl http://localhost:3111/agentmemory/health`. Kết quả hiển thị thành công chứng tỏ server đã sẵn sàng.
* **Giao diện Viewer trực quan:** Truy cập `http://localhost:3113` để mở bảng điều khiển quản lý bộ nhớ theo thời gian thực.

---

### Bước 2: Chạy Script Cầu nối để trích xuất và đồng bộ bộ nhớ
Mở một cửa sổ Terminal mới và chuyển hướng đến thư mục deploy:

```powershell
cd "d:\Nghiencuu-Baocao\agentmemory deploy"
```

Sau đó chạy script bằng Node.js:

```bash
node agentmemory_bridge.js
```

**Kết quả kỳ vọng trên Console:**
```text
=== Khởi chạy Bridge agentmemory ===
- File log nguồn: C:\Users\MrPhamTruong\.gemini\antigravity-ide\brain\144e240c-a27a-45cb-b8b0-f56df4498011\.system_generated\logs\transcript.jsonl
- Server agentmemory: http://localhost:3111
- Conversation ID: 144e240c-a27a-45cb-b8b0-f56df4498011

- Tổng số dòng đã quét: ...
- Tổng số ký ức đã trích xuất: ...

Đang tiến hành gửi các ký ức lên server agentmemory...

=== Kết quả đồng bộ ===
- Thành công: .../...
- Bạn có thể truy cập http://localhost:3113 để xem trực quan các ký ức này.
```

> [!NOTE]
> Nếu bạn chạy script khi server `agentmemory` **chưa bật**, script vẫn sẽ chạy bình thường ở chế độ **Dry-run**. Nó sẽ in ra console danh sách các "ký ức" (memories) đã trích xuất được từ cuộc hội thoại để bạn xem trước nội dung mà không đẩy lên database.

---

### Bước 3: Nghiệm thu kết quả trên Dashboard
1. Mở trình duyệt web của bạn và truy cập: **`http://localhost:3113`**
2. Bạn sẽ thấy danh sách các ký ức vừa được đồng bộ.
3. Ký ức được chia thành các loại:
   * **`user_request`**: Các câu hỏi hoặc yêu cầu mà bạn đã gửi cho Antigravity.
   * **`agent_solution_summary`**: Các tóm tắt giải pháp thiết kế mà Antigravity đưa ra.
   * **`file_mutation`**: Nhật ký chỉnh sửa file của agent (mục đích sửa đổi, tên file).
4. Bạn có thể sử dụng thanh tìm kiếm trên Dashboard để gõ các từ khóa liên quan như `"antigravity"`, `"integration plan"`, `"walkthrough"` để kiểm tra khả năng tìm kiếm ngữ nghĩa (semantic search) của `agentmemory`.

---

## 3. Đánh giá Khả năng Ứng dụng Thực tế

Sau khi đồng bộ hóa thành công, bạn sẽ nhận được các lợi ích trực tiếp sau:
* **Tính liên tục:** Ở phiên hội thoại tiếp theo, nếu bạn khởi động một agent mới (như Cursor hay Claude Code) có kết nối với `agentmemory`, agent đó sẽ ngay lập tức "nhớ" được rằng: *"Chúng ta đã thiết lập một file script bridge đồng bộ tại thư mục deploy của Antigravity để đẩy logs lên SQLite..."* mà không cần bạn giải thích lại từ đầu.
* **Quản trị bộ nhớ:** Giao diện Viewer tại cổng `3113` cho phép bạn chỉnh sửa hoặc xóa đi những thông tin lỗi thời, giúp bộ nhớ của các trợ lý AI luôn chính xác và sạch sẽ.
