# Tản Đà AI – bản MVP

Web app cho học sinh và giáo viên, dùng Claude API. Không cần cài thư viện.

## Chạy

Cần Node.js 18 trở lên.

```bash
node server.js        # hoặc: npm start
```

Mở http://localhost:3000

Tài khoản demo (mật khẩu `123456`): giáo viên `GV-0108`/`GV-0042`, học sinh `HS26-0915`, nhân viên văn phòng `NV-0215`, Ban giám hiệu/quản lý `QT-0001`.

## Gắn API key

Mở `config.js`, dán key vào dòng:

```js
ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || "",   // ← dán key thật vào đây
```

Hoặc không sửa file mà đặt biến môi trường: `ANTHROPIC_API_KEY=sk-ant-... node server.js`.

Khi chưa có key, ứng dụng chạy ở chế độ **AI mô phỏng** (chip vàng trên thanh trên cùng). Có key hợp lệ thì chip chuyển thành **AI đang hoạt động**.

Key chỉ nằm ở máy chủ. Trình duyệt gọi `/api/claude` của máy chủ, máy chủ mới gọi Anthropic. Không đưa `config.js` có key thật lên Git công khai.

## Model

Sửa trong `config.js` → `MODELS`:

| Mức | Dùng cho | Mặc định |
|---|---|---|
| quick | gợi ý, dịch, hội thoại tiếng Anh | claude-haiku-5-5 |
| default | trợ lý soạn tài liệu, slide, gia sư | claude-sonnet-5-5 |
| complex | ra đề, sửa đề, chấm | claude-opus-5-5 |

Cũng trong `config.js`: `MAX_TOKENS` theo mức, `RATE_LIMIT` (mặc định 30 yêu cầu/phút mỗi IP), `PORT`.

## Cấu trúc

```
config.js            cấu hình, API key (dùng cho server.js chạy local)
server.js            máy chủ: phục vụ /public, proxy /api/claude (stream), /api/health, /api/usage, /api/approvals
public/index.html    khung giao diện
public/css/app.css   giao diện
public/js/
  core.js            trạng thái, điều hướng, tiện ích
  ai.js              gọi Claude (aiText stream, aiJSON); không có key → chế độ mô phỏng
  gateway.js         cổng AI: lọc nội dung, quy tắc học sinh, nhật ký
  agent.js           trợ lý giáo viên: hội thoại, giao thức <<<ACTIONS>>>, phiên bản tài liệu
  assistant.js       khung chat trợ lý bên phải, có ở mọi trang giáo viên
  teacher.js         Tổng quan (lịch dạy, KPI), Tài liệu, Slide, Đề kiểm tra, Lớp học
  student.js         Toán, Tin học (chạy Python), Trí tuệ nhân tạo
  english.js         Tiếng Anh · Speak Up: nói với AI, phát âm, báo cáo
  content.js, data.js  nội dung mẫu, dữ liệu demo
  files.js           đọc .docx/.pptx/ảnh, xuất .docx/.pptx
  admin.js           Quản trị AI (chỉ tài khoản có quyền "admin"): báo cáo sử dụng, chính sách, thử phân loại, model & hạn mức
  app.js             đăng nhập, menu, khởi động
public/vendor/       pptxgenjs, Skulpt (chạy Python trong trình duyệt)
```

## Vai trò & quyền

Phân theo `data.js: ACCOUNTS[...].perms` (`docs`, `teach`, `admin`):

| Vai trò | Mã demo | Quyền | Thấy gì |
|---|---|---|---|
| Học sinh | `HS26-0915` | — | Toán, Tin học, Trí tuệ nhân tạo, Tiếng Anh |
| Giáo viên | `GV-0108`, `GV-0042` | `docs`, `teach` | Tổng quan, Tài liệu, Slide, Đề kiểm tra, Lớp học |
| Nhân viên văn phòng | `NV-0215` | `docs` | Chỉ mục Tài liệu, chỉ các mẫu hành chính (Thông báo, Biên bản họp) |
| Ban giám hiệu / quản lý | `QT-0001` | `docs`, `teach`, `admin` | Như giáo viên, cộng thêm mục **Quản trị AI** |

Mục **Quản trị AI** (`admin.js`, chỉ hiện khi có quyền `admin`):
- **Báo cáo sử dụng AI** (`a-dash`) — số liệu dùng AI của tài khoản đang đăng nhập (ghi bởi `gateway.js`) và số liệu thật từ máy chủ qua `/api/usage` (tổng lượt gọi Claude, theo tier, từ lúc máy chủ khởi động).
- **Chính sách sử dụng** (`a-policy`) — sửa trực tiếp ma trận chính sách `S.policy` (vai trò × giờ làm việc → cho phép/nhắc nhở/chặn cho việc cá nhân/giải trí).
- **Thử phân loại nội dung** (`a-classify`) — chạy thử `classifyLocal`/`decide` của `gateway.js` với nội dung tự nhập, không gọi AI.
- **Model & hạn mức** (`a-quota`) — model theo tier, max tokens, hạn mức gọi API (đọc từ `/api/health` đã mở rộng), giá tham khảo (có thể thay đổi, không dùng để tính hóa đơn chính thức).

## Tài liệu tổ (quản lý nội bộ)

Mục **Tài liệu tổ** (`a-profile`, `admin.js`, chỉ cần quyền `teach`) hiện vài thẻ tài liệu chuyên môn mẫu (chuyên đề, SKKN, kế hoạch bồi dưỡng, biên bản sinh hoạt tổ) theo đúng tổ của giáo viên đang đăng nhập, mỗi thẻ có trạng thái khác nhau (đang chờ tổ trưởng duyệt / yêu cầu bổ sung / đã duyệt kèm nhận xét) để minh họa quy trình **tổ trưởng bộ môn duyệt**. Đây là dữ liệu mẫu hiển thị tại chỗ (không gọi máy chủ) — nút Duyệt/Yêu cầu bổ sung chỉ đứng tạm vai tổ trưởng để xem giao diện cả hai phía, không phải luồng hai tài khoản thật như "Chấm bài về nhà" ở dưới.

## Xin nghỉ & dạy thay (quản lý nội bộ)

Mục **Xin nghỉ & dạy thay** (`a-leave`, `admin.js`) có một ô nhắn riêng trên trang: giáo viên gõ tự do lý do + thời gian xin nghỉ (ví dụ "Xin nghỉ ốm thứ Năm 14/11, 2 tiết Toán 10A1, nhờ cô Hạnh dạy thay"), AI (`aiJSON`, tier `quick`) rút ra **lý do** và **thời gian** thành một thẻ đơn, kèm **trạng thái**.

Cũng tạo được đơn từ khung **Trợ lý AI nổi** (gõ ở bất kỳ trang nào) — agent.js có thêm action `{"type":"leave","reason","time"}` trong giao thức ACTIONS, AI tự nhận ra ý xin nghỉ/dạy thay và trả action này. Cả hai đường đều tạo đơn qua cùng một hàm `createLeave()` (agent.js), để không có hai nơi quyết định trạng thái khác nhau.

Trạng thái ở bản demo này được random ngay khi tạo thẻ (`randomLeaveStatus()` trong `agent.js`, không gọi AI để quyết định) — khoảng 70% "Chờ tổ trưởng duyệt", 15% "Đã duyệt", 15% "Không được duyệt" (kèm một lý do không duyệt chọn ngẫu nhiên từ vài câu mẫu) — để xem trước cả ba trạng thái giao diện. Danh sách đơn (`S.leaves`) chỉ lưu trong bộ nhớ trình duyệt, mất khi tải lại trang.

## Lịch sử chỉnh sửa tài liệu & nút Save

Mọi thay đổi nội dung — dù qua **preview** (sửa trực tiếp, di chuyển/xóa đoạn) hay qua **AI chat** (AI viết lại toàn bộ, hoặc giáo viên bấm "Chấp nhận"/"Chấp nhận tất cả" một đề xuất sửa, hoặc khôi phục bản trước) — chỉ đánh dấu tài liệu là **chưa lưu** (`agent.js: markDirty`, hiện chữ "chưa lưu" màu cam cạnh tên tài liệu), chứ không ghi lịch sử ngay. Lịch sử (`d.history`, tách riêng khỏi `d.versions` dùng để khôi phục) chỉ thật sự được ghi khi giáo viên bấm nút **"Save"** cạnh tên tài liệu — gộp mọi thay đổi kể từ lần lưu trước thành một dòng, gồm **thời gian**, **người sửa** (tài khoản đang đăng nhập) và **nội dung sửa** (ghép các lý do AI tóm lược — `why`/`summary` — của từng thay đổi, hoặc mô tả ngắn khi là sửa tay). Nút Save đổi màu và chỉ bấm được khi đang có thay đổi chưa lưu.

Bấm nút **"Lịch sử chỉnh sửa (N)"** cạnh đó để xem danh sách các lần đã lưu. Mục này khác với ô **"Khôi phục phiên bản"** sẵn có cạnh bên — ô đó dùng để quay lại một bản nội dung cũ (có ngay cả khi chưa Save), còn "Lịch sử chỉnh sửa" chỉ để xem lại ai đã lưu gì, lúc nào. Khi gửi tài liệu cho đồng nghiệp (mục dưới), hệ thống tự Save mọi thay đổi còn dang dở trước khi gửi, để lịch sử đi kèm tài liệu luôn đầy đủ; bên nhận mở ra sẽ thấy nguyên lịch sử cũ cộng thêm dòng "Nhận tài liệu từ …" (cũng cần bấm Save để chính thức ghi vào lịch sử).

## Gửi tài liệu cho đồng nghiệp

Trong khung Trợ lý AI, giáo viên có thể nhờ gửi một tài liệu/slide/đề đang có cho một đồng nghiệp cụ thể, ví dụ "Gửi cái này cho cô Hạnh" (AI thật) hoặc gõ đúng mẫu "gửi … cho …" ở chế độ mô phỏng. Trợ lý nhận diện người nhận theo tên trong danh bạ (`STAFF_LIST`, `agent.js: matchStaff`) — chỉ gửi được cho đồng nghiệp có tài khoản đăng nhập (GV-0108, GV-0042, QT-0001 ở bản demo). Tài liệu được gửi qua `/api/senddoc` (lưu tạm trong bộ nhớ máy chủ, giống cơ chế "Chấm bài về nhà"), nên hiện đúng ở tài khoản người nhận dù đang ở trình duyệt khác.

Mỗi trang **Tài liệu / Slide bài giảng / Đề kiểm tra** có thêm mục **"Tài liệu người khác gửi"** liệt kê các tài liệu cùng loại đã được gửi đến tài khoản đang đăng nhập, kèm tên người gửi và nhãn "Mới" cho tài liệu chưa mở. Bấm vào một thẻ sẽ nhập tài liệu đó vào thư viện của mình (thành một phiên làm việc mới, chỉnh sửa/xuất file như tài liệu tự soạn) và đánh dấu đã đọc.

## Kỹ năng AI (tự động hoá)

Giáo viên vào **Lớp học & 4 môn** → thẻ "Kỹ năng AI" để dạy thêm cho trợ lý một quy tắc riêng (ví dụ: "Luôn thêm phần Dặn dò ở cuối giáo án"), chọn áp dụng **Mọi lúc** hoặc chỉ khi soạn đúng loại tài liệu (Tài liệu/Slide/Đề). Kỹ năng được nối vào `agentSystemPrompt()` mỗi lượt chat nếu phạm vi khớp với tài liệu đang mở — chỉ có hiệu lực khi dùng **Claude thật** (chế độ mô phỏng không đọc được chỉ dẫn tự do). Danh sách kỹ năng chỉ lưu trong bộ nhớ trình duyệt của phiên đang dùng, mất khi tải lại trang.

Khi chưa có tài liệu nào mở (đang tạo MỚI, chưa gõ gì), phạm vi được đoán theo khu đang đứng (Tài liệu/Slide/Đề) để kỹ năng vẫn áp dụng ngay từ lượt tạo đầu tiên — vì vậy nên bấm vào đúng khu (VD: "Đề kiểm tra") trước khi nhắn tạo mới, để kỹ năng theo phạm vi đó được áp dụng đúng.

Lưu ý: với đề kiểm tra, khung đề (trường, tổ, môn, thời gian, mã đề…) là **định dạng cố định**, không phải văn bản tự do như tài liệu/slide. Để kỹ năng vẫn có chỗ "thêm" được vào đề (không riêng tên giáo viên — sau này có thể là bất cứ dòng phụ nào, giáo viên tự viết kỹ năng theo ý mình), cấu trúc đề có thêm field tự do `cfg.headerExtra: [string]`: trợ lý tự quyết định nội dung dòng thêm dựa theo chỉ dẫn của kỹ năng/giáo viên, hiển thị thêm vào góc đề (mỗi phần tử một dòng). Những phần khác của đề (câu hỏi, đáp án…) không có cơ chế mở rộng tương tự — kỹ năng chỉ ảnh hưởng được đến phần đã có "chỗ chứa" như vậy.

### Quy trình nhiều bước

Mục **Quy trình nhiều bước** (`a-flows`, `teacher.js`) là bản thể hiện UI của một prompt nhiều bước soạn sẵn cho trợ lý: mỗi quy trình gồm **Tên**, đoạn **Miêu tả** và các **Bước** theo thứ tự. Có sẵn một thẻ mẫu (`S.flows` trong `core.js`) để giáo viên biết cách viết; bấm **"Nhờ trợ lý làm"** sẽ ghép Miêu tả + các Bước thành một tin nhắn rồi gửi thẳng vào khung Trợ lý AI (không có bước duyệt riêng hay chạy theo lịch — chỉ là soạn sẵn để gửi nhanh). Giáo viên tự thêm quy trình riêng ở form dưới cùng (mỗi dòng trong ô "Các bước" là một bước); danh sách chỉ lưu trong bộ nhớ trình duyệt, mất khi tải lại trang.

## Cách trợ lý sửa tài liệu

Trợ lý trả lời bằng chữ, sau đó (nếu cần thao tác) một dòng `<<<ACTIONS>>>` và mảng JSON, ví dụ:

```
Em đã soạn xong phiếu học tập.
<<<ACTIONS>>>
[{"type":"create","kind":"doc","title":"Phiếu học tập","content":"# ...markdown..."}]
```

Các loại thao tác: `create`, `update`, `patch`, `view`, `export`, `restore`, `open`, `suggest`. Tài liệu là markdown, slide là JSON, đề là JSON `{cfg, mcq, tf, short, essay}`. Mỗi lần sửa lưu một phiên bản để khôi phục; có thể chọn lại bất kỳ phiên bản cũ ở dropdown "Lịch sử" trên khung tài liệu.

### Đề xuất sửa theo từng đoạn (`patch`)

Với tài liệu loại `doc`, khi chỉnh sửa (không phải tạo mới), trợ lý ưu tiên trả về action `patch` thay vì `update`: một mảng đề xuất tối thiểu theo từng đoạn (`replace`/`delete`/`insert`, kèm `bid`/`after` là mã đoạn và lý do ngắn `why`), thay vì viết lại toàn bộ nội dung. Mỗi đề xuất hiện ngay trên tài liệu kèm phần tô màu (xanh = thêm, gạch đỏ = bỏ) và hai nút **Chấp nhận / Bỏ**; có thể duyệt từng chỗ hoặc bấm "Chấp nhận tất cả / Bỏ tất cả" ở banner phía trên. Ở chế độ mô phỏng, các quy tắc sửa tài liệu có sẵn cũng tự chuyển thành đề xuất kiểu này để trải nghiệm giống AI thật.

Ngoài ra, khi không có đề xuất đang chờ, mỗi đoạn có thể **sửa trực tiếp** (contenteditable, tự lưu khi rời khỏi ô) hoặc dùng thanh công cụ nhỏ bên trái đoạn (chuyển lên/xuống, xóa, nhờ AI viết lại riêng đoạn đó). Bôi đen một phần văn bản trong đoạn sẽ hiện thanh nổi để chọn kiểu viết lại (ngắn gọn/dài hơn/dễ hiểu/trang trọng) hoặc trích đoạn đó để hỏi trợ lý trong khung chat.

### Nói thay vì gõ (dành cho giáo viên không quen gõ máy)

Cạnh ô nhắn trong khung Trợ lý AI có nút micro. Bấm vào, nói điều cần nhờ trợ lý — chữ tự hiện vào ô nhắn khi đang nói (Web Speech API, tiếng Việt `vi-VN`). Khi dừng nói, tin nhắn **tự gửi sau 3 giây** (có đếm ngược hiển thị); gõ phím, bấm micro lần nữa (để nói lại) hoặc bấm nút Gửi sớm sẽ hủy đếm ngược. Cần Chrome/Edge và `localhost` hoặc HTTPS để dùng micro (giống Speak Up của học sinh).

### AI đọc to câu trả lời

Nút loa ở góc trên khung Trợ lý AI bật/tắt chế độ đọc to: khi bật, mỗi câu trả lời mới của trợ lý tự được đọc to ngay khi soạn xong. Mỗi tin nhắn của trợ lý cũng có nút **"Nghe lại"** để nghe bất cứ lúc nào, không cần bật chế độ đọc to.

Giọng đọc lấy từ **chính trình duyệt/máy tính đang dùng**, không gọi AI, không qua máy chủ, không tốn phí: dùng API `speechSynthesis` có sẵn trong trình duyệt (gọi là Web Speech API), hệ thống tự liệt kê các giọng tiếng Việt (`vi-VN`/`vi`) mà hệ điều hành hoặc trình duyệt đã cài sẵn, rồi tự chọn giọng nghe tự nhiên nhất trong số đó (ưu tiên giọng ghi là "Natural"/"Neural"/"Online" nếu máy có, ví dụ giọng online của Google trên Chrome hoặc giọng neural của Microsoft trên Edge/Windows — nếu máy không có giọng nào như vậy thì dùng giọng mặc định). Vì vậy **giọng nghe được sẽ khác nhau tùy máy/trình duyệt** của người dùng, không phải một giọng cố định do app quy định. Cùng cơ chế với tính năng "Nói thay vì gõ" phía trên và Speak Up của học sinh.

## Tính năng học sinh

- **Toán · Luyện nhanh**: thêm chế độ trắc nghiệm tự luyện cạnh Gợi mở/Kiểm tra/Giải luôn, dùng bộ sinh câu hỏi RNG có kiểm chứng đáp án (`content.js: genQ`) — không gọi AI, chấm ngay.
- **Trí tuệ nhân tạo · Thám tử kiểm chứng & Tình huống đạo đức**: nút "Tình huống khác" sinh thêm bộ câu hỏi/tình huống mới bằng AI (`aiJSON`, tier `quick`); hết hoặc lỗi AI thì luân phiên qua bộ mẫu tĩnh có sẵn (`CLAIMS_POOL`, `ETH_POOL` trong `student.js`).

## Lưu ý

- Nói tiếng Anh dùng Web Speech API: chạy tốt trên Chrome/Edge, cần `localhost` hoặc HTTPS để dùng micro.
- Dữ liệu (tài liệu, lớp, điểm) là dữ liệu demo trong bộ nhớ trình duyệt, tải lại trang sẽ mất. Bản thật cần thêm cơ sở dữ liệu và đăng nhập thật.
