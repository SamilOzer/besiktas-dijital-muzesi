'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, UserCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

import { DataTable, Column } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { getUsers, addUser, updateUser, deleteUser, AdminUserRecord, UserRole, UserStatus } from '@/lib/admin-store';

const userSchema = z.object({
  name: z.string().min(2, 'Ad gerekli'),
  email: z.string().email('Geçerli e-posta giriniz'),
  role: z.enum(['admin','editor','viewer']),
  status: z.enum(['active','inactive']),
});
type UserFormData = z.infer<typeof userSchema>;

export default function KullanicilarPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'viewer',
      status: 'active',
    }
  });

  const openAddDialog = () => {
    setEditingId(null);
    reset({ name: '', email: '', role: 'viewer', status: 'active' });
    setDialogOpen(true);
  };

  const openEditDialog = (row: AdminUserRecord) => {
    setEditingId(row.id);
    reset({
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: UserFormData) => {
    if (editingId) {
      updateUser(editingId, data);
    } else {
      addUser({
        id: 'u' + Date.now(),
        ...data,
        joinedAt: new Date().toISOString().split('T')[0],
        avatar: data.name.substring(0, 2).toUpperCase(),
      });
    }
    setUsers(getUsers());
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user?.email === 'admin@besiktas.bel.tr') {
      alert('Ana admin hesabı silinemez!');
      return;
    }
    deleteUser(id);
    setUsers(getUsers());
  };

  const filteredUsers = roleFilter === 'all' ? users : users.filter(u => u.role === roleFilter);

  const getRoleBadge = (role: UserRole) => {
    switch(role) {
      case 'admin': return <Badge variant="default" style={{ backgroundColor: 'var(--a-primary)', color: 'var(--a-bg)' }}>Admin</Badge>;
      case 'editor': return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Editör</Badge>;
      case 'viewer': return <Badge variant="secondary">Görüntüleyici</Badge>;
      default: return null;
    }
  };

  const columns: Column<AdminUserRecord>[] = [
    { 
      key: 'name', 
      label: 'Kullanıcı', 
      sortable: true, 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#c5a059] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {row.avatar || row.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-medium" style={{ color: 'var(--a-text)' }}>{row.name}</span>
            <span className="text-xs" style={{ color: 'var(--a-muted)' }}>{row.email}</span>
          </div>
        </div>
      ) 
    },
    { key: 'role', label: 'Rol', render: (row) => getRoleBadge(row.role) },
    { key: 'status', label: 'Durum', render: (row) => (
        <Badge variant="outline" className={row.status === 'active' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}>
          {row.status === 'active' ? 'Aktif' : 'Pasif'}
        </Badge>
      ) 
    },
    { key: 'joinedAt', label: 'Katılım', render: (row) => <span style={{ color: 'var(--a-text)' }}>{row.joinedAt}</span> },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 style={{ color: 'var(--a-text)', fontSize: '1.5rem', fontWeight: 600 }}>Kullanıcılar</h2>
          <div className="flex gap-2 mt-1">
            <Badge variant="secondary">Toplam: {users.length}</Badge>
            <Badge variant="outline" className="text-green-600 border-green-600">Aktif: {users.filter(u => u.status === 'active').length}</Badge>
          </div>
        </div>
        <Button onClick={openAddDialog} style={{ backgroundColor: 'var(--a-primary)', color: 'var(--a-bg)' }}>
          <Plus size={15} className="mr-2" /> Yeni Kullanıcı
        </Button>
      </div>

      <Card style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
        <CardContent className="p-6">
          <DataTable
            data={filteredUsers}
            columns={columns}
            searchKeys={['name', 'email']}
            filterSlot={
              <div className="w-[180px]">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }}>
                    <SelectValue placeholder="Rol Filtresi" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
                    <SelectItem value="all">Tüm Roller</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editör</SelectItem>
                    <SelectItem value="viewer">Görüntüleyici</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
            actions={(row) => (
              <div className="flex gap-2 items-center">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(row)} style={{ borderColor: 'var(--a-border)', color: 'var(--a-text)' }}>
                  <Pencil size={14} />
                </Button>
                <DeleteDialog
                  title="Kullanıcıyı Sil"
                  description={`${row.name} isimli kullanıcıyı silmek istediğinize emin misiniz?`}
                  onConfirm={() => handleDelete(row.id)}
                />
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)', color: 'var(--a-text)' }}>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input id="name" {...register('name')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" type="email" {...register('email')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rol</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }}>
                        <SelectValue placeholder="Seçin" />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editör</SelectItem>
                        <SelectItem value="viewer">Görüntüleyici</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && <p className="text-xs text-red-600">{errors.role.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Durum</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }}>
                        <SelectValue placeholder="Seçin" />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Pasif</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-xs text-red-600">{errors.status.message}</p>}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} style={{ borderColor: 'var(--a-border)', color: 'var(--a-text)' }}>
                İptal
              </Button>
              <Button type="submit" style={{ backgroundColor: 'var(--a-primary)', color: 'var(--a-bg)' }}>
                Kaydet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
