const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

function createDummyExcel() {
    const today = new Date();

    // Create random dates, some past, some future
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const data = [
        { "MÜŞTERİ ADI": "Ahmet Yılmaz (Gecikmiş)", "TEL NO": "05551112233", "DURUM": "ULAŞILAMADI", "GELECEK ARAMA": yesterday.toISOString() },
        { "MÜŞTERİ ADI": "Mehmet Demir (Bugün)", "TEL NO": "05552223344", "DURUM": "TEKRAR ARANACAK", "GELECEK ARAMA": today.toISOString() },
        { "MÜŞTERİ ADI": "Ayşe Kaya (Gelecek)", "TEL NO": "05553334455", "DURUM": "BEKLİYOR", "GELECEK ARAMA": tomorrow.toISOString() },
        { "MÜŞTERİ ADI": "Fatma Şahin (Aranmadı)", "TEL NO": "05554445566", "DURUM": "BEKLİYOR", "GELECEK ARAMA": "" }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Müşteriler");

    const desktopPath = path.join(process.env.HOME || process.env.USERPROFILE, "Desktop", "test_musteriler.xlsx");

    XLSX.writeFile(wb, desktopPath);
    console.log(`Test Excel file created successfully at: ${desktopPath}`);
}

createDummyExcel();
