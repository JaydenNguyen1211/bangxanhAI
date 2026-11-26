/* Tản Đà AI · data.js — mã nguồn, sửa trực tiếp */

export const ACCOUNTS = {
  "HS26-0915": {role:"student", kind:"student", perms:[], name:"Nguyễn Minh Anh", short:"MA", meta:"Lớp 11A1 · HS26-0915", group:"Lớp 11A1"},
  "GV-0108":   {role:"staff", kind:"teacher", perms:["docs","teach"], name:"Thầy Lê Văn Nam", short:"VN", meta:"GV Toán · CN 10A1 · GV-0108", group:"Tổ Toán – Tin", pos:"Giáo viên"},
  "GV-0042":   {role:"staff", kind:"teacher", perms:["docs","teach"], name:"Cô Trần Thu Hạnh", short:"TH", meta:"GV Tiếng Anh · CN 11A1 · GV-0042", group:"Tổ Ngoại ngữ", pos:"Giáo viên"},
  "NV-0215":   {role:"staff", kind:"staff", perms:["docs"], name:"Chị Đỗ Thu Trang", short:"TT", meta:"Văn phòng – Giáo vụ · NV-0215", group:"Văn phòng", pos:"Nhân viên"},
  "QT-0001":   {role:"staff", kind:"teacher", perms:["docs","teach","admin"], name:"Cô Phạm Thị Lan", short:"PL", meta:"Phó hiệu trưởng · GV Toán · QT-0001", group:"Ban giám hiệu", pos:"Ban giám hiệu"}
};

export const KHBD_SAMPLE = {
  title:"Kế hoạch bài dạy – Toán 10", subtitle:"Bài: Dấu của tam thức bậc hai (1 tiết)",
  sections:[
    {h:"I. Mục tiêu", blocks:[
      {h3:"1. Kiến thức"},{li:["Nhận biết được tam thức bậc hai f(x) = ax² + bx + c (a ≠ 0) và biệt thức Δ = b² − 4ac.","Phát biểu và vận dụng được định lí về dấu của tam thức bậc hai để xét dấu tam thức và giải bất phương trình bậc hai một ẩn đơn giản."]},
      {h3:"2. Năng lực"},{li:["Tư duy và lập luận toán học: giải thích được định lí về dấu dựa vào vị trí của parabol so với trục Ox.","Sử dụng công cụ, phương tiện học toán: dùng GeoGebra hoặc máy tính cầm tay để kiểm tra kết quả xét dấu.","Mô hình hóa toán học: lập được bất phương trình bậc hai từ bài toán thực tế (chuyển động ném bóng)."]},
      {h3:"3. Phẩm chất"},{li:["Chăm chỉ, có trách nhiệm khi làm việc nhóm; trung thực khi tự đánh giá kết quả."]}]},
    {h:"II. Thiết bị dạy học và học liệu", blocks:[{li:["Giáo viên: máy chiếu, slide bài giảng, tệp GeoGebra vẽ sẵn ba parabol ứng với Δ < 0, Δ = 0, Δ > 0, Phiếu học tập số 1.","Học sinh: SGK, bảng nhóm, máy tính cầm tay, ôn lại cách vẽ đồ thị hàm số bậc hai."]}]},
    {h:"III. Tiến trình dạy học", blocks:[
      {h3:"Hoạt động 1: Mở đầu (5 phút)"},
      {p:"a) Mục tiêu: Gợi nhu cầu xác định khi nào một biểu thức bậc hai nhận giá trị dương, giá trị âm."},
      {p:"b) Nội dung: Bài toán “Với giá trị nào của x thì x² − 5x + 6 < 0?”."},
      {p:"c) Sản phẩm: HS thay thử một số giá trị của x và dự đoán biểu thức âm khi x nằm giữa 2 và 3."},
      {table:{head:["Hoạt động của GV và HS","Sản phẩm dự kiến"],rows:[
        ["Bước 1 – Giao nhiệm vụ: GV chiếu bài toán, yêu cầu HS tính giá trị biểu thức tại x = 0; 2,5; 4 trong 2 phút.","HS ghi kết quả vào nháp."],
        ["Bước 2 – Thực hiện: HS tính; GV quan sát, ghi nhận các dự đoán khác nhau.","f(0) = 6 > 0; f(2,5) = −0,25 < 0; f(4) = 2 > 0."],
        ["Bước 3 – Báo cáo, thảo luận: 2 HS trình bày; lớp so sánh kết quả.","Dự đoán: biểu thức âm khi x nằm giữa hai nghiệm 2 và 3."],
        ["Bước 4 – Kết luận: GV dẫn dắt: có quy tắc tổng quát để xét dấu mà không phải thử từng giá trị không?","HS nêu câu hỏi cần giải quyết."]]}},
      {h3:"Hoạt động 2: Hình thành kiến thức (15 phút)"},
      {p:"a) Mục tiêu: HS tự rút ra được định lí về dấu của tam thức bậc hai."},
      {p:"b) Nội dung: Nhóm 4 HS quan sát ba parabol trên GeoGebra (Δ < 0, Δ = 0, Δ > 0), xác định phần đồ thị nằm phía trên, phía dưới trục Ox và liên hệ với dấu của f(x)."},
      {p:"c) Sản phẩm: Δ < 0 thì f(x) cùng dấu với a với mọi x; Δ = 0 thì f(x) cùng dấu với a với mọi x ≠ −b/(2a); Δ > 0 thì f(x) trái dấu với a khi x nằm giữa hai nghiệm, cùng dấu với a khi x nằm ngoài khoảng hai nghiệm."},
      {p:"d) Tổ chức thực hiện: GV chiếu tệp GeoGebra, giao nhiệm vụ 6 phút; nhóm báo cáo trên bảng nhóm; GV chốt định lí và cách nhớ “trong trái, ngoài cùng”, lưu ý sai lầm thường gặp (quên xét dấu hệ số a)."},
      {h3:"Hoạt động 3: Luyện tập (15 phút)"},
      {p:"Phiếu học tập số 1: xét dấu f(x) = x² − 5x + 6 và g(x) = −x² + 4x − 4; giải bất phương trình x² − x − 12 ≤ 0; tìm m để x² − 2x + m > 0 với mọi x. HS làm cá nhân, đổi chéo chấm theo đáp án GV chiếu."},
      {h3:"Hoạt động 4: Vận dụng (10 phút)"},
      {p:"Bài toán: Một quả bóng được ném lên, độ cao của bóng sau t giây là h(t) = −5t² + 20t + 1 (m). Trong khoảng thời gian nào bóng ở độ cao trên 16 m? Đáp án: −5t² + 20t − 15 > 0 ⇔ 1 < t < 3, tức là từ giây thứ 1 đến giây thứ 3. Giao về nhà: bài tập SGK và câu hỏi mở rộng: tìm một tình huống thực tế dẫn đến bất phương trình bậc hai."}]}
  ]};

export const SLIDES_SAMPLE = [
  {kind:"title", title:"Dấu của tam thức bậc hai", bullets:["Toán 10 · Tiết 24","Trường THPT Tản Đà"], note:"Chào lớp, giới thiệu mục tiêu bài học."},
  {kind:"activity", title:"Khởi động: Khi nào x² − 5x + 6 < 0?", bullets:["Thay thử x = 0; 2,5; 4","Làm cá nhân trong 2 phút","Dự đoán khoảng làm biểu thức âm"], note:"Để HS dự đoán, ghi các đáp án lên bảng."},
  {kind:"content", title:"Quan sát parabol trên GeoGebra", bullets:["Ba trường hợp: Δ < 0, Δ = 0, Δ > 0","Đồ thị phía trên Ox: f(x) > 0","Đồ thị phía dưới Ox: f(x) < 0"], note:"Chiếu tệp GeoGebra, nhóm 4 HS thảo luận."},
  {kind:"content", title:"Định lí về dấu", bullets:["Δ < 0: f(x) cùng dấu a với mọi x","Δ = 0: cùng dấu a, trừ x = −b/(2a)","Δ > 0: “trong trái, ngoài cùng”"], note:"Cho HS phát biểu bằng lời."},
  {kind:"quiz", title:"Luyện tập nhanh", bullets:["Xét dấu x² − 5x + 6","Xét dấu −x² + 4x − 4","Giải x² − x − 12 ≤ 0"], note:"HS làm phiếu số 1, đổi chéo chấm."},
  {kind:"summary", title:"Vận dụng & ghi nhớ", bullets:["Bóng cao trên 16 m khi 1 < t < 3","Về nhà: bài tập SGK"], note:"Tổng kết, giao bài về nhà."}
];

export const EXAM_SAMPLE = {
  mcq:[
    {q:"Tam thức bậc hai nào sau đây có biệt thức Δ < 0?", opts:["x² − 4x + 3","x² + 2x + 5","x² − 6x + 9","x² − 1"], ans:1, level:"Biết", topic:"Dấu của tam thức bậc hai"},
    {q:"Tọa độ đỉnh của parabol y = x² − 4x + 1 là", opts:["(2; −3)","(−2; 13)","(2; 1)","(4; 1)"], ans:0, level:"Biết", topic:"Hàm số bậc hai"},
    {q:"Tập nghiệm của bất phương trình x² − 5x + 6 < 0 là", opts:["(2; 3)","(−∞; 2) ∪ (3; +∞)","[2; 3]","(−3; −2)"], ans:0, level:"Hiểu", topic:"Dấu của tam thức bậc hai"},
    {q:"Hàm số y = −x² + 6x − 5 đồng biến trên khoảng", opts:["(3; +∞)","(−∞; 3)","(−∞; −3)","(−3; +∞)"], ans:1, level:"Hiểu", topic:"Hàm số bậc hai"}],
  tf:[{stem:"Cho tam thức bậc hai f(x) = x² − 2x − 3.", level:"Hiểu", topic:"Dấu của tam thức bậc hai", items:[
    {s:"f(x) có hai nghiệm x = −1 và x = 3.", ans:true},{s:"f(x) > 0 với mọi x ∈ ℝ.", ans:false},{s:"f(x) < 0 khi và chỉ khi −1 < x < 3.", ans:true},{s:"f(0) > 0.", ans:false}]}],
  short:[{q:"Tìm giá trị nhỏ nhất của hàm số y = x² − 6x + 10.", ans:"1", level:"Hiểu", topic:"Hàm số bậc hai"},
         {q:"Có bao nhiêu số nguyên x thỏa mãn x² − x − 12 ≤ 0?", ans:"8", level:"Vận dụng", topic:"Dấu của tam thức bậc hai"}],
  essay:[{q:"Bài 1. a) Xét dấu tam thức f(x) = −x² + 4x − 3.\nb) Tìm m để x² − 2x + m > 0 với mọi số thực x.", points:3, level:"Vận dụng", topic:"Dấu của tam thức bậc hai",
          guide:"a) Δ = 16 − 12 = 4 > 0, f(x) có hai nghiệm x = 1, x = 3 (0,5đ). Vì a = −1 < 0 nên f(x) < 0 khi x < 1 hoặc x > 3; f(x) > 0 khi 1 < x < 3 (1,0đ).\nb) Yêu cầu bài toán ⇔ Δ' = 1 − m < 0 (1,0đ) ⇔ m > 1 (0,5đ)."},
         {q:"Bài 2. Một quả bóng được ném lên từ độ cao 1 m, độ cao của bóng sau t giây là h(t) = −5t² + 20t + 1 (m).\na) Tìm độ cao lớn nhất mà quả bóng đạt được.\nb) Trong khoảng thời gian nào bóng ở độ cao trên 16 m?", points:2, level:"Vận dụng", topic:"Hàm số bậc hai",
          guide:"a) h(t) đạt giá trị lớn nhất tại t = −20/(2·(−5)) = 2 (0,5đ); h(2) = 21, độ cao lớn nhất là 21 m (0,5đ).\nb) h(t) > 16 ⇔ −5t² + 20t − 15 > 0 ⇔ t² − 4t + 3 < 0 (0,5đ) ⇔ 1 < t < 3 (0,5đ)."}]};

export const EDIT_SAMPLE = {name:"phieu-hoc-tap-dau-tam-thuc-bac-hai.docx", paras:[
  "PHIẾU HỌC TẬP – DẤU CỦA TAM THỨC BẬC HAI",
  "Họ và tên: ................................ Lớp: 10A1",
  "Bài 1: Xét dấu các tam thức sau: a) x² - 5x + 6   b) x² - 4x + 4   c) x² + 2x + 5",
  "Bài 2: Giải bất phương trình x² - x - 12 ≤ 0",
  "Câu hỏi thêm: Hãy nêu cách xét dấu tam thức bậc hai đã học theo chương trình củ (SGK Đại số 10 nâng cao).",
  "Lưu ý: học sinh làm bài trong 15 phúc, được sử dụng máy tính cầm tay."]};

export const NOTICE_SAMPLE = {title:"Thông báo", subtitle:"V/v tổ chức họp phụ huynh học sinh cuối học kỳ I, năm học 2026–2027", header:{num:"Số: 125/TB-THPTTD", date:"Phú Thọ, ngày 03 tháng 11 năm 2026"},
  sections:[
    {h:"", blocks:[{p:"Căn cứ Kế hoạch năm học 2026–2027 của Trường THPT Tản Đà, nhà trường thông báo tổ chức họp phụ huynh học sinh cuối học kỳ I như sau:"}]},
    {h:"1. Thời gian", blocks:[{p:"Từ 7 giờ 30 phút đến 10 giờ 00 phút, Chủ nhật, ngày 10/01/2027."}]},
    {h:"2. Địa điểm", blocks:[{p:"Tại các phòng học theo lớp. Sơ đồ phòng họp được niêm yết tại cổng trường."}]},
    {h:"3. Thành phần", blocks:[{li:["Cha mẹ hoặc người giám hộ của học sinh toàn trường.","Giáo viên chủ nhiệm các lớp; Ban đại diện cha mẹ học sinh các lớp."]}]},
    {h:"4. Nội dung", blocks:[{li:["Thông báo kết quả học tập và rèn luyện học kỳ I của học sinh.","Trao đổi kế hoạch học kỳ II, kế hoạch ôn thi tốt nghiệp THPT của học sinh khối 12 và định hướng nghề nghiệp, tuyển sinh đại học.","Giới thiệu việc sử dụng AI trong dạy và học tại trường, lấy ý kiến cha mẹ học sinh."]}]},
    {h:"5. Tổ chức thực hiện", blocks:[{li:["Giáo viên chủ nhiệm gửi giấy mời và nhắn tin qua ứng dụng của trường trước ngày 05/01/2027.","Văn phòng chuẩn bị phòng họp, biển chỉ dẫn và nước uống."]},{p:"Đề nghị các bộ phận, cá nhân liên quan thực hiện nghiêm túc nội dung thông báo này./."}]}],
  recv:["Các tổ chuyên môn, GVCN (để thực hiện);","Ban đại diện CMHS (để phối hợp);","Lưu: VT."], signer:"KT. HIỆU TRƯỞNG\nPHÓ HIỆU TRƯỞNG\n\n\nPhạm Thị Lan"};

export const PERIODS=[["Tiết 1","7:00–7:45"],["Tiết 2","7:50–8:35"],["Tiết 3","8:50–9:35"],["Tiết 4","9:40–10:25"],["Tiết 5","10:30–11:15"]];

export const DAYN=["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"];

export const L8="Dấu của tam thức bậc hai", L9="Cấp số cộng";

export const TT={
  "GV-0108":{subj:"Toán", hr:"10A1", items:[
    [0,1,"10A1","Chào cờ","Sân trường","",true],[0,2,"10A1","Toán","P.204",L8,true],[0,3,"10A2","Toán","P.205",L8,true],[0,4,"11A1","Toán","P.301",L9,true],
    [1,1,"11A2","Toán","P.302",L9,true],[1,3,"11A1","Toán","P.301",L9,true],[1,4,"10A2","Toán","P.205",L8,true],[1,5,"11A2","Toán","P.302","Luyện tập: cấp số cộng",false],
    [2,2,"10A1","Toán","P.204",L8,true],[2,3,"11A1","Toán","P.301","Luyện tập: cấp số cộng",false],[2,5,"10A2","Toán","P.205",L8,false],
    [3,1,"11A2","Toán","P.302",L9,false],[3,3,"10A1","Toán","P.204","Luyện tập chung",false],[3,4,"10A2","Toán","P.205","Luyện tập chung",false],
    [4,2,"10A1","Toán","P.204","Luyện tập chung",false],[4,3,"11A1","Toán","P.301","Ôn tập giữa chương",false],[4,4,"11A2","Toán","P.302","Ôn tập giữa chương",false],
    [5,5,"10A1","Sinh hoạt lớp","P.204","",true]],
    events:[[1,"14:00","Họp tổ Toán – Tin","Phòng hội đồng"],[3,"15:00","Phụ đạo 10A1 – nhóm cần củng cố","P.204"]],
    classes:[["10A1",6.9,13],["10A2",6.4,21],["11A1",7.3,8],["11A2",6.8,14]]},
  "GV-0042":{subj:"Tiếng Anh", hr:"11A1", items:[
    [0,3,"11A1","Tiếng Anh","P.301","Unit 1. A long and healthy life",true],[0,4,"10A3","Tiếng Anh","P.106","Unit 3. Music",true],
    [1,2,"11A2","Tiếng Anh","P.302","Unit 1. A long and healthy life",true],[1,3,"10A4","Tiếng Anh","P.107","Unit 3. Music",true],[1,5,"11A1","Tiếng Anh","P.301","Unit 1. Speaking",false],
    [2,1,"10A3","Tiếng Anh","P.106","Unit 3. Music",false],[2,4,"11A2","Tiếng Anh","P.302","Unit 1. Speaking",false],
    [3,2,"10A4","Tiếng Anh","P.107","Unit 3. Skills",false],[3,3,"11A1","Tiếng Anh","P.301","Unit 1. Skills",false],
    [4,1,"11A2","Tiếng Anh","P.302","Unit 1. Skills",false],[4,4,"10A3","Tiếng Anh","P.106","Unit 3. Skills",false],[4,5,"10A4","Tiếng Anh","P.107","Unit 3. Review",false],
    [0,1,"11A1","Chào cờ","Sân trường","",true],[5,5,"11A1","Sinh hoạt lớp","P.301","",true]],
    events:[[1,"14:00","Họp tổ Ngoại ngữ","Phòng hội đồng"],[4,"14:30","CLB Speaking 11A","P.301"]],
    classes:[["11A1",7.1,9],["11A2",6.7,15],["10A3",7.4,6],["10A4",6.9,11]]}
};

/* Danh bạ giáo viên trong trường — dùng cho trợ lý trả lời câu hỏi về lịch dạy của đồng nghiệp */
export const STAFF_LIST=[
  {code:"GV-0108", name:"Thầy Lê Văn Nam", alias:["nam"], subj:"Toán", hr:"10A1", to:"Tổ Toán – Tin"},
  {code:"GV-0042", name:"Cô Trần Thu Hạnh", alias:["hạnh"], subj:"Tiếng Anh", hr:"11A1", to:"Tổ Ngoại ngữ"},
  {code:"QT-0001", name:"Cô Phạm Thị Lan", alias:["lan"], subj:"Toán", hr:"", to:"Ban giám hiệu", pos:"Phó hiệu trưởng"},
  {name:"Cô Nguyễn Thị Hoa", alias:["hoa"], subj:"Ngữ văn", hr:"11A2", to:"Tổ Văn – Sử – Địa",
    days:"Dạy Ngữ văn các lớp 11A1, 11A2, 10A3 vào thứ 2, 3, 5; chủ nhiệm lớp 11A2."},
  {name:"Thầy Hoàng Minh Đức", alias:["đức"], subj:"Vật lí", hr:"", to:"Tổ Lý – Hóa – Sinh",
    days:"Dạy Vật lí các lớp 10A1, 10A2, 11A1 vào thứ 3, 4, 6; phụ trách phòng thí nghiệm chiều thứ Năm."},
  {name:"Cô Đặng Thu Hường", alias:["hường"], subj:"Sinh học", hr:"10A3", to:"Tổ Lý – Hóa – Sinh",
    days:"Dạy Sinh học khối 10, 11 vào thứ 2, 4; chủ nhiệm lớp 10A3."}
];

/* Học sinh theo lớp — dữ liệu mẫu: điểm, số điện thoại liên hệ, phụ huynh */
export const STUDENTS={
  "10A1":[
    {name:"Nguyễn Văn An", id:"HS26-1101", avg:8.6, note:"Học lực khá, tích cực phát biểu.", parent:"anh Nguyễn Văn Bình (bố)", phone:"0912 345 101"},
    {name:"Trần Gia Bảo", id:"HS26-1102", avg:6.8, note:"Tiến bộ rõ ở nửa cuối kỳ.", parent:"chị Trần Thị Mai (mẹ)", phone:"0912 345 102"},
    {name:"Phạm Đức Huy", id:"HS26-1103", avg:4.9, note:"Điểm giảm so với năm lớp 9, đang xếp vào nhóm phụ đạo chiều thứ Năm.", parent:"anh Phạm Đức Hùng (bố)", phone:"0912 345 103"},
    {name:"Lê Khánh Linh", id:"HS26-1104", avg:9.1, note:"Học tốt, hay giúp bạn trong nhóm.", parent:"chị Lê Thị Nga (mẹ)", phone:"0912 345 104"},
    {name:"Hoàng Tuấn Kiệt", id:"HS26-1105", avg:5.6, note:"Nghỉ 3 buổi trong tháng 10, cần theo dõi chuyên cần.", parent:"anh Hoàng Tuấn Anh (bố)", phone:"0912 345 105"},
    {name:"Ngô Thanh Tùng", id:"HS26-1106", avg:6.2, note:"Chưa nộp 2 bài tập gần nhất.", parent:"chị Ngô Thanh Hà (mẹ)", phone:"0912 345 106"}
  ],
  "11A1":[
    {name:"Nguyễn Minh Anh", id:"HS26-0915", avg:8.9, note:"Phát âm tốt, tự tin nói tiếng Anh.", parent:"anh Nguyễn Minh Tâm (bố)", phone:"0912 345 915"},
    {name:"Đỗ Gia Hân", id:"HS26-0916", avg:7.4, note:"Cần luyện thêm kỹ năng viết.", parent:"chị Đỗ Thị Hoa (mẹ)", phone:"0912 345 916"},
    {name:"Vũ Đình Khoa", id:"HS26-0917", avg:6.1, note:"Hay quên từ vựng, cần ôn lại Unit 1.", parent:"anh Vũ Đình Long (bố)", phone:"0912 345 917"}
  ]
};

/* Quy định của trường — trợ lý dùng để trả lời câu hỏi của giáo viên (đặc biệt giáo viên mới) */
export const SCHOOL_RULES=[
  {key:"gio-giac", m:/giờ|tác phong|trang phục|đến (lớp|trường)|ra vào/i, title:"Giờ giấc và tác phong",
   body:"Giáo viên có mặt tại trường trước giờ dạy ít nhất 15 phút, mặc trang phục công sở hoặc áo đồng phục trường vào thứ Hai. Vào lớp trễ quá 5 phút phải báo giáo vụ."},
  {key:"giao-an", m:/giáo án|soạn (bài|giáo án)|nộp giáo án|kế hoạch bài dạy/i, title:"Soạn và nộp giáo án",
   body:"Giáo án soạn theo Phụ lục IV Công văn 5512, nộp bản PDF cho tổ trưởng chuyên môn duyệt trước ít nhất 3 ngày so với tiết dạy, nộp qua hệ thống quản lý của trường."},
  {key:"dung-ai", m:/\bai\b|trí tuệ nhân tạo|dùng ai|công cụ ai|dùng trợ lý/i, title:"Sử dụng AI trong giảng dạy",
   body:"Giáo viên được dùng Tản Đà AI để soạn, sửa tài liệu, slide, đề kiểm tra và hỏi thông tin phục vụ công tác. Mọi tài liệu AI soạn phải được giáo viên duyệt lại trước khi dùng; không gửi trực tiếp bài tập hay tin nhắn cho học sinh/phụ huynh mà chưa duyệt. Không nhập thông tin cá nhân của học sinh vào các công cụ AI ngoài hệ thống của trường."},
  {key:"danh-gia", m:/điểm|đánh giá|chấm bài|nhập điểm|sổ điểm/i, title:"Đánh giá và nhập điểm",
   body:"Đánh giá học sinh theo Thông tư 22/2021/BGDĐT. Điểm kiểm tra nhập vào sổ điểm điện tử trong vòng 3 ngày sau khi chấm. Sửa điểm sau khi đã khóa sổ phải có biên bản và được tổ trưởng xác nhận."},
  {key:"bao-mat", m:/bảo mật|thông tin cá nhân|quyền riêng tư|riêng tư|lộ thông tin/i, title:"Bảo mật thông tin học sinh",
   body:"Thông tin điểm, số điện thoại, hoàn cảnh gia đình của học sinh chỉ dùng trong phạm vi công tác giảng dạy và chủ nhiệm, không chia sẻ ra ngoài hoặc đăng lên mạng xã hội. Giáo viên chỉ được cấp quyền xem thông tin của đúng các lớp mình được phân công."},
  {key:"nghi-phep", m:/nghỉ phép|xin phép|dạy thay|báo giảng/i, title:"Nghỉ phép và dạy thay",
   body:"Giáo viên nghỉ phải báo tổ trưởng và giáo vụ trước ít nhất 1 ngày (trừ trường hợp đột xuất) qua đơn điện tử, kèm đề xuất người dạy thay hoặc nội dung ôn tập cho lớp."},
  {key:"hop", m:/họp|sinh hoạt (tổ|chuyên môn)/i, title:"Họp và sinh hoạt chuyên môn",
   body:"Tổ chuyên môn họp định kỳ vào chiều thứ Ba hằng tuần tại Phòng hội đồng. Giáo viên vắng họp không phép phải gửi ý kiến bằng văn bản cho tổ trưởng trong ngày."}
];

export const STRANDS=[["Tư duy lấy con người làm trung tâm","AI phục vụ con người; con người quyết định cuối cùng.",["AI quanh em: nhận diện ứng dụng AI hằng ngày","Khi nào nên và không nên dùng AI"]],
  ["Đạo đức AI","Trung thực, quyền riêng tư, thiên kiến, trách nhiệm.",["Dùng AI trong học tập: trung thực là gì?","Dữ liệu cá nhân của em đi đâu?"]],
  ["Kỹ thuật và ứng dụng AI","Dữ liệu, mô hình, cách AI học và mắc lỗi.",["AI học từ dữ liệu như thế nào?","Viết prompt hiệu quả","Kiểm chứng thông tin AI đưa ra"]],
  ["Thiết kế hệ thống AI","Giải quyết vấn đề thực tế bằng một hệ thống AI nhỏ.",["Dự án: chatbot hỏi đáp thư viện trường"]]];

export const CLAIMS=[{t:"Vịnh Hạ Long được UNESCO công nhận là Di sản thiên nhiên thế giới lần đầu vào năm 1994.",ok:true},
  {t:"Sông Mê Công chảy qua 6 quốc gia trước khi đổ ra Biển Đông.",ok:true},
  {t:"Đỉnh Fansipan cao khoảng 3.143 m và là đỉnh núi cao nhất Đông Nam Á.",ok:false,why:"Fansipan là đỉnh cao nhất bán đảo Đông Dương, không phải Đông Nam Á. Đỉnh cao nhất Đông Nam Á là Hkakabo Razi (Myanmar), cao gần 5.900 m."},
  {t:"Việt Nam có đường bờ biển dài hơn 3.260 km.",ok:true}];

export const ETH={scene:"Tối mai phải nộp bài văn nghị luận. Bạn Nam định nhờ AI viết toàn bộ bài rồi chép lại nộp cho cô. Nam rủ em làm giống vậy.",
  opts:[{t:"Làm theo Nam vì cô sẽ không phát hiện được.",k:"bad",fb:"Nộp bài AI viết như bài của mình là thiếu trung thực, và em mất cơ hội luyện kỹ năng viết. Phát hiện được hay không không làm việc đó trở nên đúng."},
        {t:"Không dùng AI vì AI là thứ xấu, chỉ để gian lận.",k:"mid",fb:"AI không xấu hay tốt tự thân. Dùng đúng cách (lập dàn ý, góp ý diễn đạt) thì AI giúp em học tốt hơn."},
        {t:"Nhờ AI gợi ý dàn ý, tự viết bài, ghi chú rõ đã dùng AI ở phần nào.",k:"good",fb:"Lựa chọn tốt: em vẫn tự viết, và minh bạch về việc dùng AI."},
        {t:"Tự viết bài, sau đó nhờ AI chỉ ra lỗi diễn đạt rồi tự sửa, nộp kèm ghi chú.",k:"best",fb:"Lựa chọn tốt nhất: AI đóng vai người góp ý, em vẫn là tác giả và chịu trách nhiệm với bài viết."}]};

export const EN_BANK=[{q:"Choose the word that is closest in meaning to “stress”.",opts:["pressure","relax","balance","energy"],ans:0},{q:"Teenagers should ___ a healthy routine to stay fit.",opts:["keep","make","take","do"],ans:0},{q:"Which activity helps you reduce stress?",opts:["Staying up late","Doing exercise","Skipping breakfast","Playing games all night"],ans:1}];

export const CODE_PROBLEMS = [
  {id:"p1", title:"Tổng các chữ số", level:"Cơ bản", statement:"Nhập một số nguyên dương n (n ≤ 10⁹). In ra tổng các chữ số của n.", sample:[["2026","10"]], tests:[["2026","10"],["7","7"],["1000000000","1"],["99999","45"]],
   starter:"n = input()\ntong = 0\nfor c in n:\n    tong = tong + c\nprint(tong)\n", hint:"Dòng 4: biến c là một ký tự (kiểu chuỗi), còn tong là số. Python không cộng được số với chuỗi. Em cần đổi c sang số trước khi cộng — hàm nào làm việc đó?"},
  {id:"p2", title:"Kiểm tra số nguyên tố", level:"Vừa", statement:"Nhập số nguyên n (1 ≤ n ≤ 10⁶). In YES nếu n là số nguyên tố, ngược lại in NO.", sample:[["17","YES"],["21","NO"]], tests:[["2","YES"],["1","NO"],["17","YES"],["21","NO"],["97","YES"]],
   starter:'n = int(input())\nla_nguyen_to = True\nfor i in range(2, n):\n    if n % i == 0:\n        la_nguyen_to = False\nif la_nguyen_to:\n    print("YES")\nelse:\n    print("NO")\n', hint:"Chương trình đúng với hầu hết các số, nhưng hãy thử n = 1. Theo định nghĩa, 1 có phải số nguyên tố không? Vòng lặp range(2, 1) chạy bao nhiêu lần?"},
  {id:"p3", title:"Đếm nguyên âm", level:"Cơ bản", statement:"Nhập một dòng chữ tiếng Anh. In ra số nguyên âm (a, e, i, o, u), không phân biệt chữ hoa, chữ thường.", sample:[["Hello World","3"]], tests:[["Hello World","3"],["AI","2"],["xyz","0"],["Programming Is Fun","5"]],
   starter:"s = input()\n# Viết chương trình của em ở đây\n", hint:"Gợi ý: duyệt từng ký tự của s.lower() và kiểm tra ký tự đó có nằm trong chuỗi \"aeiou\" không."}
];
