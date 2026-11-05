import { createVertex } from "@ai-sdk/google-vertex";

// Vertex express mode: xác thực bằng API key, không cần project/location/ADC
export const vertex = createVertex({ apiKey: process.env.GOOGLE_VERTEX_API_KEY });
