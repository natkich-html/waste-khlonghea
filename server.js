const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// หน้าเว็บหลัก
app.get("/", (req, res) => {
  res.send("ระบบจัดการขยะ – ระบบทำงานแล้ว");
});

// ตรวจสุขภาพระบบ
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
