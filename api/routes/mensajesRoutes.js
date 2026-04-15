import express from "express"
import {
  guardarMensajes,
  obtenerMensajes
} from "../controllers/mensajesController.js"

const router = express.Router()

router.post("/guardar", guardarMensajes)
router.get("/:cliente_id", obtenerMensajes)

export default router