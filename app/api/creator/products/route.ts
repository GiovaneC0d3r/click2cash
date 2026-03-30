import { auth } from "@/lib/auth"; // Seu arquivo de configuração do Better Auth
import prisma from "@/lib/prisma"; // Seu cliente Prisma
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";
import { DeleteObjectCommand } from "@aws-sdk/client-s3"; // Caso queira deletar a antiga depois
import { s3Client } from "@/lib/minio";

export async function POST(req: Request) {
  try {
    // 1. Verificar autenticação via Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Coletar dados do corpo da requisição
    const body = await req.json();
    const { name, description, price, image } = body;

    // 3. Validação básica
    if (!name || !price) {
      return NextResponse.json(
        { error: "Nome e preço são obrigatórios" },
        { status: 400 }
      );
    }

    // 4. Criar o produto no banco de dados
    const product = await prisma.product.create({
      data: {
        name,
        description,
        // Convertemos a string/number do front para Decimal do Prisma
        price: new Decimal(price), 
        image,
        userId: session.user.id,
      },
    });

    return NextResponse.json(product, { status: 201 });

  } catch (error: any) {
    console.error("Erro ao criar produto:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar o produto" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // 1. Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Buscar produtos no banco de dados vinculados ao usuário logado
    // Usamos 'orderBy' para que os mais recentes apareçam primeiro
    const products = await prisma.product.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 3. Retornar a lista (mesmo que vazia [])
    return NextResponse.json(products);

  } catch (error: any) {
    console.error("Erro ao buscar produtos:", error);
    return NextResponse.json(
      { error: "Erro ao carregar a lista de produtos" },
      { status: 500 }
    );
  }
}


export async function PATCH(req: Request) {
  try {
    // 1. Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Coletar dados e o ID do produto
    const body = await req.json();
    const { id, name, description, price, image } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 });
    }

    // 3. Verificar se o produto pertence ao usuário antes de editar
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct || existingProduct.userId !== session.user.id) {
      return NextResponse.json({ error: "Produto não encontrado ou permissão negada" }, { status: 404 });
    }

    // 4. Atualizar no banco de dados
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name ?? existingProduct.name,
        description: description ?? existingProduct.description,
        price: price ? new Decimal(price) : existingProduct.price,
        image: image ?? existingProduct.image,
      },
    });

    return NextResponse.json(updatedProduct);

  } catch (error: any) {
    console.error("Erro ao editar produto:", error);
    return NextResponse.json(
      { error: "Erro interno ao editar o produto" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    // 1. Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Pegar o ID pela URL (ex: /api/creator/products?id=123)
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 });
    }

    // 3. Buscar o produto para verificar posse e pegar a URL da imagem
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product || product.userId !== session.user.id) {
      return NextResponse.json({ error: "Produto não encontrado ou permissão negada" }, { status: 404 });
    }

    // 4. Se o produto tiver imagem, deletar do MinIO
    if (product.image) {
      try {
        // Extrai o nome do arquivo da URL (ex: http://.../products/foto.jpg -> foto.jpg)
        const fileName = product.image.split("/").pop();

        if (fileName) {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: "products",
              Key: fileName,
            })
          );
        }
      } catch (s3Error) {
        console.error("Erro ao deletar imagem no MinIO:", s3Error);
        // Não travamos o processo se a imagem falhar ao deletar, 
        // mas logamos para saber que o arquivo ficou órfão.
      }
    }

    // 5. Deletar do Banco de Dados
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Produto deletado com sucesso" });

  } catch (error: any) {
    console.error("Erro ao deletar produto:", error);
    return NextResponse.json(
      { error: "Erro interno ao deletar o produto" },
      { status: 500 }
    );
  }
}