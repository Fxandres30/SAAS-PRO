const API = "http://209.38.77.179:3000"

const res = await fetch(`${API}/tabla/${grupo_id}`)
const params = new URLSearchParams(window.location.search)
const grupo_id = params.get("g")

async function cargarTabla() {
  const res = await fetch(`/tabla/${grupo_id}`)
  const data = await res.json()

  document.getElementById("titulo").innerText = data.grupo

  const cont = document.getElementById("tabla")
  cont.innerHTML = ""

  data.tabla.forEach(n => {
    const div = document.createElement("div")
    div.className = "num " + n.estado
    div.innerText = n.numero

    div.onclick = () => accion(n.numero, n.estado)

    cont.appendChild(div)
  })
}

async function accion(numero, estado) {
  let accion = ""

  if (estado === "disponible") accion = "reservar"
  else if (estado === "reservado") accion = "pagar"
  else if (estado === "pagado") accion = "liberar"

  await fetch("/accion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grupo_id,
      numero,
      accion,
      usuario: "admin"
    })
  })

  cargarTabla()
}

// auto refresh 🔥
setInterval(cargarTabla, 3000)

cargarTabla()