import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the Concept2 account link
    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: "concept2",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unlinking Concept2:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
