import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function uploadImage(
  file: File,
  folder: string
): Promise<{ url: string; fileId: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await imagekit.upload({
    file: buffer,
    fileName: file.name,
    folder,
  });
  return { url: result.url, fileId: result.fileId };
}

export async function deleteImage(fileId: string): Promise<void> {
  await imagekit.deleteFile(fileId);
}
