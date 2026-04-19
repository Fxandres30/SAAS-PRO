import { supabase } from "../supabase.js"

export async function guardarMensajesDB(cliente_id, mensajes) {

  await supabase
    .from("mensajes")
    .delete()
    .eq("cliente_id", cliente_id)

  let inserts = []

  Object.entries(mensajes || {}).forEach(([tipo, lista]) => {
    if (!Array.isArray(lista)) return

    lista.forEach(texto => {
      inserts.push({
        cliente_id,
        tipo,
        contenido: texto,
        activo: true
      })
    })
  })

  if (inserts.length > 0) {
    await supabase.from("mensajes").insert(inserts)
  }
}

export async function obtenerMensajesDB(cliente_id) {

  const { data } = await supabase
    .from("mensajes")
    .select("*")
    .eq("cliente_id", cliente_id)
    .eq("activo", true)

  return data || []
}