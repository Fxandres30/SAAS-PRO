import { supabase } from "../supabase.js"

// ================= 🧠 LIBERAR SI EXPIRÓ =================

async function liberarSiExpiro(grupo) {
  const ahora = new Date()

  const pagoActivo =
    grupo.expiracion && new Date(grupo.expiracion) > ahora

  const trialActivo =
    grupo.trial_fin && new Date(grupo.trial_fin) > ahora

  // 🔥 si no hay nada activo → liberar
  if (!pagoActivo && !trialActivo && grupo.owner_cliente_id) {
    await supabase
      .from("grupos")
      .update({ owner_cliente_id: null })
      .eq("id", grupo.id)

    grupo.owner_cliente_id = null
  }

  return grupo
}

// ================= 💰 ACTIVAR PAGO =================

export const activarGrupo = async (req, res) => {
  const { grupo_id, cliente_id } = req.body

  try {
    let { data: grupo, error } = await supabase
      .from("grupos")
      .select("*")
      .eq("id", grupo_id)
      .maybeSingle()

    if (error) throw error
    if (!grupo) {
      return res.status(404).json({ error: "Grupo no encontrado" })
    }

    // 🔥 liberar si expiró
    grupo = await liberarSiExpiro(grupo)

    // 🔒 si otro es dueño
    if (grupo.owner_cliente_id && grupo.owner_cliente_id !== cliente_id) {
      return res.status(400).json({
        error: "🔒 Grupo no disponible"
      })
    }

    const fin = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const { error: updateError } = await supabase
      .from("grupos")
      .update({
        owner_cliente_id: cliente_id,
        expiracion: fin,

        // 🔥 limpiar trial si existía
        trial_inicio: null,
        trial_fin: null
      })
      .eq("id", grupo_id)

    if (updateError) throw updateError

    res.json({ ok: true })

  } catch (err) {
    console.error("❌ ERROR PAGO:", err)
    res.status(500).json({ error: err.message })
  }
}

// ================= 🎁 TRIAL =================

export const activarTrial = async (req, res) => {
  const { grupo_id, cliente_id } = req.body

  try {
    let { data: grupo, error: errorGrupo } = await supabase
      .from("grupos")
      .select("*")
      .eq("id", grupo_id)
      .maybeSingle()

    if (errorGrupo) throw errorGrupo
    if (!grupo) {
      return res.status(404).json({ error: "Grupo no encontrado" })
    }

    // 🔥 liberar si expiró
    grupo = await liberarSiExpiro(grupo)

    // 🔒 si otro es dueño
    if (grupo.owner_cliente_id && grupo.owner_cliente_id !== cliente_id) {
      return res.status(400).json({
        error: "🔒 Grupo no disponible"
      })
    }

    // ❌ grupo ya usó trial
    if (grupo.trial_usado) {
      return res.status(400).json({
        error: "❌ Este grupo ya usó el trial"
      })
    }

    // ================= CLIENTE =================

    let { data: cliente, error: errorCliente } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", cliente_id)
      .maybeSingle()

    if (errorCliente) throw errorCliente

    // 👉 crear cliente si no existe
    if (!cliente) {
      const { error: insertError } = await supabase
        .from("clientes")
        .insert({
          id: cliente_id,
          trial_usado: false
        })

      if (insertError) throw insertError

      cliente = { trial_usado: false }
    }

    // ❌ cliente ya usó trial
    if (cliente.trial_usado) {
      return res.status(400).json({
        error: "❌ Ya usaste tu trial"
      })
    }

    // ================= ACTIVAR =================

    const ahora = new Date()
    const fin = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)

    const { error: updateError } = await supabase
      .from("grupos")
      .update({
        owner_cliente_id: cliente_id,

        trial_inicio: ahora,
        trial_fin: fin,
        trial_usado: true,

        // 🔥 limpiar pago si existía
        expiracion: null
      })
      .eq("id", grupo_id)

    if (updateError) throw updateError

    const { error: clienteUpdate } = await supabase
      .from("clientes")
      .update({
        trial_usado: true
      })
      .eq("id", cliente_id)

    if (clienteUpdate) throw clienteUpdate

    res.json({ ok: true })

  } catch (err) {
    console.error("🔥 ERROR TRIAL:", err)
    res.status(500).json({
      error: "Error activando trial"
    })
  }
}