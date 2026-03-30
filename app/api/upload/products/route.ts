import { NextRequest, NextResponse } from "next/server";
import { s3Client, ensureBucketExists } from "@/lib/minio";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(
  req: NextRequest,
  // Ajuste para Next.js 15/16 (params é Promise)
) {
  try {
    // 1. Extrair params (Next.js 15/16 exige await nos params)
    const bucket  = "products"; // Nome do bucket onde os arquivos serão armazenados. Você pode parametrizar isso se quiser.

    // 2. Verificar Sessão
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      console.error("DEBUG UPLOAD: Sessão não encontrada ou inválida.");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 3. Extrair Arquivo
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Arquivo ausente no FormData" }, { status: 400 });
    }

    // 4. Garantir Bucket (Debugar essa função se travar aqui)
    try {
      await ensureBucketExists(bucket);
    } catch (bucketError: any) {
      console.error("DEBUG UPLOAD: Erro ao verificar/criar bucket:", bucketError.message);
      return NextResponse.json({ error: "Erro no Bucket", details: bucketError.message }, { status: 500 });
    }

    // 5. Preparar Upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;

    // 6. Enviar para o MinIO
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const url = `${process.env.MINIO_ENDPOINT}/${bucket}/${fileName}`;
    console.log("DEBUG UPLOAD: Sucesso!", url);

    return NextResponse.json({ url });

  } catch (error: any) {
    // ESTE LOG APARECE NO SEU TERMINAL DO VS CODE
    console.error("---------- DEBUG UPLOAD ERROR ----------");
    console.error("Mensagem:", error.message);
    console.error("Código:", error.code); // Ex: ECONNREFUSED
    console.error("Stack:", error.stack);
    console.error("----------------------------------------");

    // Retorna o erro detalhado para o seu navegador (aba Network do Inspecionar)
    return NextResponse.json({ 
      error: "Erro no servidor", 
      message: error.message,
      code: error.code 
    }, { status: 500 });
  }
}