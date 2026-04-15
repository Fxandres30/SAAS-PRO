import {
  guardarMensajesDB,
  obtenerMensajesDB
} from "../services/mensajesService.js"

export async function guardarMensajes(req, res) {
  try {
    const { cliente_id, mensajes } = req.body

    if (!cliente_id) {
      return res.json({ error: "cliente_id requerido" })
    }

    await guardarMensajesDB(cliente_id, mensajes)

    res.json({ ok: true })

  } catch (err) {
    res.status(500).json({ error: "Error servidor" })
  }
}

export async function obtenerMensajes(req, res) {
  try {
    const data = await obtenerMensajesDB(req.params.cliente_id)
    res.json(data)

  } catch (err) {
    res.status(500).json({ error: "Error servidor" })
  }
}