import { NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";

export async function GET() {
  const institutions = await prisma.tbinstitutions.findMany({
    where: { status: true },
    select: {
      PK_institution: true,
      name: true,
      acronym: true,
      phoneNumber: true,
      email: true,
      address: true,
      latitude: true,
      longitude: true,
      tbinstitutiontypes: {
        select: { name: true, code: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ institutions });
}
