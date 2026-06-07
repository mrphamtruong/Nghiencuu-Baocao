# SỔ TAY KỸ THUẬT: ĐO KIỂM & XỬ LÝ SUY HAO QUANG
**Đơn vị:** Trung tâm Hạ tầng - Phòng KTĐT
**Chủ đề:** Hướng dẫn thực trường dành cho Kỹ thuật viên (VNPT Blue Edition)

---

## 1. TỔNG QUAN & QUY TẮC NHỚ NHANH
*“Sạch đầu quang - Sáng tín hiệu”*

**Mục tiêu:** Đảm bảo suy hao toàn trình từ OLT đến đầu ra Splitter cấp 2 (S2) **≤ 24 dB**.

### Quy tắc "Vùng Xanh"
Khi đo tại cổng ra của Splitter cấp 2, kết quả ĐẠT yêu cầu nếu nằm trong khoảng:
> **-18.0 dBm đến -22.0 dBm**

**Cảnh báo Đỏ (Nguy hiểm):**
> Kết quả đo **≤ -24.0 dBm** (ví dụ: -25, -27...) ➔ **KHÔNG ĐẠT**. Phải dừng lại xử lý sự cố ngay.

---

## 2. MODULE 1: BẢNG TRA CỨU CÔNG SUẤT THU (Rx)
Kỹ thuật viên đối chiếu giá trị hiển thị trên máy OPM với bảng sau:

| STT | Công nghệ | Loại SFP tại OLT | Rx Tối thiểu (ĐẠT) | Khoảng giá trị tốt |
|:---:|:---|:---|:---:|:---:|
| 1 | **GPON** | OLT SFP B+ | **≥ -22.5 dBm** | -19.0 đến -22.5 |
| 2 | **GPON** | OLT SFP C+ | **≥ -21.0 dBm** | -17.0 đến -21.0 |
| 3 | **XGS-PON** | OLT SFP+ N2 | **≥ -20.0 dBm** | -17.0 đến -20.0 |
| 4 | **MPM** | SFP+ MPM (GPON) | **≥ -23.0 dBm** | -20.0 đến -23.0 |
| 5 | **MPM** | SFP+ MPM (XGS) | **≥ -23.0 dBm** | -20.0 đến -23.0 |

*Lưu ý: Trong số âm, số có giá trị tuyệt đối nhỏ hơn thì lớn hơn (Ví dụ: -20 lớn hơn -24).*

---

## 3. MODULE 2: QUY TRÌNH THAO TÁC CHUẨN (SOP)
*Dành cho kỹ thuật viên mới*

### Bước 1: Chuẩn bị thiết bị
- Máy đo OPM: Chuyển bước sóng **1490nm** (GPON) hoặc **1577nm** (XGS-PON).
- Dây nhảy Test: SC/APC (đầu xanh lá) sạch, không trầy xước.
- Bộ vệ sinh: Bút lau đầu quang hoặc cồn/gạc sạch.

### Bước 2: Vệ sinh (Bắt buộc)
- Dùng bút lau vệ sinh cổng Output của Splitter.
- Lau sạch hai đầu dây nhảy Patchcord trước khi kết nối.

### Bước 3: Đo và Đối chiếu
- Cắm kết nối chắc chắn, chờ chỉ số ổn định (sau 3 giây).
- So sánh kết quả với **Module 1**.
- Nếu Kết quả < Rx Tối thiểu ➔ Chuyển sang **Module 4 (Xử lý sự cố)**.

---

## 4. MODULE 3: XỬ LÝ SỰ CỐ (TROUBLESHOOTING)

### Sơ đồ luồng xử lý (Flowchart)
1. **Đo Không Đạt** ➔ Vệ sinh lại đầu quang & cổng Splitter.
2. **Vẫn Không Đạt** ➔ Thay dây nhảy Test mới.
3. **Vẫn Không Đạt** ➔ Đo kiểm tra ngược về hướng Splitter cấp 1 (S1).
    - Nếu S1 Đạt ➔ Lỗi tại cáp nhánh hoặc Splitter S2.
    - Nếu S1 Không Đạt ➔ Báo cáo Phòng KTĐT xử lý cáp phối/OLT.

### Checklist kiểm tra nhanh lỗi vật lý
- [ ] Kiểm tra bán kính uốn cong cáp trong tủ (không gập quá mức).
- [ ] Soi bút quang (VFL) tìm điểm rò rỉ ánh sáng trên sợi pigtail.
- [ ] Vệ sinh bụi trong Adapter bằng khí nén hoặc bút chuyên dụng.

---

## 5. THÔNG TIN HỖ TRỢ
Khi không thể tự xử lý sự cố hoặc cần hỗ trợ chuyên sâu:
*   **Hỗ trợ hạ tầng/vật lý:** Trung tâm Hạ tầng.
*   **Hỗ trợ cấu hình/số liệu:** Phòng KTĐT.
*   **Hotline hỗ trợ:** [Ghi số nội bộ tại đây]

---

## PHỤ LỤC: NHẬT KÝ THIẾT KẾ (DESIGN LOG)
- **Mục tiêu:** Xây dựng Sổ tay (Handbook) cho kỹ thuật viên mới.
- **Quyết định 1:** Sử dụng cấu trúc Module để dễ tra cứu nhanh trên Mobile.
- **Quyết định 2:** Kết hợp Sơ đồ luồng và Checklist để tối ưu hóa việc ra quyết định tại hiện trường.
- **Quyết định 3:** Sử dụng nhận diện thương hiệu màu Xanh VNPT.
- **Giả định:** Tất cả đo kiểm dựa trên tiêu chuẩn suy hao toàn trình ≤ 24 dB.
