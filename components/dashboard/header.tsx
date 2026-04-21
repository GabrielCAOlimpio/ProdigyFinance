"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { createBrowserClient } from "@supabase/ssr"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart2 } from "lucide-react"

import {
  Settings,
  LogOut,
  User,
  Wallet,
  Flame,
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { getSupabasePublicEnv } from "@/lib/env"
import { cn } from "@/lib/utils"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)
}

function getCurrentMonthRange() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]
  return { from, to }
}

export function DashboardHeader() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { url, anonKey } = getSupabasePublicEnv()
  const supabase = createBrowserClient(url, anonKey)

  const [email, setEmail] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [streak, setStreak] = useState<number | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      setEmail(data.user.email ?? null)
      setName(data.user.user_metadata?.name ?? null)
      setAvatarUrl(data.user.user_metadata?.avatar_url ?? null)
    })

    fetch("/api/stats")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setStreak(data.streak) })

    const { from, to } = getCurrentMonthRange()

    Promise.all([
      fetch(`/api/incomes?from=${from}&to=${to}`).then(r => r.json()),
      fetch(`/api/expenses?from=${from}&to=${to}`).then(r => r.json()),
    ]).then(([incJson, expJson]) => {
      const inc = (incJson.data ?? []).reduce((s: number, t: { amount: number }) => s + t.amount, 0)
      const exp = (expJson.data ?? []).reduce((s: number, t: { amount: number }) => s + t.amount, 0)
      setBalance(inc - exp)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const displayName = name || email?.split("@")[0] || "Usuário"
  const initials = displayName.substring(0, 2).toUpperCase()
  const isPositive = (balance ?? 0) >= 0

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl border-b border-white/5" />

      <div className="container relative mx-auto flex h-20 items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex cursor-pointer items-center gap-3 group"
          onClick={() => router.push("/dashboard")}
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>

          <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Prodigy Finance
          </span>
        </motion.div>

        {/* Saldo */}
        {balance !== null && (
          <div className="hidden md:flex items-center gap-4">
            <div className="h-10 px-4 flex items-center gap-3 rounded-2xl bg-muted/30 border border-white/5 backdrop-blur-md">
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full",
                isPositive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
              )}>
                {isPositive
                  ? <TrendingUp className="h-3.5 w-3.5" />
                  : <TrendingDown className="h-3.5 w-3.5" />}
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-muted-foreground">
                  Saldo do Mês
                </span>
                <span className={cn(
                  "text-sm font-bold",
                  isPositive ? "text-success" : "text-destructive"
                )}>
                  {formatCurrency(balance)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">

          {/* Streak */}
          {streak !== null && (
            <motion.button
              whileHover={{ y: -2 }}
              onClick={() => router.push("/perfil")}
              className={cn(
                "flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black transition-all border",
                streak > 0
                  ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                  : "bg-muted text-muted-foreground border-transparent"
              )}
            >
              <Flame className="h-4 w-4" />
              <span>{streak}</span>
            </motion.button>
          )}

          {/* Theme */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl bg-muted/20 hover:bg-muted/40"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                >
                  {theme === "dark"
                    ? <Sun className="h-5 w-5" />
                    : <Moon className="h-5 w-5" />}
                </motion.div>
              </AnimatePresence>
            </Button>
          )}

          {/* User */}
         {/* User Menu Premium */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-11 w-11 rounded-2xl p-0 overflow-hidden bg-muted/20 hover:bg-muted/40 transition-all group"
            >
              {/* brilho no hover */}
              <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 bg-gradient-to-b from-white/10 to-transparent pointer-events-none transition-opacity" />
              
              <Avatar className="h-full w-full rounded-none border-none">
                <AvatarImage 
                  src={avatarUrl ?? ""} 
                  alt="User" 
                  className="object-cover" 
                />
                <AvatarFallback className="bg-gradient-to-br from-accent/50 to-primary/50 text-primary-foreground font-black text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            className="w-64 mt-2 rounded-2xl border-white/5 bg-background/80 backdrop-blur-xl shadow-2xl" 
            align="end"
          >
            <DropdownMenuLabel className="p-4 font-normal">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 rounded-xl shadow-inner bg-muted">
                  <AvatarImage src={avatarUrl ?? ""} />
                  <AvatarFallback className="font-black">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-black leading-none">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {email ?? ""}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="bg-white/5" />
            
            <div className="p-2">
              <DropdownMenuItem 
                onClick={() => router.push("/perfil")} 
                className="rounded-xl py-2.5 focus:bg-primary/10 cursor-pointer"
              >
                <User className="mr-3 h-4 w-4 text-primary" />
                <span className="font-medium">Meu Perfil</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => router.push("/relatorios")} 
                className="rounded-xl py-2.5 focus:bg-primary/10 cursor-pointer"
              >
                <BarChart2 className="mr-3 h-4 w-4 text-primary" />
                <span className="font-medium">Relatórios</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => router.push("/configuracoes")} 
                className="rounded-xl py-2.5 focus:bg-primary/10 cursor-pointer"
              >
                <Settings className="mr-3 h-4 w-4 text-primary" />
                <span className="font-medium">Configurações</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => router.push("/configuracoes")} 
                className="rounded-xl py-2.5 focus:bg-primary/10 cursor-pointer"
              >
                <Settings className="mr-3 h-4 w-4 text-primary" />
                <span className="font-medium">Configurações</span>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="bg-white/5" />
            
            <div className="p-2">
              <DropdownMenuItem 
                onClick={handleLogout}
                className="rounded-xl py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-bold">Encerrar Sessão</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </header>
  )
}