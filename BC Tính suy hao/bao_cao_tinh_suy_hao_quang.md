# Báo cáo Tính toán Công suất Thu Quang tại Splitter Cấp 2

## 1. Tổng quan

Theo yêu cầu của VNPT, tổng suy hao toàn trình từ Trạm Viễn thông đến cổng ra của Splitter cấp 2 (S2) được xác định là **≤ 24 dB**.

Báo cáo này lập bảng tính toán công suất thu dự kiến tại điểm đo (output của Splitter cấp 2) dựa trên bảng công suất phát (Tx) của các loại SFP OLT (GPON, XGS-PON) để đảm bảo kỹ thuật viên có căn cứ kiểm tra thực tế.

**Mục tiêu:**

- Xác định trường giá trị công suất thu (Rx) hợp lệ cho từng loại Module quang.
- Đảm bảo công suất thu nằm trong ngưỡng hoạt động an toàn của thiết bị đầu cuối (ONU/ONT).

## 2. Thông số kỹ thuật

- **Suy hao toàn trình (Loss):** 24 dB.
- **Điểm đo:** Cổng ra của Splitter cấp 2.
- **Công thức tính:**
  $$ P_{thu} (dBm) = P_{phat} (dBm) - Suy hao (dB) $$
  $$ P_{thu} = P_{phat} - 24 $$

## 3. Sơ đồ minh họa tuyến cáp

```mermaid
graph LR
    OLT["OLT (SFP Module)"]
    ODF["ODF Trạm"]
    S1["Splitter Cấp 1"]
    S2["Splitter Cấp 2"]
    Meter["Máy đo công suất / ONU"]

    OLT -- "Cáp gốc" --> ODF
    ODF -- "Cáp phối" --> S1
    S1 -- "Cáp nhánh" --> S2
    S2 -- "Dây picktail" --> Meter

    style OLT fill:#f9f,stroke:#333,stroke-width:2px
    style S2 fill:#bbf,stroke:#333,stroke-width:2px
    style Meter fill:#bfb,stroke:#333,stroke-width:2px
```

## 4. Bảng tính toán công suất thu (Khuyến nghị)

Dưới đây là bảng giá trị công suất thu tính toán dựa trên catalogue SFP:

| STT | Công nghệ | Loại SFP OLT | **Tx Min**<br>*(dBm)* | **Tx Max**<br>*(dBm)* | **NGƯỠNG THI CÔNG**<br>*(Kết quả đo ≥ giá trị này là ĐẠT)* | **Khoảng giá trị tham khảo**<br>*(Tính toán tại mức suy hao 24dB)* |
|:---:|:---:|:---|:---:|:---:|:---:|:---:|
| 1 | GPON | **OLT SFP GPON B+** | 1.5 | 5.0 | **≥ -22.5 dBm** | -22.5 ... -19.0 dBm |
| 2 | GPON | **OLT SFP GPON C+** | 3.0 | 7.0 | **≥ -21.0 dBm** | -21.0 ... -17.0 dBm |
| 3 | XGS-PON | **OLT SFP+ XGS-PON N1** | 2.0 | 5.0 | **≥ -22.0 dBm** | -22.0 ... -19.0 dBm |
| 4 | XGS-PON | **OLT SFP+ XGS-PON N2** | 4.0 | 7.0 | **≥ -20.0 dBm** | -20.0 ... -17.0 dBm |
| 5 | GPON | **OLT SFP+ MPM B+** (GPON) | 1.0 | 4.0 | **≥ -23.0 dBm** | -23.0 ... -20.0 dBm |
| 6 | XGS-PON | **OLT SFP+ MPM B+** (XGS) | 1.0 | 4.0 | **≥ -23.0 dBm** | -23.0 ... -20.0 dBm |
| 7 | GPON | **OLT SFP+ MPM C+** (Nokia) | 5.0 | 8.0 | **≥ -19.0 dBm** | -19.0 ... -16.0 dBm |
| 8 | GPON | **OLT SFP+ MPM C+** (Hua/ZTE) | 3.0 | 7.0 | **≥ -21.0 dBm** | -21.0 ... -17.0 dBm |
| 9 | XGS-PON | **OLT SFP+ MPM C+** (All) | 5.0 | 8.0 | **≥ -19.0 dBm** | -19.0 ... -16.0 dBm |

*(Ghi chú: Giá trị Rx Min/Max là giá trị lý thuyết sau khi trừ suy hao 24dB. Trong thực tế đo đạc, sai số cho phép thường là ±1-2dB tùy thuộc vào chất lượng mối hàn và connector cuối)*

### Hướng dẫn đánh giá kết quả đo

Kỹ thuật viên sử dụng máy đo công suất (OPM) tại đầu ra của Splitter cấp 2 và so sánh với giá trị **"Công suất thu (Rx) Min"** trong bảng trên.

**Quy tắc NHỚ NHANH:**
> **Kết quả đo ≥ Giá trị Rx Min** ➔ **ĐẠT** (Suy hao tuyến ≤ 24dB)
> **Kết quả đo < Giá trị Rx Min** ➔ **KHÔNG ĐẠT** (Suy hao tuyến > 24dB ➔ Cần kiểm tra lại mối hàn, connector)

*(Lưu ý: Trong số âm, số càng gần 0 thì càng lớn. Ví dụ: -20 lớn hơn -25)*

**Ví dụ minh họa cụ thể:**
Giả sử đang đo kiểm tuyến cáp sử dụng OLT SFP loại **XGS-PON N2**.

- Theo bảng, giá trị **Rx Min** yêu cầu là **-20.0 dBm**.

| Giá trị trên máy đo | So sánh với -20.0 | Kết luận | Hành động |
| :--- | :--- | :--- | :--- |
| **-18.0 dBm** | Lớn hơn (-18 > -20.0) | **ĐẠT** ✅ | Tuyến cáp tốt, suy hao nhỏ hơn thiết kế. |
| **-20.0 dBm** | Bằng (-20 = -20.0) | **ĐẠT** ✅ | Đạt yêu cầu kỹ thuật (sát ngưỡng). |
| **-22.0 dBm** | Nhỏ hơn (-22 < -20.0) | **KHÔNG ĐẠT** ❌ | Suy hao thực tế quá lớn (~26.0dB). Cần soi OTDR tìm điểm lỗi (mối hàn cao, connector bẩn, uốn cong cáp). |
| **-28.0 dBm** | Rất nhỏ | **CẢNH BÁO** ⚠️ | Mất tín hiệu nghiêm trọng hoặc đứt sợi quang một phần. |

## 5. Kết luận

- Với mức suy hao thiết kế là **24dB**, tất cả các loại module SFP phổ biến (B+, C+, N1, N2, MPM) đều cho công suất thu đầu cuối nằm trong khoảng **-23dBm đến -16dBm**.

- **Khuyến nghị thi công:** Kỹ thuật viên khi đo tại tủ Splitter cấp 2 cần đảm bảo giá trị đo được **≥ -24dBm** (để có độ dự phòng an toàn) và **≤ -16dBm** (để tránh suy hao quá thấp gây bão hòa, dù trường hợp này ít xảy ra với suy hao 24dB).

## 6. Nguồn tham khảo

- Bảng thông số SFP từ tài liệu hướng dẫn VNPT (Uploaded Media).
- Tiêu chuẩn G.984 (GPON) và G.9807 (XGS-PON).
