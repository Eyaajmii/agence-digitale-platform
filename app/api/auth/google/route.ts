import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google/api";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId requis" },
      { status: 400 }
    );
  }

  return NextResponse.redirect(
    getGoogleAuthUrl(clientId)
  );
}