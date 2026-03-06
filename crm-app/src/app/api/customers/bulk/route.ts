import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customerIds, status, notes, nextCallDate } = body;

        if (!Array.isArray(customerIds) || customerIds.length === 0) {
            return NextResponse.json({ error: "No customers selected" }, { status: 400 });
        }

        const result = await prisma.customer.updateMany({
            where: {
                id: { in: customerIds },
            },
            data: {
                status,
                notes: notes || undefined,
                lastCallDate: new Date(),
                nextCallDate: nextCallDate ? new Date(nextCallDate) : null,
            },
        });

        return NextResponse.json({ success: true, count: result.count });
    } catch (error) {
        console.error("Bulk update error:", error);
        return NextResponse.json(
            { error: "Failed to update customers", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
