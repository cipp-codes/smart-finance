import { HiOutlineShoppingBag, HiOutlineTruck, HiOutlineSparkles, HiOutlineXMark } from "react-icons/hi2";

import { LuUtensils } from "react-icons/lu";
import { FaPills } from "react-icons/fa";

import { useState, useEffect } from "react";

import Navbar from "../components/Navbar";

import "../styles/transactions.css";

import { useFinance } from "../context/FinanceContext";

function Transactions() {
  const { transactions, setTransactions } = useFinance();

  const userId = localStorage.getItem("userId");

  /* -------------------------------------------------------------------------- */
  /*                                    STATE                                   */
  /* -------------------------------------------------------------------------- */

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    type: "expense",
    category_id: "",
    transaction_date: "",
  });

  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    type: "expense",
    category_id: "",
    transaction_date: "",
  });

  const [editId, setEditId] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");

  const [filterType, setFilterType] = useState("all");

  const [filterCategory, setFilterCategory] = useState("all");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  /* -------------------------------------------------------------------------- */
  /*                              GET TRANSACTIONS                              */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!userId) return;

    fetch(`https://smart-finance-backend-production-0b0a.up.railway.app/transactions?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          setTransactions([]);
        }
      })
      .catch((err) => console.log(err));
  }, [userId, setTransactions]);

  /* -------------------------------------------------------------------------- */
  /*                               GET CATEGORIES                               */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    fetch("https://smart-finance-backend-production-0b0a.up.railway.app/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);

          if (data.length > 0) {
            setForm((prev) => ({
              ...prev,
              category_id: data[0].id,
            }));
          }
        }
      })
      .catch((err) => console.log(err));
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                                HANDLE INPUT                                */
  /* -------------------------------------------------------------------------- */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                                ADD TRANSACTION                             */
  /* -------------------------------------------------------------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const transactionData = {
      ...form,
      user_id: userId,
      amount: Number(form.amount),

      category_id: form.type === "income" ? null : form.category_id,
    };

    try {
      const res = await fetch("https://smart-finance-backend-production-0b0a.up.railway.app/transactions", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(transactionData),
      });

      const savedTransaction = await res.json();

      setTransactions((prev) => [savedTransaction, ...prev]);

      setForm({
        description: "",
        amount: "",
        type: "expense",
        category_id: categories.length > 0 ? categories[0].id : "",
        transaction_date: "",
      });
    } catch (err) {
      console.log(err);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */

  const handleDelete = async (id) => {
    try {
      await fetch(`https://smart-finance-backend-production-0b0a.up.railway.app/transactions/${id}`, {
        method: "DELETE",
      });

      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                   OPEN EDIT                                */
  /* -------------------------------------------------------------------------- */

  const handleEdit = (transaction) => {
    setEditForm({
      description: transaction.description || "",

      amount: transaction.amount || "",

      type: transaction.type || "expense",

      category_id: transaction.category_id || "",

      transaction_date: transaction.transaction_date || "",
    });

    setEditId(transaction.id);

    setShowModal(true);
  };

  /* -------------------------------------------------------------------------- */
  /*                                 UPDATE EDIT                                */
  /* -------------------------------------------------------------------------- */

  const handleUpdate = async () => {
    try {
      const transactionData = {
        ...editForm,
        user_id: userId,
        amount: Number(editForm.amount),

        category_id: editForm.type === "income" ? null : editForm.category_id,
      };

      const res = await fetch(`https://smart-finance-backend-production-0b0a.up.railway.app/transactions/${editId}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(transactionData),
      });

      const updatedTransaction = await res.json();

      setTransactions((prev) => prev.map((t) => (t.id === editId ? updatedTransaction : t)));

      setShowModal(false);

      setEditId(null);
    } catch (err) {
      console.log(err);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                   FILTER                                   */
  /* -------------------------------------------------------------------------- */

  const filteredTransactions = transactions.filter((t) => {
    const matchSearch = t.description?.toLowerCase().includes(search.toLowerCase());

    const matchType = filterType === "all" ? true : t.type === filterType;

    const matchCategory = filterCategory === "all" ? true : t.category_name === filterCategory;

    const localDate = t.transaction_date;

    const matchDate = (!startDate || localDate >= startDate) && (!endDate || localDate <= endDate);

    return matchSearch && matchType && matchCategory && matchDate;
  });

  /* -------------------------------------------------------------------------- */
  /*                                    ICON                                    */
  /* -------------------------------------------------------------------------- */

  const getIcon = (category) => {
    switch (category) {
      case "Food":
        return <LuUtensils />;

      case "Shopping":
        return <HiOutlineShoppingBag />;

      case "Transport":
        return <HiOutlineTruck />;

      case "Health":
        return <FaPills />;

      case "Entertainment":
        return <HiOutlineSparkles />;

      default:
        return <HiOutlineShoppingBag />;
    }
  };

  const getBg = (category) => {
    switch (category) {
      case "Food":
        return "#ede9fe";

      case "Shopping":
        return "#fee2e2";

      case "Transport":
        return "#fef3c7";

      case "Health":
        return "#dcfce7";

      case "Entertainment":
        return "#dbeafe";

      default:
        return "#f1f5f9";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const datePart = dateString.split("T")[0];

    const [year, month, day] = datePart.split("-");

    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <Navbar />

      <div className="transactions">
        <h2>Transactions</h2>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="form">
          <input type="text" name="description" placeholder="Deskripsi transaksi" value={form.description} onChange={handleChange} required />

          <input type="number" name="amount" placeholder="Jumlah" value={form.amount} onChange={handleChange} required />

          <select name="type" value={form.type} onChange={handleChange}>
            <option value="expense">Pengeluaran</option>

            <option value="income">Pemasukan</option>
          </select>

          {form.type === "expense" && (
            <select name="category_id" value={form.category_id} onChange={handleChange}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}

          <input type="date" name="transaction_date" value={form.transaction_date} onChange={handleChange} required />

          <button type="submit">Tambah</button>
        </form>

        {/* SEARCH */}
        <div className="search-wrapper">
          <div className="search-box">
            <input type="text" placeholder="Cari transaksi..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="date-filter">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        {/* FILTER */}
        <div className="filter-container">
          <button
            type="button"
            className={filterType === "all" && filterCategory === "all" ? "active-filter" : ""}
            onClick={() => {
              setFilterType("all");

              setFilterCategory("all");
            }}
          >
            Semua
          </button>

          <button
            type="button"
            className={filterType === "income" ? "active-income" : "income-filter"}
            onClick={() => {
              setFilterType("income");

              setFilterCategory("all");
            }}
          >
            Pemasukan
          </button>

          <button
            type="button"
            className={filterType === "expense" ? "active-expense" : "expense-filter"}
            onClick={() => {
              setFilterType("expense");

              setFilterCategory("all");
            }}
          >
            Pengeluaran
          </button>

          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              className={filterCategory === category.name ? "active-filter" : ""}
              onClick={() => {
                setFilterType("all");

                setFilterCategory(filterCategory === category.name ? "all" : category.name);
              }}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="list">
          {filteredTransactions.length === 0 ? (
            <p>Belum ada transaksi</p>
          ) : (
            filteredTransactions.map((t) => (
              <div key={t.id} className="item">
                <div className="item-left">
                  <div
                    className="transaction-icon"
                    style={{
                      background: getBg(t.category_name || "Entertainment"),
                    }}
                  >
                    {getIcon(t.category_name || "Entertainment")}
                  </div>

                  <div className="transaction-info">
                    <h3>{t.description}</h3>

                    <p>{t.type === "expense" ? `Pengeluaran • ${t.category_name}` : "Pemasukan"}</p>

                    <small>{formatDate(t.transaction_date)}</small>
                  </div>
                </div>

                <div className="item-right">
                  <div className={`amount ${t.type === "income" ? "income" : "expense"}`}>
                    {t.type === "income" ? "+" : "-"}
                    Rp {Number(t.amount).toLocaleString("id-ID")}
                  </div>

                  <div className="actions">
                    <button className="edit-btn" onClick={() => handleEdit(t)}>
                      Edit
                    </button>

                    <button className="delete-btn" onClick={() => handleDelete(t.id)}>
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Transaksi</h3>

              <button className="close-modal" onClick={() => setShowModal(false)}>
                <HiOutlineXMark />
              </button>
            </div>

            <div className="form-group">
              <label>Deskripsi Transaksi</label>

              <input type="text" name="description" placeholder="Masukkan deskripsi transaksi" value={editForm.description || ""} onChange={handleEditChange} />
            </div>

            <div className="form-group">
              <label>Jumlah</label>

              <input type="number" name="amount" placeholder="Masukkan jumlah" value={editForm.amount || ""} onChange={handleEditChange} />
            </div>

            <div className="form-group">
              <label>Jenis Transaksi</label>

              <select name="type" value={editForm.type} onChange={handleEditChange}>
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
            </div>

            {editForm.type === "expense" && (
              <div className="form-group">
                <label>Kategori</label>

                <select name="category_id" value={editForm.category_id} onChange={handleEditChange}>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Tanggal</label>

              <input type="date" name="transaction_date" value={editForm.transaction_date} onChange={handleEditChange} />
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                Batal
              </button>

              <button className="save-btn" onClick={handleUpdate}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
