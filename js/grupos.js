let loadingTrial = false

// ================= ICONOS =================

function getIcon(nombre) {
  if (!nombre) return "users"

  const n = nombre.toLowerCase()

  if (n.includes("club")) return "shield"
  if (n.includes("dinamicas")) return "diamond"
  if (n.includes("diarias")) return "diamond"
  if (n.includes("prueba")) return "beaker"

  return "users"
}

// ================= ESTADO =================

function estaActivo(g) {
  const ahora = new Date()

  const esOwner = g.owner_cliente_id === cliente_id

  const pago =
    esOwner &&
    g.expiracion &&
    new Date(g.expiracion) > ahora

  const trial =
    esOwner &&
    g.trial_fin &&
    new Date(g.trial_fin) > ahora

  return pago || trial
}


function getEstadoTexto(g) {
  const ahora = new Date()

  const esOwner = g.owner_cliente_id === cliente_id

  // 🚫 si otro es dueño
  if (g.owner_cliente_id && !esOwner) {
    return "No disponible"
  }

  if (g.expiracion && new Date(g.expiracion) > ahora) {
    return "Pago activo"
  }

  if (g.trial_fin && new Date(g.trial_fin) > ahora) {
    return "Trial activo"
  }

  return "Bloqueado"
}

// ================= TIEMPO =================

function getTiempoRestante(fecha) {
  if (!fecha) return ""

  const ahora = new Date()
  const fin = new Date(fecha)

  let diff = fin - ahora

  if (diff <= 0) return "0m"

  const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
  diff -= dias * (1000 * 60 * 60 * 24)

  const horas = Math.floor(diff / (1000 * 60 * 60))
  diff -= horas * (1000 * 60 * 60)

  const minutos = Math.floor(diff / (1000 * 60))

  return `${dias}d ${horas}h ${minutos}m`
}

function formatearFecha(fecha) {
  const f = new Date(fecha)

  return f.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  })
}

function getInfoExtra(g) {
  const ahora = new Date()

  const esOwner = g.owner_cliente_id === cliente_id

  if (!esOwner) return ""

  if (g.expiracion && new Date(g.expiracion) > ahora) {
    return `💰 ${getTiempoRestante(g.expiracion)} • vence ${formatearFecha(g.expiracion)}`
  }

  if (g.trial_fin && new Date(g.trial_fin) > ahora) {
    return `🎁 ${getTiempoRestante(g.trial_fin)} • vence ${formatearFecha(g.trial_fin)}`
  }

  return ""
}

// ================= CARGAR GRUPOS =================

async function cargarGrupos() {
  try {
    // 🔥 CAMBIO IMPORTANTE
    const res = await fetch(`/bot/grupos`)
    const data = await res.json()

    const container = document.getElementById("grupos_container")
    container.innerHTML = ""

    const grupos = data.grupos || []

    grupos.forEach((g) => {
      const activo = estaActivo(g)

      let acciones = ""

      if (activo) {
        acciones = `
          <button class="btn btn-copy" onclick="copiar('${g.id}')">
            <i data-lucide="copy"></i>
            Copiar
          </button>

          <button class="btn btn-open" onclick="abrirGrupo('${g.id}')">
            <i data-lucide="external-link"></i>
            Abrir
          </button>
        `
      } else {

        // 🔥 SI OTRO ES DUEÑO
        if (g.owner_cliente_id && g.owner_cliente_id !== cliente_id) {
          acciones = `
            <button class="btn btn-disabled" disabled>
              🚫 No disponible
            </button>
          `
        } else {
          acciones = `
            <button class="btn btn-success" onclick="activarGrupo('${g.id}')">
              <i data-lucide="dollar-sign"></i>
              Activar
            </button>
          `

          if (!g.trial_usado) {
            acciones += `
              <button class="btn btn-trial" onclick="activarTrial('${g.id}')">
                🎁 Trial
              </button>
            `
          } else {
            acciones += `
              <button class="btn btn-disabled" disabled>
                ❌ Trial usado
              </button>
            `
          }
        }
      }

      const card = document.createElement("div")
      card.className = "grupo-card"

      card.innerHTML = `
        <div class="grupo-header">

          <div class="grupo-left">

            <div class="grupo-nombre">
              <i data-lucide="${getIcon(g.nombre)}"></i>
              ${g.nombre || "Sin nombre"}
            </div>

            <div class="grupo-extra">
              ${getInfoExtra(g)}
            </div>

            <div class="grupo-id">${g.id}</div>

          </div>

          <div class="grupo-estado ${activo ? "activo" : "bloqueado"}">
            <i data-lucide="${activo ? "check-circle" : "lock"}"></i>
            ${getEstadoTexto(g)}
          </div>

        </div>

        <div class="grupo-actions">
          ${acciones}
        </div>
      `

      container.appendChild(card)
    })

    lucide.createIcons()

  } catch (err) {
    console.error("❌ Error cargando grupos:", err)
  }
}

// ================= ACTIVAR =================

async function activarGrupo(grupo_id) {
  const confirmar = confirm(
    "💰 Activar grupo por 30 días?\n\n⚠️ Esta acción no se puede deshacer"
  )

  if (!confirmar) return

  const btn = event.target.closest("button")
  btn.disabled = true
  btn.innerHTML = "⏳ Activando..."

  try {
    const res = await fetch(`/bot/activar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grupo_id, cliente_id })
    })

    const data = await res.json()

    if (!data.ok) {
      alert(data.error || "Error")
      btn.disabled = false
      btn.innerHTML = "Activar"
      return
    }

    btn.innerHTML = "✅ Activado"
    setTimeout(cargarGrupos, 1000)

  } catch (err) {
    console.error("❌ Error activando grupo:", err)
    btn.disabled = false
    btn.innerHTML = "Activar"
  }
}

// ================= TRIAL =================

async function activarTrial(grupo_id) {
  if (loadingTrial) return
  loadingTrial = true

  const confirmar = confirm(
    "🎁 Activar prueba GRATIS por 6 días?\n\n⚠️ Solo puedes usarla UNA VEZ"
  )

  if (!confirmar) {
    loadingTrial = false
    return
  }

  const btn = event.target.closest("button")
  btn.disabled = true
  btn.innerHTML = "⏳ Activando..."

  try {
    const res = await fetch(`/bot/trial`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grupo_id, cliente_id })
    })

    const data = await res.json()

    if (!data.ok) {
      alert(data.error)
      btn.disabled = false
      btn.innerHTML = "Trial"
      loadingTrial = false
      return
    }

    btn.innerHTML = "🎁 Activado"
    setTimeout(cargarGrupos, 1000)

  } catch (err) {
    console.error("❌ Error trial:", err)
    btn.disabled = false
    btn.innerHTML = "Trial"
  }

  loadingTrial = false
}

// ================= UTILS =================

function copiar(texto) {
  navigator.clipboard.writeText(texto)
  alert("Copiado ✅")
}

function abrirGrupo(id) {
  window.open(`/tabla.html?g=${id}`, "_blank")
}