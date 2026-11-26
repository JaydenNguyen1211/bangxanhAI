// Tản Đà AI – máy chủ nhỏ, không cần cài thư viện (Node 18+).
//   node server.js   → mở http://localhost:3000
// Nhiệm vụ: phục vụ giao diện trong /public và làm "gateway" gọi Claude API:
// giữ API key, chọn model theo tác vụ, giới hạn lượt gọi, chặn nội dung không phù hợp, ghi log tổng hợp.
const http = require("http");
const fs = require("fs");
const path = require("path");
try { if (fs.existsSync(path.join(__dirname, ".env"))) process.loadEnvFile(path.join(__dirname, ".env")); } catch (e) { console.error("Không đọc được .env:", e.message); }
const CFG = require("./config");

const PUBLIC = path.join(__dirname, "public");
const MIME = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".svg":"image/svg+xml", ".png":"image/png", ".ico":"image/x-icon", ".json":"application/json" };

/* ---------------- gateway: giới hạn lượt gọi + lọc nội dung ---------------- */
const hits = new Map();
function rateLimited(ip){
  const now = Date.now(), w = CFG.RATE_LIMIT.windowSec*1000;
  const arr = (hits.get(ip) || []).filter(t => now - t < w); arr.push(now); hits.set(ip, arr);
  return arr.length > CFG.RATE_LIMIT.maxRequests;
}
const BLOCK = /(bạo lực|vũ khí|chế tạo bom|cờ bạc|cá độ|ma túy|18\+|khiêu dâm)/i;
const usage = { calls: 0, byTier: {}, blocked: 0, since: new Date().toISOString() };

function clip(s, n){ return String(s == null ? "" : s).slice(0, n); }

/* ---------------- /api/homework: giao bài về nhà + học sinh nộp bài (lưu tạm trong bộ nhớ máy chủ) ---------------- */
// Dữ liệu mẫu để xem ngay giao diện: 1 bài đã giao cho lớp 11A1, đã có bài nộp của học sinh demo (HS26-0915) kèm AI đã chấm sẵn.
const homework = [
  { id: "hw1", title: "Viết đoạn văn ngắn giới thiệu gia đình em – Unit 1 (80–100 từ)",
    subj: "Tiếng Anh", cls: "11A1",
    desc: "Viết đoạn văn tiếng Anh 80–100 từ giới thiệu về gia đình em, dùng ít nhất 3 từ vựng đã học ở Unit 1 (family members, personality adjectives…).",
    due: "Thứ Sáu 14/11", teacherCode: "GV-0042", teacherName: "Cô Trần Thu Hạnh",
    createdAt: new Date(Date.now() - 2*24*3600e3).toISOString(),
    subs: [
      { id: "sub1", studentCode: "HS26-0915", studentName: "Nguyễn Minh Anh",
        content: "My family have four people: my father, my mother, my brother and me. My father is a doctor, he is very kind and hard-working. My mother is a teacher, she cook very well. My brother is 10 years old, he like playing football. I love my family so much because they always support me.",
        submittedAt: new Date(Date.now() - 1*24*3600e3).toISOString(),
        ai: { score: 7.5, max: 10, fb: "Đoạn văn đủ ý, đúng chủ đề, dùng được từ vựng về gia đình. Cần sửa vài lỗi chia động từ số ít.",
              strengths: ["Đủ bố cục giới thiệu từng thành viên", "Dùng được tính từ miêu tả tính cách (kind, hard-working)"],
              issues: ["Lỗi chia động từ: 'My family have' → 'has'; 'she cook' → 'cooks'; 'he like' → 'likes'", "Nên thêm câu kết nối ý mượt hơn giữa các thành viên"] },
        teacherScore: null, teacherNote: "", state: "ai_reviewed" }
    ] }
];
let hwSeq = 2, hwSubSeq = 2;
async function handleHomework(req, res, body){
  const u = new URL(req.url, "http://x");
  if (req.method === "GET" && u.pathname === "/api/homework") return json(res, 200, { homework });
  if (req.method === "POST" && u.pathname === "/api/homework"){
    let p; try { p = JSON.parse(body); } catch { return json(res, 400, { error: "bad_request" }); }
    const h = { id: "hw" + (hwSeq++), title: clip(p.title, 200) || "Bài tập về nhà", subj: clip(p.subj, 40),
      cls: clip(p.cls, 10), desc: clip(p.desc, 4000), due: clip(p.due, 40),
      teacherCode: clip(p.teacherCode, 20), teacherName: clip(p.teacherName, 80),
      createdAt: new Date().toISOString(), subs: [] };
    homework.unshift(h);
    return json(res, 200, { ok: true, homework: h });
  }
  const sub = u.pathname.match(/^\/api\/homework\/([^/]+)\/submit$/);
  if (req.method === "POST" && sub){
    const h = homework.find(x => x.id === sub[1]); if (!h) return json(res, 404, { error: "not_found" });
    let p; try { p = JSON.parse(body); } catch { return json(res, 400, { error: "bad_request" }); }
    const s = { id: "sub" + (hwSubSeq++), studentCode: clip(p.studentCode, 20), studentName: clip(p.studentName, 80),
      content: clip(p.content, 20000), submittedAt: new Date().toISOString(), ai: null,
      teacherScore: null, teacherNote: "", state: "pending" };
    h.subs = h.subs.filter(x => x.studentCode !== s.studentCode);   // nộp lại thì thay bài cũ
    h.subs.unshift(s);
    return json(res, 200, { ok: true, submission: s });
  }
  const rev = u.pathname.match(/^\/api\/homework\/([^/]+)\/submissions\/([^/]+)\/review$/);
  if (req.method === "POST" && rev){
    const h = homework.find(x => x.id === rev[1]); const s = h && h.subs.find(x => x.id === rev[2]);
    if (!s) return json(res, 404, { error: "not_found" });
    let p; try { p = JSON.parse(body); } catch { return json(res, 400, { error: "bad_request" }); }
    s.ai = { score: Math.max(0, Math.min(10, +p.score || 0)), max: 10, fb: clip(p.fb, 1000),
      strengths: Array.isArray(p.strengths) ? p.strengths.slice(0, 5).map(x => clip(x, 200)) : [],
      issues: Array.isArray(p.issues) ? p.issues.slice(0, 5).map(x => clip(x, 200)) : [], mock: !!p.mock };
    s.state = "ai_reviewed";
    return json(res, 200, { ok: true, submission: s });
  }
  const dec2 = u.pathname.match(/^\/api\/homework\/([^/]+)\/submissions\/([^/]+)\/decide$/);
  if (req.method === "POST" && dec2){
    const h = homework.find(x => x.id === dec2[1]); const s = h && h.subs.find(x => x.id === dec2[2]);
    if (!s) return json(res, 404, { error: "not_found" });
    let p; try { p = JSON.parse(body); } catch { return json(res, 400, { error: "bad_request" }); }
    s.teacherScore = Math.max(0, Math.min(10, +p.teacherScore || 0)); s.teacherNote = clip(p.teacherNote, 1000); s.state = "approved";
    return json(res, 200, { ok: true, submission: s });
  }
  res.writeHead(404); res.end();
}

/* ---------------- /api/senddoc: gửi tài liệu/slide/đề cho một giáo viên khác (lưu tạm trong bộ nhớ máy chủ) ---------------- */
const sentDocs = [];
let sentSeq = 1;
async function handleSendDoc(req, res, body){
  const u = new URL(req.url, "http://x");
  if (req.method === "GET" && u.pathname === "/api/senddoc"){
    const to = u.searchParams.get("to");
    const list = to ? sentDocs.filter(d => d.toCode === to) : [];
    return json(res, 200, { docs: list });
  }
  if (req.method === "POST" && u.pathname === "/api/senddoc"){
    let p; try { p = JSON.parse(body); } catch { return json(res, 400, { error: "bad_request" }); }
    if (!p.toCode || !p.kind || !p.title || p.content == null) return json(res, 400, { error: "bad_request" });
    const d = { id: "sd" + (sentSeq++), kind: clip(p.kind, 10), title: clip(p.title, 200), content: p.content,
      theme: p.theme ? clip(p.theme, 20) : null, history: Array.isArray(p.history) ? p.history : [],
      fromCode: clip(p.fromCode, 20), fromName: clip(p.fromName, 80),
      toCode: clip(p.toCode, 20), sentAt: new Date().toISOString(), read: false };
    sentDocs.unshift(d);
    return json(res, 200, { ok: true, doc: d });
  }
  const rd = u.pathname.match(/^\/api\/senddoc\/([^/]+)\/read$/);
  if (req.method === "POST" && rd){
    const d = sentDocs.find(x => x.id === rd[1]); if (!d) return json(res, 404, { error: "not_found" });
    d.read = true; return json(res, 200, { ok: true });
  }
  res.writeHead(404); res.end();
}

function lastUserText(messages){
  const m = [...(messages||[])].reverse().find(x => x.role === "user");
  if (!m) return "";
  return typeof m.content === "string" ? m.content : (m.content||[]).filter(c => c.type === "text").map(c => c.text).join("\n");
}
function cleanMessages(msgs){
  // Claude API: bắt đầu bằng user, gộp các lượt liên tiếp cùng vai trò
  const out = [];
  for (const m of msgs || []){
    if (!m || !m.content || !["user","assistant"].includes(m.role)) continue;
    const content = typeof m.content === "string" ? [{ type:"text", text:m.content }] : m.content;
    const last = out[out.length-1];
    if (last && last.role === m.role) last.content.push(...content); else out.push({ role:m.role, content:[...content] });
  }
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}

/* ---------------- /api/claude: gọi Claude, trả về chữ theo luồng ---------------- */
async function handleClaude(req, res, body){
  if (!CFG.ANTHROPIC_API_KEY) return json(res, 503, { error:"missing_key", message:"Chưa có API key trong config.js. Ứng dụng dùng chế độ AI mô phỏng." });
  const ip = req.socket.remoteAddress || "local";
  if (rateLimited(ip)) return json(res, 429, { error:"rate_limited", message:"Quá nhiều yêu cầu, thử lại sau ít phút." });
  let p; try { p = JSON.parse(body); } catch { return json(res, 400, { error:"bad_request" }); }
  const tier = CFG.MODELS[p.tier] ? p.tier : "default";
  const messages = cleanMessages(p.messages);
  if (!messages.length) return json(res, 400, { error:"bad_request", message:"Thiếu nội dung." });
  if (BLOCK.test(lastUserText(messages))) { usage.blocked++; return json(res, 451, { error:"blocked", message:"Nội dung không phù hợp môi trường học đường." }); }

  const system = [
    "Bạn là trợ lý AI của Trường THPT Tản Đà (Việt Nam), phục vụ giáo viên và học sinh.",
    "Chỉ hỗ trợ việc dạy, học và công việc nhà trường. Kiến thức chính xác theo Chương trình GDPT 2018. Trả lời bằng tiếng Việt trừ khi được yêu cầu khác. Không dùng LaTeX; dùng kí hiệu Unicode (², ³, −, ·).",
    p.role === "student" ? "Người dùng là HỌC SINH: không làm bài hộ, không đưa đáp án bài kiểm tra; gợi mở để học sinh tự làm; nội dung phù hợp lứa tuổi." : "",
    p.system || ""
  ].filter(Boolean).join("\n\n");

  const think = CFG.THINKING && CFG.THINKING[tier];
  const outTokens = Math.min(+p.max_tokens || CFG.MAX_TOKENS[tier], CFG.MAX_TOKENS[tier]);
  const reqBody = { model:CFG.MODELS[tier], max_tokens: think ? outTokens + (CFG.THINKING_HEADROOM||0) : outTokens, system, messages, stream:true };
  if (think) {
    reqBody.thinking = think;   // {type:"adaptive", display:"summarized"} — không set temperature/top_p/top_k (bị 400 khi khác mặc định)
    reqBody.output_config = { effort: (CFG.THINKING_EFFORT && CFG.THINKING_EFFORT[tier]) || "high" };
  }

  const upstream = await fetch(CFG.ANTHROPIC_URL.replace(/\/$/,"") + "/v1/messages", {
    method: "POST",
    headers: { "content-type":"application/json", "x-api-key":CFG.ANTHROPIC_API_KEY, "anthropic-version":CFG.ANTHROPIC_VERSION },
    body: JSON.stringify(reqBody)
  }).catch(e => ({ ok:false, status:502, text: async () => String(e) }));

  if (!upstream.ok){
    const t = await upstream.text();
    let msg = t; try { msg = JSON.parse(t).error.message; } catch {}
    console.error("[claude]", upstream.status, msg.slice(0,300));
    return json(res, upstream.status === 401 ? 401 : 502, { error: upstream.status === 401 ? "bad_key" : "upstream_error", message: msg.slice(0,300) });
  }
  usage.calls++; usage.byTier[tier] = (usage.byTier[tier]||0) + 1;
  res.writeHead(200, { "content-type":"text/plain; charset=utf-8", "cache-control":"no-cache", "x-model":CFG.MODELS[tier] });

  // Chuyển luồng SSE của Claude thành luồng chữ thuần cho trình duyệt.
  // Nội dung "suy nghĩ mở rộng" (thinking) được bọc trong <<<THINKING>>>...<<<ENDTHINKING>>> để phía
  // trình duyệt tách riêng khỏi câu trả lời chính (xem agent.js: splitThinking).
  const dec = new TextDecoder(); let buf = ""; const blockType = {};
  try {
    for await (const chunk of upstream.body){
      buf += dec.decode(chunk, { stream:true });
      let i;
      while ((i = buf.indexOf("\n\n")) >= 0){
        const evt = buf.slice(0, i); buf = buf.slice(i + 2);
        const line = evt.split("\n").find(l => l.startsWith("data:"));
        if (!line) continue;
        let d; try { d = JSON.parse(line.slice(5).trim()); } catch { continue; }
        if (d.type === "content_block_start" && d.content_block){
          blockType[d.index] = d.content_block.type;
          if (d.content_block.type === "thinking") res.write("<<<THINKING>>>");
          else if (d.content_block.type === "redacted_thinking") res.write("<<<THINKING>>>[Một phần suy nghĩ bị ẩn theo chính sách an toàn]<<<ENDTHINKING>>>");
        }
        else if (d.type === "content_block_delta" && d.delta){
          if (d.delta.type === "text_delta") res.write(d.delta.text);
          else if (d.delta.type === "thinking_delta") res.write(d.delta.thinking);
        }
        else if (d.type === "content_block_stop"){
          if (blockType[d.index] === "thinking") res.write("<<<ENDTHINKING>>>");
        }
        else if (d.type === "error") res.write("\n[Lỗi AI: " + ((d.error && d.error.message) || "không rõ") + "]");
      }
    }
  } catch (e) { res.write("\n[Kết nối AI bị gián đoạn]"); }
  res.end();
}

/* ---------------- tiện ích ---------------- */
function json(res, code, obj){ res.writeHead(code, { "content-type":"application/json; charset=utf-8" }); res.end(JSON.stringify(obj)); }
function readBody(req){ return new Promise((ok, fail) => { let n = 0; const parts = []; req.on("data", c => { n += c.length; if (n > CFG.MAX_BODY_BYTES){ fail(new Error("too_large")); req.destroy(); } else parts.push(c); }); req.on("end", () => ok(Buffer.concat(parts).toString("utf8"))); req.on("error", fail); }); }
function serveStatic(req, res){
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p === "/") p = "/index.html";
  const file = path.normalize(path.join(PUBLIC, p));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { fs.readFile(path.join(PUBLIC, "index.html"), (e2, d2) => { if (e2){ res.writeHead(404); return res.end("Not found"); } res.writeHead(200, { "content-type":MIME[".html"], "cache-control":"no-store" }); res.end(d2); }); return; }
    res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream", "cache-control":"no-store" }); res.end(data);
  });
}

http.createServer(async (req, res) => {
  try {
    if (req.url === "/api/health") return json(res, 200, { ai: !!CFG.ANTHROPIC_API_KEY, models: CFG.MODELS, maxTokens: CFG.MAX_TOKENS, rateLimit: CFG.RATE_LIMIT });
    if (req.url === "/api/usage") return json(res, 200, usage);
    if (req.url.startsWith("/api/homework")) return handleHomework(req, res, req.method === "POST" ? await readBody(req) : "");
    if (req.url.startsWith("/api/senddoc")) return handleSendDoc(req, res, req.method === "POST" ? await readBody(req) : "");
    if (req.url === "/api/claude" && req.method === "POST") return handleClaude(req, res, await readBody(req));
    if (req.method === "GET") return serveStatic(req, res);
    res.writeHead(405); res.end();
  } catch (e) { console.error(e); if (!res.headersSent) json(res, 500, { error:"server_error" }); else res.end(); }
}).listen(CFG.PORT, () => {
  console.log(`Tản Đà AI đang chạy: http://localhost:${CFG.PORT}`);
  console.log(CFG.ANTHROPIC_API_KEY ? "Claude API: đã có key, dùng AI thật." : "Claude API: chưa có key trong config.js → chế độ AI mô phỏng.");
});
