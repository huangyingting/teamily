import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  let role = "ADMIN";
  let maxUses = 1;
  let expiresInHours = 24;
  let note = "CLI generated invitation code";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--role" && args[i + 1]) {
      role = args[++i].toUpperCase();
    } else if (args[i] === "--max-uses" && args[i + 1]) {
      maxUses = parseInt(args[++i], 10) || 1;
    } else if (args[i] === "--expires-in-hours" && args[i + 1]) {
      expiresInHours = parseFloat(args[++i]) || 24;
    } else if (args[i] === "--note" && args[i + 1]) {
      note = args[++i];
    }
  }
  return { role, maxUses, expiresInHours, note };
}

async function main() {
  const { role, maxUses, expiresInHours, note } = parseArgs();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[bytes[i] % alphabet.length];
  }

  const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000);

  const invite = await prisma.invitationCode.create({
    data: {
      code,
      assignedRole: role,
      maxUses,
      usedCount: 0,
      status: "ACTIVE",
      expiresAt,
      note,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorEmail: "cli@localhost",
      actorRole: "ADMIN",
      action: "INVITE_CREATED",
      targetType: "INVITE",
      targetId: invite.id,
      status: "SUCCESS",
      metadataJson: JSON.stringify({
        code: invite.code,
        assignedRole: invite.assignedRole,
        maxUses: invite.maxUses,
        expiresAt: invite.expiresAt?.toISOString(),
        source: "cli",
      }),
    },
  });

  console.log(JSON.stringify({
    code: invite.code,
    assignedRole: invite.assignedRole,
    maxUses: invite.maxUses,
    expiresAt: invite.expiresAt?.toISOString(),
  }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
