import { NextRequest, NextResponse } from "next/server"

import { deleteProperty } from "@/services/property.service"

type Params = {
  params: Promise<{ propertyId: string }>
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { propertyId } = await params
  const result = await deleteProperty(propertyId)

  if (!result.success) {
    const status =
      result.error.code === "FORBIDDEN"
        ? 403
        : result.error.code === "NOT_FOUND"
          ? 404
          : result.error.code === "CONFLICT"
            ? 409
            : 500

    return NextResponse.json({ error: result.error.message }, { status })
  }

  return NextResponse.json({ id: result.data.id }, { status: 200 })
}
