import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { readSupabasePublicEnv } from "@/lib/env"

/**
 * Cliente Supabase para uso no servidor.
 * Compatível com Server Components, Route Handlers e Server Actions.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const env = readSupabasePublicEnv()

  if (!env) {
    throw new Error(
      "Supabase não configurado. Crie ProdigyFinance/.env.local com " +
      "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY e reinicie npm run dev."
    )
  }

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Ignorado em Server Components — cookies são read-only nesse contexto
        }
      },
    },
  })
}