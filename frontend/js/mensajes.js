async function cargarMensajes() {
  const res = await fetch(`${API}/mensajes/${cliente_id}`)
  const data = await res.json()

  console.log(data)
}

async function guardarMensajes() {
  await fetch(`${API}/mensajes/guardar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      cliente_id,
      mensajes: {}
    })
  })
}