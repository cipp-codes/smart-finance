import { useState, useEffect } from "react";
import { Wallet, TriangleAlert, Flame, Trophy } from "lucide-react";

import Navbar from "../components/Navbar";
import "../styles/goals.css";

import { useFinance } from "../context/FinanceContext";

function Goals() {
  const { goals, setGoals } = useFinance();

  const userId = localStorage.getItem("userId");

  const [form, setForm] = useState({
    title: "",
    target_amount: "",
    current_amount: "",
    deadline: "",
  });

  /* -------------------------------------------------------------------------- */
  /*                                  GET GOALS                                 */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/goals?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => setGoals(data))
      .catch((err) => console.log(err));
  }, [userId]);

  /* -------------------------------------------------------------------------- */
  /*                                HANDLE INPUT                                */
  /* -------------------------------------------------------------------------- */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                                 RESET FORM                                 */
  /* -------------------------------------------------------------------------- */

  const resetForm = () => {
    setForm({
      title: "",
      target_amount: "",
      current_amount: "",
      deadline: "",
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                                 TAMBAH GOAL                                */
  /* -------------------------------------------------------------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          user_id: userId,
        }),
      });

      const newGoal = await res.json();

      setGoals((prev) => [newGoal, ...prev]);

      resetForm();
    } catch (err) {
      console.log(err);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                 DELETE GOAL                                */
  /* -------------------------------------------------------------------------- */

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/goals/${id}`, {
        method: "DELETE",
      });

      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                               TAMBAH TABUNGAN                              */
  /* -------------------------------------------------------------------------- */

  const handleAddSaving = async (id, amount) => {
    if (!amount) return;

    const goal = goals.find((g) => g.id === id);

    const newAmount = Number(goal.current_amount) + Number(amount);

    try {
      const res = await fetch(`http://localhost:5000/goals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_amount: newAmount,
        }),
      });

      const updatedGoal = await res.json();

      setGoals((prev) => prev.map((g) => (g.id === id ? updatedGoal : g)));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="goals">
        <div className="goals-header">
          <div>
            <h2>Financial Goals</h2>

            <p className="goal-count">{goals.filter((g) => Number(g.current_amount) < Number(g.target_amount)).length} target aktif</p>
          </div>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit} className="form">
          <input type="text" name="title" placeholder="Nama tujuan" value={form.title} onChange={handleChange} required />

          <input type="number" name="target_amount" placeholder="Target (Rp)" value={form.target_amount} onChange={handleChange} required />

          <input type="number" name="current_amount" placeholder="Tabungan sekarang" value={form.current_amount} onChange={handleChange} required />

          <input type="date" name="deadline" value={form.deadline} onChange={handleChange} required />

          <button type="submit">+ Target baru</button>
        </form>

        {/* LIST */}

        <div className="goal-list">
          {goals.length === 0 ? (
            <p className="empty-goal">Belum ada goal</p>
          ) : (
            goals.map((g, index) => {
              const targetAmount = Number(g.target_amount);

              const savedAmount = Number(g.current_amount);

              const progress = Math.min((savedAmount / targetAmount) * 100, 100);

              /* -------------------------------------------------------------------------- */
              /*                                  AI LOGIC                                  */
              /* -------------------------------------------------------------------------- */

              const remaining = targetAmount - savedAmount;

              const today = new Date();

              const deadline = new Date(g.deadline);

              const diffMonth = (deadline.getFullYear() - today.getFullYear()) * 12 + (deadline.getMonth() - today.getMonth());

              const monthlySaving = diffMonth > 0 ? Math.max(remaining / diffMonth, 0) : Math.max(remaining, 0);

              /* -------------------------------------------------------------------------- */
              /*                                 AI MESSAGE                                 */
              /* -------------------------------------------------------------------------- */

              let aiMessage = "";

              let warningMessage = "";

              if (savedAmount >= targetAmount) {
                aiMessage = "Target berhasil tercapai!";
              } else {
                aiMessage = `Tabung Rp ${Math.ceil(monthlySaving).toLocaleString("id-ID")}/bulan agar tepat waktu`;

                if (monthlySaving > 5000000) {
                  warningMessage = "Target ini cukup ambisius berdasarkan deadline yang dipilih.";
                }
              }

              /* -------------------------------------------------------------------------- */
              /*                                 MOTIVATION                                 */
              /* -------------------------------------------------------------------------- */

              let motivation = "";

              if (savedAmount >= targetAmount) {
                motivation = "Selamat! Target kamu sudah tercapai!";
              } else if (progress >= 70) {
                motivation = "Sedikit lagi target tercapai!";
              } else if (progress >= 30) {
                motivation = "Progress kamu bagus!";
              } else {
                motivation = "Konsisten menabung ya!";
              }

              /* -------------------------------------------------------------------------- */
              /*                                   COLORS                                   */
              /* -------------------------------------------------------------------------- */

              const colors = ["#5b4fcf", "#10b981", "#f59e0b"];

              const color = colors[index % colors.length];

              return (
                <div key={g.id} className="goal-item">
                  {/* TOP */}

                  <div className="goal-top">
                    <div className="goal-title">
                      <h3>{g.title}</h3>

                      <p>Target: Rp {targetAmount.toLocaleString("id-ID")}</p>
                    </div>

                    <div
                      className="goal-percent"
                      style={{
                        background: `${color}20`,
                        color,
                      }}
                    >
                      {progress.toFixed(0)}%
                    </div>
                  </div>

                  {/* PROGRESS */}

                  <div className="progress-bar">
                    <div
                      className="progress"
                      style={{
                        width: `${progress}%`,
                        background: color,
                      }}
                    ></div>
                  </div>

                  {/* DETAIL */}

                  <div className="goal-detail">
                    <strong>Rp {savedAmount.toLocaleString("id-ID")} terkumpul</strong>

                    <span>
                      Deadline:{" "}
                      {new Date(g.deadline).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* AI */}

                  <div className="ai-box">
                    <div className="ai-saving">
                      {savedAmount >= targetAmount ? <Trophy size={18} /> : <Wallet size={18} />}

                      <span>{aiMessage}</span>
                    </div>

                    {warningMessage && (
                      <div className="ai-warning">
                        <TriangleAlert size={16} />

                        <span>{warningMessage}</span>
                      </div>
                    )}

                    <div className="ai-motivation">
                      <Flame size={16} />

                      <span>{motivation}</span>
                    </div>
                  </div>

                  {/* INPUT TABUNGAN */}

                  <div className="saving-input">
                    <input type="number" placeholder="Tambah tabungan" id={`input-${g.id}`} />

                    <button
                      onClick={() => {
                        const input = document.getElementById(`input-${g.id}`);

                        handleAddSaving(g.id, input.value);

                        input.value = "";
                      }}
                    >
                      Simpan
                    </button>
                  </div>

                  {/* DELETE */}

                  <div className="goal-actions">
                    <button onClick={() => handleDelete(g.id)}>Hapus</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Goals;
