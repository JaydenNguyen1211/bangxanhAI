/* Tản Đà AI · teacher.js — mã nguồn, sửa trực tiếp */
import { CH, THREADS, activeDoc, agoText, chatFile, chatSend, markDirty, newDoc, newMsg, newThread, scheduleLessons, seedDocs, useThread } from "./agent.js";
import { aiJSON } from "./ai.js";
import { asstOpen, asstSend, renderCanvas, renderChat } from "./assistant.js";
import { bars, chatSlide, slideFace } from "./content.js";
import { $, $$, S, TITLES, VIEWS, can, clone, esc, go, honor, hooks, ico, loading, shorten, toast, uid } from "./core.js";
import { DAYN, PERIODS, STUDENTS, TT } from "./data.js";

/* Điều hướng các khu soạn với AI */
export function openWork(kind, id){ SEC[kind].mode="work"; if (id) CH.active=id; go(SEC_OF[kind]); }
export let fromNav=false;
document.addEventListener("click", e=>{ if (e.target.closest("#nav [data-go]")) fromNav=true; }, true);
hooks.beforeGo.push(v=>{
  if (v==="edit" || v==="lib") v="doc";
  if (v==="ai") v=SEC_OF[(activeDoc()&&activeDoc().kind)||"doc"];
  const k=KIND_OF_VIEW[v];
  if (k && fromNav && S.view===v) SEC[k].mode="home";      // bấm lại mục menu → về trang đầu của khu
  fromNav=false;
  return v;
});
VIEWS.doc = v => sectionView(v,"doc");
VIEWS.design = v => sectionView(v,"slides");
VIEWS.exam = v => sectionView(v,"exam");
Object.assign(TITLES, { doc:"Tài liệu", design:"Slide bài giảng", exam:"Đề kiểm tra", class:"Lớp học & 4 môn", "a-skills":"Kỹ năng của AI", hw:"Chấm bài về nhà", "t-home":()=>"Chào "+honor()+" "+S.user.name.split(" ").pop() });


export const SEC_OF = {doc:"doc", slides:"design", exam:"exam"};

export const KIND_OF_VIEW = {doc:"doc", design:"slides", exam:"exam"};

export const SEC = { doc:{mode:"home"}, slides:{mode:"home"}, exam:{mode:"home"} };

export const TPL = {
  doc:[["khbd","Giáo án (KHBD)","Theo Phụ lục IV CV 5512, 4 hoạt động","doc"],["phieu","Phiếu học tập","Bài tập phân hóa 3 mức, có đáp án","edit"],["decuong","Đề cương ôn tập","Kiến thức trọng tâm và dạng bài","folder"],["thongbao","Thông báo","Thể thức Nghị định 30/2020","flag"],["bienban","Biên bản họp tổ","Họp tổ chuyên môn, sinh hoạt lớp","users"],["nhanxet","Nhận xét học sinh","Theo Thông tư 22/2021","chart"]],
  slides:[["baigiang","Bài giảng","Khởi động, kiến thức, luyện tập, tổng kết","palette"],["ontap","Ôn tập chương","Tóm tắt, dạng bài, câu hỏi nhanh","folder"],["trochoi","Trò chơi khởi động","Đố vui, ai nhanh hơn","spark"],["hop","Họp phụ huynh","Kết quả, nề nếp, kế hoạch","users"]],
  exam:[["15p","Kiểm tra 15 phút","4–6 câu, chấm nhanh","clock"],["gk","Giữa học kỳ","Định dạng mới 4 phần, 45 phút","exam"],["ck","Cuối học kỳ","Định dạng mới 4 phần, 60–90 phút","exam"],["thithu","Thi thử tốt nghiệp","Bám cấu trúc đề thi tốt nghiệp THPT","flag"]]
};

export const DD = {
  doc:{ subj:["Toán","Tiếng Anh","Tin học","Trí tuệ nhân tạo","Ngữ văn"], grade:["10","11","12"], time:["1 tiết (45 phút)","2 tiết (90 phút)"], level:["Lớp đại trà","Lớp khá giỏi","Lớp cần củng cố"], tone:["Chuẩn mực","Ngắn gọn","Chi tiết"] },
  slides:{ subj:["Toán","Tiếng Anh","Tin học","Trí tuệ nhân tạo","Ngữ văn"], grade:["10","11","12"], n:["6","8","10","12"], theme:["Bảng xanh","Nắng vàng","Tối giản"], src:["Không dùng tài liệu"] },
  exam:{ subj:["Toán","Tiếng Anh","Tin học"], grade:["10","11","12"], topic:["Dấu của tam thức bậc hai","Hàm số bậc hai","Cả hai chủ đề"], struct:["Định dạng mới 4 phần","Chỉ trắc nghiệm","Trắc nghiệm + tự luận"], dist:["40 – 30 – 30","30 – 40 – 30","50 – 30 – 20"], codes:["4 mã đề","2 mã đề","1 mã đề"] }
};

export const DDL = {subj:"Môn",grade:"Lớp",time:"Thời lượng",level:"Đối tượng",tone:"Văn phong",n:"Số slide",theme:"Mẫu",src:"Nguồn",topic:"Chủ đề",struct:"Cấu trúc",dist:"Biết–Hiểu–VD",codes:"Mã đề"};

export const CFG = { doc:{tpl:"khbd",subj:"Toán",grade:"10",time:"1 tiết (45 phút)",level:"Lớp đại trà",tone:"Chuẩn mực",text:""}, slides:{tpl:"baigiang",subj:"Toán",grade:"10",n:"8",theme:"Bảng xanh",src:"Không dùng tài liệu",text:""}, exam:{tpl:"15p",subj:"Toán",grade:"10",topic:"Dấu của tam thức bậc hai",struct:"Định dạng mới 4 phần",dist:"40 – 30 – 30",codes:"4 mã đề",text:""} };

export const DD_SHOW = { doc:t=>["thongbao","bienban"].includes(t)?["tone"]:t==="nhanxet"?["subj","grade","tone"]:["subj","grade","time","level"], slides:t=>t==="hop"?["n","theme"]:["subj","grade","n","theme","src"], exam:()=>["subj","grade","topic","struct","dist","codes"] };

export const PH = { doc:{khbd:"Bài nào? Ví dụ: Dấu của tam thức bậc hai, có trò chơi khởi động",phieu:"Nội dung phiếu? Ví dụ: Giải bất phương trình bậc hai",decuong:"Ôn tập phần nào? Ví dụ: Hàm số bậc hai và đồ thị",thongbao:"Thông báo về việc gì? Ví dụ: Họp phụ huynh cuối học kỳ I, Chủ nhật 10/01/2027",bienban:"Cuộc họp nào? Ví dụ: Họp tổ Toán – Tin tháng 11",nhanxet:"Lớp nào, kỳ nào? Ví dụ: Lớp 10A1 cuối học kỳ I"},
  slides:{baigiang:"Bài giảng về nội dung gì? Ví dụ: Hàm số bậc hai",ontap:"Ôn tập chương nào?",trochoi:"Trò chơi cho bài nào?",hop:"Nội dung buổi họp? Ví dụ: Họp phụ huynh 10A1 cuối kỳ I"},
  exam:{"15p":"Yêu cầu thêm (không bắt buộc). Ví dụ: có 1 câu thực tế","gk":"Yêu cầu thêm (không bắt buộc)","ck":"Yêu cầu thêm (không bắt buộc)","thithu":"Yêu cầu thêm (không bắt buộc)"} };

export function composePrompt(kind){
  const c=CFG[kind], tpl=TPL[kind].find(t=>t[0]===c.tpl), txt=c.text.trim();
  if (kind==="doc"){
    if (c.tpl==="thongbao") return `Soạn thông báo ${txt||"họp phụ huynh cuối học kỳ I"}${c.tone!=="Chuẩn mực"?", văn phong "+c.tone.toLowerCase():""}`;
    if (c.tpl==="bienban") return `Soạn biên bản ${txt||"họp tổ chuyên môn tháng 11"}`;
    if (c.tpl==="nhanxet") return `Viết nhận xét cuối kỳ cho ${txt||"lớp 10A1"}`;
    const ty={khbd:"giáo án",phieu:"phiếu học tập",decuong:"đề cương ôn tập"}[c.tpl];
    return `Soạn ${ty} ${c.subj} ${c.grade} ${txt?"bài "+txt:""}${c.tpl==="khbd"?", "+c.time:""}${c.level!=="Lớp đại trà"?", "+c.level.toLowerCase():""}${c.tone!=="Chuẩn mực"?", viết "+c.tone.toLowerCase():""}`.replace(/\s+,/g,",").replace(/\s{2,}/g," ");
  }
  if (kind==="slides"){
    const src=c.src!=="Không dùng tài liệu"?CH.docs.find(d=>d.title===c.src):null;
    if (src) return `Làm slide từ tài liệu “${src.title}”, ${c.n} slide, mẫu ${c.theme}${txt?". "+txt:""}`;
    const what={baigiang:"bài giảng",ontap:"ôn tập",trochoi:"trò chơi khởi động",hop:"họp phụ huynh"}[c.tpl];
    return `Làm slide ${what} ${c.tpl==="hop"?"":c.subj+" "+c.grade+" "}${txt||(c.tpl==="hop"?"lớp 10A1 cuối học kỳ I":"")}, ${c.n} slide, mẫu ${c.theme}`.replace(/\s{2,}/g," ");
  }
  const kd={"15p":"15 phút","gk":"giữa học kỳ I","ck":"cuối học kỳ I","thithu":"thi thử tốt nghiệp THPT"}[c.tpl];
  return `Ra đề ${kd} ${c.subj} ${c.grade} về ${c.topic.toLowerCase()}, ${c.struct.toLowerCase()}, tỉ lệ ${c.dist}, ${c.codes}${txt?". "+txt:""}`;
}

export const SEC_TITLE = {doc:"Tài liệu", slides:"Slide bài giảng", exam:"Đề kiểm tra"};

export const NEW_TITLE = {doc:"Tạo tài liệu mới", slides:"Tạo bộ slide mới", exam:"Tạo đề kiểm tra mới"};

export function sectionView(v, kind){
  seedDocs();
  if (SEC[kind].mode==="work" && CH.thread) return workView(v, kind);
  SEC[kind].mode="home"; $("#view").classList.remove("full");
  const c=CFG[kind];
  if (kind==="slides") DD.slides.src=["Không dùng tài liệu",...CH.docs.filter(d=>d.kind==="doc").map(d=>d.title)];
  const tplList = kind==="doc" && !can("teach") ? TPL.doc.filter(t=>["thongbao","bienban"].includes(t[0])) : TPL[kind];
  if (kind==="doc" && !can("teach") && !tplList.some(t=>t[0]===c.tpl)) c.tpl=tplList[0][0];
  const show=DD_SHOW[kind](c.tpl);
  const list=CH.docs.filter(d=>d.kind===kind).sort((a,b)=>(b.updated||0)-(a.updated||0));
  v.innerHTML = `
  <section class="cbox" aria-label="${NEW_TITLE[kind]}">
    <div class="row between"><h2>${NEW_TITLE[kind]}</h2><span class="xs muted">${ico("spark")} Chọn mẫu và tuỳ chọn, mô tả thêm bằng lời rồi bấm Soạn. Sau đó mọi chỉnh sửa đều nhắn trong chat.</span></div>
    <div class="tpls" role="radiogroup" aria-label="Mẫu">${tplList.map(([k,n,d,ic])=>`<button class="tpl ${c.tpl===k?"on":""}" role="radio" aria-checked="${c.tpl===k}" data-tpl="${k}"><span class="tic">${ico(ic)}</span><b>${n}</b><span class="xs muted">${d}</span></button>`).join("")}</div>
    <div class="cbox-in">
      <textarea id="cbText" rows="2" placeholder="${esc(PH[kind][c.tpl]||"")}">${esc(c.text)}</textarea>
      <div class="cbox-bar">
        <div class="ddbar">${show.map(k=>`<div class="ddw"><button class="dd" data-dd="${k}" aria-haspopup="listbox"><span class="muted">${DDL[k]}</span> <b>${esc(k==="src"&&c[k].length>26?shorten(c[k],5):c[k])}</b> <span class="car">▾</span></button></div>`).join("")}</div>
        <div class="row" style="gap:6px;flex-wrap:nowrap"><label class="btn ghost" for="cbFile" title="Tải file lên để sửa" style="cursor:pointer;padding:9px">${ico("up")}</label><input type="file" id="cbFile" accept=".docx,.pptx,.txt,.md" hidden><button class="btn primary" id="cbGo">${ico("spark")}Soạn với AI</button></div>
      </div>
    </div>
    <div class="row" style="gap:6px"><span class="xs muted">Gợi ý:</span>${suggestFor(kind).map(s=>`<button class="pill xsp" data-cbs="${esc(s)}">${esc(s)}</button>`).join("")}</div>
  </section>
  <div class="row between"><h2>Tài liệu người khác gửi</h2><span class="xs muted">Đồng nghiệp gửi qua trợ lý AI</span></div>
  <div class="dgrid" id="recvBox"><div class="card empty">${loading("Đang tải…")}</div></div>
  <div class="row between"><h2>${SEC_TITLE[kind]} đã tạo <span class="muted" style="font-weight:400">(${list.length})</span></h2><span class="xs muted">Mới cập nhật trước</span></div>
  <div class="dgrid">${list.map(d=>docCard(d)).join("")||`<div class="card empty">Chưa có ${SEC_TITLE[kind].toLowerCase()} nào.</div>`}</div>`;
  $$("[data-tpl]").forEach(b=>b.onclick=()=>{ c.text=$("#cbText").value; c.tpl=b.dataset.tpl; go(SEC_OF[kind]); });
  $("#cbText").oninput=e=>{ c.text=e.target.value; };
  $("#cbText").onkeydown=e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); $("#cbGo").click(); } };
  $$("[data-dd]").forEach(b=>b.onclick=e=>{ e.stopPropagation(); ddOpen(b, kind, b.dataset.dd); });
  $$("[data-cbs]").forEach(b=>b.onclick=()=>{ c.text=b.dataset.cbs; $("#cbText").value=c.text; $("#cbText").focus(); });
  $("#cbGo").onclick=()=>{ c.text=$("#cbText").value; startCompose(kind); };
  $("#cbFile").onchange=e=>{ const f=e.target.files[0]; e.target.value=""; if(!f) return; openNewThread(kind); chatFile(f); };
  $$("[data-dopen]").forEach(b=>b.onclick=()=>openDoc(b.dataset.dopen));
  loadReceived(kind);
}

/* ---------- Tài liệu người khác gửi (đồng nghiệp gửi qua trợ lý AI, lưu ở máy chủ: xem /api/senddoc) ---------- */
export function receivedCard(d){
  let th="";
  if (d.kind==="slides") th=`<div class="th th-s">${slideFace(chatSlide((d.content||[])[0]||{title:d.title,bullets:[]}),0,false,d.theme||"th-board")}</div>`;
  else if (d.kind==="doc") th=`<div class="th th-d"><div class="mini">${(d.content||[]).slice(0,9).map(b=>b.t==="title"?`<b class="mt">${esc(b.text)}</b>`:b.t==="h2"?`<b>${esc(b.text)}</b>`:b.t==="table"?`<i class="mtb"></i>`:`<span>${esc(shorten(b.text,14))}</span>`).join("")}</div></div>`;
  else { const e=d.content||{}; th=`<div class="th th-d"><div class="mini"><b class="mt">${esc((e.cfg&&e.cfg.kind)||"Đề kiểm tra")}</b><span>Môn ${esc(e.cfg?e.cfg.subj+" "+e.cfg.grade:"")} · ${esc(e.cfg?e.cfg.time:"")} phút</span></div></div>`; }
  return `<button class="dcard" data-recvopen="${d.id}">${th}<div class="dc-b"><b>${esc(d.title)}</b><span class="xs muted">Từ ${esc(d.fromName)} · ${agoText(new Date(d.sentAt).getTime())}</span>${d.read?"":' <span class="tag">Mới</span>'}</div></button>`;
}

export function openReceivedDoc(rd){
  openNewThread(rd.kind);
  const d=newDoc(rd.kind, rd.title, rd.content);
  if (rd.kind==="slides" && rd.theme) d.theme=rd.theme;
  d.history = Array.isArray(rd.history) ? clone(rd.history) : [];
  d.dirty=false; d.pendingNotes=[];
  markDirty(d, `Nhận tài liệu từ ${rd.fromName} qua trợ lý AI`);
  const m=newMsg(); m.typing=false; m.cards=[d.id];
  m.t=`Đã mở tài liệu “${rd.title}” do ${rd.fromName} gửi. ${honor()[0].toUpperCase()+honor().slice(1)} có thể xem, chỉnh sửa hoặc xuất file như tài liệu của mình.`;
  renderChat(); renderCanvas();
}

export function loadReceived(kind){
  fetch("/api/senddoc?to="+encodeURIComponent(S.user.code)).then(r=>r.json()).then(({docs})=>{
    const box=$("#recvBox"); if (!box) return;
    const list=(docs||[]).filter(x=>x.kind===kind);
    box.innerHTML = list.length ? list.map(receivedCard).join("") : `<div class="card empty">Chưa có ${SEC_TITLE[kind].toLowerCase()} nào được gửi đến.</div>`;
    $$("[data-recvopen]").forEach(b=>b.onclick=()=>{
      const rd=list.find(x=>x.id===b.dataset.recvopen); if (!rd) return;
      fetch(`/api/senddoc/${rd.id}/read`,{method:"POST"}).catch(()=>{});
      openReceivedDoc(rd);
    });
  }).catch(()=>{ const box=$("#recvBox"); if (box) box.innerHTML = `<div class="card empty">Không tải được tài liệu gửi đến.</div>`; });
}

export function suggestFor(kind){ const L=scheduleLessons().map(x=>x.split(" – ")[0].replace(/^Bài \d+\.\s*/,""));
  if (kind==="doc") return [L[0]||"Dấu của tam thức bậc hai", L[1]||"Cấp số cộng"].filter(Boolean);
  if (kind==="slides") return ["Hàm số bậc hai","Dấu của tam thức bậc hai"];
  return ["có 1 bài toán thực tế","tránh câu đánh đố"]; }

export function docCard(d){
  let th="";
  if (d.kind==="slides") th=`<div class="th th-s">${slideFace(chatSlide(d.content[0]||{title:d.title,bullets:[]}),0,false,d.theme)}</div>`;
  else if (d.kind==="doc") th=`<div class="th th-d"><div class="mini">${d.content.slice(0,9).map(b=>b.t==="title"?`<b class="mt">${esc(b.text)}</b>`:b.t==="h2"?`<b>${esc(b.text)}</b>`:b.t==="table"?`<i class="mtb"></i>`:`<span>${esc(shorten(b.text,14))}</span>`).join("")}</div></div>`;
  else { const e=d.content; th=`<div class="th th-d"><div class="mini"><b class="mt">${esc((e.cfg&&e.cfg.kind)||"Đề kiểm tra")}</b><span>Môn ${esc(e.cfg?e.cfg.subj+" "+e.cfg.grade:"")} · ${esc(e.cfg?e.cfg.time:"")} phút</span>${(e.mcq||[]).slice(0,3).map((q,i)=>`<span>Câu ${i+1}. ${esc(shorten(q.q,9))}</span>`).join("")}</div></div>`; }
  const n=d.kind==="slides"?d.content.length+" slide":d.kind==="exam"?((d.content.mcq||[]).length+(d.content.tf||[]).length+(d.content.short||[]).length+(d.content.essay||[]).length)+" câu":(d.content.filter(b=>b.t==="h2").length?d.content.filter(b=>b.t==="h2").length+" mục":d.content.length+" đoạn");
  return `<button class="dcard" data-dopen="${d.id}">${th}<div class="dc-b"><b>${esc(d.title)}</b><span class="xs muted">${n} · ${d.versions.length+1} phiên bản · ${agoText(d.updated||Date.now())}</span></div></button>`;
}

export function ddOpen(btn, kind, key){
  $("#ddmenu")&&$("#ddmenu").remove(); const c=CFG[kind]; const opts=DD[kind][key];
  const m=document.createElement("div"); m.id="ddmenu"; m.className="bmenu"; m.setAttribute("role","listbox");
  m.innerHTML=opts.map(o=>`<button role="option" aria-selected="${o===c[key]}" data-ddo="${esc(o)}">${key==="theme"?`<i class="sw ${({"Bảng xanh":"th-board","Nắng vàng":"th-sun","Tối giản":"th-clean"})[o]}"></i>`:""}${esc(o)}${o===c[key]?" ✓":""}</button>`).join("");
  document.body.appendChild(m); const r=btn.getBoundingClientRect(); m.style.left=Math.max(8,Math.min(window.innerWidth-m.offsetWidth-8,r.left))+"px"; m.style.top=(r.bottom+6+m.offsetHeight>window.innerHeight? r.top-m.offsetHeight-6 : r.bottom+6)+"px";
  m.querySelectorAll("[data-ddo]").forEach(x=>x.onclick=()=>{ c.text=$("#cbText").value; c[key]=x.dataset.ddo; m.remove(); go(SEC_OF[kind]); });
}

export function openNewThread(kind){ useThread(newThread(kind)); CH.active=null; CH.noWelcome=true; SEC[kind].mode="work"; go(SEC_OF[kind]); }

export function startCompose(kind){
  const c=CFG[kind]; if (kind==="slides") CH.nextTheme=({"Bảng xanh":"th-board","Nắng vàng":"th-sun","Tối giản":"th-clean"})[c.theme];
  if (kind!=="slides") CH.nextTheme=null; else if (c.src!=="Không dùng tài liệu"){ const i=CH.docs.findIndex(d=>d.title===c.src); if(i>=0) CH.docs.push(CH.docs.splice(i,1)[0]); }
  const p=composePrompt(kind); openNewThread(kind); chatSend(p); c.text="";
}

export function openDoc(id){
  const d=CH.docs.find(x=>x.id===id); if(!d) return; let t=THREADS.find(x=>x.id===d.thread); if(!t){ t=newThread(d.kind); d.thread=t.id; }
  useThread(t); CH.active=d.id;
  const kind=d.kind; if (!t.msgs.length || t.msgs[t.msgs.length-1].reopen!==d.id) t.msgs.push({r:"ai",reopen:d.id,t:`Đã mở “${d.title}”. ${honor()[0].toUpperCase()+honor().slice(1)} muốn chỉnh gì, cứ nhắn tôi.`,chips:null});
  SEC[kind].mode="work"; go(SEC_OF[kind]);
}

export const curSecKind = () => KIND_OF_VIEW[S.view];

export const inWork = () => { const k=curSecKind(); return !!(k && SEC[k].mode==="work"); };
export const inWorkOf = kind => curSecKind()===kind && SEC[kind].mode==="work";

export function workView(v, kind){
  $("#view").classList.add("full");
  const d=activeDoc();
  v.innerHTML = `<div class="wbar"><button class="btn sm ghost" id="wBack">← ${SEC_TITLE[kind]}</button><span class="muted small wtitle" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d?esc(d.title):NEW_TITLE[kind]}</span><span class="xs muted" style="margin-left:auto">${ico("spark")} Chỉnh sửa bằng cách nhắn trợ lý bên phải</span></div>
    <div class="cv-main"><div class="cv-head" id="cvHead"></div><div class="cv-body" id="cvBody"></div></div>`;
  $("#wBack").onclick=()=>{ SEC[kind].mode="home"; go(SEC_OF[kind]); };
  if (!d) $("#cvBody").innerHTML=`<div class="cv-empty"><div class="spin" style="width:26px;height:26px"></div><b>Trợ lý đang soạn…</b><span class="small muted">Theo dõi ở khung chat bên phải. Tài liệu sẽ hiện ở đây.</span></div>`;
  else renderCanvas();
}

document.addEventListener("mousedown",e=>{ const m=$("#ddmenu"); if(m&&!m.contains(e.target)&&!e.target.closest("[data-dd]")) m.remove(); });

export function todayIdx(){ const d=new Date().getDay(); return d===0?-1:d-1; }

VIEWS["t-home"] = v => {
  const T=TT[S.user.code]||TT["GV-0108"], di=todayIdx(), show=di<0?0:di, now=new Date();
  const dayItems=T.items.filter(x=>x[0]===show).sort((a,b)=>a[1]-b[1]), ev=T.events.filter(e=>e[0]===show);
  const teach=T.items.filter(x=>x[3]===T.subj).length, extra=T.items.length-teach, nextWeek=T.items.filter(x=>x[3]===T.subj), ready=nextWeek.filter(x=>x[6]).length;
  const dateStr = `${DAYN[show]}, ${di<0?"(Chủ nhật · xem lịch thứ 2)":String(now.getDate()).padStart(2,"0")+"/"+String(now.getMonth()+1).padStart(2,"0")+"/"+now.getFullYear()}`;
  const subjShort = T.subj==="Toán"?"Toán":"Tiếng Anh";
  v.innerHTML = `
  <div class="row between"><div class="stack" style="gap:2px"><span class="eyebrow">Hôm nay</span><h2>${dateStr}</h2></div><span class="tag">Lịch dạy và số liệu là dữ liệu mẫu</span></div>
  <div class="g4">
    <div class="kpi"><span class="muted small">Tiết dạy tuần này</span><b class="num">${teach+extra}</b><span class="xs muted">${teach} tiết ${subjShort} · ${extra} tiết chủ nhiệm</span><div class="meter"><i style="width:${Math.min(100,(teach+extra)/19*100)}%"></i></div><span class="xs muted">định mức 19 tiết/tuần (đã tính kiêm nhiệm)</span></div>
    <div class="kpi"><span class="muted small">Giáo án tuần này đã soạn</span><b class="num">${ready}<span class="muted" style="font-size:1rem">/${nextWeek.length}</span></b><div class="meter ${ready/nextWeek.length<.6?"warnm":""}"><i style="width:${ready/nextWeek.length*100}%"></i></div><span class="xs muted">${nextWeek.length-ready} tiết chưa có giáo án</span></div>
    <div class="kpi"><span class="muted small">Bài chờ chấm</span><b class="num">38</b><span class="xs" style="color:var(--warn)">${T.subj==="Toán"?"15 phút lớp 10A2":"Bài viết Unit 1 lớp 11A2"} · hạn 06/11</span></div>
    <div class="kpi"><span class="muted small">Chuyên cần lớp CN ${T.hr} hôm nay</span><b class="num">37<span class="muted" style="font-size:1rem">/38</span></b><span class="xs muted">1 học sinh nghỉ có phép</span></div>
  </div>
  <div class="dash2">
    <div class="stack" style="gap:16px">
      <div class="card stack" style="gap:10px">
        <div class="row between"><h3>Lịch dạy ${DAYN[show].toLowerCase()}</h3><span class="muted small">${dayItems.length} tiết${ev.length?` · ${ev.length} lịch chiều`:""}</span></div>
        ${dayItems.length?dayItems.map(x=>{ const [,p,cls,sj,room,lesson,ok]=x, isT=sj===T.subj;
          return `<div class="row" style="flex-wrap:nowrap;align-items:flex-start;padding:10px 0;border-top:1px solid var(--line)">
            <div style="width:84px;flex:none"><b>${PERIODS[p-1][0]}</b><div class="xs muted">${PERIODS[p-1][1]}</div></div>
            <div style="flex:1;min-width:0"><div class="row" style="gap:8px"><b>${esc(sj)} ${esc(cls)}</b><span class="muted small">${esc(room)}</span>${cls===T.hr?'<span class="tag">Lớp CN</span>':""}</div>${lesson?`<div class="small">${esc(lesson)}</div>`:""}</div>
            ${isT?(ok?`<span class="chip good">${ico("check")}Có giáo án</span>`:`<button class="btn sm accent" data-prep="${esc(`Soạn giáo án ${T.subj} ${cls.replace(/[A-Z]\d?$/,"")} ${lesson} cho lớp ${cls}`)}">${ico("spark")}Soạn với AI</button>`):""}</div>`; }).join("")
          :`<p class="muted small">Không có tiết dạy.</p>`}
        ${ev.map(e=>`<div class="row" style="flex-wrap:nowrap;padding:10px 0;border-top:1px solid var(--line)"><div style="width:84px;flex:none"><b>${e[1]}</b><div class="xs muted">Buổi chiều</div></div><div style="flex:1"><b>${esc(e[2])}</b><div class="small muted">${esc(e[3])}</div></div></div>`).join("")}
      </div>
      <div class="card stack" style="gap:10px"><div class="row between"><h3>Thời khóa biểu tuần</h3><span class="muted small">Buổi sáng</span></div>
        <div class="tablewrap"><table style="min-width:600px;table-layout:fixed"><thead><tr><th style="width:64px"></th>${DAYN.map((d,i)=>`<th style="${i===show?"color:var(--brand)":""}">${d}</th>`).join("")}</tr></thead><tbody>
        ${PERIODS.map((pp,pi)=>`<tr><td class="muted small">${pp[0]}</td>${DAYN.map((_,dI)=>{ const x=T.items.find(y=>y[0]===dI&&y[1]===pi+1); return `<td style="${dI===show?"background:var(--brand-soft)":""}">${x?`<b class="small">${esc(x[2])}</b><div class="xs muted">${esc(x[3]===T.subj?x[4]:x[3])}</div>`:""}</td>`; }).join("")}</tr>`).join("")}
        </tbody></table></div></div>
    </div>
    <div class="stack" style="gap:16px">
      <div class="card stack" style="gap:8px"><h3>Hạn cần nhớ</h3>
        ${[["06/11","Chấm và trả bài "+(T.subj==="Toán"?"15 phút lớp 10A2":"bài viết 11A2"),"warn"],["07/11","Nộp kế hoạch bài dạy tuần 11 cho tổ trưởng",""],["08/11","Nhập điểm giữa kỳ I lên sổ điểm điện tử",""],["12/11","Hạn học sinh nộp phiếu bài tập trên hệ thống",""]].map(([d,t,c])=>`<div class="row" style="flex-wrap:nowrap;gap:10px"><span class="chip ${c}" style="width:56px;justify-content:center">${d}</span><span class="small">${t}</span></div>`).join("")}</div>
      <div class="card stack" style="gap:8px"><div class="row between"><h3>Điểm TB giữa kỳ I</h3><span class="xs muted">thang 10 · % dưới 5</span></div>
        <div class="bars">${T.classes.map(([c,avg,low])=>`<div class="barrow" style="grid-template-columns:44px minmax(0,1fr) 92px"><b>${c}</b><div class="meter ${avg<6.5?"warnm":""}"><i style="width:${avg*10}%"></i></div><span class="num small">${String(avg).replace(".",",")} · <span style="color:${low>=15?"var(--warn)":"var(--muted)"}">${low}%</span></span></div>`).join("")}</div></div>
      <div class="card stack" style="gap:8px"><div class="row between"><h3>Bài tập đã giao</h3><button class="btn sm ghost" data-go="class">Lớp học</button></div>
        ${(T.subj==="Toán"?[["10A1","Phiếu dấu tam thức bậc hai",31],["11A1","Gia sư: cấp số cộng",27],["11A2","Gia sư: cấp số cộng",19]]:[["11A1","Speak Up: Unit 1",30],["11A2","Speak Up: Unit 1",22],["10A3","Từ vựng Unit 3",33]]).map(([c,t,n])=>`<div class="skill"><div class="row between"><span class="small"><b>${c}</b> · ${t}</span><span class="num small">${n}/38</span></div><div class="meter ${n/38<.6?"warnm":""}"><i style="width:${n/38*100}%"></i></div></div>`).join("")}</div>
      <div class="card stack" style="gap:8px"><h3>Lớp chủ nhiệm ${T.hr} · cần chú ý</h3>
        ${[["Phạm Đức Huy",`Điểm ${T.subj} giảm 2,0 so với cuối năm trước`],["Hoàng Tuấn Kiệt","Nghỉ 3 buổi trong tháng 10"],["Ngô Thanh Tùng","Chưa nộp 2 bài tập gần nhất"]].map(([n,r])=>`<div class="small"><b>${n}</b> <span class="muted">· ${r}</span></div>`).join("")}
        <button class="btn sm" data-prep="Soạn tin nhắn trao đổi với phụ huynh em Phạm Đức Huy (lớp ${T.hr}) về kết quả học tập" style="justify-self:start">${ico("spark")}Nhờ trợ lý soạn tin cho phụ huynh</button></div>
    </div>
  </div>
  <div class="card stack" style="gap:10px"><div class="row between"><h3>Giao việc cho trợ lý</h3><span class="muted small">Trợ lý soạn, sửa và làm nhiều bước, việc gửi ra ngoài luôn chờ duyệt</span></div>
    <div class="row" style="flex-wrap:nowrap"><input class="inp" id="hGoal" placeholder="VD: Chuẩn bị ${T.subj} ${T.hr} tuần tới"><button class="btn primary" id="hGo">${ico("send")}Gửi</button></div>
    <div class="pills">${(T.subj==="Toán"?["Chuẩn bị Toán 10A1 tuần tới","Xử lý kết quả bài kiểm tra 15 phút lớp 10A1","Tạo đề 15 phút Toán 10 về dấu của tam thức bậc hai"]:["Soạn giáo án Tiếng Anh 11 Unit 1 Speaking","Tạo đề 15 phút Tiếng Anh 11 Unit 1"]).map(g=>`<button class="pill" data-prep="${esc(g)}">${esc(g)}</button>`).join("")}</div>
    <div class="row between"><span class="xs muted">Hỏi trợ lý những việc chuyên môn khác, ví dụ:</span></div>
    <div class="pills">${[`Lịch dạy của ${T.subj==="Toán"?"cô Hạnh":"thầy Nam"} tuần này`,`Điểm và số điện thoại phụ huynh em ${(STUDENTS[T.hr]||[])[0]?.name||"Phạm Đức Huy"}`,"Quy định dùng AI khi soạn giáo án của trường"].map(g=>`<button class="pill" data-prep="${esc(g)}">${esc(g)}</button>`).join("")}</div></div>`;
  const send=g=>{ if(g){ asstOpen(true); asstSend(g); } };
  $$("[data-prep]").forEach(b=>b.onclick=()=>send(b.dataset.prep));
  $("#hGo").onclick=()=>{ const g=$("#hGoal").value.trim()||$("#hGoal").placeholder.replace(/^VD:\s*/,""); $("#hGoal").value=""; send(g); };
  $("#hGoal").onkeydown=e=>{ if(e.key==="Enter"){ const g=e.target.value.trim(); e.target.value=""; send(g);} };
};

export const SKILL_SCOPES = [["all","Mọi lúc"],["doc","Khi soạn/sửa Tài liệu"],["slides","Khi làm Slide"],["exam","Khi ra đề"]];

function skillScopeLabel(scope){ const row=SKILL_SCOPES.find(s=>s[0]===scope); return row?row[1]:scope; }

function skillRowHTML(sk){
  return `<div class="row between" style="padding:6px 0;border-top:1px solid var(--line)"><span class="small"><span class="tag">${esc(skillScopeLabel(sk.scope))}</span> ${esc(sk.text)}</span><button class="btn sm ghost" data-skdel="${sk.id}" aria-label="Xóa kỹ năng">${ico("x")}</button></div>`;
}

function skillsCardHTML(){
  return `<div class="card stack" style="gap:10px">
    <div class="row between"><h3>Kỹ năng AI (tùy biến trợ lý)</h3><span class="chip brand">${ico("spark")}Tự động hóa</span></div>
    <p class="small muted">Dạy thêm cho trợ lý một quy tắc riêng, áp dụng khi soạn đúng loại tài liệu đã chọn. Chỉ áp dụng khi dùng AI thật. Ví dụ: "Luôn thêm phần Dặn dò ở cuối giáo án."</p>
    <div class="stack" id="skList">${S.skills.length?S.skills.map(skillRowHTML).join(""):`<p class="muted small">Chưa có kỹ năng nào.</p>`}</div>
    <div class="row" style="flex-wrap:wrap;gap:6px">
      <select class="inp" id="skScope" style="width:auto">${SKILL_SCOPES.map(([k,n])=>`<option value="${k}">${n}</option>`).join("")}</select>
      <input class="inp" id="skText" placeholder="VD: Luôn thêm phần Dặn dò ở cuối giáo án" style="flex:1;min-width:220px">
      <button class="btn primary" id="skAdd">${ico("spark")}Thêm kỹ năng</button>
    </div>
  </div>`;
}

VIEWS["a-skills"] = v => {
  if (!can("teach")) { v.innerHTML = `<div class="card empty">${ico("lock")}<b>Chỉ giáo viên mới dùng được mục này.</b></div>`; return; }
  v.innerHTML = skillsCardHTML();
  $("#skAdd").onclick=()=>{ const t=$("#skText").value.trim(); if(!t){ toast("Nhập nội dung kỹ năng."); return; } S.skills.push({id:uid(), scope:$("#skScope").value, text:t}); go("a-skills"); };
  $$("[data-skdel]").forEach(b=>b.onclick=()=>{ S.skills=S.skills.filter(s=>s.id!==b.dataset.skdel); go("a-skills"); });
};

/* ---------- Quy trình nhiều bước ---------- */
function flowPromptText(f){ return `${f.name}\n${f.desc}\n` + f.steps.map((s,i)=>`Bước ${i+1}: ${s}`).join("\n"); }

function flowCardHTML(f){
  return `<div class="card stack" style="gap:8px">
    <div class="row between"><b>${esc(f.name)}</b><div class="row" style="gap:6px">
      <button class="btn sm accent" data-flowrun="${f.id}">${ico("spark")}Nhờ trợ lý làm</button>
      <button class="btn sm ghost" data-flowdel="${f.id}" aria-label="Xóa quy trình">${ico("x")}</button>
    </div></div>
    <p class="small muted">${esc(f.desc)}</p>
    <ol class="small" style="padding-left:18px;margin:0">${f.steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol>
  </div>`;
}

function flowsCardHTML(){
  return `
  <div class="banner info">${ico("gauge")}<div>Mỗi quy trình gồm một đoạn <b>Miêu tả</b> và các <b>Bước</b> theo thứ tự — soạn sẵn một yêu cầu nhiều bước để nhờ trợ lý làm liền một lúc. Thẻ đầu tiên là mẫu để tham khảo cách viết.</div></div>
  <div class="stack" id="flowList">${S.flows.map(flowCardHTML).join("")}</div>
  <div class="card stack" style="gap:10px">
    <h3>Thêm quy trình mới</h3>
    <div class="field"><label for="flName">Tên quy trình</label><input class="inp" id="flName" placeholder="VD: Chuẩn bị bài dạy mới"></div>
    <div class="field"><label for="flDesc">Miêu tả</label><textarea id="flDesc" rows="2" placeholder="Mô tả ngắn mục tiêu của quy trình này"></textarea></div>
    <div class="field"><label for="flSteps">Các bước (mỗi dòng một bước, theo đúng thứ tự)</label><textarea id="flSteps" rows="4" placeholder="Soạn giáo án...
Làm slide từ giáo án...
Ra đề kiểm tra..."></textarea></div>
    <button class="btn primary" id="flAdd" style="justify-self:start">${ico("spark")}Lưu quy trình</button>
  </div>`;
}

VIEWS["a-flows"] = v => {
  if (!can("teach")) { v.innerHTML = `<div class="card empty">${ico("lock")}<b>Chỉ giáo viên mới dùng được mục này.</b></div>`; return; }
  v.innerHTML = flowsCardHTML();
  $$("[data-flowrun]").forEach(b=>b.onclick=()=>{ const f=S.flows.find(x=>x.id===b.dataset.flowrun); if (f){ asstOpen(true); asstSend(flowPromptText(f)); } });
  $$("[data-flowdel]").forEach(b=>b.onclick=()=>{ S.flows=S.flows.filter(f=>f.id!==b.dataset.flowdel); go("a-flows"); });
  $("#flAdd").onclick=()=>{
    const name=$("#flName").value.trim(), desc=$("#flDesc").value.trim();
    const steps=$("#flSteps").value.split("\n").map(s=>s.trim()).filter(Boolean);
    if (!name || !steps.length){ toast("Nhập tên quy trình và ít nhất một bước."); return; }
    S.flows.push({id:uid(), name, desc, steps});
    go("a-flows");
  };
};

/* ---------- Chấm bài về nhà ---------- */
function hwReviewHTML(s){
  if (s.state==="approved") return `<div class="banner good" style="margin-top:6px">${ico("check")}<div><b>Điểm chốt: ${s.teacherScore}/10</b>${s.teacherNote?" · "+esc(s.teacherNote):""}<div class="xs muted">Giáo viên đã duyệt</div></div></div>`;
  if (!s.ai) return `<p class="muted small">Đang chờ AI chấm…</p>`;
  return `<div class="card tight stack" style="background:var(--sunk);margin-top:6px">
    <div class="row between"><b>AI chấm: ${s.ai.score}/10</b>${s.ai.mock?'<span class="chip warn">Mô phỏng</span>':'<span class="chip good">AI</span>'}</div>
    <p class="small">${esc(s.ai.fb)}</p>
    ${s.ai.strengths.length?`<div class="small"><b>Điểm mạnh:</b> ${s.ai.strengths.map(esc).join("; ")}</div>`:""}
    ${s.ai.issues.length?`<div class="small"><b>Cần cải thiện:</b> ${s.ai.issues.map(esc).join("; ")}</div>`:""}
    <div class="row" style="gap:6px;flex-wrap:nowrap"><input class="inp" style="width:80px" type="number" min="0" max="10" step="0.5" id="sc-${s.id}" value="${s.ai.score}" aria-label="Điểm chốt"><input class="inp" id="nt-${s.id}" placeholder="Ghi chú (không bắt buộc)" style="flex:1"><button class="btn sm primary" data-hwok="${s.id}">${ico("check")}Duyệt điểm</button></div>
  </div>`;
}

function hwSubHTML(s){
  return `<div style="padding:8px 0;border-top:1px solid var(--line)">
    <div class="row between"><b class="small">${esc(s.studentName)}</b><span class="xs muted">${esc(new Date(s.submittedAt).toLocaleString("vi-VN"))}</span></div>
    <details class="small"><summary class="muted">Xem bài làm</summary><pre class="small" style="white-space:pre-wrap;max-height:200px;overflow:auto">${esc(s.content)}</pre></details>
    ${hwReviewHTML(s)}
  </div>`;
}

function hwCardHTML(h, n){
  return `<div class="card stack">
    <div class="row between"><div><b>${esc(h.title)}</b><div class="xs muted">${esc(h.subj)} · Lớp ${esc(h.cls)} · Hạn: ${esc(h.due)||"—"}</div></div><span class="chip">${h.subs.length}/${n} đã nộp</span></div>
    ${h.desc?`<p class="small muted">${esc(h.desc)}</p>`:""}
    <div class="stack" style="gap:0">${h.subs.length?h.subs.map(hwSubHTML).join(""):`<p class="muted small">Chưa có học sinh nào nộp.</p>`}</div>
  </div>`;
}

VIEWS["hw"] = v => {
  if (!can("teach")) { v.innerHTML = `<div class="card empty">${ico("lock")}<b>Chỉ giáo viên mới dùng được mục này.</b></div>`; return; }
  v.innerHTML = `<div class="card">${loading("Đang tải...")}</div>`;
  const load = () => fetch("/api/homework").then(r=>r.json()).then(({homework})=>{
    const mine = homework.filter(h=>h.teacherCode===S.user.code);
    v.innerHTML = `
    <div class="banner info">${ico("edit")}<div>Giao bài, học sinh nộp bài làm — AI tự chấm ngay khi học sinh nộp (điểm, nhận xét, điểm mạnh/cần cải thiện). Giáo viên xem lại và bấm "Duyệt điểm" để chốt điểm cuối cùng.</div></div>
    <div class="card stack">
      <h3>Giao bài tập về nhà</h3>
      <div class="g3">
        <div class="field"><label for="hwTitle">Tiêu đề</label><input class="inp" id="hwTitle" placeholder="VD: Bài tập Dấu của tam thức bậc hai"></div>
        <div class="field"><label for="hwSubj">Môn</label><select id="hwSubj">${DD.doc.subj.map(s=>`<option ${s===(TT[S.user.code]||TT["GV-0108"]).subj?"selected":""}>${esc(s)}</option>`).join("")}</select></div>
        <div class="field"><label for="hwCls">Lớp</label><select id="hwCls">${Object.keys(STUDENTS).map(c=>`<option>${esc(c)}</option>`).join("")}</select></div>
      </div>
      <div class="field"><label for="hwDesc">Yêu cầu / đề bài</label><textarea id="hwDesc" rows="3" placeholder="Mô tả yêu cầu để AI chấm đúng trọng tâm"></textarea></div>
      <div class="field" style="max-width:220px"><label for="hwDue">Hạn nộp</label><input class="inp" id="hwDue" placeholder="VD: Thứ Năm 12/11"></div>
      <button class="btn primary" id="hwAdd" style="justify-self:start">${ico("send")}Giao bài</button>
    </div>
    <div class="row between"><h3>Bài đã giao (${mine.length})</h3><button class="btn sm ghost" id="hwReload">${ico("down")}Làm mới</button></div>
    ${mine.length?mine.map(h=>hwCardHTML(h,(STUDENTS[h.cls]||[]).length)).join(""):`<div class="card empty">Chưa giao bài tập nào.</div>`}`;
    $("#hwReload").onclick=load;
    $("#hwAdd").onclick=()=>{
      const title=$("#hwTitle").value.trim(); if(!title){ toast("Nhập tiêu đề bài tập."); return; }
      const body={ title, subj:$("#hwSubj").value, cls:$("#hwCls").value, desc:$("#hwDesc").value.trim(), due:$("#hwDue").value.trim(), teacherCode:S.user.code, teacherName:S.user.name };
      fetch("/api/homework",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}).then(()=>{ toast("Đã giao bài."); load(); }).catch(()=>toast("Không giao được bài."));
    };
    $$("[data-hwok]").forEach(b=>b.onclick=()=>{
      const id=b.dataset.hwok, sc=$("#sc-"+id).value, nt=$("#nt-"+id).value;
      const h=mine.find(x=>x.subs.some(s=>s.id===id)); if(!h) return;
      fetch(`/api/homework/${h.id}/submissions/${id}/decide`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({teacherScore:sc,teacherNote:nt})})
        .then(()=>{ toast("Đã chốt điểm."); load(); }).catch(()=>toast("Không chốt được điểm."));
    });
  }).catch(()=>{ v.innerHTML = `<div class="card empty">Không lấy được danh sách bài tập từ máy chủ.</div>`; });
  load();
};

VIEWS["class"] = v => {
  const c=S.cls;
  v.innerHTML = `
  <div class="row between"><div class="row"><span class="chip brand">${ico("users")}Lớp 10A1 · 38 học sinh</span><span class="muted small">Tuần 02/11 – 08/11/2026</span></div><span class="tag">Số liệu tiến độ là dữ liệu mẫu</span></div>
  <div class="g2">
    <div class="card stack" style="gap:6px">
      <h3>Điều khiển lớp học</h3>
      <label class="toggle"><span><b>Chế độ lớp học · Toán</b><br><span class="small muted">Gia sư chỉ trả lời về bài đang học: Dấu của tam thức bậc hai.</span></span><input type="checkbox" class="switch" data-cm="math" ${c.classroom.math?"checked":""}></label>
      <label class="toggle"><span><b>Chế độ lớp học · Tin học</b><br><span class="small muted">Chỉ mở bài “Tổng các chữ số”.</span></span><input type="checkbox" class="switch" data-cm="code" ${c.classroom.code?"checked":""}></label>
      <label class="toggle"><span><b>Cho phép “Giải luôn” ở gia sư Toán</b><br><span class="small muted">Mặc định tắt: AI chỉ gợi mở từng bước.</span></span><input type="checkbox" class="switch" id="cSolve" ${c.allowSolve?"checked":""}></label>
      <label class="toggle"><span><b>Chế độ kiểm tra</b><br><span class="small muted">Khóa toàn bộ AI trên tài khoản học sinh trong giờ làm bài.</span></span><input type="checkbox" class="switch" id="cExam" ${c.exam?"checked":""}></label>
      <p class="xs muted">Đăng nhập bằng mã học sinh HS26-0915 để thấy hiệu lực.</p>
    </div>
    <div class="card stack">
      <h3>Tiến độ theo môn</h3>
      <div class="tablewrap"><table style="min-width:420px"><thead><tr><th>Môn</th><th>Hoạt động tuần</th><th>Chỉ số chính</th></tr></thead><tbody>
        <tr><td><b>Toán</b></td><td>112 phiên gia sư</td><td>64% tự giải xong sau gợi ý<div class="meter" style="margin-top:4px"><i style="width:64%"></i></div></td></tr>
        <tr><td><b>Tin học</b></td><td>30/38 nộp “Tổng các chữ số”</td><td>24 bài qua hết test<div class="meter" style="margin-top:4px"><i style="width:63%"></i></div></td></tr>
        <tr><td><b>Trí tuệ nhân tạo</b></td><td>Phòng thí nghiệm prompt</td><td>Điểm prompt TB 2,6/4<div class="meter" style="margin-top:4px"><i style="width:65%"></i></div></td></tr>
        <tr><td><b>Tiếng Anh</b></td><td>Speak Up Lab</td><td><span class="muted">Speak Up · 30/38 học sinh đã luyện</span></td></tr>
      </tbody></table></div>
      <div class="small"><b>Lỗ hổng chung môn Toán:</b> <span class="muted">tách hạng tử (46%), nhóm hạng tử (52%).</span></div>
    </div>
  </div>
  <div class="card stack" style="gap:12px">
    <div class="row between"><h3>Tạo bài tập Tin học kèm bộ test</h3><span class="chip brand">${ico("spark")}AI</span></div>
    <div class="row" style="align-items:end"><div class="field" style="flex:1;min-width:240px"><label for="cpDesc">Mô tả bài tập</label><input id="cpDesc" value="Đếm số lượng số chẵn trong một dãy số nhập trên một dòng"></div>
      <div class="field" style="width:140px"><label for="cpLv">Mức độ</label><select id="cpLv"><option>Cơ bản</option><option selected>Vừa</option><option>Nâng cao</option></select></div>
      <button class="btn primary" id="cpGo">${ico("spark")}Tạo bài</button></div>
    <div id="cpOut"></div>
    <div class="small muted">Bài trong thư viện lớp: ${S.codeProblems.map(p=>esc(p.title)).join(" · ")}</div>
  </div>`;
  $$("[data-cm]").forEach(x=>x.onchange=()=>{ c.classroom[x.dataset.cm]=x.checked; toast(x.checked?"Đã bật chế độ lớp học.":"Đã tắt chế độ lớp học."); });
  $("#cSolve").onchange=e=>{ c.allowSolve=e.target.checked; toast(c.allowSolve?"Học sinh có thể xem lời giải đầy đủ.":"Gia sư chỉ gợi mở từng bước."); };
  $("#cExam").onchange=e=>{ c.exam=e.target.checked; toast(c.exam?"Đã khóa AI cho học sinh.":"Đã mở lại AI cho học sinh."); };
  $("#cpGo").onclick=genProblem;
};

export async function genProblem(){
  const d=$("#cpDesc").value.trim(), lv=$("#cpLv").value, out=$("#cpOut"); if(!d){toast("Nhập mô tả bài tập.");return;}
  out.innerHTML=loading("AI đang tạo đề và bộ test…"); let p;
  try{ const r=await aiJSON(`Tạo bài tập lập trình Python cho học sinh THPT Việt Nam, mức ${lv}: "${d}". Đọc dữ liệu bằng input(), in kết quả bằng print. Bộ test phải chính xác (tự kiểm tra bằng cách tính tay).
Trả về CHỈ JSON {"title": string, "statement": string (tiếng Việt, nêu rõ định dạng vào/ra), "tests": [[input string, expected output string] x5], "starter": string (2–3 dòng khởi đầu, có chú thích), "hint": string (gợi ý không lộ lời giải)}`, {tier:"default"});
    if(!r.tests) throw {}; p={...r, id:"p"+Date.now(), level:lv, sample:[r.tests[0]]};
  }catch(e){ p={id:"p"+Date.now(), title:"Đếm số chẵn", level:lv, statement:"Nhập một dòng gồm các số nguyên cách nhau bởi dấu cách. In ra số lượng số chẵn.", tests:[["1 2 3 4","2"],["7 9 11","0"],["0 -2 5","2"],["10","1"],["2 4 6 8 10","5"]], starter:"day = input().split()\n# Đếm số chẵn trong day\n", hint:"Mỗi phần tử trong day là chuỗi; đổi sang số nguyên rồi kiểm tra chia hết cho 2.", sample:[["1 2 3 4","2"]], mock:true}; }
  out.innerHTML=`<div class="card tight stack" style="background:var(--brand-soft);border-color:var(--brand)"><div class="row between"><b>${esc(p.title)}</b>${p.mock?'<span class="chip warn">Mẫu mô phỏng</span>':'<span class="chip good">AI tạo</span>'}</div><div class="small">${esc(p.statement)}</div>
    <div class="tablewrap"><table style="min-width:300px"><thead><tr><th>Input</th><th>Output mong đợi</th></tr></thead><tbody>${p.tests.map(t=>`<tr><td><code>${esc(t[0])}</code></td><td><code>${esc(t[1])}</code></td></tr>`).join("")}</tbody></table></div>
    <div><button class="btn sm primary" id="cpAdd">Duyệt &amp; giao cho lớp</button></div></div>`;
  $("#cpAdd").onclick=()=>{ S.codeProblems.push(p); toast("Đã thêm bài. Học sinh thấy trong mục Tin học."); go("class"); };
}
