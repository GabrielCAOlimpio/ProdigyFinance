"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell
} from "recharts"
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Flame, BarChart3, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { EXPENSE_CATEGORY_LABELS } from "@/lib/categories"

type Mode = "daily" | "monthly"

interface Period {
  label: string
  income: number
  expense: number
  balance: number
}

interface ReportData {
  periods: Period[]
  topCategories: { category: string; total: number }[]
  biggestExpense: { amount: number; category: string }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-white/5 bg-black/80 backdrop-blur-xl p-4 shadow-2xl ring-1 ring-white/10">
        <p className="text-[10px] font-black uppercase text-primary/80 mb-3 tracking-[0.2em]">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[11px] font-medium text-zinc-400">{entry.name}</span>
              </div>
              <span className="text-xs font-bold text-zinc-100">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export default function RelatoriosPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>("monthly")
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  useEffect(() => {
    fetchReportData()
  }, [mode])

  async function fetchReportData() {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/reports?mode=${mode}`)
      if (!response.ok) throw new Error("Erro ao carregar relatórios")
      const reportData = await response.json()
      setData(reportData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto">
            <TrendingDown className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Ops! Algo deu errado.</h1>
          <p className="text-muted-foreground">{error}</p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-xl">Voltar ao Dashboard</Button>
            </Link>
            <Button onClick={fetchReportData} className="rounded-xl">Tentar Novamente</Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8 animate-pulse">
          <div className="h-10 w-48 bg-muted rounded-lg" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded-3xl" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 h-[480px] bg-muted rounded-[2.5rem]" />
            <div className="h-[480px] bg-muted rounded-[2.5rem]" />
          </div>
        </div>
      </div>
    )
  }

  const totalIncome = data.periods.reduce((s, p) => s + p.income, 0)
  const totalExpense = data.periods.reduce((s, p) => s + p.expense, 0)
  const totalBalance = totalIncome - totalExpense

  const summaryCards = [
    {
      label: "Saldo Acumulado",
      value: formatCurrency(totalBalance),
      icon: Wallet,
      color: totalBalance >= 0 ? "text-primary" : "text-destructive",
      bg: totalBalance >= 0 ? "bg-primary/10" : "bg-destructive/10",
      iconColor: totalBalance >= 0 ? "text-primary" : "text-destructive",
    },
    {
      label: "Entradas",
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      label: "Saídas",
      value: formatCurrency(totalExpense),
      icon: TrendingDown,
      color: "text-destructive",
      bg: "bg-destructive/10",
      iconColor: "text-destructive",
    },
    {
      label: "Maior Gasto",
      value: formatCurrency(data.biggestExpense.amount),
      subtext: EXPENSE_CATEGORY_LABELS[data.biggestExpense.category as keyof typeof EXPENSE_CATEGORY_LABELS] ?? data.biggestExpense.category,
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      iconColor: "text-orange-500",
    },
  ]

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 pb-24">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="group flex items-center text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Painel Principal
            </Link>
            <h1 className="text-4xl font-black tracking-tighter italic lg:text-5xl">
              ANALYTICS<span className="text-primary/50">.</span>
            </h1>
          </div>

          {/* Toggle */}
          <div className="flex items-center bg-muted/50 p-1.5 rounded-2xl border border-border w-fit">
            {([{ id: "monthly", label: "Mensal" }, { id: "daily", label: "Diário" }] as const).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setMode(opt.id)}
                className={cn(
                  "relative px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all",
                  mode === opt.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
          {summaryCards.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="relative overflow-hidden border-none bg-card/40 backdrop-blur-md shadow-xl rounded-3xl group">
                <div className={cn(
                  "absolute -right-6 -top-6 h-32 w-32 opacity-[0.03] transition-transform group-hover:scale-110",
                  item.iconColor
                )}>
                  <item.icon className="h-full w-full" />
                </div>
                <CardContent className="p-6">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl mb-4", item.bg)}>
                    <item.icon className={cn("h-6 w-6", item.iconColor)} />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                    {item.label}
                  </p>
                  <p className={cn("text-2xl font-black tracking-tighter", item.color)}>
                    {item.value}
                  </p>
                  {item.subtext && (
                    <p className="text-xs font-medium text-muted-foreground mt-1 truncate">
                      {item.subtext}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Gráfico de barras — 2 colunas */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-none bg-card/40 backdrop-blur-md rounded-[2.5rem] p-2 overflow-hidden shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Performance de Período
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-4">
                <div className="h-[380px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.periods}
                      margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                      onMouseMove={(state) => {
                        if (state.activeTooltipIndex !== undefined) {
                          setHoveredBar(state.activeTooltipIndex)
                        }
                      }}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <CartesianGrid strokeDasharray="0" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 800 }}
                        dy={15}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                        tickFormatter={(v) => `R$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={false} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 12, paddingTop: 20 }}
                      />
                      <Bar dataKey="income" name="Receitas" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={30}>
                        {data.periods.map((_, index) => (
                          <Cell
                            key={`inc-${index}`}
                            fillOpacity={hoveredBar === null || hoveredBar === index ? 1 : 0.3}
                          />
                        ))}
                      </Bar>
                      <Bar dataKey="expense" name="Despesas" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={30}>
                        {data.periods.map((_, index) => (
                          <Cell
                            key={`exp-${index}`}
                            fillOpacity={hoveredBar === null || hoveredBar === index ? 1 : 0.3}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Categorias — barras de progresso */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-none bg-card/40 backdrop-blur-md rounded-[2.5rem] p-2 shadow-2xl h-full">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-violet-500" />
                  Distribuição
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {data.topCategories.length === 0 ? (
                  <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                    Sem dados no período
                  </div>
                ) : (
                  <div className="space-y-6 mt-6">
                    {data.topCategories.slice(0, 6).map((cat, i) => (
                      <div key={i} className="group relative">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-violet-400 transition-colors">
                            {EXPENSE_CATEGORY_LABELS[cat.category as keyof typeof EXPENSE_CATEGORY_LABELS] ?? cat.category}
                          </span>
                          <span className="text-xs font-bold">{formatCurrency(cat.total)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(cat.total / (data.topCategories[0].total || 1)) * 100}%` }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className={cn(
                              "h-full rounded-full",
                              i === 0
                                ? "bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.5)]"
                                : "bg-muted-foreground/40"
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pico de gasto */}
                {data.biggestExpense.amount > 0 && (
                  <div className="mt-10 p-4 rounded-3xl bg-violet-500/5 border border-violet-500/10">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <Flame className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-violet-400">Pico de Gasto</p>
                        <p className="text-xs font-bold">
                          {EXPENSE_CATEGORY_LABELS[data.biggestExpense.category as keyof typeof EXPENSE_CATEGORY_LABELS] ?? data.biggestExpense.category}
                          {" — "}
                          {formatCurrency(data.biggestExpense.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  )
}