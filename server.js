import express from "express";
import pkg from "pg";

const { Pool } = pkg;
const app = express();

// =======================
// middleware
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// PostgreSQL (Render)
// =======================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// =======================
// API: ทดสอบการเชื่อม DB
// =======================
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

// =======================
// API: สร้างตาราง reports
// เรียกครั้งเดียวพอ
// =======================
app.get("/api/init-db", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        reporter_name TEXT NOT NULL,
        location_text TEXT NOT NULL,
        latitude DECIMAL(10,7),
        longitude DECIMAL(10,7),
        report_date TIMESTAMP DEFAULT NOW()
      );
    `);

    res.json({
      status: "ok",
      message: "table created",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      error: err.message,
    });
  }
});

// =======================
// API: รับแจ้งปัญหาขยะ
// =======================
app.post("/api/report", async (req, res) => {
  const {
    reporter_name,
    location_text,
    latitude,
    longitude,
  } = req.body;

  // ตรวจข้อมูลขั้นต่ำ
  if (!reporter_name || !location_text) {
    return res.status(400).json({
      status: "error",
      message: "missing required fields",
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO reports
        (reporter_name, location_text, latitude, longitude)
      VALUES
        ($1, $2, $3, $4)
      RETURNING id, report_date
      `,
      [reporter_name, location_text, latitude, longitude]
    );

    res.json({
      status: "ok",
      report_id: result.rows[0].id,
      report_date: result.rows[0].report_date,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      error: err.message,
    });
  }
});

// =======================
// หน้าเว็บ (ประชาชน + เจ้าหน้าที่)
// =======================
app.use(express.static("public"));

// =======================
// start server
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
