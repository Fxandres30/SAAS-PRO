import express from "express"

// 🔥 IMPORTACIONES
import * as bot from "../controllers/botController.js"
import * as grupos from "../controllers/gruposController.js"
import * as pagos from "../controllers/pagosController.js"

const router = express.Router()

// ================= BOT =================

router.post("/start", bot.startBot)
router.post("/stop", bot.stopBot)
router.post("/reset", bot.resetBot)
router.post("/restart", bot.restartBot)

router.get("/estado/:id", bot.getEstado)

// ================= GRUPOS =================

// 🔥 CAMBIO IMPORTANTE AQUÍ
router.get("/grupos", grupos.getGrupos)

router.post("/grupos/toggle", grupos.toggleGrupo)

// ================= PAGOS =================

router.post("/activar", pagos.activarGrupo)
router.post("/trial", pagos.activarTrial)

export default router