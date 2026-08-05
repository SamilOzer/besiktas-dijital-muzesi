'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, LogOut, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
  newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalı'),
  confirmPassword: z.string().min(1, 'Şifre onayı gerekli'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function AyarlarPage() {
  const router = useRouter();
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: pwdErrors }, reset: resetPassword } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const onPasswordChange = (data: PasswordFormData) => {
    setPasswordSaved(true);
    resetPassword();
    setTimeout(() => setPasswordSaved(false), 2000);
  };

  const handleLogout = () => {
    fetch('/api/admin/logout', { method: 'POST' })
      .then(() => {
        window.location.href = '/admin/login';
      })
      .catch((err) => {
        console.error('Logout failed', err);
        window.location.href = '/admin/login';
      });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 style={{ color: 'var(--a-text)', fontSize: '1.5rem', fontWeight: 600 }}>Ayarlar</h2>
        <p style={{ color: 'var(--a-muted)' }}>Sistem ve profil ayarlarınızı yönetin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profil Bilgileri */}
        <Card style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--a-text)' }}>Profil Bilgileri</CardTitle>
            <CardDescription style={{ color: 'var(--a-muted)' }}>Kişisel bilgilerinizi güncelleyin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-[#c5a059] flex items-center justify-center text-white text-2xl font-bold">
                  AK
                </div>
                <div style={{ color: 'var(--a-text)' }}>
                  <p className="font-medium">Admin Kullanıcı</p>
                  <p className="text-sm" style={{ color: 'var(--a-muted)' }}>Sistem Yöneticisi</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input id="name" defaultValue="Admin Kullanıcı" style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" defaultValue="admin@besiktas.bel.tr" disabled style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)', opacity: 0.7 }} />
                <p className="text-xs" style={{ color: 'var(--a-muted)' }}>E-posta adresi değiştirilemez.</p>
              </div>
              
              <Button type="submit" style={{ backgroundColor: 'var(--a-primary)', color: 'var(--a-bg)' }} className="w-full">
                {profileSaved ? <><CheckCircle2 size={16} className="mr-2" /> Kaydedildi</> : <><Save size={16} className="mr-2" /> Profili Kaydet</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Şifre Değiştir */}
        <Card style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--a-text)' }}>Şifre Değiştir</CardTitle>
            <CardDescription style={{ color: 'var(--a-muted)' }}>Hesabınızın güvenliğini sağlayın.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <Input id="currentPassword" type="password" {...registerPassword('currentPassword')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
                {pwdErrors.currentPassword && <p className="text-xs text-red-600">{pwdErrors.currentPassword.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input id="newPassword" type="password" {...registerPassword('newPassword')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
                {pwdErrors.newPassword && <p className="text-xs text-red-600">{pwdErrors.newPassword.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                <Input id="confirmPassword" type="password" {...registerPassword('confirmPassword')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
                {pwdErrors.confirmPassword && <p className="text-xs text-red-600">{pwdErrors.confirmPassword.message}</p>}
              </div>
              
              <Button type="submit" variant="outline" className="w-full mt-4" style={{ borderColor: 'var(--a-border)', color: 'var(--a-text)' }}>
                {passwordSaved ? <><CheckCircle2 size={16} className="mr-2 text-green-600" /> Şifre Güncellendi</> : 'Şifreyi Güncelle'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Site Bilgileri */}
        <Card style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--a-text)' }}>Sistem Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm" style={{ color: 'var(--a-text)' }}>
            <div className="flex justify-between border-b pb-2" style={{ borderColor: 'var(--a-border)' }}>
              <span style={{ color: 'var(--a-muted)' }}>Platform:</span>
              <span className="font-medium">Beşiktaş Dijital Müzesi</span>
            </div>
            <div className="flex justify-between border-b pb-2" style={{ borderColor: 'var(--a-border)' }}>
              <span style={{ color: 'var(--a-muted)' }}>Versiyon:</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between border-b pb-2" style={{ borderColor: 'var(--a-border)' }}>
              <span style={{ color: 'var(--a-muted)' }}>Son güncelleme:</span>
              <span>Ağustos 2026</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--a-muted)' }}>Toplam sayfa:</span>
              <span>6</span>
            </div>
          </CardContent>
        </Card>

        {/* Tehlikeli Alan */}
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/10">
          <CardHeader>
            <CardTitle className="text-red-600">Oturum</CardTitle>
            <CardDescription className="text-red-500/80">Sistemden güvenli bir şekilde çıkış yapın.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              className="w-full bg-red-600 hover:bg-red-700" 
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" /> Oturumu Kapat
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
