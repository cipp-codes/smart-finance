import { createContext, useContext, useState, useEffect } from "react";

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
  const username = localStorage.getItem("username");

  // TRANSACTIONS (per user)
  const [transactions, setTransactions] = useState(() => {
    if (!username) return [];
    const data = localStorage.getItem(`transactions_${username}`);
    return data ? JSON.parse(data) : [];
  });

  // GOALS (per user)
  const [goals, setGoals] = useState(() => {
    if (!username) return [];
    const data = localStorage.getItem(`goals_${username}`);
    return data ? JSON.parse(data) : [];
  });

  // RESET SAAT USER BERUBAH
  useEffect(() => {
    if (!username) return;

    const userTransactions = JSON.parse(localStorage.getItem(`transactions_${username}`)) || [];

    const userGoals = JSON.parse(localStorage.getItem(`goals_${username}`)) || [];

    setTransactions(userTransactions);
    setGoals(userGoals);
  }, [username]);

  // SIMPAN TRANSACTIONS PER USER
  useEffect(() => {
    if (!username) return;

    localStorage.setItem(`transactions_${username}`, JSON.stringify(transactions));
  }, [transactions, username]);

  // SIMPAN GOALS PER USER
  useEffect(() => {
    if (!username) return;

    localStorage.setItem(`goals_${username}`, JSON.stringify(goals));
  }, [goals, username]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        setTransactions,
        goals,
        setGoals,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}
