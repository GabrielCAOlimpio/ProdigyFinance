import { NextResponse } from "next/server"
import { getRouteAuth } from "@/lib/auth/api-route"

export async function GET(request: Request) {
  const auth = await getRouteAuth()
  if ("error" in auth) return auth.error
  const { supabase, user } = auth

  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("mode") ?? "monthly" // daily | monthly

  const periods: { label: string; from: string; to: string }[] = []
  const now = new Date()

  if (mode === "daily") {
    // Últimos 7 dias
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      periods.push({
        label: d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" }),
        from: dateStr,
        to: dateStr,
      })
    }
  } else {
    // Últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const from = d.toISOString().split("T")[0]
      const to = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0]
      periods.push({
        label: d.toLocaleDateString("pt-BR", { month: "short" }),
        from,
        to,
      })
    }
  }

  const results = await Promise.all(
    periods.map(async (period) => {
      const [{ data: incomes }, { data: expenses }] = await Promise.all([
        supabase
          .from("incomes")
          .select("amount, category")
          .eq("user_id", user.id)
          .gte("date", period.from)
          .lte("date", period.to),
        supabase
          .from("expenses")
          .select("amount, category")
          .eq("user_id", user.id)
          .gte("date", period.from)
          .lte("date", period.to),
      ])

      const totalIncome = (incomes ?? []).reduce((s, t) => s + Number(t.amount), 0)
      const totalExpense = (expenses ?? []).reduce((s, t) => s + Number(t.amount), 0)

      return {
        label: period.label,
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense,
      }
    })
  )

  // Top categorias (período completo)
  const allFrom = periods[0].from
  const allTo = periods[periods.length - 1].to

  const { data: allExpenses } = await supabase
    .from("expenses")
    .select("amount, category")
    .eq("user_id", user.id)
    .gte("date", allFrom)
    .lte("date", allTo)

  const grouped: Record<string, number> = {}
  for (const e of allExpenses ?? []) {
    grouped[e.category] = (grouped[e.category] ?? 0) + Number(e.amount)
  }

  const topCategories = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, total]) => ({ category, total }))

  const biggestExpense = (allExpenses ?? []).reduce(
    (max, e) => Number(e.amount) > max.amount ? { amount: Number(e.amount), category: e.category } : max,
    { amount: 0, category: "" }
  )

  return NextResponse.json({ periods: results, topCategories, biggestExpense })
}