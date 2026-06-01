import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

function FinanceChart({ transactions, selectedMonth, selectedYear }) {
  /* -------------------------------------------------------------------------- */
  /*                           PIE CHART (FILTER BULAN)                         */
  /* -------------------------------------------------------------------------- */

  const expenseTransactions = transactions.filter((t) => {
    const date = new Date(t.transaction_date);

    if (selectedMonth === "all") {
      return t.type === "expense";
    }

    return t.type === "expense" && date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  const categoryMap = {};

  expenseTransactions.forEach((t) => {
    const category = t.category_name || "Other";

    if (!categoryMap[category]) {
      categoryMap[category] = 0;
    }

    categoryMap[category] += Number(t.amount);
  });

  const totalExpense = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const pieData = Object.keys(categoryMap).map((key) => ({
    name: key,

    value: categoryMap[key],

    percent: totalExpense > 0 ? ((categoryMap[key] / totalExpense) * 100).toFixed(0) : 0,
  }));

  /* -------------------------------------------------------------------------- */
  /*                                6 MONTH TREND                               */
  /* -------------------------------------------------------------------------- */

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  const validTransactions = transactions.filter((t) => t.transaction_date);

  const monthMap = {};

  validTransactions.forEach((t) => {
    const date = new Date(t.transaction_date);

    const monthIndex = date.getMonth();

    const year = date.getFullYear();

    const key = `${year}-${monthIndex}`;

    if (!monthMap[key]) {
      monthMap[key] = {
        month: monthNames[monthIndex],

        income: 0,

        expense: 0,

        year,

        monthIndex,

        sortDate: new Date(year, monthIndex),
      };
    }

    if (t.type === "income") {
      monthMap[key].income += Number(t.amount);
    } else {
      monthMap[key].expense += Number(t.amount);
    }
  });

  const last6Months = Object.values(monthMap)
    .sort((a, b) => a.sortDate - b.sortDate)
    .slice(-6);

  /* -------------------------------------------------------------------------- */
  /*                                   COLORS                                   */
  /* -------------------------------------------------------------------------- */

  const COLORS = ["#c4b5fd", "#86efac", "#fcd34d", "#fca5a5", "#67e8f9", "#fdba74"];

  /* -------------------------------------------------------------------------- */
  /*                                   FORMAT                                   */
  /* -------------------------------------------------------------------------- */

  const formatRupiah = (value) => {
    return `Rp ${Number(value).toLocaleString("id-ID")}`;
  };

  const formatCompactRupiah = (value) => {
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1).replace(".", ",")}jt`;
    }

    return `Rp ${Number(value).toLocaleString("id-ID")}`;
  };

  return (
    <div className="finance-grid">
      {/* DONUT */}

      <div className="chart-card">
        <h3>Pengeluaran per Kategori</h3>

        <div className="donut-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={75} outerRadius={110} paddingAngle={3}>
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip formatter={(value) => formatRupiah(value)} />

              <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" fontSize="18" fill="#555">
                Total
              </text>

              <text x="50%" y="57%" textAnchor="middle" dominantBaseline="middle" fontSize="28" fontWeight="bold" fill="#222">
                {formatCompactRupiah(totalExpense)}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="custom-legend">
          {pieData.map((item, index) => (
            <div key={index} className="legend-item">
              <span
                className="legend-color"
                style={{
                  background: COLORS[index % COLORS.length],
                }}
              />

              <span>
                {item.name} {item.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* LINE CHART */}

      <div className="chart-card">
        <h3>Tren 6 Bulan</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={last6Months}
            margin={{
              top: 20,
              right: 30,
              left: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="month"
              padding={{
                left: 20,
                right: 20,
              }}
            />

            <YAxis hide width={20} />

            <Tooltip formatter={(value) => formatRupiah(value)} />

            <Legend />

            <Line type="linear" dataKey="income" stroke="#5b4bc4" strokeWidth={4} dot={false} name="Pemasukan" />

            <Line type="linear" dataKey="expense" stroke="#e8b5a6" strokeWidth={4} dot={false} name="Pengeluaran" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default FinanceChart;
