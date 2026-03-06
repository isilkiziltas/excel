import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get("filter"); // e.g., 'today', 'upcoming', 'overdue'

        let whereClause = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (filter === "today") {
            whereClause = {
                nextCallDate: {
                    gte: today,
                    lt: tomorrow,
                },
            };
        } else if (filter === "overdue") {
            whereClause = {
                nextCallDate: {
                    lt: today,
                },
                status: {
                    not: "TAMAMLANDI",
                },
            };
        }

        const customers = await prisma.customer.findMany({
            where: whereClause,
            orderBy: { nextCallDate: "asc" },
        });
        return NextResponse.json(customers);
    } catch (error) {
        console.error("GET customers error:", error);
        return NextResponse.json({ error: "Failed to fetch customers", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const customer = await prisma.customer.create({
            data: {
                name: body.name,
                phone: body.phone,
                status: body.status || "BEKLİYOR",
                notes: body.notes || "",
                nextCallDate: body.nextCallDate ? new Date(body.nextCallDate) : null,
            },
        });
        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error("POST customer error:", error);
        return NextResponse.json({ error: "Failed to create customer", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
