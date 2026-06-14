import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeStore, serializeProduct } from "@/lib/serialize";
import { getStoreStatsById, jsonError } from "@/lib/api-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const store = await prisma.store.findUnique({
    where: { slug },
    include: { products: { orderBy: { createdAt: "desc" } } },
  });

  if (!store) return jsonError("المتجر غير موجود", 404);

  const stats = await getStoreStatsById(store.id);

  return Response.json({
    store: serializeStore(store, stats),
    products: store.products.map(serializeProduct),
  });
}
