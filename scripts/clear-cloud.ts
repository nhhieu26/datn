import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { clearTourEmbeddings } from "../src/lib/pinecone";
import { deleteFolder } from "../src/lib/imagekit";

const INDEX = process.env.PINECONE_INDEX!;
const NAMESPACE = process.env.PINECONE_NAMESPACE_TOURS || "tours";
const FOLDERS = ["/tours", "/provider-profiles"];

function isNotFound(error: unknown): boolean {
  const status = (error as { $ResponseMetadata?: { statusCode?: number } })
    .$ResponseMetadata?.statusCode;
  return status === 404;
}

async function main() {
  console.log("Xoá tài nguyên cloud của dự án:");
  console.log(`  Pinecone: index="${INDEX}" namespace="${NAMESPACE}"`);
  console.log(`  ImageKit: ${FOLDERS.join(", ")}`);

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question("\nTiếp tục? (y/N) ");
  rl.close();

  if (answer.trim().toLowerCase() !== "y") {
    console.log("Đã huỷ.");
    return;
  }

  const tasks: { name: string; run: () => Promise<unknown> }[] = [
    { name: `Pinecone ${INDEX}/${NAMESPACE}`, run: () => clearTourEmbeddings() },
    ...FOLDERS.map((folder) => ({
      name: `ImageKit ${folder}`,
      run: () => deleteFolder(folder),
    })),
  ];

  const results = await Promise.allSettled(tasks.map((t) => t.run()));

  let failed = false;
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      console.log(`✓ ${tasks[i].name}`);
    } else if (isNotFound(result.reason)) {
      console.log(`✓ ${tasks[i].name} (không tồn tại, bỏ qua)`);
    } else {
      failed = true;
      console.error(`✗ ${tasks[i].name}:`, result.reason);
    }
  });

  console.log(failed ? "\nHoàn tất với lỗi." : "\nĐã xoá xong.");
  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
