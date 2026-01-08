import express from "express";
import pkg from "pg";

const { Pool } = pkg;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// เชื่อม PostgreSQL จาก Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ทดสอบว่า DB ต่อได้ไหม
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "ok",
      time: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      error: err.message,
    });
  }
});

// หน้าเว็บหลัก
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
