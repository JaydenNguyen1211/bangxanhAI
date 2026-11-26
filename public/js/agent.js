/* Tản Đà AI · agent.js — mã nguồn, sửa trực tiếp */
import { aiLive, aiText, parseJSON } from "./ai.js";
import { hideSelbar, openCanvasMobile, renderAsst, renderCanvas, renderChat, speakReply } from "./assistant.js";
import { ACT_VI, KLABEL, PART_N, THEMES, TOPIC_KEY, blocksToProps, docHeadBlocks, examBlocks, exercisesFor, genQ, lessonOf, mdOut, mdParse, mockOutline, mockRewrite, mockSection, mockSlideOutline, mockSlides, mockStream } from "./content.js";
import { $, Honor, S, clone, honor, nowHM, shorten, sleep, slug, toast, uid } from "./core.js";
import { EDIT_SAMPLE, EN_BANK, EXAM_SAMPLE, KHBD_SAMPLE, NOTICE_SAMPLE, SCHOOL_RULES, SLIDES_SAMPLE, STAFF_LIST, STUDENTS, TT } from "./data.js";
import { exportPptx, makeDocx, readOffice, saveFile } from "./files.js";
import { decide, gate } from "./gateway.js";
import { curSecKind, inWorkOf, openWork } from "./teacher.js";

/* Kho tài liệu + cuộc trò chuyện (thread) */
export const CH = { msgs:[], docs:[], active:null, busy:false, quote:null, pending:null, thread:null, general:null, seeding:false, nextTheme:null, noWelcome:false };
export function newDoc(kind, title, content){
  const d={ id:"d"+(CH.docs.length+1)+uid().slice(0,3), kind, title, content, versions:[], prev:null, props:[], showAns:false, code:0, theme:"th-board", changed:null, at:nowHM(), updated:Date.now(), history:[], dirty:false, pendingNotes:[] };
  CH.docs.push(d); CH.active=d.id;
  if (!CH.thread) useThread(newThread(kind));
  d.thread=CH.thread.id;
  if (kind==="slides" && CH.nextTheme) d.theme=CH.nextTheme;
  if (!CH.seeding) markDirty(d, "Tạo tài liệu");
  if (!CH.seeding && S.user && S.user.role==="staff" && !inWorkOf(kind)) openWork(kind, d.id);
  return d;
}

/* ---------- Lịch sử chỉnh sửa: ai sửa, lúc nào, nội dung (AI tóm lược khi có) — tách khỏi "versions" (dùng để khôi phục).
   Mọi chỉnh sửa (preview hay AI chat) chỉ đánh dấu "chưa lưu" (dirty); chỉ khi bấm nút Save (saveDoc) mới thật sự ghi vào lịch sử. ---------- */
export function logHistory(d, note, by){
  d.history.push({ id:uid(), at:new Date().toLocaleString("vi-VN"), by: by || (S.user && S.user.name) || "", note: note || "Chỉnh sửa" });
}
export function markDirty(d, note){ d.dirty=true; if (note) d.pendingNotes.push(note); }
export function saveDoc(d){
  if (!d.dirty) return false;
  logHistory(d, d.pendingNotes.length ? d.pendingNotes.join("; ") : "Chỉnh sửa");
  d.dirty=false; d.pendingNotes=[];
  return true;
}
export function updDoc(d, content, note){
  d.versions.push({ id:uid(), content:clone(d.content), at:nowHM(), note:note||"Trước khi sửa" });
  d.prev=clone(d.content); d.content=content; d.changed=Date.now(); d.updated=Date.now(); CH.active=d.id;
  markDirty(d, note || "Cập nhật nội dung");
}

/* ---------- đề xuất sửa theo từng đoạn (patch): AI/mô phỏng chỉ đề xuất, giáo viên duyệt từng chỗ ---------- */
export function setProps(d, props, note){
  if (props.length){ d.versions.push({ id:uid(), content:clone(d.content), at:nowHM(), note:note||"Trước đề xuất AI" }); d.prev=clone(d.content); }
  d.props=props; d.changed=Date.now(); d.updated=Date.now(); CH.active=d.id;
}
export function applyProp(d, p){
  if (p.type==="replace"){ const b=d.content.find(x=>x.id===p.bid); if(b){ if(p.rows) b.rows=p.rows; else b.text=p.text; } }
  else if (p.type==="delete"){ d.content=d.content.filter(x=>x.id!==p.bid); }
  else if (p.type==="insert"){ const i=p.after?d.content.findIndex(x=>x.id===p.after):-1; d.content.splice(i+1,0,p.block);
    d.props.filter(q=>q!==p&&q.type==="insert"&&q.after===p.after).forEach(q=>q.after=p.block.id); }
  d.props=d.props.filter(x=>x!==p); d.updated=Date.now();
  markDirty(d, p.why || "Đã duyệt một đề xuất sửa của AI");
}
export function discardProp(d, p){ d.props=d.props.filter(x=>x!==p); }
export function applyAllProps(d){ [...d.props].forEach(p=>applyProp(d,p)); }
export function discardAllProps(d){ d.props=[]; }
export function moveBlock(d, bid, dir){
  const i=d.content.findIndex(x=>x.id===bid); if(i<0) return;
  const j=i+dir; if(j<0||j>=d.content.length) return;
  const fixed=b=>["title","sub","meta"].includes(b.t);
  if (fixed(d.content[i])||fixed(d.content[j])) return;
  d.versions.push({ id:uid(), content:clone(d.content), at:nowHM(), note:"Sửa tay" });
  [d.content[i],d.content[j]]=[d.content[j],d.content[i]]; d.updated=Date.now();
  markDirty(d, "Sửa tay: đổi vị trí một đoạn");
}
export function deleteBlock(d, bid){
  const i=d.content.findIndex(x=>x.id===bid); if(i<0) return;
  if (["title","sub","meta"].includes(d.content[i].t)) return;
  d.versions.push({ id:uid(), content:clone(d.content), at:nowHM(), note:"Sửa tay" });
  d.content.splice(i,1); d.updated=Date.now();
  markDirty(d, "Sửa tay: xóa một đoạn");
}
export function editBlockText(d, bid, text){
  const b=d.content.find(x=>x.id===bid); if(!b||b.text===text) return;
  d.versions.push({ id:uid(), content:clone(d.content), at:nowHM(), note:"Sửa tay" });
  b.text=text; d.updated=Date.now();
  markDirty(d, "Sửa tay: sửa trực tiếp nội dung một đoạn");
}
export function restoreVersion(d, vid){
  const idx=d.versions.findIndex(v=>v.id===vid); if(idx<0) return;
  const v=d.versions[idx];
  d.prev=clone(d.content); d.content=clone(v.content); d.versions.splice(idx);
  d.props=[]; d.changed=Date.now(); d.updated=Date.now(); CH.active=d.id;
  markDirty(d, "Khôi phục phiên bản lúc "+v.at);
}
export async function requestBlockRewrite(docId, bid, selText, act){
  const d=CH.docs.find(x=>x.id===docId); const b=d&&d.content.find(x=>x.id===bid); if(!d||!b) return;
  hideSelbar(); toast("AI đang viết lại…");
  let newText;
  try{
    newText=(await aiText(`Viết lại đúng một đoạn văn bản sau theo yêu cầu "${ACT_VI[act]||act}", giữ nguyên ý chính, không thêm lời dẫn hay giải thích, chỉ trả về đúng đoạn kết quả:\n"""${selText}"""`, { tier:"quick" })).trim().replace(/^"""|"""$/g,"").trim();
    if (!newText) throw new Error("empty");
  } catch { newText=mockRewrite(selText, act); }
  const replaced = selText.trim()===b.text.trim() ? newText : b.text.replace(selText, newText);
  setProps(d, [{ id:uid(), type:"replace", bid, text:replaced, why:"Theo yêu cầu: "+(ACT_VI[act]||act) }], "Viết lại đoạn đã chọn");
  renderCanvas();
}
export function docTextForAI(d){
  if (d.kind!=="doc") return docText(d);
  return d.content.map(b=> b.t==="table" ? `[${b.id}] (bảng dữ liệu)` : `[${b.id}] ${({title:"#",sub:"_",h2:"##",h3:"###",li:"-"}[b.t]||"")} ${b.text}`).join("\n");
}

/* ---------- AI thật: Claude điều khiển tài liệu bằng ACTIONS ---------- */
export function agentSystemPrompt(quote){
  const d=activeDoc();
  return `Bạn là trợ lý (agent) hỗ trợ giáo viên của Trường THPT Tản Đà, làm việc với ${S.user.name} (${S.user.meta}). Ngữ cảnh: ${teachCtx()}
Người dùng làm MỌI việc qua chat: soạn mới, sửa, xuất file, khôi phục, chuyển đổi (giáo án → slide → đề), việc nhiều bước. Bạn thao tác tài liệu bằng ACTIONS.
Quy tắc: tiếng Việt thân thiện, ngắn gọn; gọi người dùng là "${honor()}". Thiếu thông tin quan trọng thì hỏi lại MỘT câu và đưa action suggest. Kiến thức chính xác theo CT GDPT 2018; giáo án theo Phụ lục IV Công văn 5512 (I. Mục tiêu; II. Thiết bị dạy học và học liệu; III. Tiến trình dạy học với 4 hoạt động Mở đầu, Hình thành kiến thức, Luyện tập, Vận dụng, mỗi hoạt động có a) Mục tiêu b) Nội dung c) Sản phẩm d) Tổ chức thực hiện); văn bản hành chính theo Nghị định 30/2020; đề theo định dạng mới (nhiều lựa chọn, đúng/sai 4 ý, trả lời ngắn, tự luận). Kí hiệu toán Unicode, không LaTeX. Không tự giao bài hay gửi tin cho học sinh/phụ huynh: chỉ đề xuất và chờ đồng ý. Khi sửa, chỉ thay phần được yêu cầu, giữ nguyên phần còn lại. Với tài liệu loại "doc", khi CHỈNH SỬA (không phải tạo mới), ƯU TIÊN dùng action "patch" (đề xuất thay đổi tối thiểu theo từng đoạn, để giáo viên duyệt từng chỗ) thay vì "update" (viết lại toàn bộ); chỉ dùng "update" khi phải tái cấu trúc lớn cả tài liệu.
PHẠM VI: bạn chỉ phục vụ công việc giáo dục của trường (dạy học, soạn/sửa tài liệu-slide-đề, quản lý lớp, lịch dạy, thông tin học sinh mình phụ trách, hành chính trường học, quy định của trường). Nếu người dùng hỏi điều không liên quan (chuyện cá nhân, giải trí, mua sắm, đầu tư, tin tức ngoài trường, việc riêng…), hãy từ chối ngắn gọn, nhắc đây là trợ lý chỉ phục vụ công tác giáo dục, rồi trả về action suggest gợi ý quay lại việc chuyên môn; KHÔNG trả lời nội dung ngoài phạm vi đó dù người dùng có nài nỉ.
ĐỊNH DẠNG TRẢ LỜI: trước hết là lời nhắn cho người dùng (1–4 câu, có thể gạch đầu dòng, nói rõ đã làm gì). Khi action là "create" cho "slides" (hoặc "exam" nhiều câu), TRƯỚC KHI đưa ACTIONS hãy liệt kê dàn ý từng mục dạng đánh số, mỗi mục một dòng, ví dụ "1. Mở đầu", "2. Kiến thức trọng tâm"… để giáo viên thấy dàn ý ngay trong lúc bạn đang soạn. Sau đó MỘT dòng chỉ gồm <<<ACTIONS>>> rồi một mảng JSON hợp lệ (có thể là []).
Các action:
{"type":"create","kind":"doc","title":string,"content":string (markdown: "# Tiêu đề", "_phụ đề_", "## Mục", "### Mục nhỏ", "- gạch đầu dòng", "| ô | ô |" cho bảng)}
{"type":"create","kind":"slides","title":string,"content":[{"title":string,"bullets":[string ≤12 từ, tối đa 4],"note":string,"layout":"title"(chỉ slide đầu),"quiz":{"q":string,"opts":[4 string],"ans":0-3}(chỉ slide câu hỏi)}]}
{"type":"create","kind":"exam","title":string,"content":{"cfg":{"kind":string,"subj":string,"grade":string,"time":string,"headerExtra":[string] (mặc định []; khung đề (trường/tổ/môn/giờ/mã đề) CỐ ĐỊNH không sửa được — đây là nơi DUY NHẤT để thêm bất kỳ dòng phụ nào vào góc đề theo yêu cầu của giáo viên hoặc một kỹ năng riêng, VD tên người ra đề, năm học, lớp cụ thể…; mỗi yêu cầu một dòng, chỉ thêm khi được yêu cầu)},"mcq":[{"q":string,"opts":[4],"ans":0-3,"level":"Biết|Hiểu|Vận dụng"}],"tf":[{"stem":string,"items":[{"s":string,"ans":bool}×4]}],"short":[{"q":string,"ans":string}],"essay":[{"q":string,"points":number,"guide":string}]}}
{"type":"update","id":string,"content":<TOÀN BỘ nội dung mới, cùng định dạng với loại tài liệu>,"summary":string}
{"type":"patch","id":string,"props":[{"type":"replace","bid":string,"text":string,"why":string}|{"type":"delete","bid":string,"why":string}|{"type":"insert","after":string|null,"block":{"t":"h2"|"h3"|"p"|"li","text":string},"why":string}],"summary":string} (chỉ cho tài liệu "doc"; bid/after là mã [id] của đoạn, lấy đúng từ nội dung hiện tại được liệt kê dưới đây; after=null nghĩa là chèn lên đầu)
{"type":"view","id":string,"showAnswers":boolean,"code":0-3} · {"type":"export","id":string} · {"type":"restore","id":string} · {"type":"open","id":string}
{"type":"leave","reason":string,"time":string} (khi giáo viên xin nghỉ dạy/nhờ dạy thay: rút lý do và thời gian ngắn gọn từ yêu cầu, tạo một đơn ở mục "Xin nghỉ & dạy thay"; không tự quyết định ai dạy thay hay trạng thái duyệt)
{"type":"sendDoc","id":string,"to":string} (khi giáo viên nhờ gửi một tài liệu/slide/đề đã có cho MỘT đồng nghiệp cụ thể trong trường, ví dụ "gửi cái này cho cô Hạnh": "id" là mã tài liệu cần gửi (mặc định tài liệu đang mở nếu người dùng nói "tài liệu này"/"cái này"), "to" là tên đồng nghiệp. Gửi ngay khi đã rõ tài liệu và người nhận, không cần hỏi lại xác nhận thêm; nếu thiếu một trong hai, hỏi lại MỘT câu trước.)
{"type":"suggest","options":[2–3 câu trả lời nhanh, ngắn]}
Tài liệu trong cuộc trò chuyện này: ${CH.docs.filter(x=>!CH.thread||x.thread===CH.thread.id).map(x=>`${x.id} (${KLABEL[x.kind]}) “${x.title}”`).join("; ")||"chưa có"}.
${d?`Tài liệu đang mở: ${d.id} (${KLABEL[d.kind]}). Nội dung hiện tại${d.kind==="doc"?" (mỗi dòng có mã [id] của đoạn ở đầu, dùng đúng mã này cho bid/after khi trả action patch)":""}:\n${docTextForAI(d).slice(0,24000)}`:""}
${quote?`Người dùng đang trích đoạn trong ${quote.docId}: "${quote.text}". Yêu cầu chủ yếu áp dụng cho đoạn này.`:""}
${matchingSkills(d).length?`\nKỸ NĂNG RIÊNG do giáo viên đã dạy thêm cho bạn, luôn áp dụng khi phù hợp:\n${matchingSkills(d).map(s=>"- "+s).join("\n")}`:""}
${schoolKB()}`;
}
export function matchingSkills(d){
  // Chưa có tài liệu đang mở (VD: đang soạn tài liệu/đề/slide MỚI, chưa tạo) → đoán loại theo khu đang đứng,
  // để kỹ năng theo phạm vi (VD: "Khi ra đề") vẫn áp dụng ngay từ lượt tạo đầu tiên, không chỉ lúc sửa sau đó.
  const kind = d ? d.kind : curSecKind();
  return S.skills.filter(sk => sk.scope==="all" || sk.scope===kind).map(sk => sk.text);
}

/* Tách phần "suy nghĩ mở rộng" (<<<THINKING>>>...<<<ENDTHINKING>>>, xem server.js) khỏi câu trả lời chính. */
export function splitThinking(t){
  const ts=t.indexOf("<<<THINKING>>>");
  if (ts<0) return { thinking:"", done:true, body:t };
  const te=t.indexOf("<<<ENDTHINKING>>>");
  if (te<0) return { thinking:t.slice(ts+14), done:false, body:"" };
  return { thinking:t.slice(ts+14,te), done:true, body:t.slice(te+18) };
}

export async function liveTurn(text, quote, m){
  const messages=[];
  CH.msgs.slice(0,-2).filter(x=>x.t&&!x.typing).slice(-12).forEach(x=>messages.push({ role:x.r==="me"?"user":"assistant", content:x.t }));
  messages.push({ role:"user", content:text });
  let marker=false;
  const full=await aiText({ system:agentSystemPrompt(quote), messages }, { tier:"agent", onText:t=>{
    const { thinking, done, body }=splitThinking(t); m.thinking=thinking; m.thinkingDone=done;
    const i=body.indexOf("<<<ACTIONS>>>"); m.t=(i<0?body:body.slice(0,i)).trim();
    if (i>=0 && !marker){ marker=true; const seg=body.slice(i); const dd=activeDoc(); const km=seg.match(/"type"\s*:\s*"(create|update|patch)"/);
      if (dd && km) { dd.writing=true; renderCanvas(); }
      m.working = km ? (km[1]==="create"?"Đang soạn tài liệu…":km[1]==="update"?"Đang cập nhật tài liệu…":"Đang chuẩn bị đề xuất sửa…") : "Đang xử lý…"; }
    renderChat(); } });
  const { thinking, done, body }=splitThinking(full); m.thinking=thinking; m.thinkingDone=done;
  const i=body.indexOf("<<<ACTIONS>>>"); m.t=(i<0?body:body.slice(0,i)).trim();
  let actions=[];
  if (i>=0){ try { actions=parseJSON(body.slice(i+13)); } catch { actions=[]; } }
  CH.docs.forEach(x=>x.writing=false);
  await applyActions(Array.isArray(actions)?actions:[actions], m);
}

/* ---------- xuất file ---------- */
export async function exportDocById(id){
  const d=CH.docs.find(x=>x.id===id); if(!d) return;
  if (d.kind==="doc"){ const out=[]; d.content.forEach(b=>{ if(b.t==="title") out.push({t:"h1",text:b.text.toUpperCase()}); else if(b.t==="sub") out.push({t:"center",text:b.text,i:1}); else if(b.t==="h2") out.push({t:"h2",text:b.text}); else if(b.t==="h3") out.push({t:"h3",text:b.text}); else if(b.t==="li") out.push({t:"li",text:b.text}); else if(b.t==="table") out.push({t:"table",rows:b.rows}); else out.push({t:"p",text:b.text}); });
    return saveFile(fileName(d), makeDocx([{t:"center",text:"TRƯỜNG THPT TẢN ĐÀ",b:1},...out])); }
  if (d.kind==="exam") return saveFile(fileName(d), makeDocx(examBlocks(d.content,d.code)));
  return exportPptx(d.content, d.theme, d.title);
}

export const THREADS = [];
CH.thread = null;

export function newThread(kind){ const t={id:"t"+(THREADS.length+1)+Date.now()%1000, kind, msgs:[]}; THREADS.push(t); return t; }

export function useThread(t){ CH.thread=t; CH.msgs=t.msgs; CH.pending=null; CH.quote=null; }

export function oldToBlocks(d){ const out=[{id:uid(),t:"title",text:d.title},...(d.subtitle?[{id:uid(),t:"sub",text:d.subtitle}]:[])];
  (d.sections||[]).forEach(s=>{ if(s.h) out.push({id:uid(),t:"h2",text:s.h}); (s.blocks||[]).forEach(b=>{ if(b.h3) out.push({id:uid(),t:"h3",text:b.h3}); else if(b.p) out.push({id:uid(),t:"p",text:b.p}); else if(b.li) b.li.forEach(x=>out.push({id:uid(),t:"li",text:x})); else if(b.table) out.push({id:uid(),t:"table",rows:[b.table.head,...b.table.rows]}); }); });
  (d.recv||[]).length&&out.push({id:uid(),t:"p",text:"Nơi nhận: "+d.recv.join(" ")}); d.signer&&out.push({id:uid(),t:"p",text:d.signer.replace(/\n+/g," · ")}); return out; }

export function seedDocs(){
  if (CH.seeded===S.user.code) return; CH.seeded=S.user.code; CH.seeding=true; CH.docs=[]; THREADS.length=0;
  const mk=(kind,title,content,prompt,reply,ago,extra)=>{ const t=newThread(kind); useThread(t); t.msgs.push({r:"me",t:prompt}); const d=newDoc(kind,title,content); Object.assign(d,{thread:t.id, updated:Date.now()-ago*3600e3, at:"", ...(extra||{})}); t.msgs.push({r:"ai",t:reply,cards:[d.id]}); return d; };
  const B1={type:"Kế hoạch bài dạy (Công văn 5512)",subj:"Toán",grade:"10",time:"1 tiết (45 phút)",prompt:"Dấu của tam thức bậc hai"};
  mk("doc","Dấu của tam thức bậc hai (Toán 10)",oldToBlocks(KHBD_SAMPLE),"Soạn giáo án Toán 10 bài Dấu của tam thức bậc hai, có hoạt động nhóm quan sát parabol trên GeoGebra","Đã soạn giáo án theo Phụ lục IV Công văn 5512, có hoạt động nhóm quan sát parabol trên GeoGebra ở Hoạt động 2.",50,{brief:B1});
  mk("doc","Phiếu học tập – Dấu của tam thức bậc hai",EDIT_SAMPLE.paras.map((p,i)=>({id:uid(),t:i===0?"title":"p",text:p.replace(/\bcủ\b/,"cũ").replace("phúc","phút")})),"Soạn phiếu học tập dấu của tam thức bậc hai cho lớp 10A1, 15 phút","Đã soạn phiếu 2 bài và 1 câu hỏi mở rộng.",75,{brief:{...B1,type:"Phiếu học tập",prompt:"Dấu của tam thức bậc hai"}});
  mk("doc","Thông báo họp phụ huynh cuối học kỳ I",oldToBlocks(NOTICE_SAMPLE),"Soạn thông báo họp phụ huynh cuối học kỳ I, Chủ nhật 10/01/2027","Đã soạn thông báo đúng thể thức Nghị định 30/2020.",120,{brief:{...B1,type:"Thông báo",prompt:"Họp phụ huynh cuối học kỳ I"}});
  mk("slides","Dấu của tam thức bậc hai – Toán 10",SLIDES_SAMPLE.map(s=>({title:s.title,bullets:s.bullets,note:s.note,...(s.kind==="title"?{layout:"title"}:{})})),"Làm slide bài Dấu của tam thức bậc hai, 6 slide","Đã dựng 6 slide theo mẫu Bảng xanh.",48);
  mk("slides","Họp phụ huynh lớp 10A1 – học kỳ I",[{layout:"title",title:"Họp phụ huynh lớp 10A1",bullets:["Học kỳ I · Năm học 2026–2027","GVCN: Thầy Lê Văn Nam"]},{title:"Kết quả học tập",bullets:["Điểm TB môn Toán: 6,9","13% học sinh dưới 5","5 học sinh tiến bộ rõ"]},{title:"Nề nếp và chuyên cần",bullets:["Chuyên cần 97%","2 học sinh nghỉ nhiều cần phối hợp"]},{title:"Kế hoạch học kỳ II",bullets:["Phụ đạo chiều thứ Năm","Định hướng nghề nghiệp, chọn tổ hợp xét tuyển"]}],"Làm slide họp phụ huynh lớp 10A1 cuối học kỳ I","Đã dựng 4 slide theo mẫu Nắng vàng.",100,{theme:"th-sun"});
  mk("exam","Kiểm tra giữa học kỳ I – Toán 10",{cfg:{kind:"Kiểm tra giữa học kỳ I",subj:"Toán",grade:"10",time:"45"},...clone(EXAM_SAMPLE)},"Ra đề giữa kỳ I Toán 10, định dạng mới, 4 phần","Đã ra đề 9 câu theo định dạng mới, có đáp án và hướng dẫn chấm.",30);
  const ex15={cfg:{kind:"Kiểm tra 15 phút",subj:"Toán",grade:"10",time:"15"},mcq:[0,1,2,3].map(i=>genQ(i%2?"pt":"hdt","mcq",["Biết","Biết","Hiểu","Vận dụng"][i],1000+i*77)),tf:[genQ("hdt","tf","Hiểu",4242)],short:[genQ("pt","short","Hiểu",777)],essay:[]};
  mk("exam","Kiểm tra 15 phút – Dấu của tam thức bậc hai",ex15,"Ra đề 15 phút Toán 10 về dấu của tam thức bậc hai","Đã ra đề 6 câu, đáp án kiểm tra tự động.",80);
  CH.thread=null; CH.msgs=[]; CH.active=null; CH.seeding=false;
}

export const agoText = ms => { const h=Math.round((Date.now()-ms)/3600e3); return h<1?"vừa xong":h<24?h+" giờ trước":Math.round(h/24)+" ngày trước"; };

export function kindFromText(t){ return /slide|trình chiếu/i.test(t)?"slides":/(ra|tạo|soạn|làm)\s+(một\s+|1\s+)?đề|^đề\s/i.test(t)?"exam":"doc"; }

export const activeDoc = () => CH.docs.find(d=>d.id===CH.active);

export const docText = d => d.kind==="doc" ? mdOut(d.content) : JSON.stringify(d.content);

export function teachCtx(){ const T=TT[S.user.code]||TT["GV-0108"]; return `GV ${T.subj}, chủ nhiệm ${T.hr}. Các lớp: ${T.classes.map(c=>c[0]).join(", ")}. Bài đang dạy: ${[...new Set(T.items.filter(x=>x[5]).map(x=>x[5]+" ("+x[2]+")"))].slice(0,5).join("; ")}. Điểm yếu lớp 10A1: xét dấu tam thức bậc hai khi hệ số a âm và bài toán tìm tham số m.`; }

/* ---------- dữ liệu nội bộ trường: đồng nghiệp, học sinh, quy định ---------- */
export function matchStaff(t){ const low=t.toLowerCase(); return STAFF_LIST.find(s=>s.alias.some(a=>low.includes(a))); }
export function studentClass(stu){ return Object.keys(STUDENTS).find(c=>STUDENTS[c].includes(stu)); }
export function matchStudent(t){
  const m=t.match(/em\s+([A-ZĐÀ-Ỹ][\p{L}]*(\s+[A-ZĐÀ-Ỹ][\p{L}]*){0,3})/u);
  const all=[].concat(...Object.values(STUDENTS));
  if (m){ const low=m[1].trim().toLowerCase();
    const hit=all.find(s=>s.name.toLowerCase()===low) || all.find(s=>s.name.toLowerCase().includes(low)) || all.find(s=>low.includes(s.name.split(" ").pop().toLowerCase()));
    if (hit) return hit;
  }
  return all.find(s=>t.includes(s.name))||null;
}
export function matchRule(t){
  if (/\bai\b|trí tuệ nhân tạo|dùng ai|công cụ ai|dùng trợ lý/i.test(t)) return SCHOOL_RULES.find(r=>r.key==="dung-ai");
  return SCHOOL_RULES.find(r=>r.m.test(t));
}

export function schoolKB(){
  const T=TT[S.user.code]||TT["GV-0108"];
  const staff=STAFF_LIST.map(s=>`${s.name} — ${s.subj}${s.hr?`, chủ nhiệm ${s.hr}`:""}, ${s.to}${s.pos?` (${s.pos})`:""}${TT[s.code]?`; dạy các lớp ${TT[s.code].classes.map(c=>c[0]).join(", ")}`:s.days?`; ${s.days}`:""}`).join("\n- ");
  const students=T.classes.flatMap(c=>(STUDENTS[c[0]]||[]).map(s=>`${s.name} (lớp ${c[0]}, mã ${s.id}): điểm TB ${T.subj} ${s.avg}, SĐT liên hệ ${s.phone} (${s.parent}). ${s.note}`)).join("\n- ");
  const rules=SCHOOL_RULES.map(r=>`${r.title}: ${r.body}`).join("\n- ");
  return `\nTHÔNG TIN NỘI BỘ TRƯỜNG (trả lời tự nhiên như đã biết sẵn, không cần nói "theo dữ liệu tôi có"):
Đội ngũ giáo viên:\n- ${staff}
Học sinh các lớp ${S.user.name} phụ trách (chỉ trả lời thông tin của các em này):\n- ${students||"(chưa có dữ liệu)"}
Quy định của trường:\n- ${rules}`;
}

export function scheduleLessons(){ const T=TT[S.user.code]||TT["GV-0108"]; const seen=new Set(), out=[]; T.items.forEach(x=>{ if(x[3]===T.subj&&x[5]&&!seen.has(x[5])){ seen.add(x[5]); out.push(`${x[5]} – lớp ${x[2]}`); } }); return out.slice(0,3); }

export async function chatSend(text, opt={}){
  if (CH.busy){ toast("AI đang trả lời, chờ một chút nhé."); return; }
  const quote=CH.quote; CH.quote=null; const ip=$("#cwIn"); if(ip) ip.placeholder="Nhắn cho AI: soạn, sửa, xuất file…";
  CH.msgs.push({r:"me", t:text, quote:quote&&quote.text, file:opt.file});
  if (S.view!=="ai") { renderAsst(); } renderChat();
  const box=$("#cwGate")||$("#asGate"); if (box) box.innerHTML="";
  const proceed=()=>runTurn(text, quote);
  if (box && !gate(text, box, proceed)) return;
  return proceed();
}

export async function runTurn(text, quote){
  CH.busy=true; const m={r:"ai",t:"",typing:true}; CH.msgs.push(m); renderChat();
  try{
    let done=false;
    if (aiLive()){ try{ await liveTurn(text, quote, m); done=true; }catch(e){ if(e&&e.code&&!["mock","not_granted","sampling_disabled","invalid_json"].includes(e.code)){ m.t="Xin lỗi, kết nối AI đang gián đoạn. Tôi xử lý bằng chế độ mô phỏng."; } } }
    if (!done) await mockTurn(text, quote, m);
  }catch(e){ console.error(e); m.t=(m.t?m.t+"\n":"")+"Có lỗi khi xử lý yêu cầu này. Thử nói lại theo cách khác nhé."; }
  m.typing=false; CH.busy=false; renderChat(); renderCanvas(); speakReply(m.t);
}

export async function say2(m, text){ m.typing=true; await mockStream(text, t=>{ m.t=t; renderChat(); }, 900); m.typing=false; renderChat(); speakReply(m.t); }

export function newMsg(){ const m={r:"ai",t:"",typing:true}; CH.msgs.push(m); renderChat(); return m; }

export async function revealDoc(d, full){
  if (d.kind!=="doc"){ d.writing=false; renderCanvas(); return; }
  d.content=[]; d.writing=true; renderCanvas();
  for (let i=0;i<full.length;i++){ d.content.push(full[i]); if(i%2===0){ renderCanvas(); await sleep(70); } }
  d.writing=false; renderCanvas();
}

/* ---------- Xin nghỉ & dạy thay: tạo đơn (trạng thái random, chủ yếu chờ duyệt) ---------- */
export const LEAVE_REJECT_REASONS = [
  "Trùng lịch kiểm tra giữa kỳ của lớp, cần giáo viên đứng lớp.",
  "Tổ chưa sắp xếp được người dạy thay phù hợp vào thời điểm này.",
  "Đơn gửi quá gấp, cần báo trước ít nhất 2 ngày theo quy định của trường."
];
export function randomLeaveStatus(){
  const r = Math.random();
  if (r < 0.7) return { state:"pending" };
  if (r < 0.85) return { state:"approved" };
  return { state:"rejected", rejectReason: LEAVE_REJECT_REASONS[Math.floor(Math.random()*LEAVE_REJECT_REASONS.length)] };
}
export function createLeave(reason, time){
  const lv = { id:uid(), reason: reason||"", time: time||"Chưa rõ", createdAt: new Date().toLocaleString("vi-VN"), ...randomLeaveStatus() };
  S.leaves.unshift(lv);
  return lv;
}

/* ---------- Gửi tài liệu cho đồng nghiệp: lưu ở máy chủ để tài khoản kia thấy được (xem /api/senddoc) ---------- */
export async function sendDocTo(d, staff){
  saveDoc(d);
  try{
    const r = await fetch("/api/senddoc", { method:"POST", headers:{"content-type":"application/json"},
      body: JSON.stringify({ kind:d.kind, title:d.title, content:d.content, theme:d.theme, history:d.history, fromCode:S.user.code, fromName:S.user.name, toCode:staff.code }) });
    return r.ok;
  } catch { return false; }
}

export async function applyActions(actions, m){
  for (const a of (Array.isArray(actions)?actions:[])){
    if (a.type==="create"&&a.kind){ const content=a.kind==="doc"?mdParse(a.content):a.content; if(!content) continue; const d=newDoc(a.kind,a.title||KLABEL[a.kind],a.kind==="doc"?[]:content); m.cards=[...(m.cards||[]),d.id]; openCanvasMobile(); await revealDoc(d, a.kind==="doc"?content:null); if(a.kind!=="doc") renderCanvas(); }
    else if (a.type==="update"){ const d=CH.docs.find(x=>x.id===a.id)||activeDoc(); if(!d||!a.content) continue; updDoc(d, d.kind==="doc"?mdParse(a.content):a.content, a.summary); m.cards=[...(m.cards||[]),d.id]; openCanvasMobile(); renderCanvas(); }
    else if (a.type==="patch"){ const d=CH.docs.find(x=>x.id===a.id)||activeDoc(); if(!d||!Array.isArray(a.props)) continue;
      const validIds=new Set(d.content.map(x=>x.id));
      const props=a.props.map(p=>{ const q={id:uid(), type:p.type, why:p.why};
        if (p.type==="replace"){ q.bid=p.bid; q.text=p.text; }
        else if (p.type==="delete"){ q.bid=p.bid; }
        else if (p.type==="insert"){ q.after=validIds.has(p.after)?p.after:null; q.block={id:uid(), t:(p.block&&p.block.t)||"p", text:(p.block&&p.block.text)||""}; }
        return q;
      }).filter(p=>p.type==="insert"?true:validIds.has(p.bid));
      if (!props.length) continue;
      setProps(d, props, a.summary); m.cards=[...(m.cards||[]),d.id]; openCanvasMobile(); renderCanvas();
    }
    else if (a.type==="view"){ const d=CH.docs.find(x=>x.id===a.id)||activeDoc(); if(!d) continue; if(a.showAnswers!=null) d.showAns=!!a.showAnswers; if(a.code!=null) d.code=Math.max(0,Math.min(3,+a.code)); CH.active=d.id; renderCanvas(); }
    else if (a.type==="export"){ const d=CH.docs.find(x=>x.id===a.id)||activeDoc(); if(d) m.file={id:d.id,name:fileName(d)}; }
    else if (a.type==="restore"){ const d=CH.docs.find(x=>x.id===a.id)||activeDoc(); if(d&&d.versions.length){ const v=d.versions.pop(); d.prev=clone(d.content); d.content=v.content; d.changed=Date.now(); markDirty(d,"Khôi phục bản trước (theo yêu cầu trong chat)"); renderCanvas(); } }
    else if (a.type==="open"){ if(CH.docs.some(x=>x.id===a.id)){ CH.active=a.id; renderCanvas(); } }
    else if (a.type==="suggest"&&Array.isArray(a.options)) m.chips=a.options.slice(0,3);
    else if (a.type==="leave"){ createLeave(a.reason, a.time); toast("Đã tạo đơn xin nghỉ — xem ở mục Xin nghỉ & dạy thay."); }
    else if (a.type==="sendDoc"){
      const d=CH.docs.find(x=>x.id===a.id)||activeDoc(); const staff=matchStaff(a.to||"");
      if (!d || !staff || !staff.code) toast("Không xác định được tài liệu hoặc người nhận để gửi.");
      else if (staff.code===S.user.code) toast("Đây là tài khoản của chính thầy/cô.");
      else { const ok=await sendDocTo(d, staff); toast(ok?`Đã gửi “${d.title}” cho ${staff.name}.`:"Không gửi được tài liệu, thử lại sau."); }
    }
  }
  renderChat();
}

export function fileName(d){ return slug(d.title)+(d.kind==="slides"?".pptx":".docx"); }

export async function chatFile(f){
  if (CH.busy) return; let lines;
  try{ lines=await readOffice(f); }catch(e){ toast(e.message); return; }
  CH.msgs.push({r:"me",t:"",file:f.name}); renderChat();
  const isP=/\.pptx$/i.test(f.name); let d;
  if (isP){ const sl=[]; lines.forEach(l=>{ if(/^\[Slide \d+\]$/.test(l)) sl.push({title:"",bullets:[],note:""}); else if(sl.length){ const c=sl[sl.length-1]; if(!c.title) c.title=l; else c.bullets.push(l); } }); d=newDoc("slides",f.name.replace(/\.\w+$/,""),sl.length?sl:[{title:f.name,bullets:[]}]); }
  else { const bl=lines.map((p,i)=>({id:uid(),t:i===0?"title":/^[-–•]/.test(p)?"li":/^[A-ZĐÀ-Ỹ0-9 ,.–:-]{8,}$/.test(p)&&p.length<90?"h2":"p",text:p.replace(/^[-–•]\s*/,"")})); d=newDoc("doc",f.name.replace(/\.\w+$/,""),bl); }
  CH.busy=true; const m=newMsg(); m.cards=[d.id]; renderCanvas(); openCanvasMobile();
  await say2(m, `Tôi đã đọc “${f.name}” (${isP?d.content.length+" slide":lines.length+" đoạn"}) và mở ở khung bên phải. ${honor()[0].toUpperCase()+honor().slice(1)} muốn tôi làm gì với file này?`);
  m.chips=isP?["Rút mỗi slide còn tối đa 3 ý","Thêm slide câu hỏi trắc nghiệm","Xuất PowerPoint"]:["Rà soát lỗi và cập nhật theo CT 2018","Thêm 1 bài vận dụng thực tế","Làm slide từ file này"];
  CH.busy=false; renderChat();
}

export const YES_RE=/^(ok|oke|được|đồng ý|bắt đầu|làm đi|duyệt|có|ừ|chuẩn|tiến hành|đúng rồi)/i;

export function parseBrief(t){
  const B={type:/phiếu/i.test(t)?"Phiếu học tập":/đề cương/i.test(t)?"Đề cương ôn tập":/thông báo|giấy mời/i.test(t)?"Thông báo":/biên bản/i.test(t)?"Biên bản họp":"Kế hoạch bài dạy (Công văn 5512)", subj:(TT[S.user.code]||TT["GV-0108"]).subj, grade:"10", time:/90|2 tiết/i.test(t)?"2 tiết (90 phút)":"1 tiết (45 phút)"};
  const sj=["Tiếng Anh","Tin học","Ngữ văn","Trí tuệ nhân tạo","Toán"].find(s=>new RegExp(s,"i").test(t)); if(sj) B.subj=sj;
  const g=t.match(/(?:lớp|toán|anh|tin|văn)\s*(\d{1,2})/i)||t.match(/\b(\d{1,2})[A-Z]\d?\b/); if(g) B.grade=g[1];
  let L=t.replace(/^(soạn|viết|tạo|lập|làm)\s+/i,"").replace(/(giáo án|kế hoạch bài dạy|phiếu học tập|phiếu bài tập|phiếu|đề cương ôn tập|đề cương|thông báo|biên bản|công văn)\s*/i,"")
    .replace(/\b(môn\s+)?(Toán|Tiếng Anh|Tin học|Ngữ văn|Trí tuệ nhân tạo)\s*\d*\b/i,"").replace(/\bcho\s+(lớp\s+)?\d{1,2}[A-Z]?\d?\b/i,"").replace(/\blớp\s+\d{1,2}[A-Z]?\d?\b/i,"").replace(/\s+–\s+lớp.*$/i,"").replace(/^(bài|về|tiết)\s*:?\s*/i,"").replace(/^\d+[.:]\s*/,"").replace(/[\s–-]+$/,"").replace(/\s{2,}/g," ").trim();
  L=L.replace(/,\s*(\d\s*tiết.*|lớp (khá giỏi|cần củng cố|đại trà).*|viết .*|đối tượng.*)$/i,"").trim(); L=L.replace(/^\s*(bài|về|tiết)\s*:?\s*/i,"").replace(/^\d+[.:]\s*/,"").trim(); B.prompt=L+(/cần củng cố/i.test(t)?". Lớp cần củng cố, có phân hóa.":"")+(/trò chơi/i.test(t)&&!/trò chơi/i.test(L)?". Có trò chơi khởi động.":""); return B;
}

export async function mockCreateSlides(t, m){
  const src=[...CH.docs].reverse().find(x=>x.kind==="doc"); const fromDoc=src&&/(này|giáo án|tài liệu|file|từ)/i.test(t);
  const n=+(t.match(/(\d{1,2})\s*(trang|slide)/i)||[])[1]||8;
  const B={topic: fromDoc ? (src.brief?`${src.brief.subj} ${src.brief.grade}: ${src.brief.prompt}`:src.title) : t.replace(/^(làm|tạo|dựng|chuyển)\s+(bộ\s+)?(slide|trình chiếu)\s*(bài giảng)?\s*(về|cho)?\s*/i,"")||"Bài giảng", n, theme:"th-board", fromDoc:false, prompt:t};
  let outline;
  if (fromDoc){ const hs=src.content.filter(b=>(b.t==="h2"||b.t==="h3")&&/hoạt động|luyện tập|vận dụng|mở đầu|hình thành|phân hóa|câu hỏi/i.test(b.text)).map(b=>b.text.replace(/\s*\(\d+ phút\)/,"").replace(/^Hoạt động \d+:\s*/,""));
    const base=["Kiến thức trọng tâm","Ví dụ minh họa","Sai lầm thường gặp","Câu hỏi trắc nghiệm nhanh"]; const mid=[...hs,...base.filter(x=>!hs.some(h=>h.toLowerCase().includes(x.split(" ")[0].toLowerCase())))];
    outline=[B.topic.replace(/^[^:]*:\s*/,"").replace(/\s*\((Toán|Tiếng Anh|Tin học)[^)]*\)$/,""),...mid.slice(0,Math.max(1,n-2)),"Tổng kết & dặn dò"]; }
  else outline=mockSlideOutline(B);
  await say2(m, `Tôi dựng ${outline.length} slide${fromDoc?` từ "${src.title}"`:""} theo mẫu ${(THEMES.find(x=>x[0]===(CH.nextTheme||"th-board"))||[,"Bảng xanh"])[1]} của trường:\n${outline.map((x,i)=>`${i+1}. ${x}`).join("\n")}`);
  const raw=mockSlides(outline.map(x=>({id:uid(),title:x})),{...B,topic:B.topic});
  const content=raw.map(s=>{ const o={title:s.title,bullets:s.bullets||(s.left?[...s.left,...(s.right||[])]:[]),note:s.note||""}; if(s.layout==="quiz") o.quiz={q:s.q,opts:s.opts,ans:s.ans}; if(s.layout==="title") o.layout="title"; if(fromDoc&&!o.quiz&&s.layout!=="title"){ const hb=src.content.findIndex(b=>(b.t==="h2"||b.t==="h3")&&b.text.includes(s.title.slice(0,12))); if(hb>=0){ const items=[]; for(let k=hb+1;k<src.content.length&&!["h2","h3"].includes(src.content[k].t);k++){ if(["li","p"].includes(src.content[k].t)) items.push(shorten(src.content[k].text.replace(/^[a-d]\)\s*/,""),11)); } if(items.length) o.bullets=items.slice(0,4); } } return o; });
  const d=newDoc("slides", B.topic.replace(/^[^:]*:\s*/,"")+" – slide", []); m.cards=[d.id]; openCanvasMobile(); renderCanvas();
  for (let i=0;i<content.length;i++){ d.content.push(content[i]); renderCanvas(); await sleep(160); }
  m.t+="\n\nĐã dựng xong. Muốn sửa slide nào, nhắn số slide và việc cần làm, ví dụ “slide 3 thêm ví dụ”."; m.chips=["Rút mỗi slide còn tối đa 3 ý","Slide 2 thành câu hỏi trắc nghiệm","Xuất PowerPoint"]; renderChat();
}

export async function mockCreateExam(t, m){
  const src=[...CH.docs].reverse().find(x=>x.kind==="doc");
  const subj=/tiếng anh/i.test(t)?"Tiếng Anh":"Toán", grade=(t.match(/(?:toán|anh|lớp)\s*(\d{1,2})/i)||[])[1]||(src&&src.brief&&src.brief.grade)||"10";
  let topic = (/cả hai/i.test(t)?"hdt":null) || TOPIC_KEY(t) || (/(bài này|từ bài|giáo án)/i.test(t)&&src&&src.brief?TOPIC_KEY(src.brief.prompt):null);
  if (subj==="Toán" && !topic){ CH.pending={type:"topic", base:t}; await say2(m,"Đề này kiểm tra nội dung nào ạ?"); m.chips=["Dấu của tam thức bậc hai","Hàm số bậc hai","Cả hai chủ đề"]; return; }
  const t15=/15\s*phút/i.test(t); let counts=t15?{mcq:4,tf:1,short:1,essay:0}:{mcq:4,tf:1,short:2,essay:2}; if(/chỉ trắc nghiệm/i.test(t)) counts={mcq:t15?6:12,tf:0,short:0,essay:0}; if(/trắc nghiệm \+ tự luận/i.test(t)) counts={mcq:t15?4:8,tf:0,short:0,essay:t15?1:3};
  const topics = /cả hai/i.test(t)?["hdt","pt"]:[topic||"hdt"];
  const kind=t15?"Kiểm tra 15 phút":/thi thử/i.test(t)?"Thi thử tốt nghiệp THPT":/cuối/i.test(t)?"Kiểm tra cuối học kỳ I":"Kiểm tra giữa học kỳ I", time=t15?"15":/thi thử|cuối/i.test(t)?"90":"45";
  await say2(m, `Tôi ra đề **${kind.toLowerCase()} ${subj} ${grade}** (${time} phút) theo định dạng mới: ${counts.mcq} câu nhiều lựa chọn, ${counts.tf} câu đúng/sai${counts.short?`, ${counts.short} câu trả lời ngắn`:""}${counts.essay?`, ${counts.essay} bài tự luận`:""}. Tỉ lệ Biết – Hiểu – Vận dụng khoảng 40 – 30 – 30.`);
  const lv=i=>["Biết","Biết","Hiểu","Vận dụng"][i%4]; const ex={cfg:{kind,subj,grade,time},mcq:[],tf:[],short:[],essay:[]}; let k=0;
  const d=newDoc("exam", `${kind} – ${subj} ${grade}`, ex); m.cards=[d.id]; openCanvasMobile();
  for (const p of ["mcq","tf","short","essay"]) for (let i=0;i<counts[p];i++){ const tk=topics[k++%topics.length];
    const q = subj==="Toán" ? genQ(tk,p,p==="tf"?"Hiểu":p==="essay"?(i?"Vận dụng":"Hiểu"):lv(i),Date.now()+k*7919) : (p==="mcq"?clone(EN_BANK[i%EN_BANK.length]):p==="tf"?{stem:"Read and decide true or false: Teenagers need 8–10 hours of sleep a night.",items:[{s:"Sleep helps reduce stress.",ans:true},{s:"Staying up late is healthy.",ans:false},{s:"Exercise improves mood.",ans:true},{s:"Fast food is good for daily meals.",ans:false}]}:{q:"Write the opposite of “healthy”.",ans:"unhealthy"});
    if(q) ex[p].push(q); renderCanvas(); await sleep(140); }
  m.t+=`\n\nĐề ở khung bên phải${subj==="Toán"?", đáp án các câu đã được kiểm tra tự động":""}. Có thể nhắn “hiện đáp án”, “mã đề 102”, “câu 2 khó hơn”…`; m.chips=["Hiện đáp án","Câu 2 khó hơn","Xuất file Word"]; renderChat();
}

export async function mockEditDoc(d, t, quote, m){
  const bl=clone(d.content), B=d.brief||{prompt:d.title,subj:"Toán",grade:"10",type:"Kế hoạch bài dạy (Công văn 5512)"};
  const secIdx=re=>bl.findIndex(b=>b.t==="h2"&&re.test(b.text)); const secEnd=i=>{ let j=i+1; while(j<bl.length&&bl[j].t!=="h2") j++; return j; };
  const lastSecEnd=()=>bl.length; let sum="";
  const qb = quote ? bl.find(b=>b.text&&(b.text.includes(quote.text)||quote.text.includes(b.text.slice(0,30)))) : null;
  const numSec=(t.match(/(hoạt động|mục|phần)\s*(\d+)/i)||[]); const secByNum = numSec[2] ? (()=>{ const re=new RegExp(numSec[1].toLowerCase()==="hoạt động"?"Hoạt động\\s*"+numSec[2]:"^("+["I","II","III","IV","V"][numSec[2]-1]+"\\.|"+numSec[2]+"\\.)","i"); return secIdx(re); })() : -1;
  if (qb && !/(thêm|bổ sung)/i.test(t)){ const act=/ngắn|gọn/i.test(t)?"short":/chi tiết|dài/i.test(t)?"long":/dễ hiểu|đơn giản/i.test(t)?"simple":/trang trọng/i.test(t)?"formal":"rewrite"; const nt=mockRewrite(qb.text,act); qb.text=quote.text.split(/\s+/).length>=8&&qb.text.includes(quote.text)?qb.text.replace(quote.text,mockRewrite(quote.text,act)):nt; sum=`Đã ${ACT_VI[act]} đoạn được trích.`; }
  else if (/phân hóa|học sinh yếu/i.test(t)){ let i=secIdx(/luyện tập|bài tập/i); const at=i>=0?secEnd(i):lastSecEnd(); bl.splice(at,0,{id:uid(),t:"h3",text:"Phân hóa theo đối tượng học sinh"},{id:uid(),t:"li",text:"Nhóm cần củng cố: làm ví dụ mẫu từng bước cùng giáo viên, có thẻ gợi ý công thức."},{id:uid(),t:"li",text:"Nhóm đạt: hoàn thành phiếu học tập trong 10 phút, đổi chéo chấm."},{id:uid(),t:"li",text:"Nhóm khá giỏi: tự đặt một bài tương tự và giải, trình bày trước lớp."}); sum="Đã thêm phần phân hóa cho 3 nhóm học sinh vào cuối hoạt động Luyện tập."; }
  else if (/câu hỏi|bài tập|ví dụ/i.test(t) && /(thêm|bổ sung)/i.test(t)){ const n=+(t.match(/(\d+)\s*(câu|bài|ví dụ)/i)||[])[1]||3; const ex=exercisesFor(B,n)||Array.from({length:n},(_,i)=>({q:`Câu hỏi củng cố ${i+1} về “${B.prompt}”.`})); let i=secIdx(/luyện tập|vận dụng|bài tập/i); const at=i>=0?secEnd(i):lastSecEnd(); bl.splice(at,0,{id:uid(),t:"h3",text:/ví dụ/i.test(t)?"Ví dụ bổ sung":"Câu hỏi củng cố"},...ex.map((q,k)=>({id:uid(),t:"li",text:`Câu ${k+1}: ${q.q}${q.ans!=null&&!q.opts?` (Đáp số: ${q.ans})`:q.opts?` (Đáp án: ${q.opts[q.ans]})`:""}`}))); sum=`Đã thêm ${ex.length} ${/ví dụ/i.test(t)?"ví dụ":"câu hỏi củng cố"}${exercisesFor(B,1)?", đáp án đã kiểm tra tự động":""}.`; }
  else if (/(bỏ|xóa)/i.test(t) && /bảng/i.test(t)){ const n=bl.filter(b=>b.t==="table").length; for(let i=bl.length-1;i>=0;i--) if(bl[i].t==="table") bl.splice(i,1); sum=`Đã bỏ ${n} bảng tổ chức hoạt động.`; }
  else if (/(bỏ|xóa)/i.test(t) && secByNum>=0){ const nm=bl[secByNum].text; bl.splice(secByNum,secEnd(secByNum)-secByNum); sum=`Đã bỏ “${nm}”.`; }
  else if (/(ngắn|gọn|rút)/i.test(t)){ const from=secByNum>=0?secByNum:0, to=secByNum>=0?secEnd(secByNum):bl.length; let c=0; for(let i=from;i<to;i++){ const b=bl[i]; if((b.t==="p"||b.t==="li")&&b.text.split(/\s+/).length>14){ b.text=mockRewrite(b.text,"short"); c++; } } if(secByNum>=0) for(let i=to-1;i>from;i--) if(bl[i].t==="table") bl.splice(i,1); sum=c?`Đã rút gọn ${c} đoạn dài${secByNum>=0?` trong “${bl[secByNum].text}”`:""}.`:"Các đoạn đã khá ngắn gọn, tôi giữ nguyên."; }
  else if (/trang trọng/i.test(t)){ let c=0; bl.forEach(b=>{ if(b.text&&(b.t==="p"||b.t==="li")){ const n=mockRewrite(b.text,"formal"); if(n!==b.text){ b.text=n; c++; } } }); sum=`Đã điều chỉnh văn phong trang trọng hơn ở ${c} đoạn.`; }
  else if (/ngày/i.test(t) && /\d{1,2}\/\d{1,2}\/\d{4}/.test(t)){ const nd=t.match(/\d{1,2}\/\d{1,2}\/\d{4}/)[0]; let c=0; bl.forEach(b=>{ if(b.text&&/\d{1,2}\/\d{1,2}\/\d{4}/.test(b.text)&&!/tháng 11 năm 2026/.test(b.text)){ b.text=b.text.replace(/\d{1,2}\/\d{1,2}\/\d{4}/,nd); c++; } }); sum=c?`Đã đổi ngày sang ${nd}.`:"Không tìm thấy ngày nào để đổi."; }
  else if (/(rà soát|lỗi chính tả|cập nhật|chương trình 2018|ct 2018)/i.test(t)){ let c=0; bl.forEach(b=>{ if(!b.text) return; const n=b.text.replace(/(?<!\p{L})củ(?!\p{L})/gu,"cũ").replace(/phúc(?!\p{L})/gu,"phút").replace(/x² - /g,"x² − ").replace(/(\S) - (\S)/g,"$1 − $2").replace(/chương trình c[ủũ] \(SGK Đại số 10 nâng cao\)/i,"Chương trình GDPT 2018 (SGK Toán 10)").replace(/Đại số 10( nâng cao)?/g,"Toán 10"); if(n!==b.text){ b.text=n; c++; } }); sum=c?`Đã sửa ${c} chỗ: lỗi chính tả, dấu trừ toán học và tên sách theo chương trình cũ.`:"Tôi không thấy lỗi cần sửa."; }
  else if (/vận dụng thực tế|bài toán thực tế/i.test(t)){ bl.push({id:uid(),t:"h3",text:"Bài vận dụng thực tế"},{id:uid(),t:"li",text:"Một quả bóng được ném lên, độ cao của bóng sau t giây là h(t) = −5t² + 25t + 2 (m). Trong khoảng thời gian nào bóng ở độ cao trên 22 m? (Đáp số: 1 < t < 4)"}); sum="Đã thêm 1 bài vận dụng thực tế ở cuối tài liệu."; }
  else if (/^(thêm|bổ sung)\s+(mục|phần)\s+/i.test(t)){ const nm=t.replace(/^(thêm|bổ sung)\s+(mục|phần)\s+/i,""); bl.push({id:uid(),t:"h2",text:nm.charAt(0).toUpperCase()+nm.slice(1)},{id:uid(),t:"p",text:mockSection(nm,B)}); sum=`Đã thêm mục “${nm}”.`; }
  else if (/viết lại/i.test(t) && secByNum>=0){ for(let i=secByNum+1;i<secEnd(secByNum);i++){ if(bl[i].text) bl[i].text=mockRewrite(bl[i].text,"rewrite"); } sum=`Đã viết lại “${bl[secByNum].text}”.`; }
  else { await say2(m,`Ở chế độ mô phỏng, tôi làm được các yêu cầu mẫu như: thêm phân hóa, thêm câu hỏi/ví dụ, rút gọn (cả bài hoặc “hoạt động 2”), bỏ bảng, bỏ một mục, viết lại một mục, văn phong trang trọng, đổi ngày, rà soát lỗi, hoặc bôi đen một đoạn rồi nhắn “viết lại”. Khi bật AI thật, tôi hiểu mọi yêu cầu.`); m.chips=["Rút gọn hoạt động 2","Thêm 3 câu hỏi củng cố","Bỏ các bảng"]; return; }
  if (JSON.stringify(bl)===JSON.stringify(d.content)){ await say2(m, sum); return; }
  const props=blocksToProps(d.content, bl);
  setProps(d, props, sum); m.cards=[d.id]; openCanvasMobile(); renderCanvas();
  await say2(m, sum+` Tôi đã đề xuất ${props.length} chỗ trên tài liệu, thầy/cô duyệt từng chỗ hoặc bấm "Chấp nhận tất cả".`); m.chips=["Quay lại bản trước","Xuất file Word"];
}

export async function mockEditSlides(d, t, m){
  const sl=clone(d.content); const n=+(t.match(/slide\s*(\d+)/i)||[])[1]; const tgt=n?sl[n-1]:null; let sum=""; const tk=TOPIC_KEY(d.title+" "+(sl[0]&&sl[0].title||""))||"hdt";
  if (/mẫu|giao diện|màu/i.test(t)){ d.theme=/nắng vàng|vàng/i.test(t)?"th-sun":/tối giản|trắng/i.test(t)?"th-clean":"th-board"; renderCanvas(); await say2(m,`Đã đổi sang mẫu ${THEMES.find(x=>x[0]===d.theme)[1]}.`); return; }
  if (n && !tgt){ await say2(m,`Bộ slide chỉ có ${sl.length} slide.`); return; }
  if (/(xóa|bỏ)/i.test(t) && tgt){ sl.splice(n-1,1); sum=`Đã xóa slide ${n}.`; }
  else if (/(trắc nghiệm|câu hỏi)/i.test(t)){ const g=genQ(tk,"mcq","Hiểu",Date.now()); const q={title:tgt?tgt.title:"Câu hỏi nhanh",bullets:[],note:"HS giơ thẻ A/B/C/D, GV hỏi lý do.",quiz:{q:g.q,opts:g.opts,ans:g.ans}}; if(tgt) sl[n-1]=q; else sl.splice(sl.length-1,0,q); sum=tgt?`Đã biến slide ${n} thành câu hỏi trắc nghiệm.`:"Đã thêm slide câu hỏi trắc nghiệm trước slide tổng kết."; }
  else if (/(tối đa|ngắn|gọn|rút)/i.test(t)){ (tgt?[tgt]:sl).forEach(s=>s.bullets=(s.bullets||[]).slice(0,3).map(x=>shorten(x,8))); sum=tgt?`Đã rút gọn slide ${n}.`:"Đã rút mỗi slide còn tối đa 3 ý ngắn."; }
  else if (/ví dụ/i.test(t)){ const g=genQ(tk,"short","Hiểu",Date.now()); const s=tgt||sl[Math.min(2,sl.length-1)]; s.bullets=[...(s.bullets||[]),`Ví dụ: ${g.q} → ${g.ans}`]; sum=`Đã thêm ví dụ vào slide ${tgt?n:Math.min(3,sl.length)}.`; }
  else if (/ghi chú/i.test(t)){ (tgt?[tgt]:sl).forEach(s=>s.note=`Mở đầu bằng câu hỏi về “${s.title}”, gọi 2 HS trả lời rồi chiếu từng ý. Khoảng 3 phút.`); sum="Đã viết ghi chú giảng."; }
  else if (/trò chơi|khởi động/i.test(t)){ sl.splice(1,0,{title:"Trò chơi: Ai nhanh hơn?",bullets:["Chia lớp 4 đội","Mỗi đội giải 1 câu trong 30 giây","Đội đúng nhanh nhất được 10 điểm"],note:"Chuẩn bị thẻ câu hỏi, bấm giờ trên máy chiếu."}); sum="Đã chèn slide 2 “Trò chơi: Ai nhanh hơn?”."; }
  else if (/(thêm slide|slide mới)/i.test(t)){ const nm=t.replace(/.*(thêm slide|slide mới)\s*(về)?\s*/i,"")||"Slide mới"; sl.splice(sl.length-1,0,{title:nm.charAt(0).toUpperCase()+nm.slice(1),bullets:["Ý chính","Ví dụ minh họa","Câu hỏi gợi mở"],note:""}); sum=`Đã thêm slide “${nm}”.`; }
  else if (/viết lại/i.test(t)){ (tgt?[tgt]:sl).forEach(s=>{ s.bullets=(s.bullets||[]).map(x=>mockRewrite(x,"rewrite").replace(/\.$/,"")); }); sum=tgt?`Đã viết lại slide ${n}.`:"Đã viết lại toàn bộ slide."; }
  else { await say2(m,"Ở chế độ mô phỏng tôi làm được: “slide 3 thêm ví dụ”, “slide 2 thành câu hỏi trắc nghiệm”, “xóa slide 5”, “rút mỗi slide còn 3 ý”, “thêm slide trò chơi khởi động”, “viết ghi chú giảng”, “đổi sang mẫu Nắng vàng”."); return; }
  updDoc(d, sl, sum); m.cards=[d.id]; openCanvasMobile(); renderCanvas(); await say2(m, sum+" Slide thay đổi được viền vàng."); m.chips=["Quay lại bản trước","Xuất PowerPoint"];
}

export async function mockEditExam(d, t, m){
  const ex=clone(d.content); const subj=ex.cfg.subj; const partOf=/phần ii\b|đúng\s*\/?\s*sai/i.test(t)?"tf":/phần iii|trả lời ngắn/i.test(t)?"short":/phần iv|tự luận|bài\s*\d/i.test(t)?"essay":"mcq";
  const n=+(t.match(/(câu|bài)\s*(\d+)/i)||[])[2]; const tk=(q)=>TOPIC_KEY((q&&q.q)||(q&&q.stem)||"")||(/parabol|đỉnh|đồng biến|hàm số/i.test((q&&q.q)||"")?"pt":"hdt");
  if (/(hiện|xem).*đáp án/i.test(t)){ d.showAns=true; renderCanvas(); await say2(m,"Đã hiện đáp án và hướng dẫn chấm bên dưới đề."); m.chips=["Ẩn đáp án","Mã đề 102"]; return; }
  if (/ẩn.*đáp án/i.test(t)){ d.showAns=false; renderCanvas(); await say2(m,"Đã ẩn đáp án."); return; }
  const mc=t.match(/mã\s*(?:đề\s*)?(10[1-4])/i); if (mc){ d.code=+mc[1]-101; renderCanvas(); await say2(m,`Đang xem mã đề ${mc[1]}: thứ tự câu và phương án Phần I đã được trộn.`); return; }
  const tm=t.match(/(\d{2,3})\s*phút/); if (tm && /(đổi|thời gian|chuyển)/i.test(t)){ ex.cfg.time=tm[1]; updDoc(d,ex,"Đổi thời gian"); renderCanvas(); await say2(m,`Đã đổi thời gian làm bài thành ${tm[1]} phút.`); return; }
  if (subj!=="Toán"){ await say2(m,"Với môn này, chế độ mô phỏng chỉ xem và xuất đề được. Khi bật AI thật, tôi sửa từng câu theo yêu cầu."); return; }
  let sum="";
  if (/^(thêm|bổ sung)/i.test(t)){ const level=/vận dụng/i.test(t)?"Vận dụng":/biết/i.test(t)?"Biết":"Hiểu"; const p=/ngắn/i.test(t)?"short":/đúng/i.test(t)?"tf":/tự luận/i.test(t)?"essay":"mcq"; const q=genQ(/hàm số|parabol/i.test(t)?"pt":"hdt",p,level,Date.now()); ex[p].push(q); sum=`Đã thêm 1 câu ${PART_N[p].toLowerCase()} mức ${level.toLowerCase()} (câu ${ex[p].length} ${p==="mcq"?"Phần I":p==="tf"?"Phần II":p==="short"?"Phần III":"Phần IV"}).`; }
  else if (n && (/(khó|dễ|đổi|thay)/i.test(t))){ const arr=ex[partOf]; const q=arr[n-1]; if(!q){ await say2(m,`Phần này chỉ có ${arr.length} câu.`); return; } const lv=["Biết","Hiểu","Vận dụng"]; const cur=lv.indexOf(q.level||"Hiểu"); const level=/khó/i.test(t)?lv[Math.min(2,(cur<0?1:cur)+1)]:/dễ/i.test(t)?lv[Math.max(0,(cur<0?1:cur)-1)]:(q.level||"Hiểu"); const nq=genQ(tk(q),partOf,level,Date.now()); arr[n-1]={...nq,level}; sum=`Đã ${/khó/i.test(t)?"thay câu "+n+" bằng câu khó hơn (mức "+level.toLowerCase()+")":/dễ/i.test(t)?"thay câu "+n+" bằng câu dễ hơn (mức "+level.toLowerCase()+")":"đổi câu "+n+" sang câu khác"}.`; }
  else if (n && /(xóa|bỏ)/i.test(t)){ ex[partOf].splice(n-1,1); sum=`Đã xóa câu ${n}.`; }
  else { await say2(m,"Ở chế độ mô phỏng tôi làm được: “câu 2 khó hơn”, “đổi câu 3”, “xóa câu 1 phần III”, “thêm 1 câu trả lời ngắn mức Vận dụng”, “hiện đáp án”, “mã đề 103”, “đổi thời gian 20 phút”."); return; }
  updDoc(d, ex, sum); m.cards=[d.id]; openCanvasMobile(); renderCanvas(); await say2(m, sum+" Đáp án và 4 mã đề đã tự cập nhật."); m.chips=["Hiện đáp án","Quay lại bản trước","Xuất file Word"];
}

export async function mockRestore(m){ const d=activeDoc(); if(!d||!d.versions.length){ await say2(m,"Tài liệu này chưa có bản trước để quay lại."); return; } const v=d.versions.pop(); d.prev=clone(d.content); d.content=v.content; d.changed=Date.now(); renderCanvas(); m.cards=[d.id]; await say2(m,`Đã quay lại bản lúc ${v.at}.`); }

export async function mockPlan(goal, m){
  const steps=["Đọc phân phối chương trình: tuần 11 có 4 tiết Toán 10A1 (Dấu của tam thức bậc hai, Luyện tập chung)","Soạn giáo án bài Dấu của tam thức bậc hai","Dựng slide cho tiết lí thuyết","Ra đề kiểm tra 15 phút về dấu của tam thức bậc hai","Giao phiếu bài tập cho lớp 10A1 (chờ thầy duyệt)"];
  CH.pending={type:"plan",goal,steps};
  await say2(m, `Tôi đề xuất kế hoạch chuẩn bị tuần tới cho 10A1:\n${steps.map((s,i)=>`- ${i+1}. ${s}`).join("\n")}\nTôi bắt đầu nhé? Bước giao bài tôi sẽ hỏi lại trước khi gửi cho học sinh.`); m.chips=["Bắt đầu","Bỏ bước giao bài","Thôi, để sau"];
}

export async function runMockPlan(m, P){
  m.steps=P.steps.slice(0,4).map(t=>({t,st:"todo"})); await say2(m,"Bắt đầu thực hiện:");
  const mark=(i,st)=>{ m.steps[i].st=st; renderChat(); };
  mark(0,"run"); await sleep(700); mark(0,"done");
  mark(1,"run"); const m1={r:"ai",t:""}; await mockCreateDoc("Soạn giáo án Toán 10 Dấu của tam thức bậc hai", {t:"",cards:[],chips:null}); const kh=CH.docs[CH.docs.length-1]; m.cards=[kh.id]; mark(1,"done");
  mark(2,"run"); await mockCreateSlides("Làm slide từ giáo án này 8 slide", {t:"",cards:[]}); m.cards.push(CH.docs[CH.docs.length-1].id); mark(2,"done");
  mark(3,"run"); await mockCreateExam("Ra đề 15 phút Toán 10 về dấu của tam thức bậc hai", {t:"",cards:[]}); m.cards.push(CH.docs[CH.docs.length-1].id); mark(3,"done");
  m.chips=null; renderChat();
  const m2=newMsg();
  if (P.skipAssign){ await say2(m2,"Đã chuẩn bị xong giáo án, slide và đề 15 phút. Tôi bỏ qua bước giao bài như thầy dặn."); return; }
  CH.pending={type:"assign"}; await say2(m2,"Đã xong giáo án, slide và đề 15 phút (các thẻ bên trên). Thầy có muốn tôi **giao phiếu bài tập cho 38 học sinh 10A1**, hạn thứ Năm 12/11 không?"); m2.chips=["Duyệt, giao bài","Chưa giao"];
}

export async function mockResults(m){
  await say2(m,`Kết quả bài 15 phút lớp 10A1 (38/38 bài):\n- Điểm trung bình 6,4; 9 học sinh dưới 5.\n- Câu sai nhiều nhất: câu 3 (xét dấu khi a < 0) 61%, câu 5 (tìm tham số m) 47%.\n- Đề xuất chia 3 nhóm: Cần củng cố 9 HS, Đạt 21 HS, Nâng cao 8 HS.\nTôi soạn phiếu phụ đạo cho nhóm Cần củng cố nhé?`);
  CH.pending={type:"lesson",base:"Soạn phiếu học tập Toán 10"}; m.chips=["Xét dấu tam thức bậc hai, lớp cần củng cố"];
}

export async function mockComments(m){
  await say2(m,"Tôi viết nhận xét cuối kỳ theo Thông tư 22/2021 cho lớp 10A1 từ điểm số và ghi chú của thầy trong học kỳ.");
  const rows=[["Họ và tên","Nhận xét"],["Nguyễn Văn An","Nắm vững định lí về dấu của tam thức bậc hai, trình bày rõ ràng. Cần cẩn thận hơn khi kết luận tập nghiệm."],["Trần Gia Bảo","Có tiến bộ rõ ở nửa cuối kỳ, tích cực phát biểu. Cần luyện thêm dạng bài tìm tham số m."],["Phạm Đức Huy","Đã cố gắng hơn sau buổi phụ đạo. Cần hoàn thành đầy đủ bài tập về nhà và hỏi khi chưa hiểu."],["Lê Khánh Linh","Học tốt, tư duy nhanh, giúp đỡ bạn trong nhóm. Nên thử sức với các bài nâng cao."]];
  const d=newDoc("doc","Nhận xét cuối học kỳ I – lớp 10A1",[]); m.cards=[d.id]; openCanvasMobile();
  await revealDoc(d,[{id:uid(),t:"title",text:"Nhận xét cuối học kỳ I – Lớp 10A1"},{id:uid(),t:"sub",text:"Môn Toán · Năm học 2026–2027"},{id:uid(),t:"table",rows},{id:uid(),t:"p",text:"(Hiển thị 4/38 học sinh. Bản chính thức tạo đủ cả lớp và xuất ra file để nhập sổ điểm điện tử.)"}]);
  m.chips=["Viết giọng khích lệ hơn","Xuất file Word"]; renderChat();
}

export function welcome(){ const h=honor(); return `Chào ${h}! Mọi việc soạn và sửa đều làm ngay trong khung chat này. ${h[0].toUpperCase()+h.slice(1)} cứ nhắn như dặn một đồng nghiệp, ví dụ:\n- “Soạn giáo án bài Dấu của tam thức bậc hai cho 10A1”\n- “Làm slide từ giáo án này, 8 trang”\n- “Ra đề 15 phút về dấu của tam thức bậc hai”\n- “Rút gọn hoạt động 2”, “Câu 3 khó hơn”, “Quay lại bản trước”, “Xuất file Word”\nCó thể kéo thả file Word, PowerPoint vào đây để tôi đọc và sửa.`; }

export function welcomeChips(){ const L=scheduleLessons(); return [L[0]?`Soạn giáo án ${L[0].split(" – ")[0]} cho ${L[0].split(" – ")[1]}`:"Soạn giáo án",(TT[S.user.code]||TT["GV-0108"]).subj==="Toán"?"Ra đề 15 phút Toán 10 về dấu của tam thức bậc hai":"Ra đề 15 phút Tiếng Anh 11 Unit 1","Chuẩn bị Toán 10A1 tuần tới"]; }

export async function baseMockTurn(text, quote, m){
  const t=text.trim(), d=activeDoc(), P=CH.pending;
  // pending: chờ trả lời câu hỏi làm rõ / duyệt kế hoạch
  if (P){ CH.pending=null;
    if (P.type==="lesson") return mockCreateDoc(P.base+" "+t, m);
    if (P.type==="plan"){ if (YES_RE.test(t)||/bắt đầu/i.test(t)) return runMockPlan(m, P); if(/bỏ/i.test(t)) { P.skipAssign=true; return runMockPlan(m,P); } }
    if (P.type==="assign"){ if (YES_RE.test(t)||/duyệt|giao/i.test(t)){ await say2(m,"Đã giao phiếu bài tập cho 38 học sinh lớp 10A1, hạn 23:00 thứ Năm 12/11. Hệ thống sẽ tự nhắc học sinh chưa làm vào tối thứ Tư."); return; } await say2(m,"Được, tôi chưa giao. Phiếu vẫn nằm trong Thư viện, khi nào cần thầy cô nhắn “giao phiếu cho 10A1”."); return; }
    if (P.type==="topic") return mockCreateExam(P.base+" "+t, m);
  }
  if (/^chuẩn bị/i.test(t)) return mockPlan(t, m);
  if (/xử lý kết quả|kết quả bài kiểm tra/i.test(t)) return mockResults(m);
  if (/nhận xét cuối kỳ|viết nhận xét/i.test(t)) return mockComments(m);
  if (/(quay lại|hoàn tác|bản trước|undo|khôi phục)/i.test(t)) return mockRestore(m);
  if (/(xuất|tải|download)/i.test(t) || /^(file )?(word|powerpoint|pptx|docx)$/i.test(t)){ if(!d){ await say2(m,"Chưa có tài liệu nào để xuất. Thầy cô muốn tôi soạn gì trước?"); return; } m.file={id:d.id,name:fileName(d)}; await say2(m,`File “${fileName(d)}” đã sẵn sàng.`); return; }
  if (/(làm|tạo|dựng|chuyển).*(slide|trình chiếu|bài giảng điện tử)/i.test(t)) return mockCreateSlides(t, m);
  if (/(ra|tạo|soạn|làm)\s+(một\s+|1\s+)?đề/i.test(t) || /^đề\s/i.test(t)) return mockCreateExam(t, m);
  if (/(soạn|viết|tạo|lập|làm)\s/i.test(t) && /(giáo án|kế hoạch bài dạy|phiếu|đề cương|thông báo|biên bản|công văn|kế hoạch)/i.test(t)) return mockCreateDoc(t, m);
  if (/^mở\s/i.test(t)){ const k=/slide/i.test(t)?"slides":/đề/i.test(t)?"exam":"doc"; const x=[...CH.docs].reverse().find(y=>y.kind===k); if(x){ CH.active=x.id; m.cards=[x.id]; renderCanvas(); await say2(m,`Đã mở “${x.title}”.`); } else await say2(m,"Chưa có "+KLABEL[k].toLowerCase()+" nào. Nhắn tôi để soạn nhé."); return; }
  if (d){ if (d.kind==="doc") return mockEditDoc(d,t,quote,m); if (d.kind==="slides") return mockEditSlides(d,t,m); return mockEditExam(d,t,m); }
  await say2(m, "Tôi có thể soạn giáo án, phiếu học tập, đề cương, thông báo, slide và đề kiểm tra, rồi sửa tiếp theo lời nhắn của thầy cô. Ở chế độ mô phỏng tôi hiểu các yêu cầu mẫu; khi bật AI thật tôi trả lời được mọi câu hỏi.");
  m.chips=welcomeChips();
}

export function isSendDocQuery(t){ return /\bgửi\b/i.test(t) && /\bcho\b/i.test(t) && !/phụ huynh/i.test(t); }
export async function mockSendDoc(t, m){
  const d=activeDoc();
  if (!d){ await say2(m,"Thầy/cô muốn gửi tài liệu nào? Mở tài liệu đó trước rồi nhắn lại giúp tôi."); return; }
  const to=(t.match(/\bcho\s+(.+)$/i)||[])[1]; const staff=to?matchStaff(to):null;
  if (!staff || !staff.code){ await say2(m,"Tôi chưa xác định được đồng nghiệp cần gửi. Thầy/cô nhắn rõ tên, ví dụ “gửi cho cô Hạnh”."); return; }
  if (staff.code===S.user.code){ await say2(m,"Đây là tài khoản của chính thầy/cô rồi."); return; }
  const ok=await sendDocTo(d, staff);
  await say2(m, ok?`Đã gửi “${d.title}” cho ${staff.name}. ${staff.name} sẽ thấy ở mục “Tài liệu người khác gửi”.`:"Không gửi được tài liệu, thử lại sau.");
}

export function isSchoolRuleQuery(t){ return /(quy định|quy chế|chính sách|nội quy)/i.test(t); }
export function isStudentInfoQuery(t){ return /(điểm|học lực|kết quả|số điện thoại|sđt|liên hệ|phụ huynh)/i.test(t) && !!matchStudent(t); }
export function isStaffScheduleQuery(t){ return /(lịch dạy|thời khóa biểu|dạy (lớp|môn|tiết|vào|hôm nay|thứ|ngày))/i.test(t) && !/soạn|giáo án|slide|đề\s/i.test(t); }

export async function mockSchoolRule(t, m){
  const r=matchRule(t);
  if (r){ await say2(m, `Theo Quy chế chuyên môn năm học 2026–2027 của trường, mục “${r.title}”: ${r.body}`);
    m.chips=["Quy định dùng AI khi soạn giáo án","Quy định bảo mật thông tin học sinh"]; return; }
  await say2(m, `Trường có quy định về: ${SCHOOL_RULES.map(x=>x.title.toLowerCase()).join("; ")}. ${Honor()} muốn hỏi quy định nào ạ?`);
  m.chips=SCHOOL_RULES.slice(0,3).map(x=>"Quy định về "+x.title.toLowerCase());
}

export async function mockStudentInfo(t, m){
  const stu=matchStudent(t);
  if (!stu){ await say2(m, "Tôi chưa nhận diện được em học sinh nào trong các lớp thầy/cô phụ trách. Thầy/cô nhắn rõ họ tên đầy đủ giúp tôi tìm nhanh hơn, ví dụ “điểm của em Phạm Đức Huy”.");
    m.chips=["Điểm của em Phạm Đức Huy lớp 10A1","Số điện thoại phụ huynh em Nguyễn Minh Anh"]; return; }
  const cls=studentClass(stu), T=TT[S.user.code]||TT["GV-0108"];
  const wantScore=/điểm|học lực|kết quả/i.test(t), wantPhone=/số điện thoại|sđt|liên hệ|phụ huynh/i.test(t);
  let reply=`Em ${stu.name} — lớp ${cls}, mã học sinh ${stu.id}.`;
  if (wantScore || !wantPhone) reply+=` Điểm trung bình môn ${T.subj} hiện tại: ${String(stu.avg).replace(".",",")}. ${stu.note}`;
  if (wantPhone) reply+=` Số điện thoại liên hệ: ${stu.phone} (${stu.parent}).`;
  await say2(m, reply);
  m.chips=[`Soạn tin nhắn trao đổi với phụ huynh em ${stu.name}`,"Quy định bảo mật thông tin học sinh của trường"];
}

export async function mockStaffSchedule(t, m){
  const person=matchStaff(t);
  if (person){
    if (TT[person.code]){ const T=TT[person.code];
      await say2(m, `${person.name} dạy môn ${T.subj}, chủ nhiệm lớp ${T.hr}. Hiện đang dạy các lớp ${T.classes.map(c=>c[0]).join(", ")}, tổng ${T.items.filter(x=>x[3]===T.subj).length} tiết ${T.subj}/tuần${T.events[0]?`; sinh hoạt tổ vào ${T.events[0][2]} lúc ${T.events[0][1]}`:""}.`);
    } else await say2(m, `${person.name} — ${person.subj}${person.hr?`, chủ nhiệm ${person.hr}`:""}, ${person.to}. ${person.days||""}`);
    m.chips=["Lịch dạy của tôi hôm nay","Quy định giờ lên lớp của trường"]; return;
  }
  const T=TT[S.user.code]||TT["GV-0108"], L=scheduleLessons();
  await say2(m, `Lịch dạy của ${honor()} tuần này: môn ${T.subj}, chủ nhiệm lớp ${T.hr}, dạy các lớp ${T.classes.map(c=>c[0]).join(", ")} với ${T.items.filter(x=>x[3]===T.subj).length} tiết ${T.subj}/tuần.${L.length?` Các bài sắp dạy: ${L.join("; ")}.`:""}${T.events.length?` Lịch chiều: ${T.events.map(e=>e[2]+" lúc "+e[1]).join("; ")}.`:""}`);
  m.chips=["Lịch dạy của cô Hạnh tuần này","Quy định giờ lên lớp của trường"];
}

export async function mockTurn(t,q,m){
  if (/(tin nhắn|nhắn tin)/i.test(t) && /phụ huynh/i.test(t)){ const T=TT[S.user.code]||TT["GV-0108"]; const who=(t.match(/em\s+([A-ZĐÀ-Ỹ][\p{L}]*(\s+[A-ZĐÀ-Ỹ][\p{L}]*)*)/u)||[,"học sinh"])[1];
    await say2(m,`Tôi soạn tin nhắn gửi phụ huynh em ${who}, giọng tế nhị và có đề xuất cụ thể. Tin chỉ gửi đi khi ${honor()} xác nhận.`);
    const x=S.user.name.split(" ")[0]; const d=newDoc("doc","Tin nhắn phụ huynh em "+who,[]); m.cards=[d.id]; openCanvasMobile();
    await revealDoc(d,[{id:uid(),t:"title",text:"Tin nhắn gửi phụ huynh"},{id:uid(),t:"sub",text:"Em "+who+" · lớp "+T.hr},{id:uid(),t:"p",text:`Kính gửi anh/chị phụ huynh em ${who},`},{id:uid(),t:"p",text:`${x} là ${S.user.name.split(" ").slice(1).join(" ")}, giáo viên chủ nhiệm lớp ${T.hr}. Thời gian gần đây kết quả môn ${T.subj} của em có giảm so với năm trước, chủ yếu ở phần kiến thức mới của chương.`},{id:uid(),t:"p",text:`${x} đã xếp em vào nhóm phụ đạo chiều thứ Năm. Mong gia đình nhắc em hoàn thành bài tập về nhà và trao đổi thêm với ${x.toLowerCase()} khi cần.`},{id:uid(),t:"p",text:"Trân trọng cảm ơn anh/chị."}]);
    m.chips=["Viết ngắn gọn hơn","Giọng khích lệ hơn"]; renderChat(); return; }
  if (isSendDocQuery(t)) return mockSendDoc(t, m);
  if (isSchoolRuleQuery(t)) return mockSchoolRule(t, m);
  if (isStudentInfoQuery(t)) return mockStudentInfo(t, m);
  if (isStaffScheduleQuery(t)) return mockStaffSchedule(t, m);
  return baseMockTurn(t,q,m);
}

export async function baseCreateDoc(t, m){
  const B=parseBrief(t);
  if (!B.prompt || B.prompt.length<4){ CH.pending={type:"lesson", base:t}; await say2(m, `${honor()[0].toUpperCase()+honor().slice(1)} muốn soạn ${B.type.split(" (")[0].toLowerCase()} cho bài nào? Tôi thấy trong lịch dạy tuần này có:`); m.chips=scheduleLessons().map(x=>x); return; }
  const outline=mockOutline(B).map(([title])=>title);
  await say2(m, `Tôi soạn **${B.type.split(" (")[0].toLowerCase()}${B.type==="Thông báo"?"":` ${B.subj} ${B.grade}`}**: “${B.prompt}”${B.type.startsWith("Kế hoạch")?`, ${B.time}, theo Phụ lục IV Công văn 5512`:""}. Dàn ý:\n${outline.map(x=>"- "+x).join("\n")}`);
  const head=docHeadBlocks(B).map(b=>b.t==="meta"?{...b,t:"p"}:b);
  const full=[...head]; outline.forEach(o=>{ full.push({id:uid(),t:"h2",text:o}); full.push(...mdParse(mockSection(o,B))); });
  if (B.type==="Thông báo") full.push({id:uid(),t:"p",text:"Nơi nhận: Các tổ chuyên môn, GVCN (để thực hiện); Lưu: VT."},{id:uid(),t:"p",text:"KT. HIỆU TRƯỞNG – PHÓ HIỆU TRƯỞNG · Phạm Thị Lan"});
  const L0=lessonOf(B); const d=newDoc("doc", B.type==="Thông báo"?"Thông báo "+L0.charAt(0).toLowerCase()+L0.slice(1):(B.type==="Phiếu học tập"?"Phiếu học tập – ":B.type==="Đề cương ôn tập"?"Đề cương – ":"")+L0+` (${B.subj} ${B.grade})`, []); d.brief=B; m.cards=[d.id]; openCanvasMobile(); renderChat();
  await revealDoc(d, full);
  m.t+=`\n\nĐã xong, tài liệu ở khung bên phải. Cần chỉnh gì ${honor()} cứ nhắn, hoặc bôi đen một đoạn trên tài liệu rồi nhắn yêu cầu cho đoạn đó.`; m.chips=["Thêm phần phân hóa cho học sinh yếu","Làm slide từ giáo án này","Ra đề 15 phút từ bài này"]; renderChat();
}

export async function mockCreateDoc(t,m){
  if (/biên bản/i.test(t)){ const what=t.replace(/^(soạn|viết|tạo|lập)\s+biên bản\s*/i,"")||"họp tổ chuyên môn";
    await say2(m,`Tôi soạn **biên bản ${what}** gồm: thời gian – địa điểm, thành phần, nội dung, kết luận, chữ ký.`);
    const bl=[{id:uid(),t:"title",text:"Biên bản họp"},{id:uid(),t:"sub",text:"V/v "+what},{id:uid(),t:"h2",text:"1. Thời gian, địa điểm"},{id:uid(),t:"p",text:"Vào lúc 14 giờ 00 phút, ngày 03/11/2026, tại Phòng hội đồng, Trường THPT Tản Đà."},{id:uid(),t:"h2",text:"2. Thành phần"},{id:uid(),t:"li",text:"Chủ trì: Tổ trưởng tổ Toán – Tin."},{id:uid(),t:"li",text:"Thư ký: Thầy Lê Văn Nam."},{id:uid(),t:"li",text:"Có mặt: 8/9 giáo viên; vắng 1 (có phép)."},{id:uid(),t:"h2",text:"3. Nội dung"},{id:uid(),t:"li",text:"Đánh giá kết quả kiểm tra giữa học kỳ I các khối 10, 11, 12."},{id:uid(),t:"li",text:"Thống nhất kế hoạch phụ đạo học sinh yếu môn Toán từ tuần 11."},{id:uid(),t:"li",text:"Trao đổi việc sử dụng AI trong soạn giáo án và ra đề: giáo viên duyệt bản cuối trước khi dùng."},{id:uid(),t:"h2",text:"4. Kết luận"},{id:uid(),t:"p",text:"Tổ thống nhất các nội dung trên. Cuộc họp kết thúc lúc 15 giờ 30 phút cùng ngày."},{id:uid(),t:"p",text:"THƯ KÝ · CHỦ TRÌ"}];
    const d=newDoc("doc","Biên bản "+what,[]); d.brief={type:"Biên bản họp",prompt:what,subj:"",grade:""}; m.cards=[d.id]; openCanvasMobile(); renderChat(); await revealDoc(d,bl); m.chips=["Thêm ý kiến của từng thành viên","Xuất file Word"]; renderChat(); return; }
  return baseCreateDoc(t,m);
}
