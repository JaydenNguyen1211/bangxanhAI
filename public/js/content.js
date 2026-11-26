/* Tản Đà AI · content.js — mã nguồn, sửa trực tiếp */
import { $, esc, ico, shorten, sleep, uid } from "./core.js";

export const STOP = { flag:false };

export const pick = (r,a) => a[Math.floor(r()*a.length)];

export function RNG(seed){ let s=(seed>>>0)%2147483646+1; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; }

export const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1));

export const fN=n=>{ const neg=n<0; let s=String(Math.abs(n)); if(Math.abs(n)>=10000) s=s.replace(/\B(?=(\d{3})+(?!\d))/g," "); return (neg?"−":"")+s; };

export function mkMCQ(r,q,correct,ds){ const all=[correct,...ds]; const idx=[0,1,2,3].sort(()=>r()-.5); return {q, opts:idx.map(i=>all[i]), ans:idx.indexOf(0)}; }

// Viết tam thức x² + bx + c theo kí hiệu Unicode
export const tq=(b,c)=>"x²"+(b?(b<0?" − ":" + ")+(Math.abs(b)===1?"":Math.abs(b))+"x":"")+(c?(c<0?" − ":" + ")+Math.abs(c):"");

// Ngân hàng câu hỏi sinh tự động – Toán 10 (CT GDPT 2018)
//   "hdt": Dấu của tam thức bậc hai, bất phương trình bậc hai một ẩn
//   "pt" : Hàm số bậc hai và đồ thị
export const GENS=[
 {t:"hdt",p:"mcq",l:"Biết",f:r=>{ const p=ri(r,1,4), q=ri(r,p+1,7), b=-(p+q), c=p*q; return mkMCQ(r,`Biệt thức Δ của tam thức f(x) = ${tq(b,c)} là`,fN(b*b-4*c),[fN(b*b+4*c),fN(b*b-2*c),fN(4*c-b*b)]); }},
 {t:"hdt",p:"mcq",l:"Biết",f:r=>{ const p=ri(r,1,4), q=ri(r,p+1,8); return mkMCQ(r,`Tam thức f(x) = ${tq(-(p+q),p*q)} có hai nghiệm là`,`x = ${p} và x = ${q}`,[`x = −${p} và x = −${q}`,`x = −${p} và x = ${q}`,`x = ${p} và x = −${q}`]); }},
 {t:"hdt",p:"mcq",l:"Hiểu",f:r=>{ const p=ri(r,1,4), q=ri(r,p+1,8); return mkMCQ(r,`Tập nghiệm của bất phương trình ${tq(-(p+q),p*q)} < 0 là`,`(${p}; ${q})`,[`(−∞; ${p}) ∪ (${q}; +∞)`,`[${p}; ${q}]`,`(−${q}; −${p})`]); }},
 {t:"hdt",p:"mcq",l:"Vận dụng",f:r=>{ const k=ri(r,1,4); return mkMCQ(r,`Tất cả giá trị của tham số m để ${tq(-2*k,0)} + m > 0 với mọi x ∈ ℝ là`,`m > ${k*k}`,[`m < ${k*k}`,`m ≥ ${k*k}`,`m ≤ ${k*k}`]); }},
 {t:"pt",p:"mcq",l:"Biết",f:r=>{ const k=ri(r,1,5), c=ri(r,1,9); return mkMCQ(r,`Trục đối xứng của parabol y = ${tq(-2*k,c)} là`,`x = ${k}`,[`x = −${k}`,`x = ${2*k}`,`y = ${k}`]); }},
 {t:"pt",p:"mcq",l:"Hiểu",f:r=>{ const k=ri(r,1,5), c=ri(r,1,9); return mkMCQ(r,`Tọa độ đỉnh của parabol y = ${tq(-2*k,c)} là`,`(${k}; ${fN(c-k*k)})`,[`(−${k}; ${fN(c-k*k)})`,`(${k}; ${c})`,`(${2*k}; ${c})`]); }},
 {t:"pt",p:"mcq",l:"Hiểu",f:r=>{ const k=ri(r,2,5), c=ri(r,1,9); return mkMCQ(r,`Giá trị nhỏ nhất của hàm số y = ${tq(-2*k,c)} là`,fN(c-k*k),[fN(c),fN(c+k*k),fN(c-k)]); }},
 {t:"pt",p:"mcq",l:"Vận dụng",f:r=>{ const k=ri(r,1,5), c=ri(r,1,9); return mkMCQ(r,`Hàm số y = ${tq(-2*k,c)} đồng biến trên khoảng`,`(${k}; +∞)`,[`(−∞; ${k})`,`(−${k}; +∞)`,`(−∞; +∞)`]); }},
 {t:"hdt",p:"tf",l:"Hiểu",f:r=>{ const p=ri(r,1,4), q=ri(r,p+1,8); return {stem:`Cho tam thức bậc hai f(x) = ${tq(-(p+q),p*q)}.`, items:[{s:`f(x) có hai nghiệm phân biệt x = ${p} và x = ${q}.`,ans:true},{s:`f(x) > 0 với mọi x ∈ ℝ.`,ans:false},{s:`f(x) < 0 khi và chỉ khi ${p} < x < ${q}.`,ans:true},{s:`f(x) = (x + ${p})(x + ${q}).`,ans:false}]}; }},
 {t:"pt",p:"tf",l:"Hiểu",f:r=>{ const k=ri(r,1,5), c=ri(r,1,9); return {stem:`Cho hàm số y = ${tq(-2*k,c)} có đồ thị là parabol (P).`, items:[{s:`(P) có trục đối xứng là đường thẳng x = ${k}.`,ans:true},{s:`Đỉnh của (P) là điểm I(${k}; ${fN(c-k*k)}).`,ans:true},{s:`Hàm số nghịch biến trên khoảng (${k}; +∞).`,ans:false},{s:`Hàm số có giá trị lớn nhất bằng ${fN(c-k*k)}.`,ans:false}]}; }},
 {t:"hdt",p:"short",l:"Biết",f:r=>{ const p=ri(r,1,4), q=ri(r,p+1,8); return {q:`Tính biệt thức Δ của tam thức ${tq(-(p+q),p*q)}.`, ans:fN((p-q)*(p-q))}; }},
 {t:"hdt",p:"short",l:"Hiểu",f:r=>{ const p=ri(r,1,4), q=ri(r,p+1,8); return {q:`Có bao nhiêu số nguyên x thỏa mãn ${tq(-(p+q),p*q)} ≤ 0?`, ans:fN(q-p+1)}; }},
 {t:"hdt",p:"short",l:"Vận dụng",f:r=>{ const k=ri(r,1,4); return {q:`Tìm số nguyên m nhỏ nhất để ${tq(-2*k,0)} + m > 0 với mọi x ∈ ℝ.`, ans:fN(k*k+1)}; }},
 {t:"pt",p:"short",l:"Biết",f:r=>{ const k=ri(r,1,6), c=ri(r,1,9); return {q:`Tìm hoành độ đỉnh của parabol y = ${tq(-2*k,c)}.`, ans:fN(k)}; }},
 {t:"pt",p:"short",l:"Hiểu",f:r=>{ const k=ri(r,1,5), c=ri(r,1,9); return {q:`Tìm giá trị nhỏ nhất của hàm số y = ${tq(-2*k,c)}.`, ans:fN(c-k*k)}; }},
 {t:"pt",p:"short",l:"Vận dụng",f:r=>{ const L=ri(r,5,15); return {q:`Dùng ${4*L} m lưới rào kín bốn cạnh một mảnh vườn hình chữ nhật. Diện tích lớn nhất của mảnh vườn là bao nhiêu mét vuông?`, ans:fN(L*L)}; }},
 {t:"hdt",p:"essay",l:"Hiểu",f:r=>{ const p=ri(r,1,4), q=ri(r,p+1,8); return {q:`Xét dấu tam thức bậc hai f(x) = ${tq(-(p+q),p*q)}.`, points:1.5, guide:`Δ = ${fN((p-q)*(p-q))} > 0, f(x) có hai nghiệm x = ${p}, x = ${q} (0,5đ).\nVì a = 1 > 0 nên f(x) > 0 khi x < ${p} hoặc x > ${q}; f(x) < 0 khi ${p} < x < ${q} (1,0đ).`}; }},
 {t:"hdt",p:"essay",l:"Vận dụng",f:r=>{ const t2=ri(r,3,4), v=5*(1+t2), h0=ri(r,1,5), H=h0+5*t2; return {q:`Một quả bóng được ném lên, độ cao của bóng sau t giây là h(t) = −5t² + ${v}t + ${h0} (m). Trong khoảng thời gian nào bóng ở độ cao trên ${H} m?`, points:2, guide:`h(t) > ${H} ⇔ −5t² + ${v}t − ${5*t2} > 0 ⇔ t² − ${1+t2}t + ${t2} < 0 (1,0đ)\n⇔ 1 < t < ${t2} (0,5đ). Vậy bóng ở độ cao trên ${H} m trong khoảng từ giây thứ 1 đến giây thứ ${t2} (0,5đ).`}; }},
 {t:"pt",p:"essay",l:"Hiểu",f:r=>{ const k=ri(r,1,4), c=ri(r,1,9); return {q:`Lập bảng biến thiên và vẽ đồ thị hàm số y = ${tq(-2*k,c)}.`, points:1.5, guide:`Đỉnh I(${k}; ${fN(c-k*k)}), trục đối xứng x = ${k} (0,5đ).\na = 1 > 0: hàm số nghịch biến trên (−∞; ${k}), đồng biến trên (${k}; +∞); lập bảng biến thiên (0,5đ).\nĐồ thị cắt trục Oy tại (0; ${c}); vẽ đúng parabol (0,5đ).`}; }},
 {t:"pt",p:"essay",l:"Vận dụng",f:r=>{ const L=8*ri(r,3,6); return {q:`Dùng ${L} m lưới rào ba cạnh của một mảnh vườn hình chữ nhật, cạnh còn lại là bức tường.\na) Gọi x (m) là độ dài cạnh vuông góc với tường. Viết biểu thức diện tích S(x) của mảnh vườn.\nb) Tìm x để diện tích mảnh vườn lớn nhất.`, points:2, guide:`a) Cạnh song song với tường dài ${L} − 2x (m), điều kiện 0 < x < ${L/2}; S(x) = x(${L} − 2x) = −2x² + ${L}x (1,0đ).\nb) S(x) là hàm số bậc hai có a = −2 < 0 nên đạt giá trị lớn nhất tại x = ${L/4} (0,5đ); khi đó S = ${fN(L*L/8)} m² (0,5đ).`}; }}
];

export const TOPIC_KEY = t => /tam thức|xét dấu|bất phương trình bậc hai|nhân tử/i.test(t)?"hdt":/hàm số bậc hai|parabol|đồ thị hàm số/i.test(t)?"pt":null;

export function genQ(topicKey, part, level, seed){
  let cands=GENS.filter(g=>g.t===topicKey&&g.p===part&&g.l===level);
  if(!cands.length) cands=GENS.filter(g=>g.t===topicKey&&g.p===part);
  if(!cands.length) return null;
  const r=RNG(seed); const g=cands[Math.floor(r()*cands.length)]; return {...g.f(r), src:"gen"};
}

export async function mockStream(full, onText, cps=420){
  let i=0; const step=Math.max(3,Math.round(cps/30));
  while(i<full.length){ i=Math.min(full.length,i+step); onText(full.slice(0,i)); await sleep(33); if(STOP.flag) break; }
  return full.slice(0,i);
}

export const lessonOf = B => String(B.prompt||"").split(/[.\n]/)[0].trim() || "Bài học";

export function mockOutline(B){
  const t=B.type, two=/90/.test(B.time||"");
  if (t.startsWith("Kế hoạch")) { const o=[["I. Mục tiêu","Kiến thức, năng lực, phẩm chất"],["II. Thiết bị dạy học và học liệu","Đồ dùng của GV và HS"],[`Hoạt động 1: Mở đầu (${two?10:5} phút)`,"Tình huống gợi vấn đề"],[`Hoạt động 2: Hình thành kiến thức (${two?35:15} phút)`,"HS tự xây dựng kiến thức"],[`Hoạt động 3: Luyện tập (${two?30:15} phút)`,"Phiếu học tập, chấm chéo"],[`Hoạt động 4: Vận dụng (${two?15:10} phút)`,"Bài toán thực tế, giao về nhà"]];
    if (/phân hóa/i.test(B.prompt)) o.splice(5,0,["Phân hóa theo đối tượng học sinh","Nhiệm vụ cho 3 nhóm"]); return o; }
  if (t==="Phiếu học tập") return [["A. Nhắc lại kiến thức","Công thức cần nhớ"],["B. Bài tập cơ bản","3 bài"],["C. Bài tập vận dụng","2 bài"],["D. Tự đánh giá","HS tự đánh dấu mức độ"]];
  if (t==="Đề cương ôn tập") return [["I. Kiến thức trọng tâm",""],["II. Các dạng bài tập thường gặp",""],["III. Bài tập tự luyện",""],["IV. Gợi ý cách ôn tập",""]];
  return [["Căn cứ",""],["1. Thời gian",""],["2. Địa điểm",""],["3. Thành phần",""],["4. Nội dung",""],["5. Tổ chức thực hiện",""]];
}

export function exercisesFor(B,n,level){ const tk=TOPIC_KEY(B.prompt); if(!tk) return null; const out=[]; for(let i=0;i<n;i++){ const g=genQ(tk,i%2?"short":"mcq",level||["Biết","Hiểu","Vận dụng"][i%3],Date.now()+i*977); if(g) out.push(g); } return out; }

export function mockSection(title, B){
  const L=lessonOf(B), tk=TOPIC_KEY(B.prompt), hdt=tk==="hdt";
  if (/mục tiêu/i.test(title)) return `### 1. Kiến thức\n- ${hdt&&/dấu|tam thức/i.test(L)?"Phát biểu được định lí về dấu của tam thức bậc hai; xét được dấu tam thức bậc hai dựa vào dấu của biệt thức Δ và hệ số a.":`Nhận biết và phát biểu được nội dung chính của bài “${L}”.`}\n- Vận dụng kiến thức để giải bài tập và bài toán thực tế đơn giản.\n### 2. Năng lực\n- Tư duy và lập luận toán học: giải thích được kết quả bằng phép biến đổi và bằng mô hình trực quan.\n- Giao tiếp và hợp tác: thảo luận nhóm, trình bày lời giải rõ ràng, dùng đúng kí hiệu.\n### 3. Phẩm chất\n- Chăm chỉ, trung thực khi tự đánh giá; có trách nhiệm khi làm việc nhóm.`;
  if (/thiết bị|học liệu/i.test(title)) return `- Giáo viên: máy chiếu, slide bài giảng, phiếu học tập${/mô hình/i.test(B.prompt)?", mô hình bìa màu để ghép hình":""}.\n- Học sinh: SGK ${B.subj} ${B.grade}, bảng nhóm, bút dạ; ôn lại kiến thức bài trước.`;
  if (/mở đầu|khởi động/i.test(title)) return `a) Mục tiêu: Tạo hứng thú, gợi nhu cầu tìm hiểu “${L}”.\nb) Nội dung: ${/trò chơi/i.test(B.prompt)?"Trò chơi “Ai nhanh hơn?”: 4 đội thi tính nhanh trong 30 giây.":hdt?"Bài toán: Với giá trị nào của x thì x² − 5x + 6 < 0? Thay thử vài giá trị của x rồi dự đoán."  :"Tình huống thực tế liên quan đến bài học."}\nc) Sản phẩm: Câu trả lời và cách làm của học sinh.\nd) Tổ chức thực hiện:\n| Hoạt động của GV và HS | Sản phẩm dự kiến |\n| Bước 1 – Giao nhiệm vụ: GV nêu tình huống, HS làm cá nhân 2 phút. | HS ghi kết quả ra nháp. |\n| Bước 2 – Thực hiện: GV quan sát, ghi nhận các cách làm khác nhau. | Nhiều cách tính khác nhau. |\n| Bước 3 – Báo cáo, thảo luận: 2 HS trình bày, lớp nhận xét. | Phát hiện cách làm nhanh hơn. |\n| Bước 4 – Kết luận: GV dẫn dắt vào bài mới. | HS nêu câu hỏi cần giải quyết. |`;
  if (/hình thành/i.test(title)) return `a) Mục tiêu: Học sinh tự xây dựng được kiến thức của bài “${L}”.\nb) Nội dung: ${/mô hình|geogebra|đồ thị/i.test(B.prompt)?"Nhóm 4 HS quan sát các parabol trên GeoGebra, xác định phần đồ thị nằm trên, dưới trục Ox; ":""}thực hiện phép biến đổi và rút ra công thức.\nc) Sản phẩm: ${hdt&&/dấu|tam thức/i.test(L)?"Định lí về dấu: Δ < 0 thì f(x) cùng dấu a với mọi x; Δ = 0 thì f(x) cùng dấu a với mọi x ≠ −b/(2a); Δ > 0 thì f(x) trái dấu a khi x nằm giữa hai nghiệm, cùng dấu a khi x nằm ngoài khoảng hai nghiệm.":"Công thức và ví dụ minh họa do nhóm trình bày."}\nd) Tổ chức thực hiện: GV giao nhiệm vụ 6 phút; nhóm báo cáo trên bảng nhóm; GV chốt kiến thức, lưu ý sai lầm thường gặp.`;
  if (/luyện tập|bài tập cơ bản|tự luyện/i.test(title)){ const ex=exercisesFor(B,3); return `a) Mục tiêu: Củng cố, rèn kỹ năng vận dụng kiến thức vừa học.\nb) Nội dung: Phiếu học tập số 1:\n${ex?ex.map((q,i)=>`- Bài ${i+1}: ${q.q}${q.opts?" ("+q.opts.map((o,j)=>"ABCD"[j]+". "+o).join("; ")+")":""}`).join("\n"):"- Bài 1–3: các bài tập cơ bản trong SGK."}\nc) Sản phẩm: ${ex?"Đáp án: "+ex.map((q,i)=>`Bài ${i+1}: ${q.opts?"ABCD"[q.ans]+". "+q.opts[q.ans]:q.ans}`).join("; ")+".":"Lời giải của học sinh."}\nd) Tổ chức thực hiện: HS làm cá nhân 10 phút, đổi chéo chấm theo đáp án GV chiếu.`; }
  if (/phân hóa/i.test(title)) return `- Nhóm cần củng cố: làm ví dụ mẫu từng bước cùng GV, có thẻ gợi ý công thức.\n- Nhóm đạt: hoàn thành Phiếu học tập số 1 trong 10 phút.\n- Nhóm khá giỏi: bài mở rộng, tự đặt một đề tương tự và giải.`;
  if (/vận dụng/i.test(title)) return `a) Mục tiêu: Vận dụng kiến thức vào tình huống thực tế.\nb) Nội dung: ${hdt?"Một quả bóng được ném lên, độ cao sau t giây là h(t) = −5t² + 20t + 1 (m). Trong khoảng thời gian nào bóng ở độ cao trên 16 m?":"Bài toán gắn với đời sống của học sinh."}\nc) Sản phẩm: ${hdt?"−5t² + 20t − 15 > 0 ⇔ 1 < t < 3: từ giây thứ 1 đến giây thứ 3.":"Lời giải của học sinh."}\nd) Tổ chức thực hiện: HS làm theo cặp, GV giao phần còn lại về nhà.`;
  if (/nhắc lại|trọng tâm/i.test(title)) return hdt?"- f(x) = ax² + bx + c (a ≠ 0), Δ = b² − 4ac\n- Δ < 0: f(x) cùng dấu với a với mọi x\n- Δ > 0: f(x) trái dấu với a khi x nằm giữa hai nghiệm, cùng dấu với a khi x nằm ngoài khoảng hai nghiệm":`- Các kiến thức chính của bài “${L}”.`;
  if (/vận dụng|dạng bài/i.test(title)){ const ex=exercisesFor(B,2,"Vận dụng"); return ex?ex.map((q,i)=>`- Bài ${i+1}: ${q.q}`).join("\n"):"- Bài toán thực tế."; }
  if (/tự đánh giá|gợi ý cách ôn/i.test(title)) return "- Em làm đúng bao nhiêu bài? ☐ 0–1 ☐ 2–3 ☐ 4–5\n- Phần nào em còn thấy khó? ……………………………………";
  if (/căn cứ/i.test(title)) return "Căn cứ Kế hoạch năm học 2026–2027 của Trường THPT Tản Đà, nhà trường thông báo như sau:";
  if (/thời gian/i.test(title)) { const d=(B.prompt.match(/\d{1,2}\/\d{1,2}\/\d{4}/)||["10/01/2027"])[0]; return `Từ 7 giờ 30 phút đến 10 giờ 00 phút, ngày ${d}.`; }
  if (/địa điểm/i.test(title)) return "Tại các phòng học theo lớp; sơ đồ phòng được niêm yết tại cổng trường.";
  if (/thành phần/i.test(title)) return "- Cha mẹ hoặc người giám hộ của học sinh.\n- Giáo viên chủ nhiệm; Ban đại diện cha mẹ học sinh các lớp.";
  if (/nội dung/i.test(title)) return `- ${B.prompt.split(",")[0]}.\n- Trao đổi kết quả học tập, rèn luyện và kế hoạch thời gian tới.`;
  if (/tổ chức thực hiện/i.test(title)) return "- Giáo viên chủ nhiệm gửi giấy mời qua ứng dụng của trường.\n- Văn phòng chuẩn bị phòng họp, biển chỉ dẫn.\nĐề nghị các bộ phận, cá nhân liên quan thực hiện nghiêm túc./.";
  return `${title}: nội dung gắn với “${L}”, viết ngắn gọn, dùng được ngay trên lớp.`;
}

export function docHeadBlocks(B){
  const L=lessonOf(B);
  if (B.type==="Thông báo") return [{id:uid(),t:"meta",text:"TRƯỜNG THPT TẢN ĐÀ · Số: 126/TB-THPTTD · Phú Thọ, ngày 03 tháng 11 năm 2026"},{id:uid(),t:"title",text:"THÔNG BÁO"},{id:uid(),t:"sub",text:"V/v "+L.charAt(0).toLowerCase()+L.slice(1)}];
  const tt={"Phiếu học tập":"Phiếu học tập","Đề cương ôn tập":"Đề cương ôn tập"}[B.type]||"Kế hoạch bài dạy";
  return [{id:uid(),t:"title",text:`${tt} – ${B.subj} ${B.grade}`},{id:uid(),t:"sub",text:`Bài: ${L}${B.type.startsWith("Kế hoạch")?" · "+B.time:""}`}];
}

export function wdiff(a,b){ const A=String(a).split(/(\s+)/), B=String(b).split(/(\s+)/), n=A.length, m=B.length; if(n*m>120000) return `<del class="cd">${esc(a)}</del> <ins class="ci">${esc(b)}</ins>`;
  const L=Array.from({length:n+1},()=>new Uint16Array(m+1)); for(let i=n-1;i>=0;i--) for(let j=m-1;j>=0;j--) L[i][j]=A[i]===B[j]?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
  let i=0,j=0,o=""; while(i<n||j<m){ if(i<n&&j<m&&A[i]===B[j]){o+=esc(A[i]);i++;j++;} else if(j<m&&(i>=n||L[i][j+1]>=L[i+1][j])){ o+=/^\s+$/.test(B[j])?B[j]:`<ins class="ci">${esc(B[j])}</ins>`; j++; } else { o+=/^\s+$/.test(A[i])?"":`<del class="cd">${esc(A[i])}</del>`; i++; } } return o; }

export function blockHTML(b, editable, prop){
  const ce=editable&&!prop?' contenteditable="true" spellcheck="false"':"";
  const inner = prop&&prop.type==="replace" ? wdiff(b.text,prop.text) : prop&&prop.type==="delete" ? `<del class="cd">${esc(b.text)}</del>` : esc(b.text);
  if (b.t==="table"){ const tbl=`<table data-bid="${b.id}"><tbody>${b.rows.map((r,ri)=>`<tr>${r.map((c,ci)=>`<${ri?"td":"th"} ${editable?`contenteditable="true" data-cell="${ri}:${ci}"`:""}>${esc(c)}</${ri?"td":"th"}>`).join("")}</tr>`).join("")}</tbody></table>`; return prop&&prop.type==="delete"?`<div class="cd" style="opacity:.55">${tbl}</div>`:tbl; }
  const tag={title:"h1",sub:"div",h2:"h2",h3:"h3",p:"p",li:"li",meta:"div",sign:"div"}[b.t]||"p";
  const cls={sub:' class="sub"',meta:' class="meta"',sign:' class="sign"'}[b.t]||"";
  const el=`<${tag}${cls} data-bid="${b.id}"${ce}>${inner}</${tag}>`;
  return b.t==="li"?`<ul class="one">${el}</ul>`:el;
}

/* ---------- đề xuất sửa theo từng đoạn (patch), AI gửi tối thiểu, GV duyệt từng chỗ ---------- */
export function blocksToProps(oldBl, newBl){
  const oldIds=new Set(oldBl.map(b=>b.id)), newIds=new Set(newBl.map(b=>b.id));
  const props=[]; let lastOldId=null;
  oldBl.forEach(b=>{ if(!newIds.has(b.id)) props.push({id:uid(), type:"delete", bid:b.id}); });
  newBl.forEach(b=>{
    if (!oldIds.has(b.id)) props.push({id:uid(), type:"insert", after:lastOldId, block:b});
    else { const ob=oldBl.find(x=>x.id===b.id); if (JSON.stringify(ob)!==JSON.stringify(b)) props.push({id:uid(), type:"replace", bid:b.id, text:b.text, rows:b.rows}); lastOldId=b.id; }
  });
  return props;
}

export function propBar(p){
  return `<div class="pbar"><span class="xs">${p.type==="insert"?"Thêm mới":p.type==="delete"?"Xóa đoạn":"Sửa"}${p.why?" · "+esc(p.why):""}</span><button class="btn sm primary" data-pok="${p.id}">${ico("check")}Chấp nhận</button><button class="btn sm" data-pno="${p.id}">Bỏ</button></div>`;
}

export const SYN=[[/thực hiện/g,"tiến hành"],[/\bgiúp\b/g,"hỗ trợ"],[/nhận biết/g,"nhận ra"],[/vận dụng/g,"áp dụng"],[/trình bày/g,"báo cáo"],[/quan sát/g,"theo dõi"],[/rõ ràng/g,"mạch lạc"],[/thảo luận/g,"trao đổi"],[/củng cố/g,"khắc sâu"],[/tạo hứng thú/g,"khơi gợi sự tò mò"]];

export function mockRewrite(t, act){
  t=String(t).trim();
  if (act==="short"){ const mm=t.match(/^([a-dA-D]\)\s*[^:]{1,30}:\s*)(.*)$/); const pre=mm?mm[1]:"", body=mm?mm[2]:t;
    let r=body.split(/[,;]/)[0].trim(); if(r.split(/\s+/).length<5) r=body; const w=r.split(/\s+/); if(w.length>14) r=w.slice(0,14).join(" ");
    return pre+r.replace(/[“"(\s]+$/,"").replace(/[.\s]*$/,"")+"."; }
  if (act==="long") return t.replace(/[.\s]*$/,"")+", "+pick(Math.random,["kèm một ví dụ minh họa cụ thể để học sinh dễ hình dung.","giáo viên lưu ý những sai lầm thường gặp và cách khắc phục.","học sinh tự kiểm tra lại kết quả bằng cách thay số cụ thể."]);
  if (act==="simple") return t.replace(/vận dụng/g,"dùng").replace(/phát biểu/g,"nói").replace(/hằng đẳng thức/g,"công thức").replace(/thực hiện/g,"làm").replace(/Tư duy và lập luận toán học/g,"Biết suy nghĩ và giải thích");
  if (act==="formal") return t.replace(/các em/g,"học sinh").replace(/thầy cô/g,"giáo viên").replace(/\s*nhé\b/g,"").replace(/^([a-zà-ỹ])/,m=>m.toUpperCase()).replace(/[.\s]*$/,".");
  let r=t, n=0; for (const [re,to] of SYN){ if(re.test(r)&&n<3){ r=r.replace(re,to); n++; } re.lastIndex=0; }
  return n?r:("Cụ thể, "+t.charAt(0).toLowerCase()+t.slice(1));
}

export const ACT_VI={rewrite:"viết lại cho hay hơn",short:"viết ngắn gọn hơn",long:"viết chi tiết hơn",simple:"viết dễ hiểu hơn cho học sinh",formal:"viết trang trọng hơn theo văn phong hành chính"};

export const LAYOUTS=[["title","Tiêu đề"],["bullets","Gạch đầu dòng"],["two","Hai cột"],["quiz","Câu hỏi nhanh"]];

export function mockSlideOutline(B){
  const head=B.topic.replace(/^[^:]*:\s*/,"");
  const base=[/trò chơi/i.test(B.prompt)?"Trò chơi khởi động":"Khởi động","Kiến thức trọng tâm","Ví dụ minh họa","Luyện tập nhanh","Vận dụng thực tế","Sai lầm thường gặp","Câu hỏi trắc nghiệm nhanh","Mở rộng","Dặn dò"];
  let mid=base;
  if (false){ const hs=ST.doc.blocks.filter(x=>x.t==="h2").map(x=>x.text.replace(/\s*\(\d+ phút\)/,"").replace(/^Hoạt động \d+:\s*/,"")).filter(t=>!/thiết bị|mục tiêu/i.test(t)); if(hs.length>=2) mid=[...hs,...base.filter(b=>!hs.some(h=>h.toLowerCase().includes(b.toLowerCase().split(" ")[0])))]; }
  return [head,...mid.slice(0,Math.max(1,B.n-2)),"Tổng kết & dặn dò"];
}

export function mockSlides(outline,B){
  const tk=TOPIC_KEY(B.topic+" "+B.prompt), r=RNG(Date.now());
  return outline.map((o,i)=>{ const t=o.title, id=uid();
    if (i===0) return {id,layout:"title",title:t,bullets:[B.topic.split(":")[0],"Trường THPT Tản Đà"],note:"Chào lớp, giới thiệu mục tiêu bài học."};
    if (/trắc nghiệm|luyện tập nhanh/i.test(t)&&tk){ const g=genQ(tk,"mcq","Hiểu",Date.now()+i); return {id,layout:"quiz",title:t,q:g.q,opts:g.opts,ans:g.ans,note:"HS giơ thẻ A/B/C/D, GV hỏi lý do chọn."}; }
    if (/tổng kết/i.test(t)) return {id,layout:"two",title:t,left:["Đã học: "+shorten(B.topic.replace(/^[^:]*:\s*/,""),8),"Cách vận dụng vào bài tập"],right:["Về nhà: bài tập SGK","Chuẩn bị bài tiếp theo"],note:"Tóm tắt 2 phút, giao bài về nhà."};
    const fromDoc=B.fromDoc?docBulletsFor(t):null;
    let bl=fromDoc&&fromDoc.length?fromDoc:/trò chơi|khởi động/i.test(t)?["Chia lớp 4 đội","Mỗi đội giải 1 câu trong 30 giây","Đội đúng nhanh nhất được 10 điểm"]:/trọng tâm|kiến thức/i.test(t)&&tk==="hdt"?["f(x) = ax² + bx + c, Δ = b² − 4ac","Δ < 0: f(x) luôn cùng dấu a","Δ > 0: trong trái, ngoài cùng"]:/ví dụ/i.test(t)&&tk?(()=>{ const g=genQ(tk,"short","Hiểu",Date.now()+i*31); return [g.q,"Đáp số: "+g.ans]; })():/sai lầm/i.test(t)?["Quên xét dấu hệ số a","Nhầm “trong trái, ngoài cùng”","Nhầm ngoặc tròn, ngoặc vuông khi có dấu bằng"]:/vận dụng/i.test(t)?["Bài toán quả bóng ném lên","Lập bất phương trình bậc hai","Kết luận khoảng thời gian"]:["Ý chính về "+t.toLowerCase(),"Ví dụ minh họa","Câu hỏi gợi mở cho học sinh"];
    return {id,layout:"bullets",title:t,bullets:bl,note:"Dành 3–5 phút, đặt câu hỏi gợi mở trước khi chiếu đáp án."}; });
}

export function slideFace(sl,i,editable,theme){
  const ce=editable?' contenteditable="true" spellcheck="false"':"";
  const list=(arr,key)=>`<ul>${(arr||[]).map((x,j)=>`<li data-sf="${key}:${j}"${ce}>${esc(x)}</li>`).join("")}</ul>`;
  let body="";
  if (sl.layout==="title") body=`<div class="st" data-sf="title"${ce} style="margin-top:auto">${esc(sl.title)}</div><ul style="list-style:none;padding:0;margin-bottom:auto;opacity:.85">${(sl.bullets||[]).map((x,j)=>`<li data-sf="bullets:${j}"${ce}>${esc(x)}</li>`).join("")}</ul>`;
  else if (sl.layout==="two") body=`<div class="st" data-sf="title"${ce}>${esc(sl.title)}</div><div class="two-col"><div>${list(sl.left&&sl.left.length?sl.left:sl.bullets,"left")}</div><div>${list(sl.right,"right")}</div></div>`;
  else if (sl.layout==="quiz") body=`<div class="st" data-sf="title"${ce}>${esc(sl.title)}</div><div class="qz" data-sf="q"${ce}>${esc(sl.q||"Câu hỏi?")}</div><div class="qopts">${(sl.opts||["","","",""]).map((o,j)=>`<span class="${j===sl.ans?"ok":""}"><b>${"ABCD"[j]}</b> <span data-sf="opts:${j}"${ce}>${esc(o)}</span></span>`).join("")}</div>`;
  else body=`<div class="st" data-sf="title"${ce}>${esc(sl.title)}</div>${list(sl.bullets,"bullets")}`;
  return `<div class="slide ${theme} ${editable?"big":""}" ${editable?"":`data-sthumb="${i}"`} role="${editable?"group":"button"}" aria-label="Slide ${i+1}">${body}<span class="kind">${(LAYOUTS.find(l=>l[0]===sl.layout)||["","Nội dung"])[1]}</span><span class="n">${i+1}</span></div>`;
}

export const PART_N={mcq:"Nhiều lựa chọn",tf:"Đúng/Sai",short:"Trả lời ngắn",essay:"Tự luận"};

export function docBulletsFor(){ return null; }

export const THEMES=[["th-board","Bảng xanh"],["th-sun","Nắng vàng"],["th-clean","Tối giản"]];

export function rng(seed){ return ()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; }; }

export const L4="ABCD";

export function examForCode(d, code){
  if (!code) return d.mcq.map(q=>({...q}));
  const r=rng(101+code*7919); const mcq=d.mcq.map(q=>{ const idx=[0,1,2,3].sort(()=>r()-.5); return {...q, opts:idx.map(i=>q.opts[i]), ans:idx.indexOf(q.ans)}; });
  return mcq.sort(()=>r()-.5);
}

export function examPaper(d, code){
  const C=d.cfg||{kind:"Đề kiểm tra",subj:"",grade:"",time:""}, mcq=examForCode(d,code), mcode=101+code;
  const notes=Array.isArray(C.headerExtra)?C.headerExtra.filter(Boolean):[];
  return `<div class="hdr"><div><b>TRƯỜNG THPT TẢN ĐÀ</b><br>TỔ TOÁN – TIN<br><i>(Đề có ${1+Math.ceil((mcq.length+d.short.length)/8)} trang)</i>${notes.map(n=>`<br>${esc(n)}`).join("")}</div><div><b>${esc(C.kind.toUpperCase())}</b><br>Môn: ${esc(C.subj)} ${esc(C.grade)}<br>Thời gian làm bài: ${esc(C.time)} phút<br><b>Mã đề ${mcode}</b></div></div>
  <p>Họ và tên: ........................................................ Lớp: ...........</p>
  <h2>Phần I. Câu trắc nghiệm nhiều phương án lựa chọn</h2><p><i>Mỗi câu hỏi thí sinh chỉ chọn một phương án.</i></p>
  ${mcq.map((q,i)=>`<p><b>Câu ${i+1}.</b> ${esc(q.q)}</p><div class="opts ${q.opts.some(o=>o.length>18)?"two":""}">${q.opts.map((o,j)=>`<span><b>${L4[j]}.</b> ${esc(o)}</span>`).join("")}</div>`).join("")}
  <h2>Phần II. Câu trắc nghiệm đúng sai</h2><p><i>Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.</i></p>
  ${d.tf.map((q,i)=>`<p><b>Câu ${i+1}.</b> ${esc(q.stem)}</p>${q.items.map((it,j)=>`<p style="margin-left:18px">${"abcd"[j]}) ${esc(it.s)}</p>`).join("")}`).join("")}
  <h2>Phần III. Câu trắc nghiệm trả lời ngắn</h2>
  ${d.short.map((q,i)=>`<p><b>Câu ${i+1}.</b> ${esc(q.q)}</p>`).join("")}
  <h2>Phần IV. Tự luận</h2>
  ${d.essay.map(q=>esc(q.q).split("\n").map(l=>`<p>${l}</p>`).join("")+`<p style="text-align:right"><i>(${q.points} điểm)</i></p>`).join("")}
  <p style="text-align:center;margin-top:18px">— HẾT —</p>`;
}

export function examKey(d, code){
  const mcq=examForCode(d,code);
  return `<h1>Đáp án và hướng dẫn chấm – Mã đề ${101+code}</h1>
  <h2>Phần I (mỗi câu đúng 0,5 điểm)</h2><table><tr>${mcq.map((_,i)=>`<th>Câu ${i+1}</th>`).join("")}</tr><tr>${mcq.map(q=>`<td class="ans" style="text-align:center">${L4[q.ans]}</td>`).join("")}</tr></table>
  <h2>Phần II (1 ý đúng 0,1đ; 2 ý 0,25đ; 3 ý 0,5đ; 4 ý 1đ)</h2>${d.tf.map((q,i)=>`<p><b>Câu ${i+1}:</b> ${q.items.map((it,j)=>`${"abcd"[j]}) <span class="ans">${it.ans?"Đúng":"Sai"}</span>`).join(" · ")}</p>`).join("")}
  <h2>Phần III (mỗi câu đúng 1 điểm)</h2>${d.short.map((q,i)=>`<p><b>Câu ${i+1}:</b> <span class="ans">${esc(q.ans)}</span></p>`).join("")}
  <h2>Phần IV</h2>${d.essay.map(q=>`<p><b>${esc(q.q.split("\n")[0].split(".")[0])}</b> (${q.points} điểm)</p>`+esc(q.guide).split("\n").map(l=>`<p style="margin-left:18px">${l}</p>`).join("")).join("")}`;
}

export function examBlocks(d, code){
  const C=d.cfg||{kind:"Đề kiểm tra",subj:"",grade:"",time:""}, mcq=examForCode(d,code), notes=Array.isArray(C.headerExtra)?C.headerExtra.filter(Boolean):[];
  const b=[{t:"center",text:"TRƯỜNG THPT TẢN ĐÀ",b:1},{t:"h1",text:C.kind.toUpperCase()},{t:"center",text:`Môn: ${C.subj} ${C.grade} · Thời gian: ${C.time} phút · Mã đề ${101+code}`,i:1},...notes.map(n=>({t:"center",text:n,i:1})),{t:"p",text:"Họ và tên: ........................................ Lớp: ......."},{t:"h2",text:"PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN"}];
  mcq.forEach((q,i)=>{ b.push({t:"p",text:`Câu ${i+1}. ${q.q}`}); b.push({t:"p",text:q.opts.map((o,j)=>`${L4[j]}. ${o}`).join("      ")}); });
  b.push({t:"h2",text:"PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG SAI"}); d.tf.forEach((q,i)=>{ b.push({t:"p",text:`Câu ${i+1}. ${q.stem}`}); q.items.forEach((it,j)=>b.push({t:"li",text:`${"abcd"[j]}) ${it.s}`})); });
  b.push({t:"h2",text:"PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN"}); d.short.forEach((q,i)=>b.push({t:"p",text:`Câu ${i+1}. ${q.q}`}));
  b.push({t:"h2",text:"PHẦN IV. TỰ LUẬN"}); d.essay.forEach(q=>q.q.split("\n").forEach(l=>b.push({t:"p",text:l})));
  b.push({t:"center",text:"— HẾT —"},{t:"h1",text:"ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM"});
  b.push({t:"table",rows:[mcq.map((_,i)=>"Câu "+(i+1)),mcq.map(q=>L4[q.ans])]});
  d.tf.forEach((q,i)=>b.push({t:"p",text:`Phần II – Câu ${i+1}: `+q.items.map((it,j)=>`${"abcd"[j]}) ${it.ans?"Đúng":"Sai"}`).join("; ")}));
  d.short.forEach((q,i)=>b.push({t:"p",text:`Phần III – Câu ${i+1}: ${q.ans}`}));
  d.essay.forEach(q=>String(q.guide||"").split("\n").forEach(l=>b.push({t:"li",text:l})));
  return b;
}

export function mdParse(md){
  const out=[]; let tbl=null;
  for (const raw of String(md||"").split("\n")){
    const l=raw.trim(); if(!l){ tbl=null; continue; }
    if (/^\|/.test(l)){ if(/^\|[\s:\-|]+\|$/.test(l)) continue; const cells=l.replace(/^\||\|$/g,"").split("|").map(c=>c.trim()); if(!tbl){ tbl={id:uid(),t:"table",rows:[]}; out.push(tbl);} tbl.rows.push(cells); continue; }
    tbl=null;
    if (/^#\s/.test(l)) out.push({id:uid(),t:"title",text:l.slice(2).trim()});
    else if (/^_.+_$/.test(l)) out.push({id:uid(),t:"sub",text:l.slice(1,-1)});
    else if (/^##\s/.test(l)) out.push({id:uid(),t:"h2",text:l.replace(/^##\s*/,"")});
    else if (/^#{3,4}\s/.test(l)) out.push({id:uid(),t:"h3",text:l.replace(/^#+\s*/,"")});
    else if (/^([-•*]|\d+[.)])\s+/.test(l)) out.push({id:uid(),t:"li",text:l.replace(/^([-•*]|\d+[.)])\s+/,"").replace(/\*\*/g,"")});
    else out.push({id:uid(),t:"p",text:l.replace(/\*\*/g,"")});
  }
  return out;
}

export function mdOut(bl){ return bl.map(b=>b.t==="title"?"# "+b.text:b.t==="sub"?"_"+b.text+"_":b.t==="h2"?"## "+b.text:b.t==="h3"?"### "+b.text:b.t==="li"?"- "+b.text:b.t==="table"?b.rows.map(r=>"| "+r.join(" | ")+" |").join("\n"):b.text).join("\n"); }

export function chatSlide(s){ if (s.quiz) return {layout:"quiz",title:s.title,q:s.quiz.q,opts:s.quiz.opts,ans:s.quiz.ans}; if (s.layout==="title") return {layout:"title",title:s.title,bullets:s.bullets}; return {layout:"bullets",title:s.title,bullets:s.bullets||[]}; }

export const KLABEL = {doc:"Tài liệu", slides:"Slide", exam:"Đề kiểm tra"};

export const KICON = {doc:"doc", slides:"palette", exam:"exam"};

export const bars = rows => `<div class="bars">${rows.map(([k,v])=>`<div class="barrow"><span>${k}</span><div class="meter ${v>=50?"badm":v>=35?"warnm":""}"><i style="width:${v}%"></i></div><b class="num">${v}%</b></div>`).join("")}</div>`;
