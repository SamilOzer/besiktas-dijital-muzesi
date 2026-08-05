'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

import { DataTable, Column } from '@/components/admin/DataTable';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { getMekanlar, fetchMekanlar, addMekan, updateMekan, deleteMekan } from '@/lib/admin-store';
import { PinLocation } from '@/data/besiktasPinData';
import ImageUploadInput from '@/components/ImageUploadInput';

const mekanSchema = z.object({
  title: z.string().min(2, 'En az 2 karakter'),
  category: z.enum(['heykeller','saraylar','tarihi-yapilar','spor','dini-kamusal']),
  timePeriod: z.enum(['1400-1600','1600-1800','1800-1850','1850-1900','1900-1960']),
  neighborhood: z.enum(['Abbasağa','Akatlar','Arnavutköy','Balmumcu','Bebek','Cihannüma','Dikilitaş','Etiler','Gayrettepe','Konaklar','Kuruçeşme','Kültür','Levazım','Levent','Mecidiye','Muradiye','Nisbetiye','Ortaköy','Sinanpaşa','Türkali','Ulus','Vişnezade','Yıldız']),
  address: z.string().min(5, 'Adres gerekli'),
  summary: z.string().min(10, 'Özet gerekli'),
  description: z.string().optional(),
  era: z.string().optional(),
  lat: z.coerce.number().min(40).max(42),
  lng: z.coerce.number().min(28).max(30),
  images: z.array(z.string()).optional(),
});
type MekanFormData = z.infer<typeof mekanSchema>;

export default function MekanlarPage() {
  const [mekanlar, setMekanlar] = useState<PinLocation[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadMekanlar = async () => {
      const data = await fetchMekanlar();
      if (isMounted) {
        setMekanlar(data);
      }
    };
    loadMekanlar();
    return () => {
      isMounted = false;
    };
  }, []);

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<MekanFormData>({
    resolver: zodResolver(mekanSchema),
    defaultValues: {
      title: '',
      category: 'heykeller',
      timePeriod: '1900-1960',
      neighborhood: 'Sinanpaşa',
      address: '',
      summary: '',
      description: '',
      era: '',
      lat: 41.043,
      lng: 29.005,
      images: [],
    }
  });

  const images = watch('images') || [];

  const openAddDialog = () => {
    setEditingId(null);
    reset({
      title: '', category: 'heykeller', timePeriod: '1900-1960', neighborhood: 'Sinanpaşa', address: '', summary: '', description: '', era: '', lat: 41.043, lng: 29.005, images: []
    });
    setDialogOpen(true);
  };

  const openEditDialog = (row: PinLocation) => {
    setEditingId(row.id);
    reset({
      title: row.title,
      category: row.category as any,
      timePeriod: row.timePeriod as any,
      neighborhood: row.neighborhood as any,
      address: row.address || '',
      summary: row.fullHistory || row.summary || '',
      description: (row as any).description || '',
      era: row.era || '',
      lat: row.coordinates?.[0] ?? 41.043,
      lng: row.coordinates?.[1] ?? 29.005,
      images: row.images || [],
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: MekanFormData) => {
    const categoryLabels: Record<string, string> = {
      heykeller: 'Heykeller',
      saraylar: 'Saraylar',
      'tarihi-yapilar': 'Tarihi Yapılar',
      spor: 'Spor',
      'dini-kamusal': 'Dini & Kamusal'
    };

    if (editingId) {
      updateMekan(editingId, {
        ...data,
        categoryLabel: categoryLabels[data.category],
        fullHistory: data.summary,
        description: data.description,
        coordinates: [data.lat, data.lng],
        images: data.images?.filter(img => img.trim() !== '') || [],
      });
    } else {
      addMekan({
        id: Date.now().toString(),
        ...data,
        categoryLabel: categoryLabels[data.category],
        fullHistory: data.summary,
        description: data.description,
        coordinates: [data.lat, data.lng],
        images: data.images?.filter(img => img.trim() !== '') || [],
      });
    }
    setMekanlar(getMekanlar());
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteMekan(id);
    setMekanlar(getMekanlar());
  };

  const columns: Column<PinLocation>[] = [
    { key: 'title', label: 'Mekân Adı', sortable: true, render: (row) => <div className="font-medium" style={{ color: 'var(--a-text)' }}>{row.title}</div> },
    { key: 'category', label: 'Kategori', render: (row) => <Badge variant="outline" style={{ borderColor: 'var(--a-border)', color: 'var(--a-text)' }}>{row.categoryLabel || row.category}</Badge> },
    { key: 'timePeriod', label: 'Dönem', render: (row) => <span className="text-xs" style={{ color: 'var(--a-muted)' }}>{row.timePeriod}</span> },
    { key: 'neighborhood', label: 'Mahalle', render: (row) => <span style={{ color: 'var(--a-text)' }}>{row.neighborhood}</span> },
    { key: 'address', label: 'Adres', className: 'max-w-[200px] truncate hidden md:table-cell' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 style={{ color: 'var(--a-text)', fontSize: '1.5rem', fontWeight: 600 }}>Mekânlar</h2>
          <p style={{ color: 'var(--a-muted)' }}>Harita pinlerini yönetin</p>
        </div>
        <Button onClick={openAddDialog} style={{ backgroundColor: 'var(--a-primary)', color: 'var(--a-bg)' }}>
          <Plus size={15} className="mr-2" /> Yeni Mekân
        </Button>
      </div>

      <Card style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
        <CardContent className="p-6">
          <DataTable
            data={mekanlar}
            columns={columns}
            searchKeys={['title', 'address', 'neighborhood']}
            actions={(row) => (
              <div className="flex gap-2 items-center">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(row)} style={{ borderColor: 'var(--a-border)', color: 'var(--a-text)' }}>
                  <Pencil size={14} />
                </Button>
                <DeleteDialog
                  title="Mekânı Sil"
                  description={`${row.title} isimli mekânı silmek istediğinize emin misiniz?`}
                  onConfirm={() => handleDelete(row.id)}
                />
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)', color: 'var(--a-text)' }}>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Mekân Düzenle' : 'Yeni Mekân Ekle'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Mekân Adı</Label>
              <Input id="title" {...register('title')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
              {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }}>
                        <SelectValue placeholder="Seçin" />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
                        <SelectItem value="heykeller">Heykeller</SelectItem>
                        <SelectItem value="saraylar">Saraylar</SelectItem>
                        <SelectItem value="tarihi-yapilar">Tarihi Yapılar</SelectItem>
                        <SelectItem value="spor">Spor</SelectItem>
                        <SelectItem value="dini-kamusal">Dini & Kamusal</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && <p className="text-xs text-red-600">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Dönem</Label>
                <Controller
                  name="timePeriod"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }}>
                        <SelectValue placeholder="Seçin" />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
                        <SelectItem value="1400-1600">1400-1600</SelectItem>
                        <SelectItem value="1600-1800">1600-1800</SelectItem>
                        <SelectItem value="1800-1850">1800-1850</SelectItem>
                        <SelectItem value="1850-1900">1850-1900</SelectItem>
                        <SelectItem value="1900-1960">1900-1960</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.timePeriod && <p className="text-xs text-red-600">{errors.timePeriod.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mahalle</Label>
                <Controller
                  name="neighborhood"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }}>
                        <SelectValue placeholder="Seçin" />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
                        <SelectItem value="Abbasağa">Abbasağa</SelectItem>
                        <SelectItem value="Akatlar">Akatlar</SelectItem>
                        <SelectItem value="Arnavutköy">Arnavutköy</SelectItem>
                        <SelectItem value="Balmumcu">Balmumcu</SelectItem>
                        <SelectItem value="Bebek">Bebek</SelectItem>
                        <SelectItem value="Cihannüma">Cihannüma</SelectItem>
                        <SelectItem value="Dikilitaş">Dikilitaş</SelectItem>
                        <SelectItem value="Etiler">Etiler</SelectItem>
                        <SelectItem value="Gayrettepe">Gayrettepe</SelectItem>
                        <SelectItem value="Konaklar">Konaklar</SelectItem>
                        <SelectItem value="Kuruçeşme">Kuruçeşme</SelectItem>
                        <SelectItem value="Kültür">Kültür</SelectItem>
                        <SelectItem value="Levazım">Levazım</SelectItem>
                        <SelectItem value="Levent">Levent</SelectItem>
                        <SelectItem value="Mecidiye">Mecidiye</SelectItem>
                        <SelectItem value="Muradiye">Muradiye</SelectItem>
                        <SelectItem value="Nisbetiye">Nisbetiye</SelectItem>
                        <SelectItem value="Ortaköy">Ortaköy</SelectItem>
                        <SelectItem value="Sinanpaşa">Sinanpaşa</SelectItem>
                        <SelectItem value="Türkali">Türkali</SelectItem>
                        <SelectItem value="Ulus">Ulus</SelectItem>
                        <SelectItem value="Vişnezade">Vişnezade</SelectItem>
                        <SelectItem value="Yıldız">Yıldız</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.neighborhood && <p className="text-xs text-red-600">{errors.neighborhood.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="era">Dönem (Opsiyonel Metin)</Label>
                <Input id="era" {...register('era')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Input id="address" {...register('address')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
              {errors.address && <p className="text-xs text-red-600">{errors.address.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Özet Bilgi</Label>
              <Textarea id="summary" rows={3} {...register('summary')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
              {errors.summary && <p className="text-xs text-red-600">{errors.summary.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea id="description" rows={4} {...register('description')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Enlem</Label>
                <Input id="lat" type="number" step="any" {...register('lat')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
                {errors.lat && <p className="text-xs text-red-600">{errors.lat.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Boylam</Label>
                <Input id="lng" type="number" step="any" {...register('lng')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
                {errors.lng && <p className="text-xs text-red-600">{errors.lng.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fotoğraflar</Label>
              <ImageUploadInput
                images={images}
                onChange={(imgs) => setValue('images', imgs)}
              />
            </div>

            <DialogFooter>
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
