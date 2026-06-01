import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import "../styles/dashboard.css";
import FinanceChart from "../components/FinanceChart";
import Chatbot from "../components/Chatbot";

import { HiMiniHandRaised } from "react-icons/hi2";
import { RiRobot2Fill } from "react-icons/ri";

function Dashboard() {
  const [transactions, setTransactions] = useState([]);

  const [usdRate, setUsdRate] = useState(0);

  // AI RESULT
  const [aiResult, setAiResult] = useState(null);

  const [showAI, setShowAI] = useState(true);

  const userId = localStorage.getItem("userId");

  const [goals, setGoals] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState("all");

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  /* -------------------------------------------------------------------------- */
  /*                              GET TRANSACTIONS                              */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/transactions?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.log(err));
  }, [userId]);

  //

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/goals?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => setGoals(data))
      .catch((err) => console.log(err));
  }, [userId]);

  /* -------------------------------------------------------------------------- */
  /*                                GET USD RATE                                */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then((res) => res.json())
      .then((data) => {
        setUsdRate(data.rates.IDR);
      })
      .catch((err) => console.log(err));
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                              AI RECOMMENDATION                             */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (transactions.length === 0) {
      setAiResult(null);
      return;
    }

    generateAIRecommendation();
  }, [transactions, selectedMonth, selectedYear]);

  const generateAIRecommendation = async () => {
    const incomeTransactions = currentMonthTransactions.filter((t) => t.type === "income");

    const expenseTransactions = currentMonthTransactions.filter((t) => t.type === "expense");

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const txCount = transactions.length;

    const netCashflow = totalIncome - totalExpense;

    const avgExpense = expenseTransactions.length > 0 ? totalExpense / expenseTransactions.length : 0;

    // CATEGORY TOTAL
    const categoryTotal = (name) => {
      return expenseTransactions.filter((t) => t.category_name?.toLowerCase() === name.toLowerCase()).reduce((sum, t) => sum + Number(t.amount), 0);
    };

    const foodExpense = categoryTotal("Food");

    const transportExpense = categoryTotal("Transport");

    const entertainmentExpense = categoryTotal("Entertainment");

    const shoppingExpense = categoryTotal("Shopping");

    const healthExpense = categoryTotal("Health");

    const otherExpense = categoryTotal("Other");

    const payload = {
      total_income: totalIncome,

      total_expense: totalExpense,

      net_cashflow: netCashflow,

      tx_count: txCount,

      avg_expense: avgExpense,

      food_ratio: totalExpense > 0 ? foodExpense / totalExpense : 0,

      transport_ratio: totalExpense > 0 ? transportExpense / totalExpense : 0,

      entertainment_ratio: totalExpense > 0 ? entertainmentExpense / totalExpense : 0,

      shopping_ratio: totalExpense > 0 ? shoppingExpense / totalExpense : 0,

      health_ratio: totalExpense > 0 ? healthExpense / totalExpense : 0,

      other_ratio: totalExpense > 0 ? otherExpense / totalExpense : 0,

      saving_rate: totalIncome > 0 ? netCashflow / totalIncome : 0,

      expense_trend: 0,

      rolling_3m_avg: netCashflow,
    };

    try {
      const res = await fetch("http://localhost:5000/ai-recommendation", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const data = await res.json();

      setAiResult(data.prediction);
    } catch (err) {
      console.log(err);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                               BULAN SEKARANG                               */
  /* -------------------------------------------------------------------------- */

  const now = new Date();

  const currentMonth = selectedMonth;

  const currentYear = selectedYear;

  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;

  /* -------------------------------------------------------------------------- */
  /*                             TRANSAKSI BULAN INI                            */
  /* -------------------------------------------------------------------------- */

  const currentMonthTransactions =
    selectedMonth === "all"
      ? transactions
      : transactions.filter((t) => {
          const date = new Date(t.transaction_date);

          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

  /* -------------------------------------------------------------------------- */
  /*                                   TOTALS                                   */
  /* -------------------------------------------------------------------------- */

  const income = currentMonthTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + Number(t.amount), 0);

  const expense = currentMonthTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + Number(t.amount), 0);

  const balance = income - expense;

  const totalTransactions = transactions.length;

  const balanceUSD = usdRate ? (balance / usdRate).toFixed(2) : 0;

  /* -------------------------------------------------------------------------- */
  /*                                FORMAT RUPIAH                               */
  /* -------------------------------------------------------------------------- */

  const formatRupiah = (value) => {
    return Number(value).toLocaleString("id-ID");
  };

  /* -------------------------------------------------------------------------- */
  /*                            TRANSAKSI BULAN LALU                            */
  /* -------------------------------------------------------------------------- */

  const previousMonthTransactions = transactions.filter((t) => {
    const date = new Date(t.transaction_date);

    return date.getMonth() === previousMonth && date.getFullYear() === currentYear;
  });

  /* -------------------------------------------------------------------------- */
  /*                                   INCOME                                   */
  /* -------------------------------------------------------------------------- */

  const currentIncome = currentMonthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);

  const previousIncome = previousMonthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);

  /* -------------------------------------------------------------------------- */
  /*                                   EXPENSE                                  */
  /* -------------------------------------------------------------------------- */

  const currentExpense = currentMonthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);

  const previousExpense = previousMonthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);

  /* -------------------------------------------------------------------------- */
  /*                                 PERCENTAGE                                 */
  /* -------------------------------------------------------------------------- */

  const incomePercent = previousIncome > 0 ? (((currentIncome - previousIncome) / previousIncome) * 100).toFixed(0) : 0;
  const incomeRatio = previousIncome > 0 ? (currentIncome / previousIncome).toFixed(1).replace(".0", "") : 0;
  const saldoSubtitle = incomePercent > 100 ? `↑ ${incomeRatio}x dari bulan lalu` : `↑ ${incomePercent}% dari bulan lalu`;

  const expensePercent = previousExpense > 0 ? (((currentExpense - previousExpense) / previousExpense) * 100).toFixed(0) : 0;
  const expenseRatio = previousExpense > 0 ? (currentExpense / previousExpense).toFixed(1).replace(".0", "") : 0;
  const expenseSubtitle = expensePercent > 100 ? `↑ ${expenseRatio}x dari bulan lalu` : `↑ ${expensePercent}% dari bulan lalu`;

  /* -------------------------------------------------------------------------- */
  /*                                  TABUNGAN                                  */
  /* -------------------------------------------------------------------------- */

  // total uang yg sudah ditabung dari semua goals
  const saving = goals.reduce((total, goal) => total + Number(goal.current_amount), 0);

  // total target semua goals
  const savingTarget = goals.reduce((total, goal) => total + Number(goal.target_amount), 0);

  // persen tabungan
  const savingPercent = savingTarget > 0 ? ((saving / savingTarget) * 100).toFixed(0) : 0;

  // halo bulan
  const currentDate = new Date();

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const currentMonthName = monthNames[currentMonth];

  // ambil nama user dari localStorage
  const userName = localStorage.getItem("userName");

  return (
    <div>
      <Navbar />

      <div className="dashboard">
        <h2>Dashboard</h2>

        <div className="month-selector">
          <select
            value={selectedMonth === "all" ? "all" : `${selectedYear}-${selectedMonth}`}
            onChange={(e) => {
              if (e.target.value === "all") {
                setSelectedMonth("all");
                return;
              }

              const [year, month] = e.target.value.split("-");

              setSelectedYear(Number(year));
              setSelectedMonth(Number(month));
            }}
          >
            <option value="all">Semua Periode</option>

            {Array.from(
              new Set(
                transactions.map((t) => {
                  const d = new Date(t.transaction_date);

                  return `${d.getFullYear()}-${d.getMonth()}`;
                }),
              ),
            )
              .sort()
              .reverse()
              .map((item) => {
                const [year, month] = item.split("-");

                return (
                  <option key={item} value={item}>
                    {monthNames[month]} {year}
                  </option>
                );
              })}
          </select>
        </div>

        <div className="welcome-text">
          <HiMiniHandRaised className="welcome-icon" />

          <span>
            Selamat datang kembali,
            {userName} — {selectedMonth === "all" ? "Semua Periode" : `${currentMonthName} ${currentYear}`}
          </span>
        </div>

        {/* AI ALERT */}
        {aiResult && showAI && (
          <div className="ai-alert">
            <button className="close-btn" onClick={() => setShowAI(false)}>
              ✕
            </button>

            <h3 className="ai-title">
              <RiRobot2Fill className="ai-icon" />
              AI Insight
            </h3>

            <div className="insight-box">
              <p>
                <strong>{aiResult.recommendation.title}</strong>
              </p>

              <p>{aiResult.recommendation.message}</p>
            </div>

            <div className="insight-box">
              <small>
                Financial Risk: {aiResult.financial_risk.label}
                <br />
                Behavior: {aiResult.behavior_segment.label}
              </small>
            </div>
          </div>
        )}

        {/* CARD */}
        {/* ROW 1 */}
        <div className="card-container">
          <Card title="Saldo" value={`Rp ${formatRupiah(balance)}`} subtitle={saldoSubtitle} subtitleColor="#16a34a" />

          <Card title="Pemasukan" value={`Rp ${formatRupiah(income)}`} subtitle="Bulan ini" subtitleColor="#666" />

          <Card title="Pengeluaran" value={`Rp ${formatRupiah(expense)}`} subtitle={expenseSubtitle} subtitleColor="#dc2626" />

          <Card title="Tabungan" value={`Rp ${formatRupiah(saving)}`} subtitle={`${savingPercent}% dari target`} subtitleColor="#16a34a" />
        </div>

        {/* ROW 2 */}
        <div className="card-container second-row">
          <Card title="Kurs USD" value={`Rp ${formatRupiah(usdRate)}`} />

          <Card title="Saldo USD" value={`$ ${balanceUSD}`} />
        </div>

        {/* CHART */}
        <div className="chart-container">
          <FinanceChart transactions={transactions} selectedMonth={selectedMonth} selectedYear={selectedYear} />
        </div>
      </div>

      <Chatbot />
    </div>
  );
}

export default Dashboard;
