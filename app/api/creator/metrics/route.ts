import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const products = await prisma.product.findMany({
      where: { userId: session.user.id },
      include: {
        orders: { where: { status: "PAID" } },
      },
    });

    // Agregando valores
    const totalSales = products.reduce((acc, p) => acc + p.orders.length, 0);
    const totalRevenue = products.reduce((acc, p) => {
      return acc + p.orders.reduce((sum, o) => sum + Number(o.amount), 0);
    }, 0);

    return NextResponse.json({ totalSales, totalRevenue });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao carregar métricas" }, { status: 500 });
  }
}