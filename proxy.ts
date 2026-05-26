import { NextRequest, NextResponse } from "next/server";

// Route guard
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}
