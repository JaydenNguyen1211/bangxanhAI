/* Tản Đà AI · assistant.js — mã nguồn, sửa trực tiếp */
import { CH, THREADS, activeDoc, applyAllProps, applyProp, chatFile, chatSend, deleteBlock, discardAllProps, discardProp, editBlockText, exportDocById, moveBlock, newThread, requestBlockRewrite, restoreVersion, saveDoc, scheduleLessons, useThread, welcomeChips } from "./agent.js";
import { KICON, KLABEL, blockHTML, chatSlide, examKey, examPaper, propBar, slideFace, wdiff } from "./content.js";
import { $, S, TITLES, esc, go, honor, hooks, ico, nowHM, shorten, toast } from "./core.js";
import { SEC, SEC_OF, SEC_TITLE, curSecKind, inWork, openDoc } from "./teacher.js";

/* Khung Trợ lý AI cố định bên phải, dùng chung ở mọi trang của giáo viên */
export const A$ = { open:false, initFor:null, userClosed:false };
export function asstOpen(on, manual){
  A$.open=on; $("#assist").hidden=!on; document.body.classList.toggle("asst-open",on); $("#asstBtn").setAttribute("aria-expanded",on);
  if (manual) A$.userClosed=!on;
  if (on) setTimeout(()=>{ const l=$("#cwLog"); if(l) l.scrollTop=l.scrollHeight; },0);
}
export function buildDrawer(){
  const a=$("#assist");
  a.innerHTML = `<div class="as-head"><div class="row between" style="flex-wrap:nowrap"><div class="row" style="gap:8px;flex-wrap:nowrap;min-width:0"><span class="logo" style="width:28px;height:28px;border-radius:8px">${ico("spark")}</span><div style="min-width:0"><b>Trợ lý AI</b><div class="xs muted" id="asSub">Agent hỗ trợ giáo viên</div></div></div>
      <div class="row" style="gap:2px;flex-wrap:nowrap"><button class="btn sm ghost" id="asVoice" aria-pressed="false" title="Đọc to câu trả lời của trợ lý">${ico("speaker")}</button><button class="btn sm ghost" id="asNew" title="Cuộc trò chuyện mới">Mới</button><button class="btn sm ghost" id="asClose" aria-label="Thu gọn trợ lý">${ico("x")}</button></div></div>
      <div class="as-ctx" id="asCtx"></div></div>
    <div class="cw-log" id="cwLog" aria-live="polite"></div>
    <div class="cw-foot"><div id="cwGate"></div><div class="pills" id="cwSug"></div><div id="cwQuote"></div>
      <div class="cw-comp"><label class="btn ghost" for="cwFile" title="Đính kèm file Word, PowerPoint" aria-label="Đính kèm file" style="cursor:pointer;padding:9px">${ico("up")}</label><input type="file" id="cwFile" accept=".docx,.pptx,.txt,.md" hidden>
        <button class="btn ghost" id="cwMic" type="button" title="Bấm để nói với trợ lý" aria-label="Nói với trợ lý" aria-pressed="false" style="padding:9px">${ico("mic")}</button>
        <textarea id="cwIn" rows="1" placeholder="Nhắn trợ lý: soạn, sửa, giao việc…"></textarea><button class="btn primary" id="cwSend" aria-label="Gửi">${ico("send")}</button></div>
      <div class="xs muted" style="text-align:center" id="cwVoiceHint">AI có thể sai. Giáo viên luôn duyệt trước khi dùng.</div></div>`;
  const inp=$("#cwIn");
  $("#cwSend").onclick=()=>{ cancelAutoSend(); const t=inp.value.trim(); if(!t) return; inp.value=""; inp.style.height="auto"; chatSend(t); };
  inp.onkeydown=e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); $("#cwSend").click(); } };
  inp.oninput=()=>{ cancelAutoSend(); inp.style.height="auto"; inp.style.height=Math.min(inp.scrollHeight,160)+"px"; };
  $("#cwMic").onclick=()=>{ if (micRec) stopDictation(); else { cancelAutoSend(); startDictation(); } };
  $("#asVoice").onclick=()=>toggleVoice();
  $("#asVoice").setAttribute("aria-pressed", String(isVoiceOn()));
  $("#asVoice").classList.toggle("accent", isVoiceOn());
  $("#cwFile").onchange=e=>{ const f=e.target.files[0]; e.target.value=""; if(f) fileFromDrawer(f); };
  a.ondragover=e=>{ e.preventDefault(); a.classList.add("over"); }; a.ondragleave=()=>a.classList.remove("over");
  a.ondrop=e=>{ e.preventDefault(); a.classList.remove("over"); const f=e.dataTransfer.files[0]; if(f) fileFromDrawer(f); };
  $("#asClose").onclick=()=>asstOpen(false,true);
  $("#asNew").onclick=()=>{ if (CH.busy) return; const k=curSecKind(); if (k) SEC[k].mode="home"; CH.general=newThread("doc"); useThread(CH.general); CH.active=null; go(S.view); };
  $("#asstBtn").onclick=()=>asstOpen(!A$.open,true);
  let wide=window.innerWidth>=1100;
  window.addEventListener("resize",()=>{ const w=window.innerWidth>=1100; if(wide&&!w&&A$.open) asstOpen(false); if(!wide&&w&&isStaff()&&!A$.userClosed) asstOpen(true); wide=w; });
}

/* Nói thay vì gõ: dành cho giáo viên không quen gõ máy. Nhận giọng nói tiếng Việt, tự điền vào ô nhắn, tự gửi sau vài giây nếu không chỉnh sửa gì thêm. */
let micRec=null, sendTimer=null;
export function startDictation(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR){ toast("Trình duyệt này chưa hỗ trợ nói. Dùng Chrome hoặc Edge trên máy tính."); return; }
  const inp=$("#cwIn"), btn=$("#cwMic"), hint=$("#cwVoiceHint");
  if (!inp||!btn) return;
  const r=new SR(); r.lang="vi-VN"; r.interimResults=true; r.continuous=false; r.maxAlternatives=1;
  let fin="", err=null;
  btn.classList.add("accent"); btn.setAttribute("aria-pressed","true"); if(hint) hint.textContent="Đang nghe… nói điều thầy/cô cần.";
  r.onresult=e=>{ let interim=""; for (let i=e.resultIndex;i<e.results.length;i++){ const res=e.results[i]; if(res.isFinal) fin+=res[0].transcript; else interim+=res[0].transcript; } inp.value=(fin+interim).trim(); inp.style.height="auto"; inp.style.height=Math.min(inp.scrollHeight,160)+"px"; };
  r.onerror=e=>{ err=e.error; if (["not-allowed","service-not-allowed","audio-capture"].includes(e.error)) toast("Không dùng được micro. Kiểm tra quyền truy cập micro cho trình duyệt."); };
  r.onend=()=>{
    btn.classList.remove("accent"); btn.setAttribute("aria-pressed","false"); micRec=null;
    const text=inp.value.trim();
    if (!text){
      if (hint) hint.textContent="AI có thể sai. Giáo viên luôn duyệt trước khi dùng.";
      if (err && !["not-allowed","service-not-allowed","audio-capture"].includes(err)) toast(err==="no-speech" ? "Chưa nghe thấy giọng nói. Thử nói to và gần micro hơn." : `Không nhận được giọng nói (lỗi: ${err}). Thử lại hoặc gõ.`);
      return;
    }
    autoSendCountdown();
  };
  try{ r.start(); micRec=r; }catch(e){ btn.classList.remove("accent"); btn.setAttribute("aria-pressed","false"); toast("Không bật được micro: "+(e&&e.message||e)); }
}
export function stopDictation(){ if (micRec){ try{ micRec.stop(); }catch(e){} } }
function autoSendCountdown(){
  clearTimeout(sendTimer);
  let left=3;
  const tick=()=>{
    const h=$("#cwVoiceHint");
    if (left<=0){ sendTimer=null; if(h) h.textContent="AI có thể sai. Giáo viên luôn duyệt trước khi dùng."; const b=$("#cwSend"); if(b) b.click(); return; }
    if (h) h.textContent=`Tự gửi sau ${left}s… (gõ hoặc bấm micro để hủy)`;
    left--; sendTimer=setTimeout(tick,1000);
  };
  tick();
}
function cancelAutoSend(){
  if (!sendTimer) return;
  clearTimeout(sendTimer); sendTimer=null;
  const h=$("#cwVoiceHint"); if (h) h.textContent="AI có thể sai. Giáo viên luôn duyệt trước khi dùng.";
}

/* AI nói to câu trả lời: Web Speech API có sẵn trong trình duyệt (như Speak Up của học sinh), giọng tiếng Việt máy/trình duyệt đang cài — không gọi AI, không tốn phí. */
let voiceOn=false, ttsVoices=[];
function loadTtsVoices(){ try{ ttsVoices=speechSynthesis.getVoices(); }catch(e){} }
if ("speechSynthesis" in window){ loadTtsVoices(); speechSynthesis.onvoiceschanged=loadTtsVoices; }
function pickTtsVoice(){
  if (!ttsVoices.length) return null;
  const score=v=>{ if(!/^vi/i.test(v.lang)) return -1; let s=1;
    if (/natural|neural|online|wavenet|premium|enhanced/i.test(v.name)) s+=6;
    if (/google/i.test(v.name)) s+=2; if (/microsoft/i.test(v.name)) s+=1; return s; };
  const ranked=ttsVoices.map(v=>({v,s:score(v)})).filter(x=>x.s>=0).sort((a,b)=>b.s-a.s);
  return ranked.length?ranked[0].v:null;
}
export function isVoiceOn(){ return voiceOn; }
export function toggleVoice(){
  voiceOn=!voiceOn; const b=$("#asVoice");
  if (b){ b.setAttribute("aria-pressed", String(voiceOn)); b.classList.toggle("accent", voiceOn); }
  if (!voiceOn){ try{ speechSynthesis.cancel(); }catch(e){} }
  toast(voiceOn ? "Trợ lý sẽ đọc to câu trả lời." : "Đã tắt đọc to câu trả lời.");
}
function doSpeak(text){
  if (!("speechSynthesis" in window) || !text) return;
  const clean=String(text).replace(/\*\*(.+?)\*\*/g,"$1").replace(/^[-•]\s+/gm,"").replace(/\s+/g," ").trim();
  if (!clean) return;
  try{
    speechSynthesis.cancel();
    const v=pickTtsVoice();
    const u=new SpeechSynthesisUtterance(clean); u.lang="vi-VN"; if (v) u.voice=v;
    speechSynthesis.speak(u);
  }catch(e){}
}
export function speakReply(text){ if (voiceOn) doSpeak(text); }
export function speakNow(text){ doSpeak(text); }

export const isStaff = () => S.user && S.user.role==="staff";
export function asstSend(text){ if(!A$.open) asstOpen(true); chatSend(text); }
export function asstReset(){ A$.initFor=null; CH.general=null; CH.msgs=[]; CH.thread=null; CH.docs=[]; CH.seeded=null; asstOpen(false); $("#asstBtn").hidden=true; }

export function bindChatEls(root){
  root.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{ const id=b.dataset.open; if (inWork() && CH.docs.find(x=>x.id===id&&x.thread===(CH.thread&&CH.thread.id))){ CH.active=id; renderCanvas(); renderChat(); } else openDoc(id); });
  root.querySelectorAll("[data-chip]").forEach(b=>b.onclick=()=>chatSend(b.dataset.chip));
  root.querySelectorAll("[data-dl]").forEach(b=>b.onclick=()=>exportDocById(b.dataset.dl));
  root.querySelectorAll("[data-speak]").forEach(b=>b.onclick=()=>{ const msg=CH.msgs[+b.dataset.speak]; if (msg) speakNow(msg.t); });
}
export function chatSuggestions(){
  if (CH.busy || !inWork()) return [];
  const d=activeDoc(); if (!d || (CH.pending&&CH.pending.chips)) return [];
  if (d.kind==="doc") return ["Thêm phần phân hóa cho học sinh yếu","Thêm 3 câu hỏi củng cố","Làm slide từ tài liệu này","Xuất file Word"];
  if (d.kind==="slides") return ["Rút mỗi slide còn tối đa 3 ý","Thêm slide câu hỏi trắc nghiệm","Đổi sang mẫu Nắng vàng","Xuất PowerPoint"];
  return ["Câu 2 khó hơn","Thêm 1 câu trả lời ngắn mức Vận dụng",d.showAns?"Ẩn đáp án":"Hiện đáp án","Xuất file Word"];
}
/* khu giữa chỉ hiện tài liệu của cuộc trò chuyện đang mở */
export function renderCanvas(){
  const all=CH.docs, tid=CH.thread&&CH.thread.id;
  CH.docs = tid ? all.filter(d=>d.thread===tid) : all;
  try { renderCanvasAll(); } finally { CH.docs=all; }
  const wb=document.querySelector(".wbar .wtitle"); const d=activeDoc(); if(wb&&d) wb.textContent=d.title;
}

/* sau mỗi lần chuyển trang: chọn đúng cuộc trò chuyện, giữ khung trợ lý mở */
hooks.afterGo.push(()=>{
  if (!isStaff()){ asstOpen(false); $("#asstBtn").hidden=true; return; }
  if (A$.initFor!==S.user.code){ A$.initFor=S.user.code; }
  if (!CH.general) CH.general=newThread("doc");
  if (inWork()){ const d=activeDoc(); const t=d&&THREADS.find(x=>x.id===d.thread); if (t && CH.thread!==t) useThread(t); }
  else if (!CH.busy){ if (CH.docs.some(d=>d.thread===CH.general.id)) CH.general=newThread("doc"); if (CH.thread!==CH.general) useThread(CH.general); CH.active=null; greet(); }
  $("#asstBtn").hidden=false;
  if (window.innerWidth>=1100 && !A$.userClosed && !A$.open) asstOpen(true);
  renderChat();
});


export function greet(){ if (!CH.msgs.length) CH.msgs.push({r:"ai", t:greetText(), chips:greetChips()}); }

export function greetText(){ const h=honor(), H=h[0].toUpperCase()+h.slice(1); const k=curSecKind();
  const where = k ? `Đây là khu **${SEC_TITLE[k]}**. ${H} chọn mẫu ở hộp soạn bên trái, hoặc nhắn thẳng cho tôi.` : `Tôi là trợ lý của ${h} ở mọi trang: soạn, sửa tài liệu, slide, đề và làm việc nhiều bước.`;
  return `Chào ${h}! ${where}\n- “Soạn giáo án bài Dấu của tam thức bậc hai cho 10A1”\n- “Làm slide từ giáo án Dấu của tam thức bậc hai”\n- “Ra đề 15 phút về hàm số bậc hai”\n- “Chuẩn bị Toán 10A1 tuần tới”`; }

export function greetChips(){ const k=curSecKind(); const L=scheduleLessons(); const l0=L[0]?L[0].split(" – ")[0].replace(/^Bài \d+\.\s*/,""):"Dấu của tam thức bậc hai";
  if (k==="slides") return [`Làm slide bài ${l0}, 8 slide`,"Làm slide họp phụ huynh lớp 10A1"];
  if (k==="exam") return ["Ra đề 15 phút Toán 10 về dấu của tam thức bậc hai","Ra đề giữa kỳ I Toán 10 cả hai chủ đề"];
  if (k==="doc") return [`Soạn giáo án Toán 10 bài ${l0}`,"Soạn thông báo họp phụ huynh cuối học kỳ I"];
  return welcomeChips(); }

export async function fileFromDrawer(f){ const k=/\.pptx$/i.test(f.name)?"slides":"doc"; if(!inWork()){ useThread(newThread(k)); CH.active=null; CH.noWelcome=true; SEC[k].mode="work"; go(SEC_OF[k]); } chatFile(f); }

export function openCanvasMobile(){ if (window.innerWidth<1100) asstOpen(false); }

export function renderAsst(){
  if (!S.user||S.user.role!=="staff") return; const d=inWork()?activeDoc():null;
  const sub=$("#asSub"), ctx=$("#asCtx"); if(!sub) return;
  sub.textContent = d ? "Đang làm việc trên tài liệu" : "Agent hỗ trợ giáo viên · mọi trang";
  ctx.innerHTML = d ? `<span class="chip brand" title="${esc(d.title)}">${ico(KICON[d.kind])}${esc(shorten(d.title,7))}</span>${CH.quote?`<span class="chip">Đang trích đoạn</span>`:""}` : `<span class="chip">${ico("home")}${esc(S.view==="t-home"?"Tổng quan":TITLES[S.view]||"")}</span>`;
}

export function fmtChat(t){
  const lines=esc(t).split("\n"); let html="", listTag=null;
  lines.forEach(l=>{
    const mb=l.match(/^\s*[-•]\s+(.*)/);
    const mn=l.match(/^\s*(\d{1,2})[.)]\s+(.*)/);
    if (mb){ if(listTag!=="ul"){ html+="<ul>"; listTag="ul"; } html+=`<li>${mb[1]}</li>`; }
    else if (mn){ if(listTag==="ul"){ html+="</ul>"; } listTag="ol"; html+=`<div class="ol-item pop" style="margin:4px 0"><span class="ol-n">${mn[1]}</span><span class="ol-t">${mn[2]}</span></div>`; }
    else { if(listTag==="ul") html+="</ul>"; listTag=null; html+=l?`<p>${l}</p>`:""; }
  });
  if (listTag==="ul") html+="</ul>";
  return html.replace(/\*\*(.+?)\*\*/g,"<b>$1</b>");
}

export function msgHTML(m,i,compact){
  if (m.r==="me") return `<div class="cm me">${m.quote?`<div class="cq">“${esc(shorten(m.quote,18))}”</div>`:""}${m.file?`<div class="cfile">${ico("doc")}${esc(m.file)}</div>`:""}${m.t?fmtChat(m.t):""}</div>`;
  const cards=(m.cards||[]).map(id=>{ const d=CH.docs.find(x=>x.id===id); return d?`<button class="ccard" data-open="${d.id}">${ico(KICON[d.kind])}<span><b>${esc(d.title)}</b><span class="xs muted">${KLABEL[d.kind]} · ${d.versions.length?"phiên bản "+(d.versions.length+1):"bản đầu"}</span></span><span class="xs" style="margin-left:auto;color:var(--brand)">Xem</span></button>`:""; }).join("");
  const file=m.file?`<button class="ccard" data-dl="${m.file.id}">${ico("down")}<span><b>${esc(m.file.name)}</b><span class="xs muted">Bấm để tải về</span></span></button>`:"";
  const steps=m.steps?`<div class="csteps">${m.steps.map(s=>`<div class="cstep ${s.st}"><span>${s.st==="done"?ico("check"):s.st==="run"?'<i class="spin" style="width:11px;height:11px"></i>':"·"}</span>${esc(s.t)}</div>`).join("")}</div>`:"";
  const working=m.typing&&m.working?`<div class="row muted small" style="margin-top:6px;gap:6px"><div class="spin" style="width:13px;height:13px"></div><span>${esc(m.working)}</span></div>`:"";
  const thinkLive=m.thinking&&!m.thinkingDone?`<div class="think-live"><div class="row" style="gap:6px;align-items:center"><div class="spin" style="width:12px;height:12px"></div><b class="xs muted">${ico("brain")}Đang suy nghĩ…</b></div><div class="think-body">${esc(m.thinking)}</div></div>`:"";
  const thinkDone=m.thinking&&m.thinkingDone?`<details class="think"><summary>${ico("brain")}<span>Đã suy nghĩ trước khi trả lời</span></summary><div class="think-body">${esc(m.thinking)}</div></details>`:"";
  const chips=m.chips&&i===CH.msgs.length-1&&!CH.busy?`<div class="pills" style="margin-top:8px">${m.chips.map(c=>`<button class="pill" data-chip="${esc(c)}">${esc(c)}</button>`).join("")}</div>`:"";
  const speakBtn=!m.typing&&m.t?`<button class="btn sm ghost" data-speak="${i}" title="Nghe lại" aria-label="Nghe lại" style="margin-top:6px;padding:3px 8px">${ico("speaker")}Nghe lại</button>`:"";
  return `<div class="cm ai"><span class="cav">${ico("spark")}</span><div class="cbody">${thinkLive}${thinkDone}${m.typing&&!m.t&&!thinkLive?'<span class="typing" style="padding:0;background:none" title="AI đang soạn câu trả lời…"><i></i><i></i><i></i></span>':fmtChat(m.t||"")}${m.typing&&m.t?'<span class="caret"></span>':""}${working}${steps}${cards}${file}${speakBtn}${chips}</div></div>`;
}

export function renderChat(){
  const log=$("#cwLog");
  if (log){ log.innerHTML=CH.msgs.map((m,i)=>msgHTML(m,i)).join(""); bindChatEls(log); log.scrollTop=log.scrollHeight;
    $("#cwSug").innerHTML=CH.busy?"":chatSuggestions().map(s=>`<button class="pill" data-chip="${esc(s)}">${esc(s)}</button>`).join(""); bindChatEls($("#cwSug"));
    $("#cwQuote").innerHTML=CH.quote?`<div class="qchip">${ico("edit")}<span>Đang trích: “${esc(shorten(CH.quote.text,16))}”</span><button class="btn sm ghost" id="qX" aria-label="Bỏ trích">${ico("x")}</button></div>`:"";
    if ($("#qX")) $("#qX").onclick=()=>{ CH.quote=null; renderChat(); };
    $("#cwSend").disabled=CH.busy; }
  renderAsst();
}

export function blkDiffHTML(b, prevList){
  if (!prevList) return blockHTML(b,false);
  if (b.t==="table"){ const same=prevList.some(p=>p.t==="table"&&JSON.stringify(p.rows)===JSON.stringify(b.rows)); return same?blockHTML(b,false):`<div class="chg-add">${blockHTML(b,false)}</div>`; }
  if (prevList.some(p=>p.text===b.text&&p.t===b.t)) return blockHTML(b,false);
  let best=null, bs=0; const wb=new Set(b.text.split(/\s+/));
  prevList.forEach(p=>{ if(!p.text||p.t!==b.t) return; const wp=p.text.split(/\s+/); const inter=wp.filter(w=>wb.has(w)).length; const sc=inter/Math.max(wp.length,wb.size); if(sc>bs){ bs=sc; best=p; } });
  if (best && bs>0.35){ const tag={title:"h1",sub:"div",h2:"h2",h3:"h3",p:"p",li:"li"}[b.t]||"p"; const el=`<${tag}${b.t==="sub"?' class="sub"':""}>${wdiff(best.text,b.text)}</${tag}>`; return `<div class="chg-mod">${b.t==="li"?`<ul class="one">${el}</ul>`:el}</div>`; }
  return `<div class="chg-add">${blockHTML(b,false)}</div>`;
}

export function hideSelbar(){ const b=$("#selbar"); if(b) b.hidden=true; }

export function showSelBar(bid, text){
  const sel=window.getSelection(); if(!sel||!sel.rangeCount) return;
  const bar=$("#selbar"); if(!bar) return;
  bar.innerHTML=[["rewrite","Viết lại"],["short","Ngắn gọn"],["long","Dài hơn"],["simple","Dễ hiểu"],["formal","Trang trọng"]].map(([k,n])=>`<button data-sba="${k}">${ico("spark")}${n}</button>`).join("")+`<button data-sbq="1">${ico("edit")}Hỏi trợ lý…</button>`;
  bar.hidden=false;
  const r=sel.getRangeAt(0).getBoundingClientRect();
  bar.style.left=Math.max(8,Math.min(window.innerWidth-bar.offsetWidth-8,r.left))+"px";
  bar.style.top=Math.max(8,r.top-bar.offsetHeight-8)+"px";
  bar.querySelectorAll("[data-sba]").forEach(b=>b.onclick=()=>requestBlockRewrite(CH.active, bid, text, b.dataset.sba));
  const q=bar.querySelector("[data-sbq]"); if(q) q.onclick=()=>{ hideSelbar(); CH.quote={text,docId:CH.active}; renderChat(); const i=$("#cwIn"); if(i) i.placeholder="Nhắn AI cần làm gì với đoạn đã trích…"; };
}

export function canvasSelect(){
  setTimeout(()=>{
    const sel=window.getSelection(); const t=sel&&String(sel).trim();
    if (!t || t.length<=3){ hideSelbar(); return; }
    const node=sel.anchorNode; const el=node&&(node.nodeType===3?node.parentElement:node);
    const blk=el&&el.closest&&el.closest("[data-bid]");
    const d=activeDoc();
    if (blk && d && d.kind==="doc" && !d.props.some(p=>p.type!=="insert"&&p.bid===blk.dataset.bid)){ showSelBar(blk.dataset.bid, t); return; }
    hideSelbar();
    CH.quote={text:t, docId:CH.active}; renderChat();
    const i=$("#cwIn"); if (i) i.placeholder="Nhắn AI cần làm gì với đoạn đã trích…";
  },10);
}

document.addEventListener("mousedown", e=>{ const b=$("#selbar"); if (b && !b.hidden && !b.contains(e.target)) hideSelbar(); });

/* ---------- Lịch sử chỉnh sửa: thời gian, người sửa, nội dung (AI tóm lược khi có) ---------- */
function histPopover(btn, d){
  $("#histmenu") && $("#histmenu").remove();
  const m=document.createElement("div"); m.id="histmenu"; m.className="bmenu"; m.style.cssText+="min-width:260px;max-width:340px;max-height:360px;overflow-y:auto;display:block;padding:2px 4px";
  m.innerHTML = d.history.slice().reverse().map(h=>`<div class="small" style="padding:7px 8px;border-top:1px solid var(--line)"><div class="row between" style="gap:10px"><b>${esc(h.by||"—")}</b><span class="xs muted" style="white-space:nowrap">${esc(h.at)}</span></div><div class="xs muted">${esc(h.note)}</div></div>`).join("");
  document.body.appendChild(m);
  const r=btn.getBoundingClientRect(); const w=Math.min(340,window.innerWidth-16);
  m.style.left=Math.max(8,Math.min(window.innerWidth-w-8,r.left))+"px";
  m.style.top=(r.bottom+6+Math.min(360,m.scrollHeight)>window.innerHeight? Math.max(8,r.top-Math.min(360,m.scrollHeight)-6) : r.bottom+6)+"px";
}
document.addEventListener("mousedown", e=>{ const m=$("#histmenu"); if (m && !m.contains(e.target) && !e.target.closest("#cvHist")) m.remove(); });

/* Cập nhật nút Save tại chỗ (không renderCanvas lại toàn bộ) để không làm mất focus khi đang gõ trực tiếp vào tài liệu. */
function syncSaveBtn(d){
  const b=$("#cvSave"); if (!b) return;
  b.className="btn sm "+(d.dirty?"primary":"ghost"); b.disabled=!d.dirty;
}

export function renderCanvasAll(){
  const head=$("#cvHead"), body=$("#cvBody"); if(!head) return; const d=activeDoc();
  head.innerHTML = CH.docs.length ? `<div class="cv-tabs">${CH.docs.map(x=>`<button data-cvt="${x.id}" aria-pressed="${x.id===CH.active}">${ico(KICON[x.kind])}<span>${esc(shorten(x.title,6))}</span></button>`).join("")}</div>
    ${d?`<div class="cv-meta"><div class="row between" style="flex-wrap:wrap;gap:6px"><div><b>${esc(d.title)}</b><span class="xs muted"> · ${KLABEL[d.kind]} · phiên bản ${d.versions.length+1} · ${d.changed?"vừa sửa lúc "+nowHM():"tạo lúc "+d.at}${d.kind==="exam"?` · mã đề ${101+d.code}${d.showAns?" · đang hiện đáp án":""}`:""}${d.dirty?' · <span style="color:var(--warn)">chưa lưu</span>':""}</span></div><div class="row" style="gap:6px;flex-wrap:wrap">${d.versions.length?`<select class="inp" id="cvVer" style="width:auto;padding:4px 8px" aria-label="Khôi phục phiên bản"><option value="">Khôi phục phiên bản (${d.versions.length})</option>${d.versions.slice().reverse().map(v=>`<option value="${v.id}">${v.at} · ${esc(v.note||"")}</option>`).join("")}</select>`:""}${d.history&&d.history.length?`<button class="btn sm ghost" id="cvHist" type="button">${ico("clock")}Lịch sử chỉnh sửa (${d.history.length})</button>`:""}<button class="btn sm ${d.dirty?"primary":"ghost"}" id="cvSave" type="button" ${d.dirty?"":"disabled"}>${ico("save")}Save</button></div></div></div>`:""}` : "";
  head.querySelectorAll("[data-cvt]").forEach(b=>b.onclick=()=>{ CH.active=b.dataset.cvt; renderCanvas(); renderChat(); });
  if ($("#cvVer")) $("#cvVer").onchange=e=>{ if(e.target.value){ restoreVersion(d, e.target.value); renderCanvas(); } };
  if ($("#cvHist")) $("#cvHist").onclick=e=>{ e.stopPropagation(); histPopover(e.currentTarget, d); };
  if ($("#cvSave")) $("#cvSave").onclick=()=>{ if (saveDoc(d)){ toast("Đã lưu — lịch sử chỉnh sửa đã được ghi lại."); renderCanvas(); } };
  if (!d){ body.innerHTML=`<div class="cv-empty">${ico("doc")}<b>Tài liệu AI soạn sẽ hiện ở đây</b><span class="small muted">Giáo án, phiếu học tập, slide, đề kiểm tra… Mọi chỉnh sửa đều nhắn trong khung chat, phần thay đổi được tô màu để dễ duyệt.</span></div>`; return; }
  if (d.writing){ body.innerHTML=`<div class="paperwrap"><article class="paper">${(d.content&&d.kind==="doc"?d.content.map(b=>blockHTML(b,false)).join(""):"")}<div class="skel" style="width:70%"></div><div class="skel"></div><div class="skel" style="width:85%"></div><div class="small muted" style="text-align:center;font-family:var(--f-body)">AI đang viết…</div></article></div>`; return; }
  const fresh = d.changed && Date.now()-d.changed < 120000 && d.prev;
  if (d.kind==="doc"){
    const pending=d.props.length>0;
    const rowHTML=b=>{
      const prop=d.props.find(p=>p.type!=="insert"&&p.bid===b.id);
      const insAfter=d.props.filter(p=>p.type==="insert"&&p.after===b.id).map(p=>`<div class="blk ins">${blockHTML(p.block,false)}</div>${propBar(p)}`).join("");
      if (prop) return `<div class="blk has-prop" data-bid="${b.id}">${blockHTML(b,false,prop)}</div>${propBar(prop)}${insAfter}`;
      const toolbar=(d.writing||["title","sub","meta","table"].includes(b.t))?"":`<div class="bt"><button data-bup="${b.id}" title="Chuyển lên" aria-label="Chuyển lên">${ico("up")}</button><button data-bdown="${b.id}" title="Chuyển xuống" aria-label="Chuyển xuống">${ico("down")}</button><button data-bai="${b.id}" title="AI viết lại đoạn này" aria-label="AI viết lại đoạn này">${ico("spark")}</button><button data-bdel="${b.id}" title="Xóa đoạn" aria-label="Xóa đoạn">${ico("x")}</button></div>`;
      const inner=fresh?blkDiffHTML(b,d.prev):blockHTML(b,b.t!=="table");
      return `<div class="blk" data-bid="${b.id}">${toolbar}${inner}</div>${insAfter}`;
    };
    const leadIns=d.props.filter(p=>p.type==="insert"&&!p.after).map(p=>`<div class="blk ins">${blockHTML(p.block,false)}</div>${propBar(p)}`).join("");
    body.innerHTML=`${pending?`<div class="banner warn" style="position:sticky;top:0;z-index:5">${ico("spark")}<div class="row between" style="flex:1;flex-wrap:wrap;gap:8px"><span><b>${d.props.length} đề xuất của AI</b> đang chờ duyệt. Chữ xanh là thêm, chữ gạch đỏ là bỏ.</span><span class="row" style="gap:6px"><button class="btn sm primary" id="pAll">Chấp nhận tất cả</button><button class="btn sm" id="pNone">Bỏ tất cả</button></span></div></div>`:fresh?`<div class="cv-legend"><span class="lg add">Thêm mới</span><span class="lg mod">Đã sửa</span><span class="xs muted">Nhắn “quay lại bản trước” để hoàn tác</span></div>`:""}
    <div class="paperwrap"><article class="paper editing" id="cvPaper">${leadIns}${d.content.map(rowHTML).join("")}</article></div>`;
    const paper=$("#cvPaper"); paper.addEventListener("mouseup",canvasSelect); paper.addEventListener("touchend",canvasSelect);
    paper.addEventListener("focusout",e=>{ const el=e.target.closest("[data-bid]"); if(!el) return; editBlockText(d, el.dataset.bid, el.textContent); syncSaveBtn(d); });
    if ($("#pAll")) $("#pAll").onclick=()=>{ applyAllProps(d); renderCanvas(); };
    if ($("#pNone")) $("#pNone").onclick=()=>{ discardAllProps(d); renderCanvas(); };
    body.querySelectorAll("[data-pok]").forEach(b=>b.onclick=()=>{ const p=d.props.find(x=>x.id===b.dataset.pok); if(p){ applyProp(d,p); renderCanvas(); } });
    body.querySelectorAll("[data-pno]").forEach(b=>b.onclick=()=>{ const p=d.props.find(x=>x.id===b.dataset.pno); if(p){ discardProp(d,p); renderCanvas(); } });
    body.querySelectorAll("[data-bup]").forEach(b=>b.onclick=()=>{ moveBlock(d,b.dataset.bup,-1); renderCanvas(); });
    body.querySelectorAll("[data-bdown]").forEach(b=>b.onclick=()=>{ moveBlock(d,b.dataset.bdown,1); renderCanvas(); });
    body.querySelectorAll("[data-bdel]").forEach(b=>b.onclick=()=>{ deleteBlock(d,b.dataset.bdel); renderCanvas(); });
    body.querySelectorAll("[data-bai]").forEach(b=>b.onclick=()=>{ const bl=d.content.find(x=>x.id===b.dataset.bai); if(bl) requestBlockRewrite(d.id, bl.id, bl.text, "rewrite"); });
    if (fresh && !pending && d._scrolled!==d.changed){ d._scrolled=d.changed; const f=paper.querySelector(".chg-add,.chg-mod"); if(f) setTimeout(()=>f.scrollIntoView({block:"center",behavior:"smooth"}),60); }
  } else if (d.kind==="slides"){
    const prevS=fresh?d.prev.map(x=>JSON.stringify(x)):null;
    if (fresh && d._scrolled!==d.changed){ d._scrolled=d.changed; setTimeout(()=>{ const f=body.querySelector(".cv-sl.chg"); if(f) f.scrollIntoView({block:"center",behavior:"smooth"}); },60); }
    body.innerHTML=`<div class="cv-slides">${d.content.map((s,i)=>`<div class="cv-sl ${prevS&&!prevS.includes(JSON.stringify(s))?"chg":""}">${slideFace(chatSlide(s),i,false,d.theme)}${s.note?`<div class="xs muted" style="padding:4px 2px">Ghi chú: ${esc(s.note)}</div>`:""}</div>`).join("")}</div>`;
  } else {
    
    body.innerHTML=`${fresh?`<div class="cv-legend"><span class="lg mod">Đề vừa được cập nhật</span><span class="xs muted">Nhắn “quay lại bản trước” để hoàn tác</span></div>`:""}<div class="paperwrap"><article class="paper ${fresh?"flashp":""}">${examPaper(d.content,d.code)}${d.showAns?`<hr style="margin:24px 0;border:0;border-top:1px dashed #999">${examKey(d.content,d.code)}`:""}</article></div>`;
  }
}
