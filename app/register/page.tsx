"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Eye, EyeOff, Mail, Lock, TrendingUp, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { getSupabasePublicEnv } from "@/lib/env"

export default function RegisterPage() {
  const router = useRouter()
  const { url, anonKey } = getSupabasePublicEnv()
  const supabase = createBrowserClient(url, anonKey)

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
    general?: string
  }>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }
    if (!formData.email) {
      newErrors.email = "E-mail é obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "E-mail inválido"
    }
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória"
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter no mínimo 6 caracteres"
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirme sua senha"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.name.trim() },
        },
      })

      if (error) {
        if (error.message.includes("already registered") || error.message.includes("User already registered")) {
          setErrors({ general: "Este e-mail já está cadastrado. Faça login." })
        } else {
          setErrors({ general: error.message })
        }
        return
      }

      // Se confirmação de email estiver ativa
      setSuccessMessage(
        "Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar."
      )
    } catch {
      setErrors({ general: "Erro inesperado. Tente novamente." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent text-accent-foreground mb-4">
            <TrendingUp className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Finance Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Crie sua conta e comece a controlar suas finanças
          </p>
        </div>

        <Card className="shadow-lg border-border/50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Criar conta</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para se cadastrar
            </CardDescription>
          </CardHeader>
          <CardContent>

            {/* Sucesso */}
            {successMessage ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <p className="text-sm text-muted-foreground">{successMessage}</p>
                <Button className="w-full" onClick={() => router.push("/login")}>
                  Ir para o login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <FieldGroup>

                  {/* Nome */}
                  <Field data-invalid={!!errors.name}>
                    <FieldLabel htmlFor="name">Nome</FieldLabel>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={formData.name}
                        onChange={handleInputChange("name")}
                        className="pl-10"
                        disabled={isLoading}
                        aria-invalid={!!errors.name}
                      />
                    </div>
                    {errors.name && <FieldError id="name-error">{errors.name}</FieldError>}
                  </Field>

                  {/* Email */}
                  <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="email">E-mail</FieldLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={handleInputChange("email")}
                        className="pl-10"
                        disabled={isLoading}
                        aria-invalid={!!errors.email}
                      />
                    </div>
                    {errors.email && <FieldError id="email-error">{errors.email}</FieldError>}
                  </Field>

                  {/* Senha */}
                  <Field data-invalid={!!errors.password}>
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={handleInputChange("password")}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        aria-invalid={!!errors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <FieldError id="password-error">{errors.password}</FieldError>}
                  </Field>

                  {/* Confirmar senha */}
                  <Field data-invalid={!!errors.confirmPassword}>
                    <FieldLabel htmlFor="confirmPassword">Confirmar senha</FieldLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repita a senha"
                        value={formData.confirmPassword}
                        onChange={handleInputChange("confirmPassword")}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        aria-invalid={!!errors.confirmPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <FieldError id="confirm-error">{errors.confirmPassword}</FieldError>
                    )}
                  </Field>

                </FieldGroup>

                {errors.general && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                    {errors.general}
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <><Spinner className="mr-2" />Criando conta...</>
                  ) : (
                    "Criar conta"
                  )}
                </Button>
              </form>
            )}

            {!successMessage && (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <Link href="/login" className="text-accent font-medium hover:underline">
                    Entrar
                  </Link>
                </p>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  )
}