# Kịch bản demo – Tản Đà AI

Server: `node server.js` → http://localhost:3000 (AI thật, có API key). Mật khẩu mọi tài khoản demo: `123456`.
Dùng 3 tài khoản: **GV-0108** (Thầy Lê Văn Nam – Toán, CN 10A1) cho mục 2–6, **HS26-0915** cho mục 1, **GV-0042** (Cô Trần Thu Hạnh – Tiếng Anh) để xem phía nhận ở mục 6.

Các prompt dưới đây được chọn để bám sát đúng dữ liệu mẫu có sẵn trong code (`STAFF_LIST`, `STUDENTS`, `SCHOOL_RULES`, `TT` lịch dạy trong `public/js/data.js`), nên AI thật luôn trả lời đúng, không phụ thuộc may rủi của một lần sinh.

## 1. Học sinh · Luyện nói tiếng Anh (Speak Up)

Đăng nhập `HS26-0915` / `123456` → **Tiếng Anh** → bấm **"Bắt đầu bài cô giao"** (chủ đề *Trò chuyện với cố vấn học đường về áp lực học tập*).

Gõ/nói lần lượt (đã chọn để "trúng" từ vựng mục tiêu `stress / routine / balance`, AI sẽ ghi nhận tiến bộ):

1. `I feel a bit stressed because I have a lot of homework and exams are coming soon.`
2. `I usually listen to music or play badminton to relax.`
3. `I usually sleep about 6 hours, but I want a better balance between study and rest.`
4. `After school I have a daily routine: I eat, do homework, then relax for 30 minutes.`

Kết thúc buổi → xem **Báo cáo chi tiết** (điểm, lỗi ngữ pháp được AI sửa, từ vựng đã dùng đúng).

## 2. Giáo viên · Hỏi AI thông tin nội bộ

Đăng nhập `GV-0108` / `123456` → mở khung **Trợ lý AI**, hỏi từng câu:

- `Cô Hoa tuần này dạy môn gì, lớp nào, có chủ nhiệm lớp nào không?`
  → trả lời theo dữ liệu: Cô Nguyễn Thị Hoa, Ngữ văn, 11A1/11A2/10A3, CN 11A2.
- `Quy định nộp giáo án ở trường mình thế nào?`
  → trả theo quy định "Soạn và nộp giáo án" (Phụ lục IV CV 5512, nộp trước ≥3 ngày).
- `Cho tôi số điện thoại liên hệ và tình hình học tập của em Phạm Đức Huy lớp 10A1.`
  → trả đúng SĐT `0912 345 103`, phụ huynh, ghi chú "điểm giảm, đang phụ đạo".

## 3. Giáo viên · Soạn tài liệu / slide / đề thi

Vẫn tài khoản GV-0108, bấm vào khu **Tài liệu** trước, rồi gõ liên tiếp trong khung chat:

1. `Soạn giáo án Toán 10 bài Cấp số cộng, 1 tiết (45 phút), có hoạt động nhóm và bài tập vận dụng thực tế.`
2. `Từ giáo án này, làm slide bài giảng 6 trang theo mẫu Bảng xanh.`
3. `Ra đề kiểm tra 15 phút Toán 10 về Cấp số cộng, định dạng mới, có đáp án.`

Thêm 1 bước "sửa theo đoạn" để khoe tính năng patch:

`Thêm một hoạt động khởi động bằng trò chơi ngắn ở đầu bài, giữ nguyên các phần khác.`
→ AI trả đề xuất tô màu từng đoạn (không viết lại cả bài).

Cuối cùng gõ `Xuất file giáo án này ra Word` để xuất .docx thật.

## 4. Giáo viên · Xin nghỉ ốm & xin dạy thay

Vào mục **Xin nghỉ & dạy thay** (`a-leave`), 2 cách:

- Bấm thẳng pill có sẵn: *"Xin nghỉ ốm ngày mai, nhờ đồng nghiệp cùng tổ dạy thay 2 tiết"*.
- Hoặc gõ tự do ngay trong khung **Trợ lý AI nổi** ở bất kỳ trang nào:
  `Tôi bị sốt, xin nghỉ dạy 2 tiết Toán lớp 10A1 chiều mai, nhờ thầy Hoàng Minh Đức dạy thay giúp.`
  → AI tự nhận ý và tạo đơn ở mục Xin nghỉ.

Lưu ý: trạng thái đơn (Chờ duyệt / Đã duyệt / Không được duyệt) là **random có chủ đích** để demo đủ 3 giao diện — nếu muốn chắc ăn thấy cả 3 trạng thái, gửi thử 2–3 đơn trước giờ demo.

## 5. Giáo viên · Dạy kỹ năng AI & quy trình nhiều bước

**Kỹ năng AI**: vào **Tự động hoá AI → Kỹ năng của AI**, thêm:
- Phạm vi: **"Tài liệu"**
- Nội dung: `Luôn thêm mục Dặn dò ở cuối mỗi giáo án, gồm bài tập về nhà và việc cần chuẩn bị cho tiết sau.`
→ Lưu.

Sau đó vào khu **Tài liệu**, gõ `Soạn giáo án Toán 10 bài Cấp số cộng` (không nhắc gì đến "Dặn dò") → AI tự thêm mục đó, minh hoạ rõ nhất việc "dạy" được AI một quy tắc riêng.

**Quy trình nhiều bước**: vào **Quy trình nhiều bước**, tạo quy trình mới để chắc chắn AI không phải hỏi lại gì:

- Tên: `Soạn trọn bộ bài Cấp số cộng – Toán 10`
- Miêu tả: `Soạn đầy đủ từ giáo án đến slide và đề kiểm tra ngắn cho bài Cấp số cộng, Toán 10, lớp 11A1.`
- Các bước (mỗi dòng 1 bước):
  ```
  Soạn giáo án Toán 10 bài Cấp số cộng, 1 tiết, theo Công văn 5512, có hoạt động nhóm.
  Từ giáo án vừa soạn, làm slide bài giảng 6 trang, súc tích, có ví dụ minh họa.
  Ra đề kiểm tra 15 phút bám sát nội dung bài Cấp số cộng, kèm đáp án.
  ```

Bấm **"Nhờ trợ lý làm"** → 1 lần bấm, AI tự làm liên tiếp cả 3 việc trong 1 lượt chat.

## 6. Giáo viên · Gửi tài liệu cho đồng nghiệp & lịch sử chỉnh sửa

Ba tính năng mới, demo nối tiếp nhau để thấy rõ cả vòng: sửa (preview hoặc AI chat) → bấm Save → gửi đi → bên nhận mở ra vẫn thấy đủ lịch sử.

**Bước A — sửa tài liệu rồi bấm Save:**
Vẫn tài khoản GV-0108, mở lại tài liệu đã soạn ở mục 3 (bài Cấp số cộng) ở khu **Tài liệu**, gõ trong khung chat:

`Thêm 2 câu hỏi củng cố ở cuối bài, mức Vận dụng.`

→ AI trả đề xuất tô màu từng đoạn (không viết lại cả bài) → bấm **"Chấp nhận tất cả"** để duyệt. Để ý cạnh tên tài liệu xuất hiện chữ **"chưa lưu"** và nút **"Save"** chuyển màu — duyệt đề xuất (hoặc sửa trực tiếp trên preview) chỉ đánh dấu thay đổi, chưa ghi lịch sử. Bấm **"Save"** để chính thức ghi lại (đây là lúc lịch sử nhận dòng mới).

**Bước B — gửi tài liệu cho đồng nghiệp:**
Ngay trong khung chat (tài liệu vẫn đang mở), gõ:

`Gửi giáo án này cho cô Hạnh.`

→ AI xác nhận đã gửi ngay, không hỏi lại (đã rõ tài liệu đang mở và tên người nhận). Câu lệnh này nhận diện được cả khi AI thật đang nghỉ/hết hạn mức (chế độ mô phỏng), vì việc gửi không cần gọi AI để thực hiện, chỉ cần nhận diện đúng mẫu câu "gửi … cho …". Nếu còn thay đổi chưa bấm Save lúc gửi, hệ thống tự Save giúp trước khi gửi đi, để lịch sử đi kèm luôn đầy đủ.

**Bước C — xem lịch sử chỉnh sửa:**
Trên khung tài liệu (canvas bên phải), cạnh tên tài liệu có nút **"Lịch sử chỉnh sửa (N)"** → bấm để xem: *Tạo tài liệu* → *duyệt đề xuất sửa* (kèm đúng lý do AI tóm lược cho từng câu hỏi vừa thêm) → *gửi tài liệu*, mỗi dòng có giờ và tên giáo viên thực hiện. Phân biệt với ô **"Khôi phục phiên bản"** cạnh bên — ô đó để quay lại nội dung cũ (dùng được cả khi chưa Save), còn mục này chỉ để xem lại nhật ký các lần đã lưu.

**Bước D — phía đồng nghiệp nhận được:**
Đăng xuất, đăng nhập `GV-0042` / `123456` (Cô Trần Thu Hạnh) → vào khu **Tài liệu** → mục **"Tài liệu người khác gửi"** hiện thẻ tài liệu vừa nhận, có nhãn **"Mới"** và tên người gửi. Bấm vào thẻ → tài liệu mở thành bản của Cô Hạnh, chỉnh sửa/xuất file được như tài liệu tự soạn, nhưng lại hiện "chưa lưu" (vì việc nhận tài liệu cũng cần Save để chính thức vào lịch sử) → bấm **"Save"** rồi bấm tiếp **"Lịch sử chỉnh sửa"** để thấy toàn bộ các dòng cũ của Thầy Nam vẫn còn nguyên, cộng thêm dòng mới nhất: *"Nhận tài liệu từ Thầy Lê Văn Nam qua trợ lý AI"*.

## Lưu ý trước giờ demo

Chạy thử mỗi prompt một lần (server đang chạy ở `localhost:3000`, AI thật) để chắc không bị rate-limit (30 req/phút/IP) giữa lúc demo trực tiếp.
