import pkg from "whatsapp-web.js"
import { supabase } from "../api/supabase.js"
import { escanearUsuario } from "./escanerUsuarios.js"
import QRCode from "qrcode"

const { Client, LocalAuth } = pkg

// ================= VARIABLES =================

export const clientes = {}
export const estados = {}
export const qrs = {}

const iniciando = {}

// ================= FUNCION ESTADO =================

function estaActivo(grupo) {
  const ahora = new Date()

  const pagoActivo =
    grupo.expiracion && new Date(grupo.expiracion) > ahora

  const trialActivo =
    grupo.trial_fin && new Date(grupo.trial_fin) > ahora

  return pagoActivo || trialActivo
}

// ================= GUARDAR GRUPO =================

async function guardarGrupo(cliente_id, grupo) {
  try {
    const { data: existente } = await supabase
      .from("grupos")
      .select("id")
      .eq("id", grupo.id)
      .maybeSingle()

    if (!existente) {
      await supabase.from("grupos").insert({
        id: grupo.id,
        nombre: grupo.nombre,
        owner_cliente_id: null,
        expiracion: null,
        trial_usado: false,
        trial_inicio: null,
        trial_fin: null
      })

      console.log("🆕 Grupo guardado:", grupo.nombre)
    } else {
      await supabase
        .from("grupos")
        .update({ nombre: grupo.nombre })
        .eq("id", grupo.id)
    }

  } catch (err) {
    console.log("❌ Error guardando grupo:", err.message)
  }
}

// ================= BOT =================

export async function iniciarCliente(cliente_id) {
  try {

    if (iniciando[cliente_id]) return
    iniciando[cliente_id] = true

    if (clientes[cliente_id]) return

    console.log("🟢 Iniciando bot:", cliente_id)

    const client = new Client({
      authStrategy: new LocalAuth({ clientId: cliente_id }),
      puppeteer: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu"
        ]
      }
    })

    clientes[cliente_id] = client
    estados[cliente_id] = "iniciando"

    // ================= QR =================

    client.on("qr", async (qr) => {
      qrs[cliente_id] = await QRCode.toDataURL(qr)
      estados[cliente_id] = "esperando_qr"
      console.log("📲 Escanea el QR")
    })

    // ================= READY =================

    client.on("ready", async () => {
  console.log("✅ CONECTADO:", cliente_id)

  estados[cliente_id] = "conectado"
  qrs[cliente_id] = null

  try {
    const chats = await client.getChats()
    const grupos = chats.filter(c => c.isGroup)

    console.log("📂 Grupos:", grupos.length)

    // 🔹 GUARDAR GRUPOS
    for (const g of grupos) {
      await guardarGrupo(cliente_id, {
        id: g.id._serialized,
        nombre: g.name
      })
    }

    // ================= 🔥 ESCANEO =================

    console.log("🔍 Escaneando participantes...")

    let total = 0

    for (const chat of grupos) {
      try {

        const metadata = await chat.getMetadata().catch(() => null)

        if (!metadata) {
          console.log("⚠️ Sin metadata:", chat.name)
          continue
        }

        const participantes = metadata.participants || []

        if (!participantes.length) continue

        for (const p of participantes) {
          try {

            const lid = p.id?._serialized || p.id

            if (!lid) continue

            await escanearUsuario({
              author: lid,
              from: chat.id._serialized,
              _data: {
                notifyName: p.name || p.pushname || null
              }
            })

            total++

          } catch {
            console.log("⚠️ Error participante")
          }
        }

      } catch {
        console.log("⚠️ Error grupo:", chat.name)
      }
    }

    // 🔥 ESTE VA FUERA DEL FOR
    console.log(`✅ Escaneo completo: ${total}`)

  } catch (err) {
    console.log("❌ Error ready:", err.message)
  }
})
    // ================= MENSAJES =================

    client.on("message", async (msg) => {

      // 🔥 ESCANEO EN TIEMPO REAL
      try {
        await escanearUsuario(msg)
      } catch (err) {
        console.log("❌ Error escáner:", err.message)
      }

      // ================= TU LÓGICA =================

      if (!msg.from.endsWith("@g.us")) return

      const { data: grupo } = await supabase
        .from("grupos")
        .select("*")
        .eq("id", msg.from)
        .maybeSingle()

      if (!grupo) return
      if (grupo.owner_cliente_id !== cliente_id) return
      if (!estaActivo(grupo)) return

      console.log("🔥 ACTIVO EN:", msg.from)
    })

    // ================= DESCONECTADO =================

    client.on("disconnected", () => {
      estados[cliente_id] = "desconectado"
      delete clientes[cliente_id]
      delete qrs[cliente_id]
    })

    // ================= ERROR =================

    client.on("auth_failure", () => {
      estados[cliente_id] = "sin_sesion"
      delete clientes[cliente_id]
      delete qrs[cliente_id]
    })

    await client.initialize()

  } catch (err) {
    console.log("❌ ERROR GLOBAL:", err.message)
    estados[cliente_id] = "error"
    delete clientes[cliente_id]
    delete qrs[cliente_id]
  } finally {
    iniciando[cliente_id] = false
  }
}