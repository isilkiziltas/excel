"use client";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import toast from "react-hot-toast";
import { Search, Plus, Upload, PhoneForwarded, X } from "lucide-react";

type Customer = {
    id: string;
    name: string;
    phone: string;
    status: string;
    notes: string;
    lastCallDate: string | null;
    nextCallDate: string | null;
    createdAt: string;
};

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modals state
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Update Form State
    const [updateStatus, setUpdateStatus] = useState("ULAŞILAMADI");
    const [updateNote, setUpdateNote] = useState("");

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/customers");
            const data = await res.json();
            if (Array.isArray(data)) {
                setCustomers(data);
            } else {
                console.error("API Error:", data);
                setCustomers([]);
                toast.error("Müşteri listesi alınırken sunucu hatası oluştu.");
            }
        } catch {
            toast.error("Müşteriler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const toastId = toast.loading("Excel yükleniyor...");
        try {
            const res = await fetch("/api/import", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`${data.count} müşteri başarıyla eklendi!`, { id: toastId });
                fetchCustomers();
            } else {
                toast.error("Yükleme hatası: " + data.error, { id: toastId });
            }
        } catch (e) {
            toast.error("Bağlantı hatası.", { id: toastId });
        }

        // reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const openUpdateModal = (customer: Customer) => {
        setSelectedCustomer(customer);
        setUpdateStatus(customer.status || "ULAŞILAMADI");
        setUpdateNote(customer.notes || "");
        setIsUpdateModalOpen(true);
    };

    const closeUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setSelectedCustomer(null);
    };

    const handleUpdateCallStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) return;

        // 7 GÜN MANTIĞI: Eğer durum "Ulaşılamadı" veya "Tekrar Aranacak" ise
        let nextDate = null;
        if (updateStatus === "ULAŞILAMADI" || updateStatus === "TEKRAR ARANACAK" || updateStatus === "BEKLİYOR") {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            nextDate = nextWeek.toISOString();
        } // "TAMAMLANDI" durumunda nextDate null bırakılır

        const toastId = toast.loading("Güncelleniyor...");
        try {
            const res = await fetch(`/api/customers/${selectedCustomer.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: updateStatus,
                    notes: updateNote,
                    lastCallDate: new Date().toISOString(), // Şu an arandı
                    nextCallDate: nextDate,
                }),
            });

            if (res.ok) {
                toast.success("Arama durumu güncellendi ve 7 günlük hatırlatıcı kuruldu!", { id: toastId });
                closeUpdateModal();
                fetchCustomers();
            } else {
                toast.error("Güncelleme başarısız.", { id: toastId });
            }
        } catch (e) {
            toast.error("Bağlantı hatası.", { id: toastId });
        }
    };

    const getStatusBadgeClass = (status: string) => {
        if (status === "ULAŞILAMADI") return "badge-danger";
        if (status === "TAMAMLANDI") return "badge-success";
        if (status === "TEKRAR ARANACAK") return "badge-warning";
        return "badge-neutral";
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        return format(new Date(dateStr), "dd MMM yyyy", { locale: tr });
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <header className="header">
                <h1 className="page-title">Müşteriler</h1>
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        style={{ display: "none" }}
                        ref={fileInputRef}
                        onChange={handleImport}
                    />
                    <button
                        className="btn btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload size={16} /> Excel Yükle
                    </button>
                    <button className="btn btn-primary" onClick={() => toast("Manuel ekleme modülü yakında!")}>
                        <Plus size={16} /> Yeni Müşteri
                    </button>
                </div>
            </header>

            <div className="page-content">
                <div className="card mb-6">
                    <div className="form-group" style={{ marginBottom: 0, position: "relative" }}>
                        <Search size={18} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--text-secondary)" }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="İsim veya telefon numarası ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: "40px" }}
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Müşteri Adı</th>
                                <th>Telefon</th>
                                <th>Durum</th>
                                <th>Son Arama</th>
                                <th>Gelecek Arama</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center" }}>Yükleniyor...</td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center" }}>Müşteri bulunamadı.</td>
                                </tr>
                            ) : (
                                filteredCustomers.map((c) => (
                                    <tr key={c.id}>
                                        <td style={{ fontWeight: 500 }}>{c.name}</td>
                                        <td>{c.phone}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(c.status)}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td>{formatDate(c.lastCallDate)}</td>
                                        <td style={{ fontWeight: c.nextCallDate ? 600 : 400, color: c.nextCallDate && new Date(c.nextCallDate) <= new Date() ? "var(--danger)" : "inherit" }}>
                                            {formatDate(c.nextCallDate)}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: "4px 8px", fontSize: "12px" }}
                                                onClick={() => openUpdateModal(c)}
                                            >
                                                <PhoneForwarded size={14} /> Sonuç Gir
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isUpdateModalOpen && selectedCustomer && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Arama Sonucu: {selectedCustomer.name}</h3>
                            <button className="modal-close" onClick={closeUpdateModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateCallStatus}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Arama Durumu</label>
                                    <select
                                        className="form-control"
                                        value={updateStatus}
                                        onChange={(e) => setUpdateStatus(e.target.value)}
                                    >
                                        <option value="BEKLİYOR">Bekliyor (7 Gün Hatırlatıcı Kurar)</option>
                                        <option value="ULAŞILAMADI">Ulaşılamadı (7 Gün Hatırlatıcı Kurar)</option>
                                        <option value="TEKRAR ARANACAK">Tekrar Aranacak (7 Gün Hatırlatıcı Kurar)</option>
                                        <option value="TAMAMLANDI">Tamamlandı (Hatırlatıcı Gerekmez)</option>
                                    </select>
                                </div>
                                <div className="form-group mb-0">
                                    <label className="form-label">Arama Notları (İsteğe Bağlı)</label>
                                    <textarea
                                        className="form-control"
                                        rows={4}
                                        placeholder="Görüşme detayları..."
                                        value={updateNote}
                                        onChange={(e) => setUpdateNote(e.target.value)}
                                    />
                                </div>
                                {(updateStatus === "ULAŞILAMADI" || updateStatus === "TEKRAR ARANACAK") && (
                                    <div className="mt-4" style={{ padding: "16px", backgroundColor: "#fef2f2", borderLeft: "4px solid var(--primary)", borderRadius: "var(--radius-md)" }}>
                                        <p style={{ fontSize: "0.9rem", color: "#991b1b", margin: 0, fontWeight: 500 }}>
                                            <strong>Bilgi:</strong> Bu durumu seçtiğinizde, sistem arka planda otomatik olarak tam <strong>7 gün sonrasına</strong> hatırlatıcı görev oluşturacaktır.
                                        </p>
                                    </div>
                                )}                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeUpdateModal}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Kaydet ve Kapat
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
