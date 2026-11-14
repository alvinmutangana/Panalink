import { PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "../../../lib/auth";
import { isApprovedSeller } from "../../../lib/seller";
import { r2 } from "../../../lib/r2";

const MAX_BYTES = 1024 * 1024; // 1 MB after compression

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (
    !session ||
    session.user.role !== "seller" ||
    !(await isApprovedSeller(session.user.id))
  ) {
    return Response.json({ error: "Not allowed" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File) || file.type !== "image/jpeg") {
    return Response.json({ error: "Only JPEG images are accepted" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Image is too large" }, { status: 413 });
  }

  const key = `listings/${session.user.id}/${crypto.randomUUID()}.jpg`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: "image/jpeg",
    })
  );

  return Response.json({ url: `${process.env.R2_PUBLIC_URL}/${key}` });
}
