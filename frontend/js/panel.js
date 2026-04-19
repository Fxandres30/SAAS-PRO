const API = "http://209.38.77.179:3000" 

const cliente_id = localStorage.getItem("cliente_id")

if (!cliente_id) {
  alert("No hay sesión ❌")
  window.location.href = "/login"
}

// ================= UI =================

function renderIcons() {
  if (window.lucide) lucide.createIcons()
}

function logout() {
  localStorage.removeItem("cliente_id")
  window.location.href = "/login"
}

function mostrar(id) {
  document.querySelectorAll(".seccion").forEach(s => s.style.display = "none")
  document.getElementById(id).style.display = "block"
}

mostrar("dashboard")

// ================= ESTADO =================

function traducirEstado(estado) {
  switch (estado) {
    case "iniciando": return "🟡 Iniciando..."
    case "esperando_qr": return "📲 Esperando QR"
    case "conectado": return "🟢 Conectado"
    case "desconectado": return "🔴 Desconectado"
    case "detenido": return "⛔ Detenido"
    case "sin_sesion": return "🗑️ Sin sesión"
    case "expirado": return "⌛ QR expirado"
    default: return "⚪ Cargando..."
  }
}

// ================= BOT =================

async function iniciarBot(e) {
  const btn = e?.target

  if (btn) {
    btn.disabled = true
    btn.innerText = "⏳ Iniciando..."
  }

  try {
    await fetch(`${API}/bot/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cliente_id })
    })

    if (btn) btn.innerText = "🟡 Iniciando..."

  } catch (err) {
    console.error(err)
    if (btn) {
      btn.innerText = "❌ Error"
      btn.disabled = false
    }
  }
}

async function detenerBot(e) {
  const btn = e?.target

  if (btn) {
    btn.disabled = true
    btn.innerText = "⏳ Deteniendo..."
  }

  try {
    await fetch(`${API}/bot/stop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cliente_id })
    })

    if (btn) btn.innerText = "⛔ Detenido"

    setTimeout(() => location.reload(), 1000)

  } catch (err) {
    console.error(err)
    if (btn) {
      btn.innerText = "❌ Error"
      btn.disabled = false
    }
  }
}

async function resetBot(e) {
  if (!confirm("¿Seguro que quieres eliminar la sesión?")) return

  const btn = e?.target

  if (btn) {
    btn.disabled = true
    btn.innerText = "⏳ Eliminando..."
  }

  try {
    await fetch(`${API}/bot/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cliente_id })
    })

    if (btn) btn.innerText = "🗑️ Eliminado"

    setTimeout(() => location.reload(), 1000)

  } catch (err) {
    console.error(err)
    if (btn) {
      btn.innerText = "❌ Error"
      btn.disabled = false
    }
  }
}

async function restartBot(e) {
  const btn = e?.target

  if (btn) {
    btn.disabled = true
    btn.innerText = "⏳ Reiniciando..."
  }

  try {
    await fetch(`${API}/bot/restart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cliente_id })
    })

    if (btn) btn.innerText = "🔄 Reiniciado"

    setTimeout(() => location.reload(), 1000)

  } catch (err) {
    console.error(err)
    if (btn) {
      btn.innerText = "❌ Error"
      btn.disabled = false
    }
  }
}

// ================= ACTUALIZAR =================

async function actualizar() {
  try {
    const res = await fetch(`${API}/bot/estado/${cliente_id}`)
    const data = await res.json()

    const estadoCard = document.getElementById("estado_card")
    const estadoTop = document.getElementById("estado_top")
    const qrImg = document.getElementById("qr")

    const texto = traducirEstado(data.estado)

    if (estadoCard) estadoCard.innerText = texto
    if (estadoTop) estadoTop.innerText = texto

    if (window.cargarGrupos) {
      cargarGrupos()
    }

    if (data.qr && qrImg) {
      qrImg.style.display = "block"
      qrImg.src = data.qr
    } else if (qrImg) {
      qrImg.style.display = "none"
    }

  } catch (err) {
    console.error("❌ Error estado:", err)
  }
}

// ================= INIT =================

async function init() {
  await actualizar()
  renderIcons()
}

window.onload = () => {
  init()
  setInterval(actualizar, 2000)
}