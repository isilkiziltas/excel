/* eslint-disable react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import toast from "react-hot-toast";
import { Search, Plus, Upload, PhoneForwarded, X, Menu } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUI } from "@/contexts/UIContext";

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
    const { t, language } = useLanguage();
    const { toggleSidebar } = useUI();

    const dateLocale = language === "en" ? enUS : tr;

    // Modals state
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", notes: "" });

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkStatus, setBulkStatus] = useState("ULAŞILAMADI");
    const [bulkNote, setBulkNote] = useState("");

    // Update Form State
    const [updateStatus, setUpdateStatus] = useState("ULAŞILAMADI");
    const [updateNote, setUpdateNote] = useState("");

    // Play a gentle beep sound for notifications
    const playReminderSound = () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // Slide up

            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05); // Fade in
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); // Fade out

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.warn("Audio API unsupported or blocked", e);
        }
    };

    const fetchCustomers = async (showNotification = false) => {
        try {
            setLoading(true);
            const res = await fetch("/api/customers");
            const data = await res.json();
            if (Array.isArray(data)) {
                setCustomers(data);

                // Check if any customer is due today or overdue
                if (showNotification) {
                    const now = new Date();
                    now.setHours(23, 59, 59, 999); // End of today
                    const hasDue = data.some(c => c.nextCallDate && new Date(c.nextCallDate) <= now && c.status !== "TAMAMLANDI");
                    if (hasDue) {
                        playReminderSound();
                        toast(t("callsToday") + ": Lütfen aranması gereken müşterileri kontrol ediniz.", {
                            icon: '🔔',
                            style: { border: '1px solid var(--danger)', color: 'var(--danger)' },
                            duration: 5000,
                        });
                    }
                }
            } else {
                console.error("API Error:", data);
                setCustomers([]);
                toast.error(t("toastConnError"));
            }
        } catch {
            toast.error(t("toastConnError"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers(true); // Check for reminders on first load
    }, []);

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const toastId = toast.loading(t("loading"));
        try {
            const res = await fetch("/api/import", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`${t("toastImportSuccessPrefix")}${data.count}${t("toastImportSuccessSuffix")}`, { id: toastId });
                fetchCustomers();
            } else {
                toast.error(`${t("toastImportFailed")}: ${data.error}`, { id: toastId });
            }
        } catch (e) {
            toast.error(t("toastConnError"), { id: toastId });
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

        let nextDate = null;
        if (updateStatus === "ULAŞILAMADI" || updateStatus === "TEKRAR ARANACAK" || updateStatus === "BEKLİYOR") {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            nextDate = nextWeek.toISOString();
        }

        const toastId = toast.loading(t("saving"));
        try {
            const res = await fetch(`/api/customers/${selectedCustomer.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: updateStatus,
                    notes: updateNote,
                    lastCallDate: new Date().toISOString(),
                    nextCallDate: nextDate,
                }),
            });

            if (res.ok) {
                toast.success(t("toastUpdateSuccess"), { id: toastId });
                closeUpdateModal();
                fetchCustomers();
            } else {
                toast.error(t("toastUpdateFailed"), { id: toastId });
            }
        } catch (e) {
            toast.error(t("toastConnError"), { id: toastId });
        }
    };

    const getStatusBadgeClass = (status: string) => {
        if (status === "ULAŞILAMADI") return "badge-danger";
        if (status === "TAMAMLANDI") return "badge-success";
        if (status === "TEKRAR ARANACAK") return "badge-warning";
        return "badge-neutral";
    };

    const translateStatus = (status: string) => {
        if (status === "ULAŞILAMADI") return t("statusUnreachable");
        if (status === "TAMAMLANDI") return t("statusCompleted");
        if (status === "TEKRAR ARANACAK") return t("statusCallAgain");
        if (status === "BEKLİYOR") return t("statusPending");
        return status;
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        return format(new Date(dateStr), "dd MMM yyyy", { locale: dateLocale });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredCustomers.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedIds.length === 0) return;

        let nextDate = null;
        if (bulkStatus === "ULAŞILAMADI" || bulkStatus === "TEKRAR ARANACAK" || bulkStatus === "BEKLİYOR") {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            nextDate = nextWeek.toISOString();
        }

        const toastId = toast.loading(`${t("toastBulkUpdatingPrefix")}${selectedIds.length}${t("toastBulkUpdatingSuffix")}`);
        try {
            const res = await fetch("/api/customers/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerIds: selectedIds,
                    status: bulkStatus,
                    notes: bulkNote,
                    nextCallDate: nextDate,
                }),
            });

            if (res.ok) {
                toast.success(`${t("toastBulkSuccessPrefix")}${selectedIds.length}${t("toastBulkSuccessSuffix")}`, { id: toastId });
                setIsBulkModalOpen(false);
                setSelectedIds([]);
                fetchCustomers();
            } else {
                toast.error(t("toastBulkFailed"), { id: toastId });
            }
        } catch {
            toast.error(t("toastConnError"), { id: toastId });
        }
    };

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCustomer.name || !newCustomer.phone) {
            toast.error(t("toastNamePhoneRequired"));
            return;
        }

        const toastId = toast.loading(t("toastAddingCustomer"));
        try {
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newCustomer.name,
                    phone: newCustomer.phone,
                    notes: newCustomer.notes,
                    status: "BEKLİYOR"
                }),
            });

            if (res.ok) {
                toast.success(t("toastCustomerAddedSuccess"), { id: toastId });
                setNewCustomer({ name: "", phone: "", notes: "" });
                setIsAddModalOpen(false);
                fetchCustomers();
            } else {
                const data = await res.json();
                toast.error(`${t("toastAddFailed")} ` + (data.error || ""), { id: toastId });
            }
        } catch {
            toast.error(t("toastConnError"), { id: toastId });
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <header className="header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="hamburger-btn" onClick={toggleSidebar}>
                        <Menu size={24} />
                    </button>
                    <h1 className="page-title">{t("customersTitle")}</h1>
                </div>
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
                        <Upload size={16} /> {t("uploadExcel")}
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={16} /> {t("newCustomer")}
                    </button>
                </div>
            </header>

            {selectedIds.length > 0 && (
                <div style={{ backgroundColor: "rgba(218, 37, 29, 0.05)", padding: "12px 32px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 600, color: "var(--primary)" }}>
                        {selectedIds.length} {t("customersSelected")}
                    </div>
                    <div className="flex gap-2">
                        <button className="btn btn-secondary" onClick={() => setSelectedIds([])} style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                            {t("clearSelection")}
                        </button>
                        <button className="btn btn-primary" onClick={() => setIsBulkModalOpen(true)} style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                            {t("bulkActionBtn")}
                        </button>
                    </div>
                </div>
            )}

            <div className="page-content">
                <div className="card mb-6">
                    <div className="form-group" style={{ marginBottom: 0, position: "relative" }}>
                        <Search size={18} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--text-secondary)" }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder={t("searchPlaceholder")}
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
                                <th style={{ width: "40px", textAlign: "center" }}>
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length}
                                    />
                                </th>
                                <th>{t("colName")}</th>
                                <th>{t("colPhone")}</th>
                                <th>{t("colStatus")}</th>
                                <th>{t("colLastCall")}</th>
                                <th>{t("colNextCall")}</th>
                                <th>{t("colActions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center" }}>{t("loading")}</td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center" }}>{t("noCustomersFound")}</td>
                                </tr>
                            ) : (
                                filteredCustomers.map((c) => {
                                    // isDue checks if the nextCallDate is today or older
                                    const now = new Date();
                                    now.setHours(23, 59, 59, 999);

                                    const isDue = c.nextCallDate && new Date(c.nextCallDate) <= now && c.status !== "TAMAMLANDI";
                                    const isSelected = selectedIds.includes(c.id);
                                    let rowClass = "";
                                    if (isDue) rowClass = "row-due";

                                    return (
                                        <tr key={c.id} className={rowClass} style={{ backgroundColor: isSelected ? "rgba(218, 37, 29, 0.03)" : undefined }}>
                                            <td style={{ textAlign: "center" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectOne(c.id)}
                                                />
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{c.name}</td>
                                            <td>{c.phone}</td>
                                            <td>
                                                <span className={`badge ${getStatusBadgeClass(c.status)}`}>
                                                    {translateStatus(c.status)}
                                                </span>
                                            </td>
                                            <td>{formatDate(c.lastCallDate)}</td>
                                            <td style={{ fontWeight: c.nextCallDate ? 600 : 400 }}>
                                                {formatDate(c.nextCallDate)}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: "4px 8px", fontSize: "12px", border: isDue ? "1px solid var(--danger)" : undefined }}
                                                    onClick={() => openUpdateModal(c)}
                                                >
                                                    <PhoneForwarded size={14} /> {t("enterResultBtn")}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isUpdateModalOpen && selectedCustomer && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{t("updateModalTitle")}: {selectedCustomer.name}</h3>
                            <button className="modal-close" onClick={closeUpdateModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateCallStatus}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">{t("callStatusLabel")}</label>
                                    <select
                                        className="form-control"
                                        value={updateStatus}
                                        onChange={(e) => setUpdateStatus(e.target.value)}
                                    >
                                        <option value="BEKLİYOR">{t("statusPending")}</option>
                                        <option value="ULAŞILAMADI">{t("statusUnreachable")}</option>
                                        <option value="TEKRAR ARANACAK">{t("statusCallAgain")}</option>
                                        <option value="TAMAMLANDI">{t("statusCompleted")}</option>
                                    </select>
                                </div>
                                <div className="form-group mb-0">
                                    <label className="form-label">{t("noteOptLabel")}</label>
                                    <textarea
                                        className="form-control"
                                        rows={4}
                                        placeholder={t("notePlaceholder")}
                                        value={updateNote}
                                        onChange={(e) => setUpdateNote(e.target.value)}
                                    />
                                </div>
                                {(updateStatus === "ULAŞILAMADI" || updateStatus === "TEKRAR ARANACAK") && (
                                    <div className="mt-4" style={{ padding: "16px", backgroundColor: "rgba(218, 37, 29, 0.1)", borderLeft: "4px solid var(--primary)", borderRadius: "var(--radius-md)" }}>
                                        <p style={{ fontSize: "0.9rem", color: "var(--primary)", margin: 0, fontWeight: 500 }}>
                                            <strong>Bilgi:</strong> {t("info7Days")}
                                        </p>
                                    </div>
                                )}                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeUpdateModal}>
                                    {t("cancel")}
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {t("saveAndClose")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Modal */}
            {isBulkModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{t("bulkModalTitle")}</h3>
                            <button className="modal-close" onClick={() => setIsBulkModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleBulkUpdate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">{t("callStatusLabel")}</label>
                                    <select
                                        className="form-control"
                                        value={bulkStatus}
                                        onChange={(e) => setBulkStatus(e.target.value)}
                                    >
                                        <option value="BEKLİYOR">{t("statusPending")}</option>
                                        <option value="ULAŞILAMADI">{t("statusUnreachable")}</option>
                                        <option value="TEKRAR ARANACAK">{t("statusCallAgain")}</option>
                                        <option value="TAMAMLANDI">{t("statusCompleted")}</option>
                                    </select>
                                </div>
                                <div className="form-group mb-0">
                                    <label className="form-label">{t("commonNoteLabel")}</label>
                                    <textarea
                                        className="form-control"
                                        rows={4}
                                        placeholder={t("commonNotePlaceholder")}
                                        value={bulkNote}
                                        onChange={(e) => setBulkNote(e.target.value)}
                                    />
                                </div>
                                {(bulkStatus === "ULAŞILAMADI" || bulkStatus === "TEKRAR ARANACAK") && (
                                    <div className="mt-4" style={{ padding: "16px", backgroundColor: "rgba(218, 37, 29, 0.1)", borderLeft: "4px solid var(--primary)", borderRadius: "var(--radius-md)" }}>
                                        <p style={{ fontSize: "0.9rem", color: "var(--primary)", margin: 0, fontWeight: 500 }}>
                                            <strong>Bilgi:</strong> {t("bulkInfo7Days")}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsBulkModalOpen(false)}>
                                    {t("cancel")}
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {t("bulkSaveBtn")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manual Add Modal */}
            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{t("addModalTitle")}</h3>
                            <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddCustomer}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">{t("fullNameLabel")}</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        placeholder={t("fullNamePlaceholder")}
                                        value={newCustomer.name}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t("phoneLabel")}</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        placeholder={t("phonePlaceholder")}
                                        value={newCustomer.phone}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    />
                                </div>
                                <div className="form-group mb-0">
                                    <label className="form-label">{t("noteOptLabel")}</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        placeholder={t("notePlaceholder")}
                                        value={newCustomer.notes}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                                    {t("cancel")}
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {t("save")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
