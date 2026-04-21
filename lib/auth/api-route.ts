import { NextResponse } from "next/server"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import { isSupabaseConfigured } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"

export type AuthedContext = { user: User; supabase: SupabaseClient }
export type RouteAuthResult = AuthedContext | { error: NextResponse }

export function isAuthError(
  result: RouteAuthResult
): result is { error: NextResponse } {
  return "error" in result
}

function errorResponse(message: string, status: number): { error: NextResponse } {
  return { error: NextResponse.json({ error: message }, { status }) }
}

export async function getRouteAuth(): Promise<RouteAuthResult> {
  if (!isSupabaseConfigured()) {
    return errorResponse(
      "Supabase não configurado. Crie .env.local na pasta Prodigy Finance (veja /setup).",
      503
    )
  }

  let supabase: SupabaseClient
  try {
    supabase = await createClient()
  } catch {
    return errorResponse("Falha ao inicializar o cliente Supabase.", 500)
  }

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    return errorResponse("Falha ao verificar autenticação.", 500)
  }

  if (!user) {
    return errorResponse("Não autorizado.", 401)
  }

  return { user, supabase }
}