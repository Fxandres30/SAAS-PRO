import { guardarUsuario } from "./guardarUsuario.js"

export async function escanearUsuario(msg) {
  try {
    const lid = msg.author || msg.from

    if (!lid) return

    await guardarUsuario({
      lid,
      telefono: null,
      nombre: msg._data?.notifyName || null
    })

  } catch (err) {
    console.log("❌ Error escaneando:", err.message)
  }
}