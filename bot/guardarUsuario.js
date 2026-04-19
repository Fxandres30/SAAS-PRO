import { supabase } from "../backend/supabase.js"

// ================= LIMPIAR TEL =================

function limpiarTelefono(numero) {
  if (!numero) return null

  numero = numero.replace(/\D/g, "")

  if (numero.startsWith("57") && numero.length === 12) {
    numero = numero.substring(2)
  }

  // 🔥 validar que sea celular válido
  if (numero.length !== 10) return null

  return numero
}

// ================= GUARDAR USUARIO =================

export async function guardarUsuario(data) {

  const { lid, telefono, nombre } = data

  if (!lid) return

  const telefonoLimpio = limpiarTelefono(telefono)

  // ================= BUSCAR =================

  const { data: usuario } = await supabase
    .from("usuarios_whatsapp")
    .select("*")
    .eq("lid", lid)
    .maybeSingle()

  // ================= NUEVO =================

  if (!usuario) {

    const { error } = await supabase
      .from("usuarios_whatsapp")
      .insert({
        lid,
        telefono: telefonoLimpio,
        nombre: nombre || null,
        created_at: new Date(),
        ultima_actividad: new Date()
      })

    if (error) {
      console.log("❌ Error guardando:", error.message)
    } else {
      console.log("🆕 Usuario nuevo:", lid)
    }

    return
  }

  // ================= EXISTENTE =================

  const updateData = {
    ultima_actividad: new Date()
  }

  // 🔥 solo actualizar nombre si no existe
  if (nombre && !usuario.nombre) {
    updateData.nombre = nombre
  }

  // 🔥 guardar teléfono SOLO si no tiene
  if (!usuario.telefono && telefonoLimpio) {
    updateData.telefono = telefonoLimpio
    console.log("📱 Teléfono agregado:", telefonoLimpio)
  }

  const { error } = await supabase
    .from("usuarios_whatsapp")
    .update(updateData)
    .eq("lid", lid)

  if (error) {
    console.log("❌ Error actualizando:", error.message)
  }
}