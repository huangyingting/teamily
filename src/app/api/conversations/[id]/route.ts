import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await context.params;
  const conversation = await prisma.conversation.findFirst({
    where: { id, ownerId: user.id },
    include: {
      members: {
        include: {
          agent: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ conversation });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.conversation.findFirst({
    where: { id, ownerId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) {
    data.title = body.title.trim();
  }
  if (typeof body.isPinned === "boolean") {
    data.isPinned = body.isPinned;
  }
  if (body.mode === "Auto" || body.mode === "Instant" || body.mode === "Agentic") {
    data.mode = body.mode;
  }

  const updated = await prisma.conversation.update({
    where: { id: existing.id },
    data,
    include: {
      members: { include: { agent: true } },
    },
  });

  return NextResponse.json({ conversation: updated });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.conversation.findFirst({
    where: { id, ownerId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await prisma.conversation.delete({ where: { id: existing.id } });
  return NextResponse.json({ deleted: true });
}
