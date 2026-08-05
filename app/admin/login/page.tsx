"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Landmark, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPass, setShowPass]   = useState(false);
  const [serverErr, setServerErr] = useState("");
  const [loading, setLoading]     = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setServerErr("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { setServerErr(json.error ?? "Giriş başarısız."); return; }
      router.push("/admin");
      router.refresh();
    } catch {
      setServerErr("Bağlantı hatası, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Scoped admin-light theme wrapper */
    <div
      className="admin-root admin-light min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--a-bg)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#c5a059] flex items-center justify-center mb-4 shadow-lg">
            <Landmark size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center" style={{ color: "var(--a-text)" }}>
            Beşiktaş Dijital Müzesi
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--a-muted)" }}>
            Admin Paneli — Yönetici Girişi
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle style={{ color: "var(--a-text)" }}>Giriş Yap</CardTitle>
            <CardDescription style={{ color: "var(--a-muted)" }}>
              Yönetici hesabınızla oturum açın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@besiktas.bel.tr"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Şifre</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "var(--a-muted)" }}
                    aria-label={showPass ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Server error */}
              {serverErr && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {serverErr}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                id="login-submit"
                disabled={loading}
              >
                {loading && <Loader2 size={14} className="animate-spin mr-2" />}
                {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
              </Button>
            </form>

            {/* Demo credentials hint */}
            <div className="mt-4 rounded-lg p-3 text-xs" style={{ background: "var(--a-bg)", color: "var(--a-muted)" }}>
              <p className="font-semibold mb-1" style={{ color: "var(--a-text)" }}>Demo Giriş:</p>
              <p>E-posta: <code className="font-mono">admin@besiktas.bel.tr</code></p>
              <p>Şifre: <code className="font-mono">Admin2026!</code></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
