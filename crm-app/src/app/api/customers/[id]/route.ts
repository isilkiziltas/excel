import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const customer = await prisma.customer.findUnique({
            where: { id },
        });
        if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(customer);
    } catch {
        return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const customer = await prisma.customer.update({
            where: { id },
            data: {
                name: body.name,
                phone: body.phone,
                status: body.status,
                notes: body.notes,
                lastCallDate: body.lastCallDate ? new Date(body.lastCallDate) : undefined,
                nextCallDate: body.nextCallDate ? new Date(body.nextCallDate) : null,
            },
        });
        return NextResponse.json(customer);
    } catch {
        return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.customer.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
    }
}
