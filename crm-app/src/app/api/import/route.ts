import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as xlsx from "xlsx";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const workbook = xlsx.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any[] = xlsx.utils.sheet_to_json(sheet);

        let count = 0;
        for (const row of data) {
            // Excel sütun başlıklarını kontrol et (kullanıcının ekran görüntüsündeki gibi: 'MÜŞTERİ ADI', 'TEL NO')
            const name = row["MÜŞTERİ ADI"] || row["Müşteri Adı"] || row["Name"] || row["Ad Soyad"];
            const phone = row["TEL NO"] || row["Telefon"] || row["Tel"] || row["Phone"] || row["Tel No"];

            if (name && phone) {
                await prisma.customer.create({
                    data: {
                        name: String(name),
                        phone: String(phone),
                        status: "BEKLİYOR",
                    },
                });
                count++;
            }
        }

        return NextResponse.json({ success: true, count });
    } catch (error) {
        console.error("Import error:", error);
        return NextResponse.json({ error: "Failed to import customers" }, { status: 500 });
    }
}
