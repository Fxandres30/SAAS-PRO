const API = "http://209.38.77.179:3000"

// ================= UI =================

function mostrarRegistro() {
  document.getElementById("loginBox").classList.add("hidden")
  document.getElementById("registerBox").classList.remove("hidden")
  document.getElementById("titulo").innerText = "Registro"
}

function mostrarLogin() {
  document.getElementById("registerBox").classList.add("hidden")
  document.getElementById("loginBox").classList.remove("hidden")
  document.getElementById("titulo").innerText = "Iniciar sesión"
}

// ================= REGISTER =================

async function register() {
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })

  const data = await res.json()

  if (!res.ok) {
    alert(data.error || "Error")
    return
  }

  alert("Usuario creado ✅")
  mostrarLogin()
}

// ================= LOGIN =================

async function login() {
  const email = document.getElementById("email_login").value
  const password = document.getElementById("password_login").value

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })

  const data = await res.json()

  if (!res.ok) {
    alert(data.error || "Credenciales incorrectas ❌")
    return
  }

  // 🔥 guardar sesión
  localStorage.setItem("cliente_id", data.id)

  // 🚀 ir al panel
  window.location.href = "panel.html"
}