import { supabase } from "../supabase.js"

// ================= REGISTRAR =================

export async function registrar(email, password) {

  // verificar si existe
  const { data: existe } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .maybeSingle()

  if (existe) {
    return { error: "Usuario ya existe" }
  }

  // crear usuario
  const { data, error } = await supabase
    .from("usuarios")
    .insert({
      email,
      password
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return {
  id: data.id,
  email: data.email
}
}

// ================= LOGIN =================

export async function login(email, password) {

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .maybeSingle()

  if (error || !data) return null

  return {
  id: data.id,
  email: data.email
}
}