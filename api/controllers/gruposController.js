import { supabase } from "../supabase.js"

// ================= GET GRUPOS (GLOBAL) =================
export const getGrupos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("grupos")
      .select("*")
      .order("nombre")

    if (error) throw error

    res.json({
      ok: true,
      grupos: data
    })

  } catch (err) {
    console.error("❌ Error grupos:", err)

    res.status(500).json({
      ok: false,
      grupos: []
    })
  }
}

// ================= TOGGLE (OPCIONAL) =================
export const toggleGrupo = async (req, res) => {
  const { grupo_id, activo } = req.body

  try {
    const { error } = await supabase
      .from("grupos")
      .update({ permitido: activo })
      .eq("id", grupo_id)

    if (error) throw error

    res.json({ ok: true })

  } catch (err) {
    console.error("❌ Error toggle:", err)
    res.status(500).json({ ok: false })
  }
}