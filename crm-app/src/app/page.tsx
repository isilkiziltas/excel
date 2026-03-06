"use client";
import { useState, useEffect } from "react";
import { Phone, Users, CalendarClock } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, today: 0, overdue: 0 });
  const { t } = useLanguage();

  useEffect(() => {
    async function loadStats() {
      try {
        const [todayRes, overdueRes, allRes] = await Promise.all([
          fetch("/api/customers?filter=today"),
          fetch("/api/customers?filter=overdue"),
          fetch("/api/customers")
        ]);
        const today = await todayRes.json();
        const overdue = await overdueRes.json();
        const all = await allRes.json();
        setStats({
          today: today?.length || 0,
          overdue: overdue?.length || 0,
          total: all?.length || 0
        });
      } catch (e) {
        console.error(e);
      }
    }
    loadStats();
  }, []);

  return (
    <>
      <header className="header">
        <h1 className="page-title">{t("dashboardTitle")}</h1>
      </header>
      <div className="page-content">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card stat-card stat-gray">
            <div className="stat-icon" style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
              <Users size={24} />
            </div>
            <div className="stat-label">{t("totalCustomers")}</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="card stat-card stat-green">
            <div className="stat-icon" style={{ backgroundColor: "#dcfce7", color: "var(--success)" }}>
              <Phone size={24} />
            </div>
            <div className="stat-label">{t("callsToday")}</div>
            <div className="stat-value">{stats.today}</div>
          </div>
          <div className="card stat-card stat-red">
            <div className="stat-icon" style={{ backgroundColor: "#fee2e2", color: "var(--danger)" }}>
              <CalendarClock size={24} />
            </div>
            <div className="stat-label">{t("overdueCalls")}</div>
            <div className="stat-value">{stats.overdue}</div>
          </div>
        </div>

        <div className="card">
          <div className="flex-between">
            <h2 className="card-title">{t("quickActions")}</h2>
          </div>
          <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
            {t("quickActionsDesc")}
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/customers" className="btn btn-primary">
              {t("goToCustomerList")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
