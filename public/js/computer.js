/* Tản Đà AI · computer.js — AI điều khiển máy tính (mở web, mở ứng dụng). Phía server: computer.js + desktop.ps1 */
import { $, $$, TITLES, VIEWS, can, esc, ico, toast } from "./core.js";

Object.assign(TITLES, { "t-computer": "Điều khiển máy tính" });

const SAMPLES = [
  "Mở Chrome và vào trang vnexpress.net",
  "Mở Notepad rồi gõ: Xin chào các em lớp 11A1!",
  "Mở ứng dụng Máy tính (Calculator) và tính 125 × 48",
  "Mở Microsoft Word, tạo tài liệu trống mới",
  "Mở trình duyệt, tìm kiếm \"Chương trình GDPT 2018 môn Toán\""
];
const ACT_LABEL = {
  screenshot: "Chụp màn hình", zoom: "Phóng to vùng", left_click: "Bấm chuột", right_click: "Bấm chuột phải", middle_click: "Bấm chuột giữa",
  double_click: "Bấm đúp", triple_click: "Bấm 3 lần", left_click_drag: "Kéo thả", mouse_move: "Di chuột", left_mouse_down: "Nhấn giữ chuột",
  left_mouse_up: "Thả chuột", cursor_position: "Xem vị trí chuột", scroll: "Cuộn", type: "Gõ chữ", key: "Nhấn phím", hold_key: "Giữ phím", wait: "Chờ"
};
const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
let run = null;   // { ctl: AbortController } khi đang chạy

function actText(e){
  const i = e.input || {}, bits = [];
  if (i.coordinate) bits.push(`(${i.coordinate.join(", ")})`);
  if (i.text) bits.push(`“${String(i.text).slice(0, 80)}”`);
  if (i.scroll_direction) bits.push(`${i.scroll_direction} ×${i.scroll_amount || 1}`);
  if (i.duration) bits.push(`${i.duration}s`);
  return `${ACT_LABEL[e.name] || e.name} ${bits.join(" ")}`;
}
function addLog(kind, html){
  const log = $("#cuLog"); if (!log) return;
  const icon = { text:"spark", note:"bulb", action:"play", error:"x", done:"check", you:"chat" }[kind] || "spark";
  log.insertAdjacentHTML("beforeend", `<div class="row small" style="align-items:flex-start;gap:8px;flex-wrap:nowrap;padding:6px 0;border-bottom:1px solid var(--line)">${ico(icon)}<div style="min-width:0;${kind === "note" ? "color:var(--muted);font-style:italic" : ""}${kind === "error" ? "color:var(--bad)" : ""}">${html}</div></div>`);
  log.scrollTop = log.scrollHeight;
}
function setBusy(b){
  const go = $("#cuGo"), stop = $("#cuStop"); if (!go) return;
  go.disabled = b; stop.hidden = !b; $$("[data-cus]").forEach(x => x.disabled = b);
  if (!b) $("#cuStatus").textContent = "";
}

async function start(){
  const task = $("#cuTask").value.trim();
  if (!task) { toast("Nhập việc cần AI làm trước."); return; }
  if (run) return;
  run = { ctl: new AbortController() };
  setBusy(true); addLog("you", `<b>${esc(task)}</b>`);
  try {
    const r = await fetch("/api/computer", { method:"POST", signal: run.ctl.signal,
      headers: { "content-type":"application/json", "x-tanda-computer":"1" }, body: JSON.stringify({ task }) });
    if (!r.ok) { let m = "Lỗi " + r.status; try { m = (await r.json()).message || m; } catch {} addLog("error", esc(m)); return; }
    const rd = r.body.getReader(), dec = new TextDecoder(); let buf = "";
    for (;;){
      const { value, done } = await rd.read(); if (done) break;
      buf += dec.decode(value, { stream:true });
      let i;
      while ((i = buf.indexOf("\n")) >= 0){
        const line = buf.slice(0, i); buf = buf.slice(i + 1);
        let e; try { e = JSON.parse(line); } catch { continue; }
        if (e.type === "status") $("#cuStatus").textContent = e.text;
        else if (e.type === "screen") { const im = $("#cuShot"); if (im) { im.src = "data:image/png;base64," + e.png; im.hidden = false; $("#cuNoShot").hidden = true; } }
        else if (e.type === "action") addLog("action", esc(actText(e)));
        else addLog(e.type, esc(e.text));
      }
    }
  } catch (e) {
    addLog(run && run.ctl.signal.aborted ? "done" : "error", run && run.ctl.signal.aborted ? "Đã dừng theo yêu cầu." : esc("Mất kết nối tới máy chủ: " + e.message));
  } finally { run = null; setBusy(false); }
}

VIEWS["t-computer"] = v => {
  if (!can("teach")) { v.innerHTML = `<div class="card empty">${ico("lock")}<b>Chỉ giáo viên mới dùng được mục này.</b></div>`; return; }
  v.innerHTML = `
  <div class="banner ${isLocal ? "info" : "warn"}">${ico(isLocal ? "bot" : "lock")}<div>${isLocal
    ? "AI sẽ nhìn màn hình và <b>tự bấm chuột, gõ phím trên chính máy này</b>. Trong lúc AI làm, đừng chạm chuột/bàn phím. Muốn dừng: bấm <b>Dừng</b> (hoặc đóng tab này). AI không nhập mật khẩu, không mua bán, không xóa tệp."
    : `Tính năng này chỉ dùng được trên chính máy chạy server. Hãy mở <b>http://localhost:${esc(location.port || "80")}</b> trên máy đó.`}</div></div>
  <div class="g2" style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:16px;align-items:start">
    <div class="card stack">
      <h3>Giao việc cho AI</h3>
      <div class="field"><label for="cuTask">Việc cần làm</label><textarea id="cuTask" rows="3" placeholder="VD: Mở Chrome và vào trang vnexpress.net"></textarea></div>
      <div class="pills">${SAMPLES.map(s => `<button class="pill" data-cus="${esc(s)}">${esc(s)}</button>`).join("")}</div>
      <div class="row" style="gap:8px"><button class="btn primary" id="cuGo" ${isLocal ? "" : "disabled"}>${ico("play")}Bắt đầu</button><button class="btn" id="cuStop" hidden>${ico("x")}Dừng</button><span class="muted small" id="cuStatus"></span></div>
      <div id="cuLog" style="max-height:420px;overflow:auto"></div>
    </div>
    <div class="card stack">
      <h3>Màn hình AI đang thấy</h3>
      <p class="muted small" id="cuNoShot">Ảnh chụp màn hình mới nhất sẽ hiện ở đây khi AI bắt đầu làm.</p>
      <img id="cuShot" hidden alt="Ảnh chụp màn hình AI đang xem" style="width:100%;border-radius:8px;border:1px solid var(--line)">
    </div>
  </div>`;
  $$("[data-cus]").forEach(b => b.onclick = () => { $("#cuTask").value = b.dataset.cus; $("#cuTask").focus(); });
  $("#cuGo").onclick = start;
  $("#cuStop").onclick = () => { if (run) run.ctl.abort(); };
  $("#cuTask").addEventListener("keydown", e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); start(); } });
  if (run) setBusy(true);
};
