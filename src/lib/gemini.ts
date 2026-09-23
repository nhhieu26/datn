import { embed } from "ai";
import { google } from "@ai-sdk/google";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;

export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: google.embeddingModel(EMBEDDING_MODEL),
    value: text,
    providerOptions: {
      google: {
        outputDimensionality: EMBEDDING_DIMENSIONS,
      },
    },
  });

  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Embedding phải có ${EMBEDDING_DIMENSIONS} chiều, nhận được ${embedding.length}.`
    );
  }

  return embedding;
}
