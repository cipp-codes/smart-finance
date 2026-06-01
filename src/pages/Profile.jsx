import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import "../styles/profile.css";

import { Mail, Receipt, Target, Brain, Download, LogOut, FileText, FileSpreadsheet, ShieldAlert } from "lucide-react";

import { useFinance } from "../context/FinanceContext";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Profile({ setIsLogin }) {
  const { transactions, goals } = useFinance();

  const [aiResult, setAiResult] = useState(null);

  const [loadingAI, setLoadingAI] = useState(false);

  const userName = localStorage.getItem("userName");

  const userEmail = localStorage.getItem("userEmail");

  /* -------------------------------------------------------------------------- */
  /*                                    TOTAL                                   */
  /* -------------------------------------------------------------------------- */

  const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);

  const totalTransactions = transactions.length;

  /* -------------------------------------------------------------------------- */
  /*                                    GOALS                                   */
  /* -------------------------------------------------------------------------- */

  const completedGoals = goals.filter((g) => Number(g.current_amount) >= Number(g.target_amount)).length;

  /* -------------------------------------------------------------------------- */
  /*                               CATEGORY TOTALS                              */
  /* -------------------------------------------------------------------------- */

  const foodExpense = transactions.filter((t) => t.type === "expense" && (t.category_name || t.category) === "Food").reduce((sum, t) => sum + Number(t.amount), 0);

  const transportExpense = transactions.filter((t) => t.type === "expense" && (t.category_name || t.category) === "Transport").reduce((sum, t) => sum + Number(t.amount), 0);

  const entertainmentExpense = transactions.filter((t) => t.type === "expense" && (t.category_name || t.category) === "Entertainment").reduce((sum, t) => sum + Number(t.amount), 0);

  const shoppingExpense = transactions.filter((t) => t.type === "expense" && (t.category_name || t.category) === "Shopping").reduce((sum, t) => sum + Number(t.amount), 0);

  const healthExpense = transactions.filter((t) => t.type === "expense" && (t.category_name || t.category) === "Health").reduce((sum, t) => sum + Number(t.amount), 0);

  /* -------------------------------------------------------------------------- */
  /*                                AI FEATURES                                 */
  /* -------------------------------------------------------------------------- */

  const totalExpense = expense;

  const netCashflow = income - totalExpense;

  const avgExpense = totalTransactions > 0 ? totalExpense / totalTransactions : 0;

  const foodRatio = totalExpense > 0 ? foodExpense / totalExpense : 0;

  const transportRatio = totalExpense > 0 ? transportExpense / totalExpense : 0;

  const entertainmentRatio = totalExpense > 0 ? entertainmentExpense / totalExpense : 0;

  const shoppingRatio = totalExpense > 0 ? shoppingExpense / totalExpense : 0;

  const healthRatio = totalExpense > 0 ? healthExpense / totalExpense : 0;

  const otherRatio = totalExpense > 0 ? Math.max(0, 1 - (foodRatio + transportRatio + entertainmentRatio + shoppingRatio + healthRatio)) : 0;

  const savingRate = income > 0 ? netCashflow / income : 0;

  /* -------------------------------------------------------------------------- */
  /*                             EXPENSE TREND MOCK                             */
  /* -------------------------------------------------------------------------- */

  const expenseTrend = 0;

  const rolling3mAvg = netCashflow;

  /* -------------------------------------------------------------------------- */
  /*                                AI ANALYSIS                                 */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (transactions.length === 0) return;

    const generateAIAnalysis = async () => {
      try {
        setLoadingAI(true);

        const payload = {
          total_income: income,

          total_expense: totalExpense,

          net_cashflow: netCashflow,

          tx_count: totalTransactions,

          avg_expense: Number(avgExpense.toFixed(2)),

          food_ratio: Number(foodRatio.toFixed(4)),

          transport_ratio: Number(transportRatio.toFixed(4)),

          entertainment_ratio: Number(entertainmentRatio.toFixed(4)),

          shopping_ratio: Number(shoppingRatio.toFixed(4)),

          health_ratio: Number(healthRatio.toFixed(4)),

          other_ratio: Number(otherRatio.toFixed(4)),

          saving_rate: Number(savingRate.toFixed(4)),

          expense_trend: expenseTrend,

          rolling_3m_avg: rolling3mAvg,
        };

        const response = await fetch("https://ai-financial-recommendation-service-production.up.railway.app/predict", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        });

        const data = await response.json();

        setAiResult(data);
      } catch (error) {
        console.error("AI Error:", error);
      } finally {
        setLoadingAI(false);
      }
    };

    generateAIAnalysis();
  }, [transactions]);

  /* -------------------------------------------------------------------------- */
  /*                               DOWNLOAD EXCEL                               */
  /* -------------------------------------------------------------------------- */

  const downloadExcel = () => {
    const data = transactions.map((t) => ({
      Deskripsi: t.description || "-",

      Kategori: t.category_name || t.category || t.category_id || "-",

      Tipe: t.type === "income" ? "Pemasukan" : "Pengeluaran",

      Jumlah: `Rp ${Number(t.amount).toLocaleString("id-ID")}`,

      Tanggal: t.transaction_date ? new Date(t.transaction_date).toLocaleDateString("id-ID") : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");

    XLSX.writeFile(workbook, "laporan-keuangan.xlsx");
  };

  /* -------------------------------------------------------------------------- */
  /*                                DOWNLOAD PDF                                */
  /* -------------------------------------------------------------------------- */

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text("Laporan Keuangan", 14, 20);

    autoTable(doc, {
      startY: 30,

      head: [["Deskripsi", "Kategori", "Tipe", "Jumlah", "Tanggal"]],

      body: transactions.map((t) => [
        t.description || "-",

        t.category_name || t.category || t.category_id || "-",

        t.type === "income" ? "Pemasukan" : "Pengeluaran",

        `Rp ${Number(t.amount).toLocaleString("id-ID")}`,

        t.transaction_date ? new Date(t.transaction_date).toLocaleDateString("id-ID") : "-",
      ]),
    });

    doc.save("laporan-keuangan.pdf");
  };

  /* -------------------------------------------------------------------------- */
  /*                                   LOGOUT                                   */
  /* -------------------------------------------------------------------------- */

  const handleLogout = () => {
    localStorage.removeItem("isLogin");

    localStorage.removeItem("userId");

    localStorage.removeItem("userName");

    localStorage.removeItem("userEmail");

    setIsLogin(false);
  };

  return (
    <div>
      <Navbar />

      <div className="profile-page">
        {/* HEADER */}
        <div className="profile-header-card">
          <div className="profile-avatar">{userName?.charAt(0).toUpperCase()}</div>

          <div className="profile-user-info">
            <h2>{userName}</h2>

            <p>
              <Mail size={16} />
              {userEmail}
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-top">
              <Receipt size={20} />
              <span>Total transaksi</span>
            </div>

            <h3>{totalTransactions}</h3>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <Target size={20} />
              <span>Goals selesai</span>
            </div>

            <h3>
              {completedGoals} / {goals.length}
            </h3>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <Brain size={20} />
              <span>AI Behavior</span>
            </div>

            <p className="behavior-text">{loadingAI ? "Menganalisis..." : aiResult?.prediction?.behavior_segment?.label || "Belum ada data"}</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <ShieldAlert size={20} />
              <span>Financial Risk</span>
            </div>

            <p className="behavior-text">{loadingAI ? "Menganalisis..." : aiResult?.prediction?.financial_risk?.label || "Belum ada data"}</p>
          </div>
        </div>

        {/* AI RECOMMENDATION */}
        {aiResult?.prediction?.recommendation && (
          <div className="ai-profile-box">
            <h3>{aiResult.prediction.recommendation.title}</h3>

            <p>{aiResult.prediction.recommendation.message}</p>
          </div>
        )}

        {/* FINANCE */}
        <div className="finance-summary">
          <div className="summary-card">
            <p>Total pemasukan</p>

            <h3>Rp {income.toLocaleString("id-ID")}</h3>
          </div>

          <div className="summary-card">
            <p>Total pengeluaran</p>

            <h3>Rp {expense.toLocaleString("id-ID")}</h3>
          </div>
        </div>

        {/* DOWNLOAD */}
        <div className="download-section">
          <h3>
            <Download size={20} />
            Download laporan
          </h3>

          <div className="download-box">
            {/* EXCEL */}
            <div className="download-item">
              <div className="download-left">
                <FileSpreadsheet size={20} />

                <span>Download laporan (.xlsx)</span>
              </div>

              <button onClick={downloadExcel}>Unduh</button>
            </div>

            {/* PDF */}
            <div className="download-item">
              <div className="download-left">
                <FileText size={20} />

                <span>Download laporan (.pdf)</span>
              </div>

              <button onClick={downloadPDF}>Unduh</button>
            </div>
          </div>
        </div>

        {/* LOGOUT */}
        <div className="logout-wrapper">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
