/* Tản Đà AI · admin.js — mã nguồn, sửa trực tiếp */
import { createLeave } from "./agent.js";
import { aiJSON, getHealth } from "./ai.js";
import { bars } from "./content.js";
import { $, $$, S, TITLES, VIEWS, can, esc, ico, loading, toast } from "./core.js";
import { STAFF_LIST } from "./data.js";
import { classifyLocal, decide } from "./gateway.js";

Object.assign(TITLES, {
  "a-dash": "Báo cáo sử dụng AI",
  "a-policy": "Chính sách sử dụng AI",
  "a-classify": "Thử phân loại nội dung",
  "a-quota": "Model & hạn mức",
  "a-leave": "Xin nghỉ & dạy thay",
  "a-profile": "Tài liệu tổ",
  "a-flows": "Quy trình nhiều bước"
});

function guard(v) {
  v.innerHTML = `<div class="card empty">${ico("lock")}<b>Chỉ Ban giám hiệu / quản trị mới xem được mục này.</b></div>`;
}

/* a-flows: xem teacher.js */

/* ---------- Xin nghỉ & dạy thay: nhắn cho trợ lý để tạo đơn, trạng thái random (chủ yếu chờ duyệt) ---------- */
const LEAVE_STATE_UI = { pending:["warn","clock","Chờ tổ trưởng duyệt"], approved:["good","check","Đã duyệt"], rejected:["bad","x","Không được duyệt"] };

function leaveCardHTML(lv){
  const [cls, icn, label] = LEAVE_STATE_UI[lv.state];
  return `<div class="card tight stack">
    <div class="row between"><span class="chip ${cls}">${ico(icn)}${label}</span><span class="xs muted">${esc(lv.createdAt)}</span></div>
    <div class="small"><b>Lý do:</b> ${esc(lv.reason)}</div>
    <div class="small"><b>Thời gian:</b> ${esc(lv.time)}</div>
    ${lv.state === "rejected" ? `<div class="small" style="background:var(--sunk);border-radius:8px;padding:8px 10px"><b>Lý do không duyệt:</b> ${esc(lv.rejectReason)}</div>` : ""}
  </div>`;
}

function renderLeaveList(){
  const list = $("#lvList"); if (!list) return;
  list.innerHTML = S.leaves.length ? S.leaves.map(leaveCardHTML).join("") : `<p class="muted small">Chưa có đơn nào.</p>`;
}

async function createLeaveFromChat(text){
  const box = $("#lvOut"); if (box) box.innerHTML = loading("Trợ lý đang đọc nội dung…");
  let info;
  try{
    info = await aiJSON(`Giáo viên nhắn xin nghỉ dạy, nhờ dạy thay: "${text}". Rút ra CHỈ JSON {"reason": string (lý do nghỉ, ngắn gọn, tiếng Việt), "time": string (thời gian nghỉ: ngày/buổi/tiết nếu có nhắc đến, nếu không rõ ghi "Chưa rõ, xem lại nội dung nhắn")}`, { tier:"quick" });
  }catch(e){ info = { reason: text, time: "Chưa rõ, xem lại nội dung nhắn" }; }
  createLeave(info.reason || text, info.time || "Chưa rõ");
  if (box) box.innerHTML = "";
  renderLeaveList();
  toast("Đã tạo đơn xin nghỉ.");
}

VIEWS["a-leave"] = v => {
  if (!can("teach")) { v.innerHTML = `<div class="card empty">${ico("lock")}<b>Chỉ giáo viên mới dùng được mục này.</b></div>`; return; }
  v.innerHTML = `
  <div class="banner info">${ico("clock")}<div>Nhắn cho trợ lý lý do và thời gian xin nghỉ — trợ lý tự tạo đơn (lý do, thời gian, trạng thái). Trạng thái ở bản demo này đang để random cho xem giao diện, chủ yếu rơi vào "Chờ tổ trưởng duyệt".</div></div>
  <div class="card stack">
    <h3>Nhắn cho trợ lý</h3>
    <div class="row" style="flex-wrap:nowrap"><input class="inp" id="lvIn" placeholder="VD: Xin nghỉ ốm thứ Năm 14/11, 2 tiết Toán 10A1, nhờ cô Hạnh dạy thay"><button class="btn primary" id="lvGo">${ico("send")}Gửi</button></div>
    <div class="pills">${["Xin nghỉ ốm ngày mai, nhờ đồng nghiệp cùng tổ dạy thay 2 tiết","Xin nghỉ việc riêng chiều thứ Sáu tuần này, 1 tiết lớp 11A1","Xin nghỉ phép 2 ngày tuần sau để đi công tác"].map(s => `<button class="pill" data-lvs="${esc(s)}">${esc(s)}</button>`).join("")}</div>
    <div id="lvOut"></div>
  </div>
  <div class="row between"><h3>Đơn đã tạo (${S.leaves.length})</h3></div>
  <div class="stack" id="lvList"></div>`;
  renderLeaveList();
  const send = () => { const t = $("#lvIn").value.trim(); if (!t){ toast("Nhập nội dung xin nghỉ."); return; } $("#lvIn").value = ""; createLeaveFromChat(t); };
  $("#lvGo").onclick = send;
  $("#lvIn").onkeydown = e => { if (e.key === "Enter") send(); };
  $$("[data-lvs]").forEach(b => b.onclick = () => { $("#lvIn").value = b.dataset.lvs; send(); });
};

/* ---------- Tài liệu tổ: tài liệu chuyên môn nộp lên, tổ trưởng bộ môn duyệt ---------- */
const DEPT_STATE = { pending: ["warn", "clock", "Đang chờ tổ trưởng duyệt"], needs_fix: ["bad", "x", "Yêu cầu bổ sung"], approved: ["good", "check", "Đã duyệt"] };

function myDept(){ const me = STAFF_LIST.find(s => s.code === S.user.code); return (me && me.to) || "Tổ chuyên môn"; }

const DEPT_SEED = {
  "Toán": [
    { title: "Chuyên đề: Dạy học STEM chủ đề Hàm số bậc hai", kind: "Chuyên đề", state: "approved", note: "Bám sát CT 2018, có thể áp dụng chung cả tổ. Bổ sung thêm rubric đánh giá sản phẩm nhóm.", at: "08/11/2026" },
    { title: "Sáng kiến kinh nghiệm: Ứng dụng AI hỗ trợ soạn giáo án", kind: "SKKN", state: "pending" },
    { title: "Kế hoạch bồi dưỡng thường xuyên năm học 2026–2027", kind: "Kế hoạch", state: "needs_fix", note: "Cần nêu rõ minh chứng từng module đã học.", at: "05/11/2026" },
    { title: "Biên bản sinh hoạt chuyên môn tháng 10", kind: "Biên bản", state: "approved", note: "Lưu hồ sơ tổ.", at: "31/10/2026" }
  ],
  "Tiếng Anh": [
    { title: "Chuyên đề: Dạy Speaking theo định hướng giao tiếp Unit 1–3", kind: "Chuyên đề", state: "approved", note: "Vận dụng tốt hoạt động cặp/nhóm. Nên thêm tiêu chí chấm nói chi tiết hơn.", at: "07/11/2026" },
    { title: "Sáng kiến kinh nghiệm: Luyện phát âm bằng AI (Speak Up)", kind: "SKKN", state: "pending" },
    { title: "Kế hoạch bồi dưỡng thường xuyên năm học 2026–2027", kind: "Kế hoạch", state: "needs_fix", note: "Bổ sung minh chứng chứng chỉ/khóa học đã hoàn thành.", at: "05/11/2026" },
    { title: "Biên bản sinh hoạt chuyên môn tháng 10", kind: "Biên bản", state: "approved", note: "Lưu hồ sơ tổ.", at: "31/10/2026" }
  ]
};
function myDeptDocs(){ const me = STAFF_LIST.find(s => s.code === S.user.code); return (DEPT_SEED[me && me.subj] || DEPT_SEED["Toán"]).map((d, i) => ({ id: "dd" + i, ...d })); }

function deptCardHTML(d){
  const [cls, icn, label] = DEPT_STATE[d.state];
  return `<div class="card tight stack">
    <div class="row between"><div><b>${esc(d.title)}</b><div class="xs muted">${esc(d.kind)}${S.user.name ? " · " + esc(S.user.name) : ""}</div></div><span class="chip ${cls}">${ico(icn)}${label}</span></div>
    ${d.note ? `<div class="small" style="background:var(--sunk);border-radius:8px;padding:8px 10px"><b>Nhận xét của tổ trưởng:</b> ${esc(d.note)}${d.at ? ` <span class="xs muted">· ${esc(d.at)}</span>` : ""}</div>` : ""}
    ${d.state === "pending" ? `<div class="row" style="gap:6px"><button class="btn sm primary" data-ddok="${d.id}">${ico("check")}Duyệt (vai tổ trưởng)</button><button class="btn sm danger" data-ddno="${d.id}">${ico("x")}Yêu cầu bổ sung</button></div>` : ""}
    ${d.state === "needs_fix" ? `<button class="btn sm ghost" data-ddresend="${d.id}">${ico("send")}Đã sửa, gửi lại</button>` : ""}
  </div>`;
}

VIEWS["a-profile"] = v => {
  if (!can("teach")) { v.innerHTML = `<div class="card empty">${ico("lock")}<b>Chỉ giáo viên mới dùng được mục này.</b></div>`; return; }
  const DOCS = myDeptDocs();
  const render = () => {
    v.innerHTML = `
    <div class="banner info">${ico("folder")}<div>Tài liệu chuyên môn của <b>${esc(myDept())}</b> (chuyên đề, SKKN, kế hoạch bồi dưỡng, biên bản sinh hoạt tổ…) — nộp lên để <b>tổ trưởng bộ môn</b> xem và duyệt trước khi lưu hồ sơ tổ. Đây là dữ liệu mẫu để xem trước giao diện; nút "Duyệt" ở đây đứng tạm vai tổ trưởng để minh họa.</div></div>
    <div class="dgrid">${DOCS.map(deptCardHTML).join("")}</div>`;
    $$("[data-ddok]").forEach(b => b.onclick = () => { const d = DOCS.find(x => x.id === b.dataset.ddok); if (d){ d.state = "approved"; d.note = "Đạt yêu cầu, lưu hồ sơ tổ."; d.at = new Date().toLocaleDateString("vi-VN"); toast("Đã duyệt."); render(); } });
    $$("[data-ddno]").forEach(b => b.onclick = () => { const d = DOCS.find(x => x.id === b.dataset.ddno); if (d){ d.state = "needs_fix"; d.note = "Tổ trưởng yêu cầu xem lại và bổ sung minh chứng trước khi duyệt."; d.at = new Date().toLocaleDateString("vi-VN"); toast("Đã yêu cầu bổ sung."); render(); } });
    $$("[data-ddresend]").forEach(b => b.onclick = () => { const d = DOCS.find(x => x.id === b.dataset.ddresend); if (d){ d.state = "pending"; d.note = ""; toast("Đã gửi lại cho tổ trưởng."); render(); } });
  };
  render();
};

const WHEN = [["work", "Giờ làm việc"], ["after", "Ngoài giờ"]];
const KIND = [["teacher", "Giáo viên"], ["student", "Học sinh"], ["staff", "Nhân viên"]];
const PURP = [["personal", "Việc cá nhân"], ["entertain", "Giải trí"]];
const LV = [["allow", "Cho phép"], ["warn", "Nhắc nhở"], ["block", "Chặn"]];

VIEWS["a-dash"] = v => {
  if (!can("admin")) return guard(v);
  const U = S.usage;
  v.innerHTML = `
  <div class="row between"><span class="chip brand">${ico("chart")}Dữ liệu phía trình duyệt của tài khoản đang đăng nhập</span><span class="tag">Số liệu máy chủ toàn trường ở dưới</span></div>
  <div class="g4">
    <div class="kpi"><span class="muted small">Lượt gọi AI (phiên này)</span><b class="num">${U.calls}</b></div>
    <div class="kpi"><span class="muted small">Bị chặn theo chính sách</span><b class="num">${U.blocked}</b></div>
    <div class="kpi"><span class="muted small">Được nhắc nhở</span><b class="num">${U.warned}</b></div>
    <div class="kpi"><span class="muted small">Chế độ AI</span><b class="num" style="font-size:1.1rem">${S.aiMode === "live" ? "AI thật" : "Mô phỏng"}</b></div>
  </div>
  <div class="card stack">
    <h3>Lý do bị chặn / nhắc nhở (phiên này)</h3>
    ${Object.keys(U.byPurpose || {}).length ? bars(Object.entries(U.byPurpose).map(([k, n]) => [k, Math.max(1, Math.round(n / Math.max(1, U.blocked + U.warned) * 100))])) : `<p class="muted small">Chưa có lần nào bị chặn hoặc nhắc nhở trong phiên này.</p>`}
  </div>
  <div class="card stack">
    <div class="row between"><h3>Nhật ký gần đây (phía trình duyệt)</h3><span class="muted small">${(U.log || []).length} dòng · không lưu nội dung chat</span></div>
    <div class="tablewrap"><table style="min-width:520px"><thead><tr><th>Giờ</th><th>Nhóm</th><th>Mục đích</th><th>Hành động</th></tr></thead><tbody>
      ${(U.log || []).slice(0, 20).map(l => `<tr><td>${esc(l.when || "")}</td><td>${esc(l.who || "")}</td><td>${esc(l.purpose || "")}</td><td>${esc(l.action || "")}</td></tr>`).join("") || `<tr><td colspan="4" class="muted small">Chưa có dòng nào.</td></tr>`}
    </tbody></table></div>
  </div>
  <div class="card stack" id="srvUsage">${loading("Đang tải số liệu máy chủ (toàn trường)…")}</div>`;
  fetch("/api/usage").then(r => r.json()).then(u => {
    const el = $("#srvUsage"); if (!el) return;
    const tiers = Object.entries(u.byTier || {});
    el.innerHTML = `<div class="row between"><h3>Số liệu máy chủ · toàn trường</h3><span class="muted small">Từ ${esc(new Date(u.since).toLocaleString("vi-VN"))}</span></div>
      <div class="g3">
        <div class="kpi"><span class="muted small">Tổng lượt gọi AI</span><b class="num">${u.calls}</b></div>
        <div class="kpi"><span class="muted small">Bị chặn ở máy chủ</span><b class="num">${u.blocked}</b></div>
        <div class="kpi"><span class="muted small">Model dùng nhiều nhất</span><b class="num" style="font-size:1rem">${tiers.length ? tiers.slice().sort((a, b) => b[1] - a[1])[0][0] : "—"}</b></div>
      </div>
      ${tiers.length ? `<div class="tablewrap"><table style="min-width:360px"><thead><tr><th>Mức (tier)</th><th>Số lượt</th></tr></thead><tbody>${tiers.map(([k, n]) => `<tr><td>${esc(k)}</td><td>${n}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted small">Chưa có lượt gọi AI thật nào từ khi khởi động máy chủ.</p>`}`;
  }).catch(() => { const el = $("#srvUsage"); if (el) el.innerHTML = `<p class="muted small">Không lấy được số liệu máy chủ.</p>`; });
};

function getPolicy(kind, when, purpose) { return when === "work" ? S.policy[kind][purpose] : S.policy.after[kind][purpose]; }
function setPolicy(kind, when, purpose, val) { if (when === "work") S.policy[kind][purpose] = val; else S.policy.after[kind][purpose] = val; }

VIEWS["a-policy"] = v => {
  if (!can("admin")) return guard(v);
  v.innerHTML = `
  <div class="banner info">${ico("shield")}<div>Chính sách áp dụng cho yêu cầu AI không thuộc chuyên môn (việc cá nhân, giải trí). Nội dung không phù hợp hoặc yêu cầu làm bài hộ luôn bị chặn, không sửa được ở đây.</div></div>
  <div class="card stack"><h3>Ma trận chính sách</h3>
    <div class="tablewrap"><table style="min-width:640px"><thead><tr><th>Vai trò</th><th>Khung giờ</th><th>Việc cá nhân</th><th>Giải trí</th></tr></thead><tbody>
    ${KIND.flatMap(([kk, kn]) => WHEN.map(([wk, wn]) => `<tr><td>${esc(kn)}</td><td>${esc(wn)}</td>${PURP.map(([pk]) => `<td><select class="inp" data-pk="${kk}" data-pw="${wk}" data-pp="${pk}">${LV.map(([lv, ln]) => `<option value="${lv}" ${getPolicy(kk, wk, pk) === lv ? "selected" : ""}>${ln}</option>`).join("")}</select></td>`).join("")}</tr>`)).join("")}
    </tbody></table></div>
  </div>`;
  $$("[data-pk]").forEach(s => s.onchange = () => { setPolicy(s.dataset.pk, s.dataset.pw, s.dataset.pp, s.value); });
};

VIEWS["a-classify"] = v => {
  if (!can("admin")) return guard(v);
  v.innerHTML = `
  <div class="card stack">
    <h3>Thử phân loại một đoạn yêu cầu</h3>
    <p class="small muted">Không gọi AI — chạy lại đúng bộ lọc từ khóa và chính sách mà hệ thống dùng thật, để kiểm tra trước khi đổi chính sách.</p>
    <div class="field"><label for="clText">Nội dung thử</label><textarea id="clText" rows="3" placeholder="VD: Viết cho tôi một bài thơ tặng sinh nhật vợ"></textarea></div>
    <div class="g3">
      <div class="field"><label for="clKind">Vai trò</label><select id="clKind">${KIND.map(([k, n]) => `<option value="${k}">${n}</option>`).join("")}</select></div>
      <div class="field"><label for="clWhen">Khung giờ</label><select id="clWhen">${WHEN.map(([k, n]) => `<option value="${k}">${n}</option>`).join("")}</select></div>
      <div></div>
    </div>
    <button class="btn primary" id="clGo">${ico("filter")}Phân loại thử</button>
    <div id="clOut"></div>
  </div>`;
  $("#clGo").onclick = () => {
    const text = $("#clText").value.trim();
    if (!text) { $("#clOut").innerHTML = `<p class="muted small">Nhập nội dung trước.</p>`; return; }
    const kind = $("#clKind").value, when = $("#clWhen").value;
    const cls = classifyLocal(text, kind);
    const saved = S.clock; S.clock = when; const d = decide(cls, kind); S.clock = saved;
    $("#clOut").innerHTML = `<div class="banner ${d === "block" ? "bad" : d === "warn" ? "warn" : "good"}">${ico(d === "block" ? "x" : d === "warn" ? "shield" : "check")}<div><b>Mục đích: ${esc(cls.purpose)}</b> (khóa: ${esc(cls.key)})<div class="small" style="margin-top:4px">${esc(cls.reason)}</div><div class="small" style="margin-top:4px">Quyết định: <b>${d === "block" ? "Chặn" : d === "warn" ? "Nhắc nhở" : "Cho phép"}</b></div></div></div>`;
  };
};

const PRICING = { "claude-haiku-5-5": [0.10, 0.50], "claude-sonnet-5-5": [2.00, 10.00], "claude-opus-5-5": [4.00, 20.00] };
const TIER_LABEL = { quick: "Nhanh — phân loại, dịch, gợi ý", default: "Chuẩn — soạn tài liệu, trợ lý chat", complex: "Chuyên sâu — ra đề, chấm" };

VIEWS["a-quota"] = v => {
  if (!can("admin")) return guard(v);
  v.innerHTML = `<div class="card">${loading("Đang tải cấu hình từ máy chủ…")}</div>`;
  const render = h => {
    const models = h.models || {}, maxTok = h.maxTokens || {}, rl = h.rateLimit || {};
    const rows = Object.entries(models).map(([tier, model]) => {
      const price = PRICING[model];
      return [tier, TIER_LABEL[tier] || tier, maxTok[tier] || "—", price ? `$${price[0].toFixed(2)} / $${price[1].toFixed(2)}` : "—"];
    });
    v.innerHTML = `
    <div class="banner ${h.ai ? "good" : "warn"}">${ico(h.ai ? "check" : "shield")}<div>${h.ai ? "Máy chủ đang có API key, dùng AI thật." : "Chưa có API key trong config.js — toàn trường đang chạy ở chế độ AI mô phỏng."}</div></div>
    <div class="card stack">
      <h3>Model theo mức tác vụ (tier)</h3>
      <div class="tablewrap"><table style="min-width:560px"><thead><tr><th>Tier</th><th>Dùng cho</th><th>Max tokens/lượt</th><th>Giá tham khảo (vào / ra · $/1M token)</th></tr></thead><tbody>
      ${rows.map(([t, label, mt, p]) => `<tr><td>${esc(t)}</td><td>${esc(label)}</td><td>${mt}</td><td>${p}</td></tr>`).join("")}
      </tbody></table></div>
      <p class="xs muted">Giá tham khảo theo bảng giá công khai của nhà cung cấp AI tại thời điểm viết, có thể thay đổi — không dùng để tính hóa đơn chính thức.</p>
    </div>
    <div class="card stack">
      <h3>Hạn mức gọi API</h3>
      <p class="small">Mỗi địa chỉ IP được tối đa <b>${rl.maxRequests || "—"}</b> yêu cầu / <b>${rl.windowSec || "—"} giây</b>. Vượt hạn mức sẽ bị tạm chặn vài phút (lỗi 429) để tránh phát sinh chi phí ngoài kiểm soát.</p>
    </div>`;
  };
  const h = getHealth();
  if (h) render(h);
  else fetch("/api/health").then(r => r.json()).then(render).catch(() => { v.innerHTML = `<div class="card empty">Không lấy được cấu hình máy chủ.</div>`; });
};

