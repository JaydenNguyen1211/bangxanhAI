/* Tản Đà AI · student.js — mã nguồn, sửa trực tiếp */
import { aiJSON, aiLive, aiText } from "./ai.js";
import { genQ } from "./content.js";
import { $, $$, S, TITLES, VIEWS, esc, go, ico, loading, toast } from "./core.js";
import { CLAIMS, ETH, STRANDS } from "./data.js";
import { loadScript } from "./files.js";
import { gate } from "./gateway.js";

S.math={mode:"guide", problem:"x² − 5x + 6", msgs:[], step:0, lines:"x² − 2x − 3x + 6\n= x(x − 2) − 3(x − 2)\n= (x − 2)(x + 3)", checkRes:null, aiNote:"", img:null,
  practice:{topic:"hdt", level:"Biết", q:null, picked:null, score:0, total:0}};

S.code={sel:0, src:{}, out:"", tests:null, input:"", hint:"", runner:"unknown"};

S.aiedu={tab:"lessons", prompt:"Tóm tắt bài này.", lab:null, claims:null, picked:null, revealed:false, eth:null, ethWhy:"", ethFb:""};

export function loadSkulpt(){ if (SkReady) return SkReady; SkReady=(async()=>{ try{ await loadScript("/vendor/skulpt.min.js"); await loadScript("/vendor/skulpt-stdlib.js"); return !!window.Sk; }catch(e){ return false; } })(); return SkReady; }

export function examLock(v){ v.innerHTML=`<div class="card empty" style="padding:60px 16px">${ico("lock")}<h2 style="color:var(--ink)">Đang trong giờ kiểm tra</h2><p style="max-width:46ch">Giáo viên đã bật chế độ kiểm tra. AI tạm khóa trên tài khoản học sinh cho đến khi hết giờ làm bài.</p></div>`; }

VIEWS["s-home"] = v => {
  v.innerHTML = `${S.cls.exam?`<div class="banner bad">${ico("lock")}<div><b>Đang trong giờ kiểm tra.</b> Các công cụ AI tạm khóa.</div></div>`:""}
  <div class="card stack"><div class="row between"><h3>Việc cần làm</h3><span class="muted small">Tuần này</span></div>
    ${[["math","sigma","Toán","Tam thức bậc hai: tìm nghiệm, phân tích nhân tử (gia sư gợi mở)","Hạn thứ Năm"],["code","code","Tin học","Bài “Tổng các chữ số” – nộp qua bộ test","Hạn thứ Sáu"],["aiedu","brain","Trí tuệ nhân tạo","Phòng thí nghiệm prompt: tóm tắt bài đọc","Hạn thứ Bảy"],["english","globe","Tiếng Anh","Speak Up: nói chuyện với cố vấn học đường 15 phút","Hạn 05/11"]]
      .map(([id,ic,s,t,d])=>`<div class="row between" style="padding:6px 0;border-bottom:1px solid var(--line)"><span class="row" style="gap:10px;min-width:0">${ico(ic)}<span><b>${s}</b> · ${t}</span></span><span class="row" style="gap:8px"><span class="muted small">${d}</span><button class="btn sm" data-go="${id}">Làm</button></span></div>`).join("")}
  </div>
  <div class="tiles">
    <button class="tile" data-go="math"><span class="ic">${ico("sigma")}</span><h3>Toán</h3><span class="small muted">Gia sư gợi mở từng bước, kiểm tra lời giải, luyện theo lỗ hổng.</span><div class="meter"><i style="width:58%"></i></div></button>
    <button class="tile" data-go="code"><span class="ic">${ico("code")}</span><h3>Tin học</h3><span class="small muted">Lập trình Python trên trình duyệt, chấm tự động bằng bộ test.</span><div class="meter"><i style="width:40%"></i></div></button>
    <button class="tile" data-go="aiedu"><span class="ic y">${ico("brain")}</span><h3>Trí tuệ nhân tạo</h3><span class="small muted">Viết prompt, kiểm chứng thông tin, tình huống đạo đức, dự án nhỏ.</span><div class="meter"><i style="width:25%"></i></div></button>
    <button class="tile" data-go="english"><span class="ic">${ico("globe")}</span><h3>Tiếng Anh</h3><span class="small muted">Speak Up: hội thoại bằng giọng nói với AI, chấm phát âm.</span><div class="meter"><i style="width:63%"></i></div></button>
  </div>
  <div class="card stack" id="hwBox"><h3>Bài tập về nhà</h3>${loading("Đang tải...")}</div>`;
  loadHw();
};

/* ---------- Bài tập về nhà: nộp bài, AI tự chấm khi nộp ---------- */
let HW_CACHE=[];
function hwBareClass(){ return String(S.user.group||"").replace(/^Lớp\s*/,""); }

function hwTaskHTML(h, mySub){
  const label = !mySub ? "" : mySub.state==="approved" ? `Điểm: ${mySub.teacherScore}/10 (đã duyệt)` : mySub.ai ? `AI chấm: ${mySub.ai.score}/10` : "Đang chờ AI chấm…";
  return `<div class="card tight stack" style="gap:8px">
    <div class="row between"><div><b>${esc(h.title)}</b><div class="xs muted">${esc(h.subj)} · Hạn: ${esc(h.due)||"—"}</div></div>${mySub?`<span class="chip ${mySub.state==="approved"?"good":"brand"}">${esc(label)}</span>`:`<span class="chip warn">Chưa nộp</span>`}</div>
    ${h.desc?`<p class="small muted">${esc(h.desc)}</p>`:""}
    ${mySub?`
      <details class="small"><summary class="muted">Bài đã nộp</summary><pre class="small" style="white-space:pre-wrap;max-height:160px;overflow:auto">${esc(mySub.content)}</pre></details>
      ${mySub.ai?`<div class="card tight stack" style="background:var(--sunk)"><div class="row between"><b>Nhận xét của AI</b>${mySub.ai.mock?'<span class="chip warn">Mô phỏng</span>':""}</div><p class="small">${esc(mySub.ai.fb)}</p>${mySub.ai.strengths.length?`<div class="small"><b>Điểm mạnh:</b> ${mySub.ai.strengths.map(esc).join("; ")}</div>`:""}${mySub.ai.issues.length?`<div class="small"><b>Cần cải thiện:</b> ${mySub.ai.issues.map(esc).join("; ")}</div>`:""}</div>`:`<p class="muted small">Đang chờ AI chấm…</p>`}
      ${mySub.teacherNote?`<p class="small"><b>Ghi chú của giáo viên:</b> ${esc(mySub.teacherNote)}</p>`:""}`:`
      <textarea class="inp" id="hwin-${h.id}" rows="3" placeholder="Viết bài làm vào đây…"></textarea>
      <button class="btn sm primary" data-hwsend="${h.id}" style="justify-self:start">${ico("send")}Nộp bài</button>`}
  </div>`;
}

function renderHwBox(){
  const box=$("#hwBox"); if (!box) return;
  const cls=hwBareClass(), mine=HW_CACHE.filter(h=>h.cls===cls);
  box.innerHTML = `<h3>Bài tập về nhà</h3>${mine.length?mine.map(h=>hwTaskHTML(h, h.subs.find(s=>s.studentCode===S.user.code))).join(""):`<p class="muted small">Chưa có bài tập về nhà nào được giao.</p>`}`;
  $$("[data-hwsend]").forEach(b=>b.onclick=()=>submitHw(b.dataset.hwsend));
}

function loadHw(){
  fetch("/api/homework").then(r=>r.json()).then(({homework})=>{ HW_CACHE=homework||[]; renderHwBox(); }).catch(()=>{ const box=$("#hwBox"); if(box) box.innerHTML=`<h3>Bài tập về nhà</h3><p class="muted small">Không lấy được bài tập từ máy chủ.</p>`; });
}

function submitHw(hwId){
  const ta=$("#hwin-"+hwId); const content=ta&&ta.value.trim(); if(!content){ toast("Viết bài làm trước khi nộp."); return; }
  const btn=$(`[data-hwsend="${hwId}"]`); if(btn){ btn.disabled=true; btn.textContent="Đang nộp…"; }
  fetch(`/api/homework/${hwId}/submit`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({studentCode:S.user.code,studentName:S.user.name,content})})
    .then(r=>r.json()).then(({submission})=>{
      toast("Đã nộp bài. AI đang chấm…");
      const h=HW_CACHE.find(x=>x.id===hwId); if(h){ h.subs=h.subs.filter(s=>s.studentCode!==submission.studentCode); h.subs.unshift(submission); }
      renderHwBox();
      gradeHw(hwId, submission, h);
    }).catch(()=>toast("Không nộp được bài, thử lại."));
}

async function gradeHw(hwId, sub, h){
  let review;
  try{
    const r=await aiJSON(`Chấm bài làm của học sinh THPT theo đúng yêu cầu đề bài dưới đây. Góp ý xây dựng, không quá khắt khe, chỉ ra điểm mạnh và điểm cần cải thiện cụ thể.
Đề bài (môn ${h?h.subj:""}): ${h?(h.desc||h.title):""}
Bài làm của học sinh: """${sub.content}"""
Trả về CHỈ JSON {"score": number (0-10, có thể lẻ .5), "fb": string (nhận xét tổng quan, tối đa 60 từ), "strengths": [tối đa 3 string ngắn], "issues": [tối đa 3 string ngắn]}`, {tier:"quick"});
    review={ score:r.score, fb:r.fb, strengths:Array.isArray(r.strengths)?r.strengths:[], issues:Array.isArray(r.issues)?r.issues:[] };
  }catch(e){ review={ score:7, fb:"AI mô phỏng: bài làm có vẻ hợp lý, giáo viên vui lòng xem lại chi tiết.", strengths:["Có trả lời đúng yêu cầu đề bài"], issues:["Cần bật AI thật để chấm chi tiết hơn"], mock:true }; }
  fetch(`/api/homework/${hwId}/submissions/${sub.id}/review`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(review)})
    .then(r=>r.json()).then(({submission})=>{ sub.ai=submission.ai; sub.state=submission.state; renderHwBox(); toast("AI đã chấm bài."); })
    .catch(()=>{});
}

export function toJS(s){
  let t=String(s).replace(/[−–]/g,"-").replace(/[·×]/g,"*").replace(/²/g,"^2").replace(/³/g,"^3").replace(/\s+/g,"").replace(/,/g,".");
  if (!t || /[^0-9x+\-*/().^]/.test(t)) return null;
  t=t.replace(/(\d|\)|x)(?=\(|x)/g,"$1*").replace(/\)(?=\d)/g,")*").replace(/\^/g,"**");
  try{ const f=new Function("x","return "+t); f(1.1); return f; }catch(e){ return null; }
}

export const PTS=[-1.7,0.3,2.9,5.1,-3.2];

export function equiv(f,g){ return PTS.every(x=>{ const a=f(x), b=g(x); return isFinite(a)&&isFinite(b)&&Math.abs(a-b)<1e-6*(1+Math.abs(a)); }); }

export function exprOf(problem){ const m=String(problem).replace(/^[^:]*:/,"").split("=")[0]; return toJS(m); }

export function quadInfo(problem){ const f=exprOf(problem); if(!f) return null; const c=f(0), s1=f(1), s2=f(-1); const a=(s1+s2)/2-c, b=(s1-s2)/2;
  if (Math.abs(a-1)>1e-9 || !Number.isInteger(Math.round(b)) || !Number.isInteger(Math.round(c)) || !equiv(f,x=>x*x+b*x+c)) return null;
  for (let p=-100;p<=100;p++){ const q=Math.round(b)-p; if (p*q===Math.round(c)) return {b:Math.round(b), c:Math.round(c), p, q, f}; } return null; }

export const sgn = n => n<0?` − ${-n}`:` + ${n}`;

export function nums(t){ return (String(t).replace(/−/g,"-").match(/-?\s?\d+/g)||[]).map(x=>parseInt(x.replace(/\s/g,""))); }

VIEWS["math"] = v => {
  if (S.cls.exam) return examLock(v);
  const M=S.math;
  v.innerHTML = `${S.cls.classroom.math?`<div class="banner warn">${ico("lock")}<div><b>Chế độ lớp học:</b> gia sư chỉ hỗ trợ bài "Dấu của tam thức bậc hai".</div></div>`:""}
  <div class="split" style="grid-template-columns:minmax(0,1fr) 300px">
    <div class="stack" style="gap:14px">
      <div class="card stack">
        <div class="row between"><span class="lbl">${M.mode==="practice"?"Luyện nhanh":"Đề bài"}</span><div class="pills">${[["guide","Gợi mở từng bước"],["check","Kiểm tra lời giải của em"],["solve","Giải luôn"],["practice","Luyện nhanh"]].map(([k,n])=>`<button class="pill" data-mm="${k}" aria-pressed="${M.mode===k}" ${k==="solve"&&!S.cls.allowSolve?'disabled title="Giáo viên đang khóa chế độ này" style="opacity:.55"':""}>${k==="solve"&&!S.cls.allowSolve?ico("lock")+" ":""}${n}</button>`).join("")}</div></div>
        ${M.mode==="practice"?`<p class="small muted">Chọn chủ đề và mức độ, chọn đáp án — được chấm ngay bằng công thức, không cần gọi AI.</p>`:`
        <div class="row" style="flex-wrap:nowrap"><input class="inp mathbox" id="mProb" value="${esc(M.problem)}" aria-label="Đề bài"><label class="btn" for="mImg" title="Chụp hoặc tải ảnh đề bài" style="cursor:pointer">${ico("image")}</label><input type="file" id="mImg" accept="image/*" hidden><button class="btn primary" id="mStart">Bắt đầu</button></div>
        <div class="small muted" id="mImgNote">${M.img?`Đã đính kèm ảnh: ${esc(M.img.name)}`:"Gõ đề (dùng x², x³, −) hoặc bấm biểu tượng ảnh để chụp đề."}</div>
        <div id="mGate"></div>`}
      </div>
      <div id="mBody"></div>
    </div>
    <aside class="stack">
      <div class="card stack"><h3>Kỹ năng của em</h3>
        ${[["Tính Δ, tìm nghiệm",78],["Định lí Viète",85],["Phân tích thành nhân tử",46],["Xét dấu tam thức",52]].map(([k,p])=>`<div class="skill"><div class="row between"><span>${k}</span><b class="num">${p}%</b></div><div class="meter ${p<55?"warnm":""}"><i style="width:${p}%"></i></div></div>`).join("")}
        <span class="xs muted">Cập nhật sau mỗi bài em làm với gia sư.</span></div>
      <div class="card stack"><h3>Luyện tiếp theo lỗ hổng</h3><span class="small muted">Phân tích tam thức thành nhân tử · 3 mức</span>
        ${[["Cơ bản","x² + 7x + 10"],["Vừa","x² − x − 12"],["Nâng cao","2x² − 5x + 3"]].map(([l,p])=>`<button class="btn" data-mp="${p}" style="justify-content:space-between"><span class="mathbox" style="font-size:1rem">${p}</span><span class="tag">${l}</span></button>`).join("")}</div>
    </aside></div>`;
  $$("[data-mm]").forEach(b=>b.onclick=()=>{ if(b.disabled) return; M.mode=b.dataset.mm; go("math"); });
  $$("[data-mp]").forEach(b=>b.onclick=()=>{ M.problem=b.dataset.mp; M.msgs=[]; M.checkRes=null; go("math"); });
  if ($("#mImg")) $("#mImg").onchange=e=>{ const f=e.target.files[0]; if(!f) return; M.img=f; $("#mImgNote").textContent=aiLive()?`Đã đính kèm ảnh: ${f.name}. Bấm Bắt đầu.`:`Đã chọn ${f.name}. Đọc đề từ ảnh cần AI thật; ở chế độ này em gõ đề giúp nhé.`; };
  if ($("#mStart")) $("#mStart").onclick=()=>{ const p=$("#mProb").value.trim(); if(!p&&!M.img){toast("Nhập đề bài.");return;} M.problem=p; const run=()=>startMath(); if (gate(p,$("#mGate"),run)) run(); };
  renderMath();
};

export function renderMath(){
  const M=S.math, b=$("#mBody"); if(!b) return;
  if (M.mode==="practice"){ b.innerHTML=practiceHTML(); bindPractice(); return; }
  if (M.mode==="check"){
    b.innerHTML=`<div class="card stack"><div class="lbl">Lời giải của em (mỗi bước một dòng)</div><textarea class="inp mathbox" id="mLines" rows="5" style="font-size:1.05rem">${esc(M.lines)}</textarea>
      <div class="row"><button class="btn primary" id="mCheck">${ico("check")}Kiểm tra từng bước</button><span class="xs muted">Mỗi bước được kiểm tra bằng cách thay số, không chỉ dựa vào AI.</span></div>
      <div class="stack" id="mRes">${M.checkRes?M.checkRes.map((r,i)=>`<div class="chk ${r.s}"><span>${r.s==="ok"?ico("check"):r.s==="no"?ico("x"):"·"}</span><div><span class="m">Bước ${i+1}: ${esc(r.line)}</span><div class="small">${esc(r.msg)}</div></div></div>`).join(""):""}${M.aiNote?`<div class="banner info">${ico("bulb")}<div>${esc(M.aiNote)}</div></div>`:""}</div></div>`;
    $("#mCheck").onclick=checkMath; return;
  }
  b.innerHTML=`<div class="chat"><div class="log" id="mLog">${M.msgs.length?M.msgs.map(m=>`<div class="msg ${m.r}">${esc(m.t)}</div>`).join(""):`<div class="msg sys">Bấm “Bắt đầu”. Gia sư sẽ hỏi gợi mở để em tự tìm ra lời giải, không đưa đáp án ngay.</div>`}</div>
    <div class="composer"><textarea id="mSay" rows="1" placeholder="Trả lời gia sư…"></textarea><button class="btn primary" id="mSend" aria-label="Gửi">${ico("send")}</button></div></div>`;
  const log=$("#mLog"); log.scrollTop=log.scrollHeight;
  $("#mSend").onclick=sendMath; $("#mSay").onkeydown=e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMath();} };
}

export const PRACTICE_TOPICS=[["hdt","Dấu của tam thức bậc hai"],["pt","Hàm số bậc hai"]];
export const PRACTICE_LEVELS=["Biết","Hiểu","Vận dụng"];

export function newPracticeQ(){
  const P=S.math.practice;
  P.q=genQ(P.topic,"mcq",P.level,Date.now()+Math.floor(Math.random()*1e6));
  P.picked=null;
}

export function practiceHTML(){
  const P=S.math.practice; if(!P.q) newPracticeQ(); const q=P.q;
  if (!q) return `<div class="card empty">Chưa có câu luyện cho mức này, đổi mức hoặc chủ đề khác nhé.</div>`;
  const L4="ABCD";
  return `<div class="card stack">
    <div class="row between" style="flex-wrap:wrap;gap:8px">
      <div class="pills">${PRACTICE_TOPICS.map(([k,n])=>`<button class="pill" data-ptopic="${k}" aria-pressed="${P.topic===k}">${n}</button>`).join("")}</div>
      <div class="pills">${PRACTICE_LEVELS.map(l=>`<button class="pill" data-plevel="${l}" aria-pressed="${P.level===l}">${l}</button>`).join("")}</div>
    </div>
    <p class="mathbox" style="font-size:1.05rem">${esc(q.q)}</p>
    <div class="g2">${q.opts.map((o,i)=>`<button class="btn ${P.picked==null?"":i===q.ans?"primary":i===P.picked?"danger":""}" data-popt="${i}" ${P.picked!=null?"disabled":""} style="justify-content:flex-start;text-align:left">${L4[i]}. ${esc(o)}</button>`).join("")}</div>
    ${P.picked!=null?`<div class="banner ${P.picked===q.ans?"good":"bad"}">${ico(P.picked===q.ans?"check":"x")}<div>${P.picked===q.ans?"Chính xác!":`Chưa đúng. Đáp án đúng: ${L4[q.ans]}. ${esc(q.opts[q.ans])}`}</div></div>`:""}
    <div class="row between"><span class="muted small">Đúng ${P.score}/${P.total} câu</span><button class="btn primary" id="pNext">${P.picked!=null?"Câu tiếp theo":"Bỏ qua câu này"}</button></div>
  </div>`;
}

export function bindPractice(){
  const P=S.math.practice;
  $$("[data-ptopic]").forEach(b=>b.onclick=()=>{ P.topic=b.dataset.ptopic; newPracticeQ(); renderMath(); });
  $$("[data-plevel]").forEach(b=>b.onclick=()=>{ P.level=b.dataset.plevel; newPracticeQ(); renderMath(); });
  $$("[data-popt]").forEach(b=>b.onclick=()=>{ if(P.picked!=null) return; const i=+b.dataset.popt; P.picked=i; P.total++; if(i===P.q.ans) P.score++; renderMath(); });
  $("#pNext").onclick=()=>{ newPracticeQ(); renderMath(); };
}

export const MATH_RULES = () => `Bạn là gia sư Toán cho học sinh THPT Việt Nam (lớp 10–12). Đề bài: "${S.math.problem||"(trong ảnh)"}".
${S.math.mode==="solve"?"Giáo viên CHO PHÉP giải đầy đủ: trình bày lời giải từng bước rõ ràng, ngắn gọn.":"Phương pháp gợi mở (Socratic): KHÔNG đưa đáp án cuối cùng hay lời giải hoàn chỉnh. Mỗi lượt chỉ hỏi MỘT câu gợi mở hoặc nhận xét MỘT bước của học sinh. Nếu học sinh xin đáp án, nhắc nhẹ nhàng là em sẽ tự làm được và đưa gợi ý nhỏ hơn."}
${S.cls.classroom.math?"Chế độ lớp học: chỉ hỗ trợ bài về tam thức bậc hai (tìm nghiệm, phân tích nhân tử, xét dấu); câu hỏi khác thì nhắc quay lại bài.":""}
Viết tiếng Việt thân thiện, tối đa 70 từ, kí hiệu toán Unicode (x², −, ·), không dùng LaTeX. Khi học sinh làm đúng hết, khen và tóm tắt kết quả.`;

export async function startMath(){
  const M=S.math; M.msgs=[]; M.step=0; M.checkRes=null; M.aiNote="";
  if (M.mode==="check"){ renderMath(); return; }
  renderMath(); await mathReply("Em bắt đầu bài này. Hãy gợi ý bước đầu tiên.", true);
}

export async function sendMath(){
  const t=$("#mSay").value.trim(); if(!t) return; const M=S.math;
  if (!gate(t,$("#mGate"),()=>{})) { return; }
  M.msgs.push({r:"me",t}); $("#mSay").value=""; renderMath(); await mathReply(t,false);
}

export async function mathReply(t, first){
  const M=S.math, log=$("#mLog"); const holder=document.createElement("div"); holder.className="msg ai"; holder.innerHTML='<span class="typing" style="padding:0;background:none"><i></i><i></i><i></i></span>'; log.appendChild(holder); log.scrollTop=log.scrollHeight;
  try{
    const turns=[{role:"user",content:MATH_RULES()}];
    M.msgs.forEach(m=>turns.push({role:m.r==="me"?"user":"assistant",content:m.t}));
    if (first) turns.push({role:"user",content:t});
    const text=await aiText(turns,{tier:"default",onText:x=>{holder.textContent=x;log.scrollTop=log.scrollHeight;},images:first&&M.img&&aiLive()?[M.img]:undefined});
    M.msgs.push({r:"ai",t:text});
  }catch(e){ M.msgs.push({r:"ai",t:mockMath(first?"":t)}); }
  renderMath();
}

export function mockMath(t){
  const M=S.math, q=quadInfo(M.problem);
  if (!q) return "Ở chế độ mô phỏng, gia sư chỉ có kịch bản cho dạng x² + bx + c. Em thử chọn một bài ở cột “Luyện tiếp theo lỗ hổng” nhé.";
  const {b,c,p,q:qq,f}=q;
  if (M.mode==="solve") return `Lời giải:\nTìm hai số có tổng ${b} và tích ${c}: đó là ${p} và ${qq}.\n${M.problem} = x²${sgn(p)}x${sgn(qq)}x${sgn(c)}\n= x(x${sgn(p)})${sgn(qq)}(x${sgn(p)})\n= (x${sgn(p)})(x${sgn(qq)}).`;
  if (M.step===0 && !t){ return `Tam thức có dạng x² + bx + c với b = ${b}, c = ${c}. Ta phân tích nó thành tích hai nhân tử bậc nhất. Em hãy tìm hai số có tích bằng ${c} và tổng bằng ${b}. Đó là hai số nào?`; }
  if (M.step===0){ const n=nums(t); const ok=n.some((x,i)=>n.some((y,j)=>i!==j&&x*y===c&&x+y===b));
    if (ok){ M.step=1; return `Đúng rồi: ${p} và ${qq}. Bây giờ em tách hạng tử ${b}x thành tổng hai hạng tử theo hai số đó và viết lại đa thức.`; }
    return `Chưa đúng. Gợi ý: ${c>0?"tích dương nên hai số cùng dấu":"tích âm nên hai số trái dấu"}${c>0?(b<0?", tổng âm nên cả hai đều âm":", tổng dương nên cả hai đều dương"):""}. Thử liệt kê các cặp số có tích bằng ${c}.`; }
  const g=toJS(t.replace(/^=/,"").split("=").pop());
  if (M.step===1){ if (g&&equiv(f,g)&&/x.*x.*x/.test(t.replace(/x²/g,""))||(g&&equiv(f,g)&&(t.match(/x/g)||[]).length>=3)){ M.step=2; return "Tốt lắm! Em nhóm hai hạng tử đầu và hai hạng tử cuối, đặt nhân tử chung cho từng nhóm. Kết quả cuối cùng là gì?"; }
    return g?"Biểu thức em viết chưa bằng đa thức ban đầu. Kiểm tra lại dấu khi tách nhé.":`Em viết lại dạng x² ${p<0?"−":"+"} ${Math.abs(p)}x ${qq<0?"−":"+"} ${Math.abs(qq)}x ${c<0?"−":"+"} ${Math.abs(c)} thử xem.`; }
  if (M.step===2){ if (g&&equiv(f,g)&&/\)\s*\(/.test(t)){ M.step=3; return `Chính xác! ${M.problem} = (x${sgn(p)})(x${sgn(qq)}). Em có thể kiểm tra lại bằng cách nhân hai ngoặc. Thử bài tiếp theo ở cột bên phải nhé.`; }
    return g&&equiv(f,g)?"Đúng nhưng chưa xong: em đặt tiếp nhân tử chung để được tích của hai ngoặc.":"Kết quả chưa bằng đa thức ban đầu. Em xem lại nhân tử chung của từng nhóm."; }
  return "Em đã hoàn thành bài này. Chọn bài khác để luyện tiếp nhé!";
}

export async function checkMath(){
  const M=S.math; M.lines=$("#mLines").value; const f=exprOf(M.problem);
  const lines=M.lines.split("\n").map(s=>s.trim()).filter(Boolean);
  M.checkRes=lines.map(line=>{ const parts=line.replace(/^=/,"").split("=").map(s=>s.trim()).filter(Boolean); if(!f) return {line,s:"na",msg:"Đề không phải biểu thức một biến x nên không thay số được."};
    const gs=parts.map(toJS); if (gs.some(g=>!g)) return {line,s:"na",msg:"Không đọc được biểu thức ở bước này. Kiểm tra lại cách viết (dùng x², ngoặc đủ)."};
    return gs.every(g=>equiv(f,g))?{line,s:"ok",msg:"Biến đổi đúng: biểu thức vẫn bằng đề bài."}:{line,s:"no",msg:"Bước này không còn bằng đề bài. Thường do sai dấu khi đặt nhân tử chung hoặc bỏ ngoặc."}; });
  M.aiNote=""; renderMath();
  const firstBad=M.checkRes.findIndex(r=>r.s==="no");
  if (aiLive() && firstBad>=0){ try{ M.aiNote="Đang hỏi gia sư…"; renderMath(); M.aiNote=await aiText(`Học sinh lớp 10 giải bài "${M.problem}" như sau:\n${lines.join("\n")}\nBước ${firstBad+1} ("${lines[firstBad]}") đã được kiểm tra bằng thay số là SAI. Giải thích ngắn (tối đa 50 từ, tiếng Việt, kí hiệu Unicode) chỗ sai ở bước đó và gợi ý cách sửa, KHÔNG viết lời giải hoàn chỉnh.`,{tier:"quick"}); }catch(e){ M.aiNote=""; } renderMath(); }
  else if (firstBad>=0){ M.aiNote=`Gợi ý: xem lại bước ${firstBad+1}. Khi đặt −3 ra ngoài ngoặc, dấu của các hạng tử bên trong phải đổi.`; renderMath(); }
}

export let SkReady=null;

export async function runPy(code, inputs){
  const ok=await loadSkulpt();
  if (!ok) throw {runner:"none"};
  let out=""; const q=[...inputs];
  Sk.configure({output:t=>{out+=t;}, read:f=>{ if(!Sk.builtinFiles||!Sk.builtinFiles.files[f]) throw "File not found: '"+f+"'"; return Sk.builtinFiles.files[f]; }, inputfun:()=>q.length?q.shift():"", inputfunTakesPrompt:true, __future__:Sk.python3, execLimit:4000});
  try{ await Sk.misceval.asyncToPromise(()=>Sk.importMainWithBody("<stdin>",false,code,true)); return {out}; }
  catch(e){ return {out, err:String(e.toString?e.toString():e)}; }
}

export const prob = () => S.codeProblems[S.code.sel];

export const srcOf = p => S.code.src[p.id] ?? p.starter;

VIEWS["code"] = v => {
  if (S.cls.exam) return examLock(v);
  const C=S.code, P=prob(), locked=p=>S.cls.classroom.code&&p.id!=="p1";
  v.innerHTML = `
  ${S.cls.classroom.code?`<div class="banner warn">${ico("lock")}<div><b>Chế độ lớp học:</b> chỉ mở bài “Tổng các chữ số”.</div></div>`:""}
  <div class="pills">${S.codeProblems.map((p,i)=>`<button class="pill" data-cp="${i}" aria-pressed="${i===C.sel}" ${locked(p)?'disabled style="opacity:.5"':""}>${locked(p)?ico("lock")+" ":""}${esc(p.title)} · ${esc(p.level)}</button>`).join("")}</div>
  <div class="ide">
    <div class="stack">
      <div class="card tight stack"><b>${esc(P.title)}</b><span class="small">${esc(P.statement)}</span>
        <div class="small muted">Ví dụ: ${P.sample.map(s=>`vào <code>${esc(s[0])}</code> → ra <code>${esc(s[1])}</code>`).join(" · ")}</div></div>
      <div class="editor"><div class="ln" id="cLn"></div><textarea id="cSrc" spellcheck="false" aria-label="Mã nguồn Python">${esc(srcOf(P))}</textarea></div>
      <div class="row"><button class="btn" id="cRun">${ico("play")}Chạy thử</button><input class="inp" id="cIn" style="max-width:220px" placeholder="Dữ liệu vào (mỗi dòng cách bằng |)" value="${esc(C.input||P.sample[0][0])}"><button class="btn primary" id="cSubmit">${ico("check")}Nộp bài (chạy bộ test)</button><button class="btn sm ghost" id="cReset">Khôi phục mã ban đầu</button></div>
    </div>
    <div class="stack">
      <div class="stack" style="gap:6px"><span class="lbl">Kết quả chạy</span><div class="console" id="cOut">${C.out||'<span style="opacity:.6">Bấm “Chạy thử” để chạy chương trình ngay trên trình duyệt.</span>'}</div></div>
      <div class="stack" style="gap:6px" id="cTests">${C.tests?`<span class="lbl">Bộ test · ${C.tests.filter(t=>t.ok).length}/${C.tests.length} đạt</span>`+C.tests.map((t,i)=>`<div class="test ${t.ok?"ok":"no"}">${t.ok?ico("check"):ico("x")}<div>Test ${i+1}: vào <code>${esc(t.in)}</code> · mong đợi <code>${esc(t.exp)}</code>${t.ok?"":` · em ra <code>${esc(t.got||"(trống)")}</code>`}</div></div>`).join(""):""}</div>
      <div class="card tight stack"><div class="row between"><b>Trợ giảng AI</b><span class="xs muted">gợi ý sửa lỗi, không viết hộ</span></div>
        <button class="btn" id="cHint">${ico("bulb")}Vì sao chương trình của em sai?</button><div id="cHintOut" class="small">${C.hint?esc(C.hint):""}</div></div>
    </div>
  </div>`;
  const ta=$("#cSrc"), ln=$("#cLn");
  const syncLn=()=>{ ln.textContent=ta.value.split("\n").map((_,i)=>i+1).join("\n"); C.src[P.id]=ta.value; };
  syncLn(); ta.oninput=syncLn;
  ta.onkeydown=e=>{ if(e.key==="Tab"){ e.preventDefault(); const s=ta.selectionStart; ta.value=ta.value.slice(0,s)+"    "+ta.value.slice(ta.selectionEnd); ta.selectionStart=ta.selectionEnd=s+4; syncLn(); } };
  $$("[data-cp]").forEach(b=>b.onclick=()=>{ if(b.disabled) return; C.sel=+b.dataset.cp; C.out=""; C.tests=null; C.hint=""; C.input=""; go("code"); });
  $("#cReset").onclick=()=>{ delete C.src[P.id]; go("code"); };
  $("#cRun").onclick=async()=>{ C.input=$("#cIn").value; const o=$("#cOut"); o.innerHTML='<span style="opacity:.6">Đang chạy…</span>';
    try{ const r=await runPy(ta.value, C.input.split("|").map(s=>s.trim())); C.out=esc(r.out)+(r.err?`<span class="e">${esc(r.err)}</span>`:""); C.lastErr=r.err||""; }
    catch(e){ C.out=await simulate(ta.value,[C.input]); }
    o.innerHTML=C.out||'<span style="opacity:.6">(chương trình không in gì)</span>'; };
  $("#cSubmit").onclick=async()=>{ $("#cTests").innerHTML=loading("Đang chạy bộ test…"); const res=[];
    for (const [i,exp] of P.tests){ try{ const r=await runPy(ta.value, i.split("|")); res.push({in:i,exp,got:(r.err?r.err.split("\n").pop():r.out.trim()),ok:!r.err&&r.out.trim()===exp.trim()}); if(r.err) C.lastErr=r.err; }
      catch(e){ $("#cTests").innerHTML=`<div class="banner warn">${ico("code")}<div>Không tải được trình chạy Python trong khung xem này. Bản chính thức chạy Python ngay trên máy học sinh. ${aiLive()?"Đang nhờ AI chạy mô phỏng…":""}</div></div>`; if(aiLive()){ C.tests=await simulateTests(ta.value,P); go("code"); } return; } }
    C.tests=res; go("code"); if(res.every(t=>t.ok)) toast("Tuyệt vời! Em đã qua hết bộ test."); };
  $("#cHint").onclick=async()=>{ const out=$("#cHintOut"); out.innerHTML=loading("Trợ giảng đang đọc mã…");
    const fails=(C.tests||[]).filter(t=>!t.ok).map(t=>`vào ${t.in} mong đợi ${t.exp} nhưng ra ${t.got}`).join("; ");
    try{ C.hint=await aiText(`Bạn là trợ giảng Tin học THPT. Bài: "${P.statement}". Mã Python của học sinh:\n${ta.value}\n${C.lastErr?"Lỗi khi chạy: "+C.lastErr:""}\n${fails?"Test sai: "+fails:""}\nQuy tắc: KHÔNG viết lại chương trình hay đưa dòng code sửa hoàn chỉnh. Chỉ ra dòng có vấn đề, giải thích nguyên nhân bằng tiếng Việt dễ hiểu (tối đa 60 từ) và kết thúc bằng một câu hỏi gợi mở.`,{tier:"quick"}); }
    catch(e){ C.hint=P.hint||"Đọc lại đề và thử chạy với ví dụ để so sánh kết quả."; }
    out.textContent=C.hint; };
};

export async function simulate(code, inputs){
  if (!aiLive()) return '<span class="e">Không tải được trình chạy Python trong khung xem này. Mở bản chạy trên máy hoặc dùng bản chính thức.</span>';
  try{ const r=await aiJSON(`Mô phỏng chính xác việc chạy chương trình Python 3 sau với dữ liệu vào (mỗi phần tử là một dòng input): ${JSON.stringify(inputs)}\n\n${code}\n\nTrả về CHỈ JSON {"stdout": string, "error": string ("" nếu không lỗi, nếu lỗi ghi dạng "TypeError: ... on line N")}`,{tier:"quick"});
    return '<span style="opacity:.6">[chạy mô phỏng bằng AI]</span>\n'+esc(r.stdout||"")+(r.error?`<span class="e">${esc(r.error)}</span>`:""); }catch(e){ return '<span class="e">Không chạy được.</span>'; }
}

export async function simulateTests(code,P){
  try{ const r=await aiJSON(`Mô phỏng chính xác chương trình Python 3 sau với từng bộ dữ liệu vào. Trả về CHỈ JSON {"outputs":[string]} theo đúng thứ tự, mỗi phần tử là toàn bộ stdout (hoặc "ERROR: ..." nếu lỗi).\nDữ liệu: ${JSON.stringify(P.tests.map(t=>t[0]))}\n\n${code}`,{tier:"quick"});
    return P.tests.map((t,i)=>({in:t[0],exp:t[1],got:String(r.outputs[i]??"").trim(),ok:String(r.outputs[i]??"").trim()===t[1]})); }catch(e){ return null; }
}

export const CLAIMS_ALT = [
  {t:"Sông Hồng bắt nguồn từ Trung Quốc, chảy qua miền Bắc Việt Nam rồi đổ ra Biển Đông.", ok:true},
  {t:"Trên bản đồ, lãnh thổ Việt Nam có hình dáng gần giống chữ S.", ok:true},
  {t:"Hoàng Sa và Trường Sa là hai quần đảo thuộc chủ quyền của Việt Nam trên Biển Đông.", ok:true},
  {t:"Việt Nam hiện có 45 dân tộc anh em cùng sinh sống.", ok:false, why:"Việt Nam có 54 dân tộc anh em, không phải 45."}
];
export const CLAIMS_POOL = [CLAIMS, CLAIMS_ALT];

export const ETH_ALT = {
  scene:"Em được giao làm bài thuyết trình nhóm. Một bạn trong nhóm dùng AI tạo toàn bộ nội dung slide, không ghi chú gì, rồi nộp để tính điểm chung cho cả nhóm.",
  opts:[
    {t:"Không nói gì vì đằng nào nhóm cũng được điểm.", k:"bad", fb:"Im lặng để nhóm nhận điểm từ bài không trung thực là tiếp tay cho gian lận."},
    {t:"Yêu cầu bỏ hẳn phần AI làm, chỉ dùng nội dung tự viết dù không kịp hạn.", k:"mid", fb:"An toàn nhưng cực đoan: AI vẫn có thể hỗ trợ hợp lý nếu dùng đúng cách và minh bạch."},
    {t:"Đề nghị cả nhóm cùng xem lại, tự viết nội dung chính, chỉ dùng AI hỗ trợ hình ảnh và ghi rõ trong slide.", k:"good", fb:"Hướng xử lý hợp lý: giữ phần AI hỗ trợ ở mức công cụ, có minh bạch."},
    {t:"Đề nghị cả nhóm thảo luận lại nội dung, mỗi người tự trình bày phần mình hiểu, ghi rõ phần nào có AI hỗ trợ.", k:"best", fb:"Lựa chọn tốt nhất: mỗi thành viên hiểu và chịu trách nhiệm phần của mình, minh bạch về vai trò của AI."}
  ]
};
export const ETH_POOL = [ETH, ETH_ALT];

export function pickOther(pool, current){
  if (pool.length<2) return pool[0];
  let next; do{ next=pool[Math.floor(Math.random()*pool.length)]; } while(next===current);
  return next;
}

export async function genClaims(){
  const A=S.aiedu, cur=A.claims||CLAIMS;
  try{
    const r=await aiJSON("Viết 4 câu khẳng định tiếng Việt về địa lý Việt Nam, đúng 3 câu ĐÚNG và 1 câu SAI (sai một chi tiết nhỏ). Trả về CHỈ JSON {\"claims\":[{\"t\":string,\"ok\":boolean,\"why\":string (chỉ bắt buộc với câu ok:false)}x4]} (đúng 1 trong 4 có ok:false).",{tier:"quick"});
    if (!Array.isArray(r.claims)||r.claims.length!==4||r.claims.filter(c=>!c.ok).length!==1) throw new Error("bad shape");
    A.claims=r.claims;
  } catch(e){ A.claims=pickOther(CLAIMS_POOL,cur); }
  A.picked=null; A.revealed=false; go("aiedu");
}

export async function genEthics(){
  const A=S.aiedu, cur=A.scene||ETH;
  try{
    const r=await aiJSON("Viết MỘT tình huống ngắn (2-3 câu, tiếng Việt) cho học sinh THPT về việc dùng AI trong học tập liên quan trung thực/đạo văn/trách nhiệm. Kèm 4 lựa chọn hành động xếp loại bad/mid/good/best, mỗi lựa chọn có phản hồi ngắn (fb). Trả về CHỈ JSON {\"scene\":string,\"opts\":[{\"t\":string,\"k\":\"bad\"|\"mid\"|\"good\"|\"best\",\"fb\":string}x4]} (đúng 1 mỗi loại).",{tier:"quick"});
    if (!r.scene||!Array.isArray(r.opts)||r.opts.length!==4) throw new Error("bad shape");
    const kinds=new Set(r.opts.map(o=>o.k));
    if (!["bad","mid","good","best"].every(k=>kinds.has(k))) throw new Error("bad kinds");
    A.scene=r;
  } catch(e){ A.scene=pickOther(ETH_POOL,cur); }
  A.eth=null; A.ethWhy=""; A.ethFb=""; go("aiedu");
}

VIEWS["aiedu"] = v => {
  if (S.cls.exam) return examLock(v);
  const A=S.aiedu;
  v.innerHTML = `<div class="tabs" role="tablist">${[["lessons","Bài học"],["lab","Phòng thí nghiệm prompt"],["fact","Thám tử kiểm chứng"],["ethics","Tình huống đạo đức"],["project","Dự án nhỏ"]].map(([k,n])=>`<button role="tab" data-at="${k}" aria-selected="${A.tab===k}">${n}</button>`).join("")}</div><div id="aBody"></div>`;
  $$("[data-at]").forEach(b=>b.onclick=()=>{ A.tab=b.dataset.at; go("aiedu"); });
  const b=$("#aBody");
  if (A.tab==="lessons"){
    b.innerHTML = `<p class="small muted">Nội dung bám Khung giáo dục trí tuệ nhân tạo (Quyết định 2422/QĐ-BGDĐT), 4 mạch nội dung.</p><div class="g2">${STRANDS.map(([t,d,ls],i)=>`<div class="card stack"><div class="row between"><span class="eyebrow">Mạch ${i+1}</span><span class="chip ${i===2?"brand":""}">${ls.length} bài</span></div><h3>${t}</h3><p class="small muted">${d}</p>${ls.map(l=>`<div class="row between small" style="border-top:1px solid var(--line);padding-top:8px"><span>${esc(l)}</span>${/prompt/i.test(l)?`<button class="btn sm" data-at2="lab">Thực hành</button>`:/kiểm chứng/i.test(l)?`<button class="btn sm" data-at2="fact">Thực hành</button>`:/trung thực/i.test(l)?`<button class="btn sm" data-at2="ethics">Thực hành</button>`:/Dự án/i.test(l)?`<button class="btn sm" data-at2="project">Mở</button>`:`<span class="muted xs">Đọc · 10 phút</span>`}</div>`).join("")}</div>`).join("")}</div>`;
    $$("[data-at2]").forEach(x=>x.onclick=()=>{ A.tab=x.dataset.at2; go("aiedu"); });
  }
  if (A.tab==="lab"){
    b.innerHTML = `<div class="g2" style="align-items:start"><div class="card stack">
      <span class="eyebrow">Nhiệm vụ</span><p>Viết prompt nhờ AI <b>tóm tắt đoạn văn về rừng ngập mặn</b> để giới thiệu cho <b>học sinh lớp 6</b>, kết quả gồm <b>3 câu</b> dễ hiểu.</p>
      <details class="small"><summary>Xem đoạn văn</summary><p class="muted" style="margin-top:6px">Rừng ngập mặn mọc ở vùng cửa sông, ven biển nhiệt đới, nơi nước mặn và nước ngọt hòa trộn. Cây đước, cây mắm có rễ chống và rễ thở giúp đứng vững trong bùn và lấy không khí khi thủy triều lên. Rừng ngập mặn chắn sóng, giảm xói lở bờ biển, là nơi sinh sản của nhiều loài tôm, cá, cua. Việt Nam có rừng ngập mặn lớn ở Cà Mau và Cần Giờ; Cần Giờ được UNESCO công nhận là khu dự trữ sinh quyển thế giới năm 2000.</p></details>
      <div class="field"><label for="lP">Prompt của em</label><textarea id="lP" rows="5">${esc(A.prompt)}</textarea></div><div id="lGate"></div>
      <button class="btn primary" id="lRun">${ico("play")}Chạy prompt và chấm điểm</button></div>
      <div class="stack" id="lOut">${A.lab?labHTML(A.lab):`<div class="card empty">${ico("brain")}<span>Kết quả AI và điểm prompt của em sẽ hiện ở đây. Thử chạy prompt “Tóm tắt bài này.” trước, rồi cải thiện.</span></div>`}</div></div>`;
    $("#lRun").onclick=()=>{ const p=$("#lP").value.trim(); if(!p) return; A.prompt=p; const run=()=>runLab(p); if (gate(p,$("#lGate"),run)) run(); };
  }
  if (A.tab==="fact"){
    const claims=A.claims||CLAIMS, bad=claims.find(c=>!c.ok)||{why:""};
    b.innerHTML = `<div class="card stack" style="max-width:760px"><div class="row between"><span class="eyebrow">Một chatbot viết đoạn sau về địa lý Việt Nam</span><button class="btn sm" id="fNew">${ico("spark")}Tình huống khác</button></div><p>Có <b>một</b> câu sai. Em chọn câu đó và cho biết em sẽ kiểm chứng bằng nguồn nào.</p>
      ${claims.map((c,i)=>`<button class="claim ${A.revealed?(c.ok?(A.picked===i?"wrong":""):"right"):""}" data-cl="${i}" aria-pressed="${A.picked===i}">${esc(c.t)}</button>`).join("")}
      <div class="field"><label for="fSrc">Em kiểm chứng bằng nguồn nào?</label><input id="fSrc" placeholder="VD: trang của Tổng cục Thống kê, sách Địa lí, trang UNESCO"></div>
      <div class="row"><button class="btn primary" id="fGo" ${A.picked==null?"disabled":""}>Nộp câu trả lời</button>${A.revealed?`<button class="btn" id="fAgain">Làm lại</button>`:""}</div>
      ${A.revealed?`<div class="banner ${claims[A.picked].ok?"bad":"good"}">${ico(claims[A.picked].ok?"x":"check")}<div><b>${claims[A.picked].ok?"Chưa đúng.":"Chính xác!"}</b> ${esc(bad.why)}<div class="small" style="margin-top:6px">Bài học: AI có thể viết sai với giọng văn rất chắc chắn. Luôn đối chiếu với nguồn chính thống trước khi tin và chia sẻ.</div></div></div>`:""}</div>`;
    $$("[data-cl]").forEach(x=>x.onclick=()=>{ if(A.revealed) return; A.picked=+x.dataset.cl; go("aiedu"); });
    $("#fGo").onclick=()=>{ A.revealed=true; go("aiedu"); };
    $("#fNew").onclick=genClaims;
    if ($("#fAgain")) $("#fAgain").onclick=()=>{ A.revealed=false; A.picked=null; go("aiedu"); };
  }
  if (A.tab==="ethics"){
    const eth=A.scene||ETH;
    b.innerHTML = `<div class="card stack" style="max-width:760px"><div class="row between"><span class="eyebrow">Tình huống</span><button class="btn sm" id="eNew">${ico("spark")}Tình huống khác</button></div><p>${esc(eth.scene)}</p><b>Em sẽ làm gì?</b>
      ${eth.opts.map((o,i)=>`<button class="claim ${A.eth!=null?(o.k==="best"||o.k==="good"?"right":i===A.eth?"wrong":""):""}" data-eo="${i}" aria-pressed="${A.eth===i}">${esc(o.t)}</button>`).join("")}
      ${A.eth!=null?`<div class="banner info">${ico("bulb")}<div>${esc(eth.opts[A.eth].fb)}</div></div>
      <div class="field"><label for="eWhy">Giải thích vì sao em chọn như vậy (2–3 câu)</label><textarea id="eWhy" rows="3">${esc(A.ethWhy)}</textarea></div><div id="eGate2"></div>
      <div class="row"><button class="btn primary" id="eFb">${ico("send")}Nhận phản hồi từ AI</button></div>${A.ethFb?`<div class="card tight small">${esc(A.ethFb)}</div>`:""}`:""}</div>`;
    $$("[data-eo]").forEach(x=>x.onclick=()=>{ A.eth=+x.dataset.eo; A.ethFb=""; go("aiedu"); });
    $("#eNew").onclick=genEthics;
    if ($("#eFb")) $("#eFb").onclick=async()=>{ A.ethWhy=$("#eWhy").value.trim(); if(!A.ethWhy){toast("Viết vài câu giải thích trước nhé.");return;}
      if (!gate(A.ethWhy,$("#eGate2"),()=>{})) return;
      $("#eFb").disabled=true; try{ A.ethFb=await aiText(`Bạn là giáo viên môn Trí tuệ nhân tạo (THPT, Việt Nam). Tình huống: ${eth.scene}\nHọc sinh chọn: "${eth.opts[A.eth].t}". Giải thích của học sinh: "${A.ethWhy}".\nPhản hồi tiếng Việt, tối đa 70 từ: ghi nhận điểm hợp lý, chỉ ra một điểm cần nghĩ thêm (trung thực, trách nhiệm, quyền tác giả), kết thúc bằng một câu hỏi mở. Không phán xét nặng nề.`,{tier:"quick"}); }
      catch(e){ A.ethFb="Em đã nêu được lý do của mình. Hãy nghĩ thêm: nếu cô hỏi em giải thích lại một đoạn trong bài, em có làm được không? Điều đó cho thấy ai là tác giả thật sự của bài viết."; }
      go("aiedu"); };
  }
  if (A.tab==="project"){
    b.innerHTML = `<div class="g2" style="align-items:start"><div class="card stack"><span class="eyebrow">Dự án nhóm · Mạch 4 · 3 tuần</span><h3>Chatbot hỏi đáp cho thư viện trường</h3>
      ${["Xác định người dùng và câu hỏi họ hay hỏi (khảo sát 10 bạn)","Thu thập dữ liệu: danh mục sách, giờ mở cửa, quy định mượn trả","Viết hướng dẫn (prompt) và các luật trả lời cho chatbot","Thử nghiệm với 20 câu hỏi, ghi lại câu trả lời sai và lý do","Đánh giá đạo đức: chatbot có lưu thông tin cá nhân không? Ai chịu trách nhiệm khi trả lời sai?"].map((s,i)=>`<div class="row" style="align-items:flex-start;flex-wrap:nowrap"><span class="chip ${i<2?"good":""}">${i<2?ico("check"):"Bước "+(i+1)}</span><span class="small">${s}</span></div>`).join("")}
      <span class="xs muted">Nhóm em đã xong 2/5 bước.</span></div>
      <div class="card stack"><h3>Rubric chấm dự án</h3><div class="tablewrap"><table style="min-width:420px"><thead><tr><th>Tiêu chí</th><th>Đạt (1)</th><th>Khá (2)</th><th>Tốt (3)</th></tr></thead><tbody>
        <tr><td>Hiểu người dùng</td><td>Nêu được người dùng</td><td>Có khảo sát</td><td>Khảo sát và phân tích nhu cầu</td></tr>
        <tr><td>Dữ liệu</td><td>Có dữ liệu</td><td>Dữ liệu đúng, đủ</td><td>Có kiểm tra chất lượng dữ liệu</td></tr>
        <tr><td>Thử nghiệm</td><td>Thử vài câu</td><td>Có bảng ghi lỗi</td><td>Sửa và thử lại có số liệu</td></tr>
        <tr><td>Đạo đức &amp; an toàn</td><td>Nêu 1 rủi ro</td><td>Nêu rủi ro và cách giảm</td><td>Có quy tắc bảo vệ dữ liệu rõ ràng</td></tr></tbody></table></div></div></div>`;
  }
};

export function labHTML(L){ return `<div class="card stack"><div class="row between"><b>AI trả lời</b>${L.mock?'<span class="chip warn">Mô phỏng</span>':""}</div><div class="small" style="white-space:pre-wrap">${esc(L.output)}</div></div>
  <div class="card stack"><div class="row between"><b>Điểm prompt</b><b class="num">${L.score.reduce((a,r)=>a+r.v,0)}/${L.score.length}</b></div><div class="rubric">${L.score.map(r=>`<div class="r"><div><b>${esc(r.k)}</b><div class="xs muted">${esc(r.fb)}</div></div><div class="dots"><i class="${r.v?"on":""}"></i></div></div>`).join("")}</div></div>`; }

export async function runLab(p){
  const A=S.aiedu, o=$("#lOut"); o.innerHTML=`<div class="card">${loading("AI đang chạy prompt của em…")}</div>`;
  const passage="Rừng ngập mặn mọc ở vùng cửa sông, ven biển nhiệt đới, nơi nước mặn và nước ngọt hòa trộn. Cây đước, cây mắm có rễ chống và rễ thở giúp đứng vững trong bùn và lấy không khí khi thủy triều lên. Rừng ngập mặn chắn sóng, giảm xói lở bờ biển, là nơi sinh sản của nhiều loài tôm, cá, cua. Việt Nam có rừng ngập mặn lớn ở Cà Mau và Cần Giờ; Cần Giờ được UNESCO công nhận là khu dự trữ sinh quyển thế giới năm 2000.";
  const K=["Vai trò / bối cảnh","Nhiệm vụ rõ ràng","Đối tượng người đọc","Định dạng đầu ra"];
  try{
    const output=await aiText(`${p}\n\n[Đoạn văn học sinh đính kèm]\n${passage}`,{tier:"quick"});
    const r=await aiJSON(`Chấm prompt của học sinh THPT theo 4 tiêu chí (mỗi tiêu chí 0 hoặc 1): ${K.join("; ")}. Nhiệm vụ gốc: tóm tắt đoạn văn về rừng ngập mặn cho học sinh lớp 6 trong 3 câu.\nPrompt: "${p}"\nTrả về CHỈ JSON {"score":[{"k": tên tiêu chí, "v": 0|1, "fb": string (góp ý tiếng Việt ≤ 20 từ)}]}`,{tier:"quick"});
    A.lab={output, score:r.score};
  }catch(e){
    const has=re=>re.test(p);
    const score=[{k:K[0],v:+has(/(bạn là|đóng vai|em là giáo viên|với vai trò|hãy là)/i),fb:"Cho AI biết nó đóng vai ai, VD: “Bạn là giáo viên Sinh học”."},
      {k:K[1],v:+(has(/(tóm tắt|giới thiệu|viết lại)/i)&&has(/(đoạn|bài|rừng ngập mặn)/i)),fb:"Nêu rõ việc cần làm và với nội dung nào."},
      {k:K[2],v:+has(/(lớp 6|học sinh|trẻ em|bạn nhỏ)/i),fb:"Nói rõ ai sẽ đọc để AI chọn từ ngữ phù hợp."},
      {k:K[3],v:+has(/(\d+\s*câu|ba câu|gạch đầu dòng|ngắn gọn|bảng)/i),fb:"Yêu cầu độ dài hoặc dạng trình bày, VD: “đúng 3 câu”."}];
    const full=score.every(s=>s.v);
    A.lab={mock:true, score, output: full?"Rừng ngập mặn là những khu rừng mọc ở nơi nước sông gặp nước biển.\nCây đước, cây mắm có rễ đặc biệt để đứng vững trong bùn và giúp chắn sóng, bảo vệ bờ biển.\nỞ Việt Nam, rừng ngập mặn Cần Giờ được UNESCO công nhận là khu dự trữ sinh quyển thế giới.":"Rừng ngập mặn là hệ sinh thái đặc trưng vùng cửa sông ven biển nhiệt đới với các loài thực vật thích nghi như đước, mắm có hệ rễ chống và rễ thở; hệ sinh thái này có chức năng phòng hộ, giảm xói lở và là nơi cư trú, sinh sản của nhiều loài thủy sản; tại Việt Nam phân bố chủ yếu ở Cà Mau, Cần Giờ (khu dự trữ sinh quyển thế giới, 2000).\n\n(Câu trả lời dài và khó hiểu với học sinh lớp 6 vì prompt chưa nêu đối tượng và độ dài.)"};
  }
  if (S.view==="aiedu") go("aiedu");
}

Object.assign(TITLES,{"s-home":"Chào Minh Anh","math":"Toán · Gia sư gợi mở","code":"Tin học · Lập trình Python","aiedu":"Trí tuệ nhân tạo"});
