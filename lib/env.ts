const ENV_ERROR =
  "Supabase não configurado. Crie ProdigyFinance/.env.local com " +
  "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY e reinicie npm run dev."

export type SupabasePublicEnv = { url: string; anonKey: string }

let _cached: SupabasePublicEnv | null | undefined = undefined

export function readSupabasePublicEnv(): SupabasePublicEnv | null {
  if (_cached !== undefined) return _cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!url || !anonKey) {
    _cached = null
    return null
  }

  if (!URL.canParse(url)) {
    console.error(`[env] NEXT_PUBLIC_SUPABASE_URL inválida: "${url}"`)
    _cached = null
    return null
  }

  _cached = { url, anonKey }
  return _cached
}

export function isSupabaseConfigured(): boolean {
  return readSupabasePublicEnv() !== null
}

/** Lança erro se não configurado — usar apenas onde a config já foi validada. */
export function getSupabasePublicEnv(): SupabasePublicEnv {
  const env = readSupabasePublicEnv()
  if (!env) throw new Error(ENV_ERROR)
  return env
}