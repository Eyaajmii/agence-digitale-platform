import { NextRequest, NextResponse } from "next/server";
import { getMetaAuthUrl } from "@/lib/meta/api";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId requis" },
      { status: 400 }
    );
  }

  const url = getMetaAuthUrl(clientId);

  return NextResponse.redirect(url);
}