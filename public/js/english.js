/* Tản Đà AI · english.js — mã nguồn, sửa trực tiếp */
import { aiJSON } from "./ai.js";
import { $, S, TITLES, VIEWS, can, esc, go, ico, loading, sleep, toast, today } from "./core.js";

const SCENARIOS = [
  {id:"u3", unit:"Unit 1 · A long and healthy life", title:"Trò chuyện với cố vấn học đường về áp lực học tập", grade:11, level:"B1",
   persona:"Mr. Ben, the school counsellor", name:"Mr. Ben",
   setting:"The student talks to the school counsellor about study pressure before the end-of-term exams and how to keep a healthy lifestyle.",
   vocab:["stress","balance","routine"],
   opener:"Hello! I'm Mr. Ben, the school counsellor. The end-of-term exams are coming soon. How do you feel about your studies these days?",
   script:["Thanks for sharing. What do you usually do when you feel stressed?","That's helpful. How many hours do you usually sleep on school nights?","Sleep is really important. What does your daily routine look like after school?","Good. What is one small change you can make this week to have a better balance?"],
   hints:["I feel a bit stressed because I have a lot of homework.","I usually listen to music or play badminton to relax."]},
  {id:"u1", unit:"Chủ đề · Di sản văn hóa", title:"Giới thiệu nghề truyền thống ở quê em", grade:10, level:"B1",
   persona:"Emma, a tourist from Australia", name:"Emma",
   setting:"Emma is visiting the student's hometown and wants to learn about a local traditional craft such as pottery, conical hats or weaving.",
   vocab:["craft","artisan","pass down"],
   opener:"Hi! I'm Emma from Australia. I'm visiting your hometown this week. Is there a traditional craft that your town is famous for?",
   script:["Wow, that sounds interesting! Who usually makes it, and how long does it take?","I see. Do young people in your town still want to learn this craft?","That's a good point. How can we help keep this craft alive?","Great ideas! If I want to buy one as a souvenir, where should I go?"],
   hints:["My town is famous for making conical hats.","The artisans pass down their skills to their children."]},
  {id:"u5", unit:"Chủ đề · Du lịch và trải nghiệm", title:"Kể cho bạn qua thư về một chuyến đi đáng nhớ", grade:10, level:"B1",
   persona:"Tom, a pen pal from the UK", name:"Tom",
   setting:"Tom, the student's pen pal, asks about a memorable trip the student has taken.",
   vocab:["journey","explore","unforgettable"],
   opener:"Hey, it's Tom! I just got back from Scotland. Have you been on any memorable trips? Tell me about one!",
   script:["Cool! Who did you go with, and how did you get there?","What was the best thing you did or saw there?","Did anything funny or surprising happen on the trip?","Would you like to go back there again? Why or why not?"],
   hints:["Last summer I went to Da Lat with my family.","It was an unforgettable journey because we explored the flower gardens."]},
  {id:"exam", unit:"Luyện phỏng vấn tuyển sinh đại học", title:"Phỏng vấn tuyển sinh, học bổng: bản thân, ngành học, quan điểm", grade:12, level:"B1–B2",
   persona:"a university admissions interviewer", name:"Interviewer",
   setting:"A formal interview for a university scholarship programme. The interviewer asks about the student, their strengths, the major they want to study and their opinions.",
   vocab:["major","strength","in my opinion"],
   opener:"Good morning. Thank you for coming to this interview. Could you introduce yourself, please?",
   script:["Thank you. Which major would you like to study at university, and why?","Tell me about an activity or project at school that you are proud of.","In your opinion, how will artificial intelligence change the job you want to do?","What will you do if you do not receive this scholarship?"],
   hints:["My name is Minh Anh and I'm in grade 11 at Tan Da High School.","I would like to study computer science because I enjoy solving problems."]},
  {id:"cafe", unit:"Đời sống hằng ngày", title:"Gọi đồ uống ở quán café", grade:10, level:"A2–B1",
   persona:"Sam, a barista", name:"Sam",
   setting:"The student orders drinks and snacks at a café from a friendly barista.",
   vocab:["would like","medium","take away"],
   opener:"Hi there! Welcome to Sunny Café. What would you like to drink today?",
   script:["Sure! What size would you like: small, medium or large?","Great. Would you like anything to eat with that?","Is that for here or to take away?","Okay! That's 65,000 dong. How would you like to pay?"],
   hints:["I would like an iced milk tea, please.","A medium one, please."]}
];
const FREE_TALK = {
  id:"free", unit:"Nói chuyện tự do", title:"Nói chuyện tự do với AI", grade:11, level:"B1", free:true,
  persona:"Alex, a friendly AI speaking partner", name:"Alex",
  setting:"An open, relaxed conversation. Alex chats naturally about everyday topics (school, hobbies, weekend plans, food, movies, family, future dreams…), follows the student's lead, and introduces a new everyday topic if the conversation runs out of things to say.",
  vocab:["because","for example","actually"],
  opener:"Hi, I'm Alex! I'm here to practise English with you — we can talk about anything you like. So, how's your day going so far?",
  hints:["My day is pretty good, thanks! I just finished my homework.","It's okay, a bit tired because I had a Maths test today."]
};
const FREE_FOLLOWUPS=[
  "That's nice! What do you usually do after school?",
  "Interesting! Do you have a favourite subject at school? Why?",
  "Cool! What do you like to do on weekends?",
  "Nice! Who do you usually spend time with, and what do you do together?",
  "Got it! What's your favourite food, and why do you like it?",
  "Great! Do you have a hobby you enjoy a lot? Tell me about it.",
  "I see! What are you looking forward to this month?",
  "Nice! If you could travel anywhere, where would you go?",
  "Interesting! What kind of movies or music do you like?",
  "Cool! What do you want to be in the future?"
];
const PRON = [
  {t:"She likes cakes and cookies.", focus:"Âm cuối /s/", ipa:"/ʃiː laɪks keɪks ənd ˈkʊkiz/"},
  {t:"I visited my grandparents last week.", focus:"Đuôi -ed và âm /t/", ipa:"/aɪ ˈvɪzɪtɪd maɪ ˈɡrænpeərənts lɑːst wiːk/"},
  {t:"I think this is the third time.", focus:"Âm /θ/ và /ð/", ipa:"/aɪ θɪŋk ðɪs ɪz ðə θɜːd taɪm/"},
  {t:"The artisans pass down their craft.", focus:"Cụm phụ âm /ft/, /nz/", ipa:"/ði ˈɑːtɪzænz pɑːs daʊn ðeə krɑːft/"},
  {t:"I would like a medium coffee to take away.", focus:"Nối âm", ipa:"/aɪ wʊd laɪk ə ˈmiːdiəm ˈkɒfi tə teɪk əˈweɪ/"}
];
const EN = {
  user:null, view:"home", sc:null, turns:[], fbs:[], hits:new Set(), confs:[], usedMic:false,
  autoSpeak:true, slow:false, showVi:false, busy:false,
  ai:null, aiMode:"checking", micState:"unknown",
  classroom:{on:false, topic:"u3"}, exam:false, assigned:{topic:"u3", due:"05/11/2026", minutes:15},
  custom:[], report:null, pronIdx:1, pronResult:{idx:1, heard:"i visit my grandparent last week", example:true},
  history:[{title:"Giới thiệu nghề truyền thống ở quê em", when:"31/10", score:6.9},{title:"Gọi đồ uống ở quán café", when:"29/10", score:7.4}]
};
const allScenarios = () => [...SCENARIOS, ...EN.custom];
const scById = id => id==="free" ? FREE_TALK : allScenarios().find(s => s.id === id);
/* ================= SPEECH ================= */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
EN.micState = SR ? "ready" : "unsupported";
let voices = [];
function loadVoices(){ try{ voices = speechSynthesis.getVoices(); }catch(e){} }
if ("speechSynthesis" in window){ loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
/* Chọn giọng tự nhiên nhất máy có: ưu tiên giọng "Natural"/"Neural"/"Premium" (Edge, một số Android/Chrome OS) trước giọng robot mặc định. */
function pickVoice(){
  if (!voices.length) return null;
  const score = v => {
    if (!/^en/i.test(v.lang)) return -1;
    let s = /^en-(US|GB)/i.test(v.lang) ? 2 : 0;
    if (/online \(natural\)|natural|neural|wavenet|premium|enhanced/i.test(v.name)) s += 6;
    if (/google/i.test(v.name)) s += 2;
    if (/microsoft/i.test(v.name)) s += 1;
    return s;
  };
  const ranked = voices.map(v=>({v,s:score(v)})).filter(x=>x.s>=0).sort((a,b)=>b.s-a.s);
  return ranked.length ? ranked[0].v : null;
}
/* Đọc theo từng câu (ngắt nhẹ giữa câu) để giọng lên xuống tự nhiên hơn, gần với nhịp nói của người bản xứ hơn là đọc liền một mạch. */
function speak(text){
  if (!("speechSynthesis" in window)) return;
  try{
    speechSynthesis.cancel();
    const v = pickVoice();
    const parts = String(text).match(/[^.!?]+[.!?]*/g) || [text];
    parts.map(p=>p.trim()).filter(Boolean).forEach(part=>{
      const u = new SpeechSynthesisUtterance(part); u.lang="en-US"; u.rate = EN.slow ? .75 : 1;
      if (v) u.voice = v; speechSynthesis.speak(u);
    });
  }catch(e){}
}
function listen({onInterim, onDone}){
  if (!SR || EN.micState==="blocked") { onDone("", [], "unavailable"); return null; }
  const r = new SR(); r.lang="en-US"; r.interimResults=true; r.continuous=false; r.maxAlternatives=1;
  let fin="", confs=[], err=null;
  r.onresult = e => { let interim=""; for (let i=e.resultIndex;i<e.results.length;i++){ const res=e.results[i]; if(res.isFinal){ fin+=res[0].transcript; confs.push(res[0].confidence||0);} else interim+=res[0].transcript; } onInterim((fin+interim).trim()); };
  r.onerror = e => { err=e.error; if (["not-allowed","service-not-allowed","audio-capture"].includes(e.error)){ EN.micState="blocked"; enChips(); } };
  r.onend = () => onDone(fin.trim(), confs, err);
  try { r.start(); } catch(e){ EN.micState="blocked"; enChips(); onDone("",[], "start"); return null; }
  return r;
}

/* ================= STUDENT HOME ================= */
function rHome(){
  const a=scById(EN.assigned.topic);
  const locked = id => EN.classroom.on && id!==EN.classroom.topic;
  $("#enRoot").innerHTML = `
    ${EN.classroom.on?`<div class="banner">${ico("lock")}<div><b>Chế độ lớp học đang bật.</b> Cô Hạnh đang cho cả lớp luyện chủ đề “${esc(scById(EN.classroom.topic).title)}”. Các chủ đề khác mở lại sau giờ học.</div></div>`:""}
    <div class="hello">
      <div class="assign">
        <div class="eyebrow">Bài cô Hạnh giao · hạn ${esc(EN.assigned.due)}</div>
        <h2>${esc(a.title)}</h2>
        <p style="opacity:.85">${esc(a.unit)} · nói ít nhất ${EN.assigned.minutes} phút, dùng được 3 từ mục tiêu: <b>${a.vocab.map(esc).join(", ")}</b>.</p>
        <button class="btn" data-start="${a.id}">${ico("mic")}Bắt đầu nói</button>
      </div>
      <div class="en-stats">
        <div class="en-stat"><span class="muted small">Chuỗi ngày luyện</span><b class="num">5</b><span class="small muted">ngày liên tiếp</span></div>
        <div class="en-stat"><span class="muted small">Phút nói tuần này</span><b class="num">38<span class="muted" style="font-size:.9rem">/60</span></b><div class="meter"><i style="width:63%"></i></div></div>
        <div class="en-stat"><span class="muted small">Điểm nói gần nhất</span><b class="num">${EN.history[0].score.toFixed(1)}</b><span class="small muted">trên thang 10</span></div>
      </div>
    </div>
    <div class="row between"><h2>Luyện nói với AI</h2><span class="muted small">Chọn cách luyện nói</span></div>
    <div class="topics">
      <button class="topic free" data-start="free" ${EN.classroom.on?'aria-disabled="true"':''}>
        <div class="row between"><span class="eyebrow">Mở, không theo khung sẵn</span><span class="chip accent">Tự do</span></div>
        <h3>Nói chuyện tự do với AI</h3>
        <div class="persona">${ico("chat")}AI đóng vai: ${esc(FREE_TALK.persona)}</div>
        <p class="small muted" style="margin:0">Trò chuyện tự nhiên bằng tiếng Anh về bất kỳ đề tài đời thường, giọng AI lên xuống như người bản xứ, AI sửa lỗi và gợi ý ngay khi em cần.</p>
        ${EN.classroom.on?`<span class="chip">${ico("lock")}Mở sau giờ học</span>`:""}
      </button>
    </div>
    <div class="row between" style="margin-top:4px"><h3>Luyện nói theo kịch bản · chủ đề do giáo viên soạn sẵn</h3><span class="muted small">Mỗi kịch bản là một tình huống nhập vai, có từ mục tiêu và gợi ý</span></div>
    <div class="topics">${allScenarios().map(s=>`
      <button class="topic" data-start="${s.id}" ${locked(s.id)?'aria-disabled="true"':''}>
        <div class="row between"><span class="eyebrow">${esc(s.unit)}</span><span class="chip ${s.custom?'accent':'brand'}">${s.custom?'GV tạo':esc(s.level)}</span></div>
        <h3>${esc(s.title)}</h3>
        <div class="persona">${ico("chat")}AI đóng vai: ${esc(s.persona)}</div>
        <div class="vocab">${s.vocab.map(v=>`<span>${esc(v)}</span>`).join("")}</div>
        ${locked(s.id)?`<span class="chip">${ico("lock")}Mở sau giờ học</span>`:""}
      </button>`).join("")}
    </div>
    <div class="card grid" style="gap:10px">
      <h3>Buổi luyện gần đây</h3>
      ${EN.history.map(h=>`<div class="row between"><span>${esc(h.title)}</span><span class="row" style="gap:10px"><span class="muted small">${esc(h.when)}</span><span class="chip ${h.score>=7?'good':'warn'} num">${h.score.toFixed(1)}</span></span></div>`).join("")}
    </div>`;
}
document.addEventListener("click", e=>{
  const b=e.target.closest("[data-start]"); if(!b) return;
  if (b.getAttribute("aria-disabled")==="true"){ toast("Chủ đề này đang khóa trong giờ học."); return; }
  startScenario(b.dataset.start);
});

/* ================= CONVERSATION ================= */
let rec=null;
function startScenario(id){
  EN.sc=scById(id); EN.turns=[{role:"ai",text:EN.sc.opener,vi:null}]; EN.fbs=[]; EN.hits=new Set(); EN.confs=[]; EN.usedMic=false; EN.report=null;
  enGo("talk"); if (EN.autoSpeak) speak(EN.sc.opener);
}
function rTalk(){
  const v=$("#enRoot");
  if (S.cls.exam){ v.innerHTML=`<div class="card lock"><div class="en-big">${ico("lock")}</div><h2>Đang trong giờ kiểm tra</h2><p class="muted" style="max-width:46ch">Giáo viên đã bật chế độ kiểm tra. AI tạm khóa trên tài khoản học sinh cho đến khi hết giờ làm bài.</p></div>`; return; }
  if (!EN.sc){ v.innerHTML=`<div class="card lock"><div class="en-big" style="background:var(--brand-soft);color:var(--brand)">${ico("chat")}</div><h2>Chưa chọn chủ đề</h2><p class="muted">Chọn một chủ đề ở trang chủ để bắt đầu hội thoại.</p><button class="btn primary" data-start="${EN.assigned.topic}">Bắt đầu bài cô giao</button></div>`; return; }
  const sc=EN.sc;
  v.innerHTML = `
  <div class="talk">
    <section class="en-chat" aria-label="Hội thoại">
      <div class="chat-head"><div class="avatar">${esc(sc.name.slice(0,2))}</div><div style="min-width:0"><b>${esc(sc.name)}</b><div class="muted small">${esc(sc.unit)} · ${esc(sc.level)}</div></div>
        <button class="btn sm" id="endBtn" style="margin-left:auto">Kết thúc &amp; xem đánh giá</button></div>
      <div class="en-log" id="log" aria-live="polite"></div>
      <div class="en-composer">
        <div class="compose-row">
          <button class="mic ${EN.micState==='blocked'||EN.micState==='unsupported'?'blocked':''}" id="micBtn" aria-label="Nhấn để nói">${ico("mic")}</button>
          <input id="say" placeholder="Nhấn micro để nói, hoặc gõ câu trả lời bằng tiếng Anh…" autocomplete="off">
          <button class="btn primary" id="sendBtn" aria-label="Gửi">${ico("send")}</button>
        </div>
        <div class="compose-foot"><span id="micNote">${micNote()}</span>
          <span class="row" style="gap:6px"><button class="btn sm" id="hintBtn">${ico("bulb")}Gợi ý câu nói</button></span></div>
        <div id="hintBox" class="row" style="gap:6px" hidden></div>
      </div>
    </section>
    <aside class="side">
      <div class="card grid" style="gap:10px">
        <div class="eyebrow">Nhiệm vụ</div>
        <p class="small">${esc(sc.setting)}</p>
        <div class="grid" style="gap:6px" id="goals"></div>
      </div>
      <div class="card grid" style="gap:4px">
        <div class="eyebrow" style="margin-bottom:6px">Cài đặt</div>
        <label class="toggle">AI tự đọc câu trả lời<input type="checkbox" class="switch" id="tAuto" ${EN.autoSpeak?"checked":""}></label>
        <label class="toggle">Đọc chậm<input type="checkbox" class="switch" id="tSlow" ${EN.slow?"checked":""}></label>
        <label class="toggle">Hiện dịch tiếng Việt<input type="checkbox" class="switch" id="tVi" ${EN.showVi?"checked":""}></label>
      </div>
      <div class="card grid small" style="gap:6px">
        <div class="eyebrow">Quy tắc của lớp</div>
        <p class="muted">AI chỉ trò chuyện trong chủ đề này và không làm bài hộ. Giáo viên xem được tiến độ và lỗi thường gặp, không xem từng tin nhắn.</p>
      </div>
    </aside>
  </div>`;
  renderLog(); renderGoals();
  $("#sendBtn").onclick=()=>submitSay();
  $("#say").onkeydown=e=>{ if(e.key==="Enter"){ e.preventDefault(); submitSay(); } };
  $("#micBtn").onclick=toggleMic;
  $("#hintBtn").onclick=showHints;
  $("#endBtn").onclick=endSession;
  $("#tAuto").onchange=e=>EN.autoSpeak=e.target.checked;
  $("#tSlow").onchange=e=>EN.slow=e.target.checked;
  $("#tVi").onchange=e=>{EN.showVi=e.target.checked; if(EN.showVi) translateMissing(); renderLog();};
}
function micNote(){
  if (EN.micState==="ready") return "Nhấn micro, nói một câu, hệ thống tự gửi khi bạn dừng.";
  if (EN.micState==="blocked") return "Micro bị chặn trong khung xem này. Gõ câu trả lời, hoặc mở bản cài đặt trên Chrome để nói.";
  return "Trình duyệt này chưa hỗ trợ nhận giọng nói. Dùng Chrome hoặc Edge, hoặc gõ câu trả lời.";
}
function renderGoals(){
  const g=$("#goals"); if(!g) return;
  const turnsMe=EN.turns.filter(t=>t.role==="me").length;
  g.innerHTML = EN.sc.vocab.map(w=>`<div class="goal ${EN.hits.has(w.toLowerCase())?'en-done':''}"><span class="tick">${ico("check")}</span>Dùng “${esc(w)}”<button class="btn ghost sm" data-say="${esc(w)}" aria-label="Nghe từ ${esc(w)}">${ico("play")}</button></div>`).join("")
   + `<div class="goal ${turnsMe>=5?'en-done':''}"><span class="tick">${ico("check")}</span>Trả lời 5 lượt <span class="muted small num" style="margin-left:auto">${Math.min(turnsMe,5)}/5</span></div>`;
}
document.addEventListener("click", e=>{ const b=e.target.closest("[data-say]"); if(b) speak(b.dataset.say); });

function renderLog(typing=false){
  const log=$("#log"); if(!log) return;
  log.innerHTML = EN.turns.map((t,i)=>{
    if (t.role==="ai") return `<div class="en-msg en-ai"><div class="bubble">${esc(t.text)}</div>
      ${EN.showVi&&t.vi?`<div class="vi">${esc(t.vi)}</div>`:""}
      <div class="tools"><button data-say="${esc(t.text)}">${ico("play")}Nghe lại</button><button data-vi="${i}">${ico("translate")}Dịch</button></div></div>`;
    const f=t.fb;
    return `<div class="en-msg en-me"><div class="bubble">${esc(t.text)}</div>${t.mic?`<span class="muted small">${ico("mic")} nói${t.conf?` · rõ ${Math.round(t.conf*100)}%`:""}</span>`:""}${f?fbHTML(f):""}</div>`;
  }).join("") + (typing?`<div class="typing" aria-label="AI đang trả lời"><i></i><i></i><i></i></div>`:"");
  log.scrollTop=log.scrollHeight;
}
function fbHTML(f){
  const lbl={good:"Tốt lắm",fix:"Cần sửa",tip:"Gợi ý"}[f.status]||"Gợi ý";
  return `<div class="fb ${f.status}"><span class="lbl">${lbl}</span>
    ${f.corrected?`<div class="line"><b>Câu đúng:</b><span>${esc(f.corrected)}</span></div>`:""}
    ${f.better?`<div class="line"><b>Hay hơn:</b><span>${esc(f.better)}</span></div>`:""}
    ${f.explain_vi?`<div>${esc(f.explain_vi)}</div>`:""}</div>`;
}
document.addEventListener("click", async e=>{
  const b=e.target.closest("[data-vi]"); if(!b) return;
  const t=EN.turns[+b.dataset.vi]; if(!t) return;
  if(!t.vi){ b.disabled=true; t.vi = await translate(t.text); }
  EN.showVi=true; const tv=$("#tVi"); if(tv) tv.checked=true; renderLog();
});
async function translate(text){
  try{ const r=await askJSON(`Translate this English sentence into natural Vietnamese for a grade-11 student. Reply with only JSON {"vi": string}.\n\n${text}`); return r.vi||""; }
  catch(e){ return MOCK_VI[text] || "(Bản dịch sẽ hiển thị khi kết nối AI thật.)"; }
}
async function translateMissing(){ for (const t of EN.turns) if(t.role==="ai"&&!t.vi){ t.vi=await translate(t.text); renderLog(); } }

function toggleMic(){
  if (rec){ try{rec.stop()}catch(e){} return; }
  if (EN.micState!=="ready"){ toast(micNote()); $("#say").focus(); return; }
  try{speechSynthesis.cancel()}catch(e){}
  const btn=$("#micBtn"), input=$("#say");
  btn.classList.add("en-on"); input.placeholder="Đang nghe… hãy nói bằng tiếng Anh";
  rec = listen({
    onInterim: t => { input.value=t; },
    onDone: (text, confs, err) => {
      rec=null; btn.classList.remove("en-on"); input.placeholder="Nhấn micro để nói, hoặc gõ câu trả lời bằng tiếng Anh…";
      if (err && EN.micState==="blocked"){ btn.classList.add("blocked"); $("#micNote").textContent=micNote(); toast("Micro bị chặn. Bạn có thể gõ câu trả lời."); input.focus(); return; }
      if (text){ const c=confs.length?confs.reduce((a,b)=>a+b,0)/confs.length:0; submitSay(text, c||null); }
      else if (err==="no-speech") toast("Chưa nghe thấy giọng nói. Thử nói to và gần micro hơn.");
      else if (err) toast(`Không nhận được giọng nói (lỗi: ${err}). Thử lại hoặc gõ câu trả lời.`);
    }
  });
  if (!rec){ btn.classList.remove("en-on"); }
}

async function submitSay(forced, conf){
  if (EN.busy) return;
  const input=$("#say"); const text=(forced ?? input.value).trim();
  if (!text) { input.focus(); return; }
  input.value=""; $("#hintBox").hidden=true;
  const turn={role:"me",text,mic:forced!==undefined,conf:conf||null};
  if (turn.mic){ EN.usedMic=true; if(conf) EN.confs.push(conf); }
  EN.turns.push(turn); EN.busy=true; renderLog(true);
  let res;
  try { res = await askJSON(turnPrompt(text), "default"); if(!res||!res.reply) throw {code:"bad"}; }
  catch(e){ res = enMockTurn(text); }
  turn.fb = res.feedback && (res.feedback.corrected||res.feedback.better||res.feedback.explain_vi) ? res.feedback : null;
  (res.goals_hit||[]).forEach(w=>EN.hits.add(String(w).toLowerCase()));
  EN.sc.vocab.forEach(w=>{ if(new RegExp("\\b"+w.replace(/\s+/g,"\\s+")+"\\b","i").test(text)) EN.hits.add(w.toLowerCase()); });
  if (turn.fb) EN.fbs.push({said:text,...turn.fb});
  EN.turns.push({role:"ai",text:res.reply,vi:null});
  EN.busy=false; renderLog(); renderGoals();
  if (EN.showVi) translateMissing();
  if (EN.autoSpeak) speak(res.reply);
}
function transcript(){ return EN.turns.map(t=>(t.role==="ai"?EN.sc.name:"Student")+": "+t.text).join("\n"); }
function turnPrompt(last){
  const sc=EN.sc;
  return `You are role-playing as ${sc.persona} in an English speaking-practice app for Vietnamese high-school students (grade ${sc.grade}, CEFR ${sc.level}).
Scenario: ${sc.setting}
Target vocabulary the student should try to use: ${sc.vocab.join(", ")}.
Classroom rules: ${sc.free ? "keep the chat friendly, natural and age-appropriate; if it stalls, naturally bring up a new everyday topic" : "talk only about this scenario"}. If the student goes off-topic into games/social media, asks you to do homework, or writes in Vietnamese, gently steer back in simple English. Never write the student's answers for them.

Conversation so far:
${transcript()}

Do two things:
1. Write ${sc.name}'s next line: 1-2 short sentences (max 30 words), simple ${sc.level} English, warm and encouraging, usually ending with one question. Sound like a real native speaker having a casual spoken conversation, not a textbook: use natural reactions and connectors sometimes ("Oh nice!", "Really?", "That's cool.", "Hmm, I see.", "Oh, I didn't know that!"), vary how you start each line (don't repeat the same opener every turn), use contractions (I'm, that's, didn't), and keep it conversational and warm rather than formal or robotic.
2. Evaluate ONLY the student's last message: "${last}". It may come from speech recognition, so ignore missing punctuation and capitalisation.

Reply with only JSON:
{"reply": string, "feedback": {"status": "good" | "fix" | "tip", "corrected": string (the student's sentence with grammar/word errors fixed, or "" if it was correct), "better": string (a more natural or richer version, max 25 words, or ""), "explain_vi": string (one short, kind sentence in Vietnamese explaining the main point)}, "goals_hit": [target words the student used correctly in that message], "off_topic": boolean}`;
}

/* ---- simulated AI (works without network or Claude) ---- */
const MOCK_VI = {};
const IRREG={go:"went",see:"saw",eat:"ate",make:"made",buy:"bought",have:"had",take:"took",do:"did",get:"got",come:"came",swim:"swam"};
const RULES=[
  {re:/\bi am agree\b/i, fix:t=>t.replace(/\bi am agree\b/i,"I agree"), vi:"Agree là động từ, không dùng “am” trước nó."},
  {re:/\bvery like\b/i, fix:t=>t.replace(/\bvery like\b/i,"really like"), vi:"Nói “really like” hoặc “like … very much”, không nói “very like”."},
  {re:/\b(he|she|it|my (?:mother|father|mom|dad|friend|sister|brother|teacher))\s+(go|do|have|like|play|make|live|work|want|watch|study|help|need|feel)\b/i,
   fix:t=>t.replace(/\b(he|she|it|my (?:mother|father|mom|dad|friend|sister|brother|teacher))\s+(go|do|have|like|play|make|live|work|want|watch|study|help|need|feel)\b/i,(m,s,v)=>s+" "+({go:"goes",do:"does",have:"has",watch:"watches",study:"studies"}[v.toLowerCase()]||v+"s")),
   vi:"Chủ ngữ ngôi thứ ba số ít thì động từ thêm -s/-es."},
  {re:/\b(yesterday|last (?:week|year|summer|month|weekend)|ago)\b/i, test:t=>/\b(go|visit|see|eat|play|make|buy|have|take|do|get|come|swim|watch|travel)\b/i.test(t),
   fix:t=>t.replace(/\b(go|visit|see|eat|play|make|buy|have|take|do|get|come|swim|watch|travel)\b/gi,v=>IRREG[v.toLowerCase()]||(v.toLowerCase()==="travel"?"travelled":v+"ed")),
   vi:"Có mốc thời gian quá khứ nên dùng thì quá khứ đơn."},
  {re:/\bpeoples\b/i, fix:t=>t.replace(/\bpeoples\b/i,"people"), vi:"“People” đã là số nhiều, không thêm -s."},
  {re:/\bdon't has\b|\bdoesn't has\b/i, fix:t=>t.replace(/\b(don't|doesn't) has\b/i,"$1 have"), vi:"Sau don't/doesn't dùng động từ nguyên mẫu “have”."}
];
const OFFTOPIC=/(game|tiktok|facebook|youtube|bóng đá|football match|làm hộ|giải hộ|do my homework|answer key|đáp án)/i;
function nextLine(sc, aiCount){
  if (!sc.script) return FREE_FOLLOWUPS[Math.max(0,aiCount-1) % FREE_FOLLOWUPS.length];
  return aiCount-1 < sc.script.length ? sc.script[aiCount-1] : "That was a great conversation! Tap “Kết thúc & xem đánh giá” to see your feedback.";
}
function enMockTurn(text){
  const sc=EN.sc; const aiCount=EN.turns.filter(t=>t.role==="ai").length;
  if (OFFTOPIC.test(text)) return {reply:`That sounds fun, but let's keep practising our English conversation. ${nextLine(sc,aiCount)}`, feedback:{status:"tip",corrected:"",better:"",explain_vi:"AI chỉ luyện nói tiếng Anh và không làm bài hộ. Quay lại luyện nói nhé!"}, goals_hit:[], off_topic:true};
  if (/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(text)) return {reply:"Can you try saying that in English? Short sentences are fine!", feedback:{status:"tip",corrected:"",better:"",explain_vi:"Hãy thử nói bằng tiếng Anh, câu ngắn cũng được. Bấm “Gợi ý câu nói” nếu cần."}, goals_hit:[]};
  let corrected=text, notes=[];
  for (const r of RULES){ if (r.re.test(corrected) && (!r.test||r.test(corrected))){ corrected=r.fix(corrected); notes.push(r.vi); } }
  if (/^i\b/.test(corrected)) corrected="I"+corrected.slice(1);
  corrected=corrected.replace(/\bi\b/g,"I");
  const words=text.split(/\s+/).filter(Boolean).length;
  let fb;
  if (notes.length) fb={status:"fix",corrected,better:"",explain_vi:notes[0]};
  else if (words<6) fb={status:"tip",corrected:"",better:"",explain_vi:"Câu đúng rồi. Thử nói dài hơn: thêm lý do với “because…” hoặc một ví dụ."};
  else fb={status:"good",corrected:"",better:"",explain_vi:"Câu rõ ý và đúng ngữ pháp. Tiếp tục nhé!"};
  const reply = nextLine(sc, aiCount);
  return {reply, feedback:fb, goals_hit:[]};
}

async function showHints(){
  const box=$("#hintBox"); box.hidden=false; box.innerHTML=`<span class="muted small">Đang tìm gợi ý…</span>`;
  let hints;
  try{ const r=await askJSON(`A Vietnamese grade-${EN.sc.grade} student (CEFR ${EN.sc.level}) is practising English speaking. Scenario: ${EN.sc.setting}\n\nConversation:\n${transcript()}\n\nSuggest 2 short, different example answers (max 14 words each) the student could say next, using simple English and, if natural, one of: ${EN.sc.vocab.join(", ")}. Reply with only JSON {"hints": [string, string]}.`); hints=r.hints; }
  catch(e){ hints=EN.sc.hints; }
  box.innerHTML = `<span class="muted small">Bấm để nghe, rồi tự nói lại bằng lời của em:</span>` + (hints||[]).map(h=>`<button class="btn sm" data-say="${esc(h)}">${ico("play")}${esc(h)}</button>`).join("");
}

/* ================= REPORT ================= */
async function endSession(){
  const mine=EN.turns.filter(t=>t.role==="me");
  if (!mine.length){ toast("Hãy nói ít nhất một câu trước khi kết thúc."); return; }
  try{speechSynthesis.cancel()}catch(e){}
  EN.report={loading:true}; enGo("report");
  let r;
  try{
    r=await askJSON(`You are an English speaking examiner for Vietnamese grade-${EN.sc.grade} students (CEFR target ${EN.sc.level}). Assess the STUDENT's turns in this role-play (speech-recognised text: ignore punctuation/capitalisation).\nScenario: ${EN.sc.setting}\nTarget vocabulary: ${EN.sc.vocab.join(", ")}\n\n${transcript()}\n\nReply with only JSON: {"fluency": 0-10, "grammar": 0-10, "vocabulary": 0-10, "task": 0-10, "cefr": "A1"|"A2"|"B1"|"B2", "strengths": [2 short Vietnamese sentences], "improve": [2 short Vietnamese sentences], "next_vi": "one Vietnamese sentence recommending what to practise next"}. Use one decimal place for scores.`, "default");
    if (typeof r.grammar!=="number") throw {};
  }catch(e){ r=mockReport(); }
  r.pron = EN.confs.length ? Math.round((EN.confs.reduce((a,b)=>a+b,0)/EN.confs.length)*100)/10 : null;
  EN.report=r;
  const overall=avg([r.fluency,r.grammar,r.vocabulary,r.task,r.pron].filter(x=>typeof x==="number"));
  EN.history.unshift({title:EN.sc.title,when:"Hôm nay",score:overall});
  if (EN.view==="report") rReport();
}
const avg=a=>Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10;
function mockReport(){
  const mine=EN.turns.filter(t=>t.role==="me"); const wpt=mine.reduce((a,t)=>a+t.text.split(/\s+/).length,0)/mine.length;
  const fixes=EN.fbs.filter(f=>f.status==="fix").length;
  const clamp=x=>Math.max(3,Math.min(9.5,Math.round(x*10)/10));
  return {fluency:clamp(4+wpt/2.2), grammar:clamp(9-fixes*1.2-(wpt<5?1:0)), vocabulary:clamp(5+EN.hits.size*1.3), task:clamp(4+Math.min(mine.length,5)),
    cefr: wpt>9?"B1":"A2",
    strengths:["Em giữ được mạch hội thoại và trả lời đúng câu hỏi.", EN.hits.size?`Đã dùng được từ mục tiêu: ${[...EN.hits].join(", ")}.`:"Em mạnh dạn nói và không bỏ lượt nào."],
    improve:[fixes?"Chú ý chia động từ: ngôi thứ ba thêm -s, có mốc quá khứ thì dùng quá khứ đơn.":"Thử nối hai ý bằng “and”, “but”, “because” để câu dài và tự nhiên hơn.", EN.hits.size<EN.sc.vocab.length?`Lần sau cố gắng dùng thêm: ${EN.sc.vocab.filter(v=>!EN.hits.has(v.toLowerCase())).join(", ")}.`:"Mở rộng câu trả lời với một ví dụ cụ thể của bản thân."],
    next_vi:"Luyện lại chủ đề này một lần nữa, rồi chuyển sang “Phỏng vấn tuyển sinh đại học”.", simulated:true};
}
function rReport(){
  const v=$("#enRoot"); const r=EN.report;
  if (!r){ v.innerHTML=`<div class="card lock"><div class="en-big" style="background:var(--brand-soft);color:var(--brand)">${ico("chart")}</div><h2>Chưa có buổi luyện nào hôm nay</h2><p class="muted">Kết thúc một buổi hội thoại để xem đánh giá chi tiết.</p><button class="btn primary" data-start="${EN.assigned.topic}">Bắt đầu bài cô giao</button></div>`; return; }
  if (r.loading){ v.innerHTML=`<div class="card lock"><div class="typing"><i></i><i></i><i></i></div><h2>AI đang chấm buổi nói của em…</h2><p class="muted">Thường mất 10–30 giây.</p></div>`; return; }
  const items=[["Trôi chảy",r.fluency],["Ngữ pháp",r.grammar],["Từ vựng",r.vocabulary],["Hoàn thành nhiệm vụ",r.task],["Phát âm",r.pron]];
  const overall=avg(items.map(i=>i[1]).filter(x=>typeof x==="number"));
  const mine=EN.turns.filter(t=>t.role==="me");
  v.innerHTML=`
  <div class="card report-head">
    <div class="ring" style="--v:${overall*10}"><div><b class="num">${overall.toFixed(1)}</b><span class="muted small">/10</span></div></div>
    <div class="grid" style="gap:8px">
      <div class="eyebrow">${esc(EN.sc.unit)}</div><h2>${esc(EN.sc.title)}</h2>
      <div class="row"><span class="chip brand">Trình độ ước tính ${esc(r.cefr||"A2")}</span><span class="chip">${mine.length} lượt nói</span><span class="chip">${EN.hits.size}/${EN.sc.vocab.length} từ mục tiêu</span>${r.simulated?'<span class="chip warn">Chấm mô phỏng</span>':'<span class="chip good">Chấm bởi AI</span>'}</div>
      <p class="muted small">${esc(r.next_vi||"")}</p>
    </div>
  </div>
  <div class="card"><div class="scores">${items.map(([k,x])=>`<div class="score"><div class="row between"><span>${k}</span><b class="num">${typeof x==="number"?x.toFixed(1):"—"}</b></div><div class="meter"><i style="width:${typeof x==="number"?x*10:0}%"></i></div>${k==="Phát âm"&&typeof x!=="number"?'<span class="muted small">Cần nói bằng micro để chấm phát âm</span>':""}</div>`).join("")}</div></div>
  <div class="en-two">
    <div class="card grid" style="gap:10px"><h3>Em làm tốt</h3><ul class="clean">${(r.strengths||[]).map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div>
    <div class="card grid" style="gap:10px"><h3>Cần cải thiện</h3><ul class="clean">${(r.improve||[]).map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div>
  </div>
  <div class="card grid" style="gap:12px">
    <div class="row between"><h3>Sổ tay lỗi của buổi này</h3><span class="muted small">Tự động lưu để ôn lại</span></div>
    <div class="fixlist">${EN.fbs.filter(f=>f.corrected||f.better).map(f=>`<div class="fixitem"><div><s>${esc(f.said)}</s></div><div><ins>${esc(f.corrected||f.better)}</ins></div><div class="muted small">${esc(f.explain_vi)}</div></div>`).join("") || '<p class="muted">Không có lỗi cần sửa trong buổi này.</p>'}</div>
  </div>
  <div class="row"><button class="btn primary" data-start="${EN.sc.id}">${ico("mic")}Luyện lại chủ đề này</button><button class="btn" data-engo="pron">${ico("wave")}Luyện phát âm</button><button class="btn" data-engo="home">Về trang chủ</button></div>`;
}

/* ================= PRONUNCIATION ================= */
let prec=null;
const norm=s=>s.toLowerCase().replace(/[^a-z' ]/g," ").split(/\s+/).filter(Boolean);
function rPron(){
  const p=PRON[EN.pronIdx]; const res=EN.pronResult&&EN.pronResult.idx===EN.pronIdx?EN.pronResult:null;
  const heard=res?new Set(norm(res.heard)):null;
  const words=p.t.split(/\s+/);
  const hits=heard?words.filter(w=>heard.has(norm(w)[0])).length:0;
  $("#enRoot").innerHTML=`
  <div class="pron">
    <div class="plist">${PRON.map((x,i)=>`<button data-pi="${i}" aria-current="${i===EN.pronIdx}"><b class="small">${esc(x.focus)}</b><span class="small muted">${esc(x.t)}</span></button>`).join("")}</div>
    <div class="card grid" style="gap:18px">
      <div class="row between"><span class="chip brand">${esc(p.focus)}</span>${res&&res.example?'<span class="sample-tag">Ví dụ kết quả</span>':""}</div>
      <div class="target">${words.map(w=>`<span class="${heard?(heard.has(norm(w)[0])?"hit":"miss"):""}">${esc(w)}</span>`).join("")}</div>
      <div class="ipa">${esc(p.ipa)}</div>
      <div class="row">
        <button class="btn" data-say="${esc(p.t)}">${ico("play")}Nghe mẫu</button>
        <button class="btn accent" id="pRec">${ico("mic")}Nhấn để đọc</button>
        <span class="muted small" id="pNote">${EN.micState==="ready"?"":esc(micNote())}</span>
      </div>
      ${res?`<div class="card" style="background:var(--sunk);border:0;display:grid;gap:6px">
        <div class="row between"><b>Máy nghe được</b><span class="chip ${hits/words.length>=.8?'good':'warn'} num">${hits}/${words.length} từ rõ</span></div>
        <p>“${esc(res.heard)}”</p>
        <p class="muted small">${hits===words.length?"Rất tốt! Tất cả các từ đều được nhận ra.":"Các từ gạch đỏ chưa được nhận ra, thường do thiếu âm cuối. Nghe mẫu ở tốc độ chậm rồi đọc lại."}</p></div>`:""}
      <p class="muted small">Bản MVP chấm theo mức độ máy nhận ra từng từ. Bản chính thức sẽ dùng API chấm phát âm theo âm vị (phoneme) để chỉ ra âm sai cụ thể.</p>
    </div>
  </div>`;
  $("#pRec").onclick=()=>{
    if (prec){ try{prec.stop()}catch(e){} return; }
    if (EN.micState!=="ready"){ toast(micNote()); return; }
    const b=$("#pRec"); b.textContent="Đang nghe… nhấn để dừng";
    prec=listen({onInterim:()=>{}, onDone:(t,c,err)=>{ prec=null; if(t){ EN.pronResult={idx:EN.pronIdx,heard:t}; } else if(err) toast(EN.micState==="blocked"?micNote():"Chưa nghe rõ, thử lại nhé."); rPron(); }});
  };
}
document.addEventListener("click", e=>{ const b=e.target.closest("[data-pi]"); if(!b) return; EN.pronIdx=+b.dataset.pi; rPron(); });


/* Tập trung giao diện vào 2 việc chính: luyện nói với AI (gồm chọn chế độ/kịch bản, hội thoại và kết quả) và luyện phát âm. */
const EN_TABS=[["home","Luyện nói với AI"],["pron","Phát âm"]];
const tabOf = v => (v==="talk"||v==="report") ? "home" : v;
function enChips(){ const n=document.getElementById("enMic"); if(n) n.innerHTML=EN.micState==="ready"?'<span class="chip good"><span class="dot"></span>Micro sẵn sàng</span>':EN.micState==="blocked"?'<span class="chip bad"><span class="dot"></span>Micro bị chặn · gõ thay thế</span>':'<span class="chip bad"><span class="dot"></span>Trình duyệt chưa hỗ trợ micro</span>'; }
async function askJSON(prompt, tier="quick"){ return aiJSON(prompt, { tier }); }
function enGo(v){ EN.view=v; const r=document.getElementById("enRoot"); if(!r) return; document.querySelectorAll("[data-engo]").forEach(b=>{ if(b.closest(".en-tabs")) b.setAttribute("aria-selected", b.dataset.engo===tabOf(v)); }); ({home:rHome,talk:rTalk,report:rReport,pron:rPron})[v](); enChips(); }
VIEWS.english = v => { v.innerHTML = `<div class="row between"><div class="tabs en-tabs" role="tablist" style="border:0">${EN_TABS.map(([k,n])=>`<button role="tab" data-engo="${k}" aria-selected="${tabOf(EN.view||"home")===k}">${n}</button>`).join("")}</div><span id="enMic"></span></div><div id="enRoot" class="en grid" style="gap:20px"></div>`; enGo(EN.view||"home"); };
TITLES.english = "Tiếng Anh · Speak Up";
document.addEventListener("click", e=>{ const b=e.target.closest("[data-engo]"); if(b){ e.preventDefault(); enGo(b.dataset.engo); } });

