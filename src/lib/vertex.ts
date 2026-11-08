import { createVertex } from "@ai-sdk/google-vertex";

// Vertex AI xác thực bằng Application Default Credentials (tổ chức chặn API key):
// - máy dev: `gcloud auth application-default login`
// - server: tài khoản dịch vụ gắn sẵn hoặc GOOGLE_APPLICATION_CREDENTIALS
// Model preview (gemini-3-*) chỉ có ở location "global".
export const vertex = createVertex({
  project: process.env.GOOGLE_VERTEX_PROJECT,
  location: process.env.GOOGLE_VERTEX_LOCATION ?? "global",
});
