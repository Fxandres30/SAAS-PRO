export function estaActivo(grupo) {
  const ahora = new Date()

  const pagoActivo =
    grupo.expiracion && new Date(grupo.expiracion) > ahora

  const trialActivo =
    grupo.trial_fin && new Date(grupo.trial_fin) > ahora

  return pagoActivo || trialActivo
}