import { iniciarCliente, clientes, estados, qrs } from "../../bot/iniciarBot.js"
import fs from "fs"
import path from "path"

// ================= UTILS =================

async function cerrarCliente(cliente_id) {
  try {
    const client = clientes[cliente_id]

    if (!client) return

    const browser = client.pupBrowser

    // 🔥 cerrar cliente
    await client.destroy()

    // 🔥 cerrar navegador REAL
    if (browser) {
      await browser.close()
    }

  } catch (e) {
    console.log("⚠️ Error cerrando cliente:", e.message)
  }

  delete clientes[cliente_id]
}

// 🔥 limpiar lock de Chrome
function limpiarLock(cliente_id) {
  try {
    const lockPath = path.join(
      process.cwd(),
      ".wwebjs_auth",
      `session-${cliente_id}`,
      "SingletonLock"
    )

    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath)
      console.log("🧹 Lock eliminado")
    }
  } catch (e) {
    console.log("⚠️ Error limpiando lock:", e.message)
  }
}

// ================= START =================

export const startBot = async (req, res) => {
  const { cliente_id } = req.body

  try {
    // 🔒 si ya existe, devolver estado real
    if (clientes[cliente_id]) {
      return res.json({
        ok: true,
        estado: estados[cliente_id],
        qr: qrs[cliente_id] || null
      })
    }

    limpiarLock(cliente_id)

    await iniciarCliente(cliente_id)

    res.json({
      ok: true,
      estado: "iniciando"
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error start" })
  }
}

// ================= STOP =================

export const stopBot = async (req, res) => {
  const { cliente_id } = req.body

  try {
    await cerrarCliente(cliente_id)

    // 🔥 esperar liberación real
    await new Promise(r => setTimeout(r, 3000))

    estados[cliente_id] = "detenido"
    delete qrs[cliente_id]

    res.json({ ok: true })

  } catch (err) {
    res.status(500).json({ error: "Error stop" })
  }
}

// ================= RESET =================

export const resetBot = async (req, res) => {
  const { cliente_id } = req.body

  try {
    await cerrarCliente(cliente_id)

    const pathSesion = `./.wwebjs_auth/session-${cliente_id}`

    if (fs.existsSync(pathSesion)) {
      fs.rmSync(pathSesion, { recursive: true, force: true })
    }

    estados[cliente_id] = "sin_sesion"
    delete qrs[cliente_id]

    res.json({ ok: true })

  } catch (err) {
    res.status(500).json({ error: "Error reset" })
  }
}

// ================= RESTART =================

export const restartBot = async (req, res) => {
  const { cliente_id } = req.body

  try {
    await cerrarCliente(cliente_id)

    limpiarLock(cliente_id)

    // 🔥 esperar bien
    await new Promise(r => setTimeout(r, 3000))

    await iniciarCliente(cliente_id)

    res.json({ ok: true })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error restart" })
  }
}

// ================= ESTADO =================

export const getEstado = (req, res) => {
  const id = req.params.id

  res.json({
    estado: estados[id] || "detenido",
    qr: qrs[id] || null
  })
}