import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

import authRoutes from "./routes/authRoutes.js"
import mensajesRoutes from "./routes/mensajesRoutes.js"
import botRoutes from "./routes/botRoutes.js"

const app = express()
const PORT = process.env.PORT || 3000

// ================= PATH =================

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ================= MIDDLEWARES =================

app.use(cors({
  origin: "*"
}))

app.use(express.json())

// 🔥 SERVIR FRONTEND
app.use(express.static(path.join(__dirname, "public")))

// ================= RUTA PRINCIPAL =================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"))
})

// ================= ROUTES API =================

app.use("/auth", authRoutes)
app.use("/mensajes", mensajesRoutes)
app.use("/bot", botRoutes)

// ================= START =================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API corriendo en ${PORT}`)
})