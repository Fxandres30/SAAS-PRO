import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import mensajesRoutes from "./routes/mensajesRoutes.js";
import botRoutes from "./routes/botRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ================= PATH =================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= MIDDLEWARES =================

app.use(cors({
  origin: "*"
}));

app.use(express.json());

// 🔥 SERVIR FRONTEND (NUEVA RUTA)
app.use(express.static(
  path.join(__dirname, "../frontend")
));

// ================= RUTAS FRONTEND =================

// 🏠 inicio
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/views/index.html"));
});

// 🔐 login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/views/login.html"));
});

// 📊 panel
app.get("/panel", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/views/panel.html"));
});

// 📋 tabla
app.get("/tabla", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/views/tabla.html"));
});

// ================= API =================

// 🔥 IMPORTANTE: ahora todo bajo /api
app.use("/api/auth", authRoutes);
app.use("/api/mensajes", mensajesRoutes);
app.use("/api/bot", botRoutes);

// ================= START =================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 http://localhost:${PORT}`);
});