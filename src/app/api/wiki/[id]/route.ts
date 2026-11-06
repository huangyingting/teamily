import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasMinimumRole } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await context.params;
  const page = await prisma.wikiPage.findFirst({
    where: { id, ownerId: user.id },
  });

  if (!page) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ page });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!hasMinimumRole(user.role, "MEMBER")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await context.params;
  const existing = await prisma.wikiPage.findFirst({
    where: { id, ownerId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {
    version: { increment: 1 },
  };

  if (typeof body.title === "string" && body.title.trim()) {
    data.title = body.title.trim();
  }
  if (typeof body.content === "string") {
    data.content = body.content;
  }
  if (typeof body.icon === "string" && body.icon.trim()) {
    data.icon = body.icon.trim();
  }
  if (typeof body.category === "string" && body.category.trim()) {
    data.category = body.category.trim();
  }
  if (Array.isArray(body.tags)) {
    data.tagsJson = JSON.stringify(body.tags);
  }

  const updated = await prisma.wikiPage.update({
    where: { id: existing.id },
    data,
  });

  return NextResponse.json({ page: updated });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (!hasMinimumRole(user.role, "MEMBER")) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id } = await context.params;
  const existing = await prisma.wikiPage.findFirst({
    where: { id, ownerId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await prisma.wikiPage.delete({ where: { id: existing.id } });
  return NextResponse.json({ deleted: true });
}
