// =====================================================================
//  CẤU HÌNH TẢN ĐÀ AI
//  Dán API key của Claude vào ANTHROPIC_API_KEY bên dưới rồi chạy: node server.js
//  Key chỉ nằm ở máy chủ, trình duyệt không bao giờ nhìn thấy key.
//  Để trống: ứng dụng vẫn chạy ở chế độ AI mô phỏng.
// =====================================================================
module.exports = {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || "",   // ← dán key thật vào đây, ví dụ "sk-ant-..."

  // Model theo tác vụ (định tuyến model, mục 5 tài liệu phân tích):
  //   quick   – phân loại, gợi ý, dịch, hội thoại tiếng Anh, gia sư, chấm: nhanh, rẻ
  //   agent   – agent chat chính của giáo viên (soạn/sửa giáo án, slide, đề qua ACTIONS): cần max_tokens
  //             riêng (tài liệu dài) + "suy nghĩ mở rộng" riêng, tách khỏi "default" để không ảnh hưởng
  //             các tác vụ default khác
  //   default – các tác vụ còn lại chưa phân loại
  //   complex – ra đề, sửa đề, chấm: kiến thức phải chính xác (chưa dùng ở client)
  MODELS: {
    quick:   "claude-haiku-5-5",
    agent:   "claude-haiku-5-5",
    default: "claude-sonnet-5-5",
    complex: "claude-opus-5-5"
  },

  ANTHROPIC_URL: process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com",
  ANTHROPIC_VERSION: "2023-06-01",
  PORT: +process.env.PORT || 3000,

  // Giới hạn để kiểm soát chi phí (mục 2.4)
  MAX_TOKENS: { quick: 1500, agent: 6000, default: 6000, complex: 8000 },

  // "Suy nghĩ mở rộng" (extended thinking) — API mới trên dòng Claude 5: không còn "budget_tokens"
  // (bị lỗi 400 trên claude-sonnet-5-5/claude-opus-5-5), điều khiển độ sâu suy nghĩ bằng "adaptive" +
  // output_config.effort. display:"summarized" bắt buộc để THẤY được nội dung suy nghĩ thật — mặc định
  // "omitted" trả về rỗng. Chỉ bật cho tier "agent" (trợ lý giáo viên dùng cho mọi tác vụ qua chat, xem
  // agent.js: splitThinking tách <<<THINKING>>> khỏi câu trả lời) để không tốn thêm token/độ trễ ở các
  // tier khác; "default" KHÔNG bật vì một số tác vụ default (vd teacher.js: tạo bài tập, đọc JSON) không
  // tách marker <<<THINKING>>> khỏi luồng, sẽ làm hỏng kết quả nếu bật ở đó.
  THINKING: { agent: { type: "adaptive", display: "summarized" } },
  THINKING_EFFORT: { agent: "medium" },   // low|medium|high|xhigh|max — độ sâu suy nghĩ, càng cao càng tốn token
  THINKING_HEADROOM: 2000,                  // cộng thêm vào max_tokens khi có thinking, để suy nghĩ không ăn hết chỗ của câu trả lời/ACTIONS
  RATE_LIMIT: { windowSec: 60, maxRequests: 30 },    // mỗi địa chỉ IP
  MAX_BODY_BYTES: 6 * 1024 * 1024                     // cho phép gửi ảnh đề bài
};
