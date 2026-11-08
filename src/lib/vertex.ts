import { createVertex } from "@ai-sdk/google-vertex";
import { getVercelOidcToken } from "@vercel/oidc";
import { ExternalAccountClient } from "google-auth-library";

// Tổ chức chặn API key → xác thực Vertex AI không dùng key:
// - Trên Vercel: token OIDC của Vercel đổi lấy quyền của service account qua Workload Identity Federation
//   (GCP_WORKLOAD_IDENTITY_PROVIDER + GCP_SERVICE_ACCOUNT_EMAIL)
// - Máy dev: Application Default Credentials (`gcloud auth application-default login`)
const provider = process.env.GCP_WORKLOAD_IDENTITY_PROVIDER;
const serviceAccount = process.env.GCP_SERVICE_ACCOUNT_EMAIL;

const authClient =
  provider && serviceAccount
    ? ExternalAccountClient.fromJSON({
        type: "external_account",
        audience: `//iam.googleapis.com/${provider}`,
        subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
        token_url: "https://sts.googleapis.com/v1/token",
        service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccount}:generateAccessToken`,
        subject_token_supplier: { getSubjectToken: () => getVercelOidcToken() },
      })
    : null;

// Model preview (gemini-3-*) chỉ có ở location "global"
export const vertex = createVertex({
  project: process.env.GOOGLE_VERTEX_PROJECT,
  location: process.env.GOOGLE_VERTEX_LOCATION ?? "global",
  ...(authClient ? { googleAuthOptions: { authClient } } : {}),
});
