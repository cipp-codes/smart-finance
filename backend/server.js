import express from "express";
import cors from "cors";
import pkg from "pg";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const { Pool } = pkg;

// DATE -> string
pg.types.setTypeParser(1082, (value) => value);

const app = express();

app.use(cors());
app.use(express.json());

/* -------------------------------------------------------------------------- */
/*                                  DATABASE                                  */
/* -------------------------------------------------------------------------- */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .query("SELECT NOW()")
  .then(() => console.log("✅ Supabase Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

/* -------------------------------------------------------------------------- */
/*                                    USERS                                   */
/* -------------------------------------------------------------------------- */

// REGISTER
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const check = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (check.rows.length > 0) {
      return res.json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users(name,email,password)
      VALUES($1,$2,$3)
      RETURNING id,name,email
      `,
      [name, email, hashedPassword],
    );

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
    });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (result.rows.length === 0) {
      return res.json({
        success: false,
      });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({
        success: false,
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                                 CATEGORIES                                 */
/* -------------------------------------------------------------------------- */

// GET ALL CATEGORIES
app.get("/categories", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM categories
      ORDER BY id ASC
      `,
    );

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Gagal ambil categories",
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                                TRANSACTIONS                                */
/* -------------------------------------------------------------------------- */

// GET TRANSACTIONS
app.get("/transactions", async (req, res) => {
  const { user_id } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT
        t.*,
        c.name AS category_name
      FROM transactions t
      LEFT JOIN categories c
      ON t.category_id = c.id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC
      `,
      [user_id],
    );

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Gagal ambil transaksi",
    });
  }
});

// CREATE TRANSACTION
app.post("/transactions", async (req, res) => {
  const { user_id, amount, type, category_id, description, transaction_date } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO transactions(
        user_id,
        amount,
        type,
        category_id,
        description,
        transaction_date
      )
      VALUES($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [user_id, amount, type, category_id, description, transaction_date],
    );

    const transaction = result.rows[0];

    const categoryResult = await pool.query(
      `
      SELECT name
      FROM categories
      WHERE id = $1
      `,
      [transaction.category_id],
    );

    transaction.category_name = categoryResult.rows[0]?.name;

    res.json(transaction);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Gagal tambah transaksi",
    });
  }
});

// UPDATE TRANSACTION
app.put("/transactions/:id", async (req, res) => {
  const { id } = req.params;

  const { amount, type, category_id, description, transaction_date } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE transactions
      SET
        amount=$1,
        type=$2,
        category_id=$3,
        description=$4,
        transaction_date=$5,
        updated_at=NOW()
      WHERE id=$6
      RETURNING *
      `,
      [amount, type, category_id, description, transaction_date, id],
    );

    const transaction = result.rows[0];

    const categoryResult = await pool.query(
      `
      SELECT name
      FROM categories
      WHERE id = $1
      `,
      [transaction.category_id],
    );

    transaction.category_name = categoryResult.rows[0]?.name;

    res.json(transaction);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Gagal update transaksi",
    });
  }
});

// DELETE TRANSACTION
app.delete("/transactions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM transactions WHERE id=$1", [id]);

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Gagal hapus transaksi",
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                               FINANCIAL GOALS                              */
/* -------------------------------------------------------------------------- */

// GET GOALS
app.get("/goals", async (req, res) => {
  const { user_id } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM financial_goals
      WHERE user_id=$1
      ORDER BY created_at DESC
      `,
      [user_id],
    );

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Gagal ambil goals",
    });
  }
});

// CREATE GOAL
app.post("/goals", async (req, res) => {
  const { user_id, title, target_amount, current_amount, deadline } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO financial_goals(
        user_id,
        title,
        target_amount,
        current_amount,
        deadline
      )
      VALUES($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [user_id, title, target_amount, current_amount, deadline],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Gagal tambah goal",
    });
  }
});

// UPDATE GOAL
app.put("/goals/:id", async (req, res) => {
  const { id } = req.params;

  const { current_amount } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE financial_goals
      SET
        current_amount=$1,
        updated_at=NOW()
      WHERE id=$2
      RETURNING *
      `,
      [current_amount, id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Gagal update goal",
    });
  }
});

// DELETE GOAL
app.delete("/goals/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM financial_goals WHERE id=$1", [id]);

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Gagal hapus goal",
    });
  }
});

/* ========================= */

app.post("/ai-recommendation", async (req, res) => {
  try {
    const { total_income, total_expense, net_cashflow, tx_count, avg_expense, food_ratio, transport_ratio, entertainment_ratio, shopping_ratio, health_ratio, other_ratio, saving_rate, expense_trend, rolling_3m_avg } = req.body;

    const response = await fetch(process.env.AI_API_URL_PRED, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        total_income,
        total_expense,
        net_cashflow,
        tx_count,
        avg_expense,
        food_ratio,
        transport_ratio,
        entertainment_ratio,
        shopping_ratio,
        health_ratio,
        other_ratio,
        saving_rate,
        expense_trend,
        rolling_3m_avg,
      }),
    });

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "AI recommendation failed",
    });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
