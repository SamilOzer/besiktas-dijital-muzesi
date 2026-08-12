'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import dynamic from 'next/dynamic';

const LocationPickerModal = dynamic(() => import('@/components/admin/LocationPickerModal'), { ssr: false });

const mekanSchema = z.object({
  title: z.string().trim().min(1, 'Mekân adı zorunludur'),
  category: z.enum(['heykeller','saraylar','tarihi-yapilar','spor','dini-kamusal'], {
    errorMap: () => ({ message: 'Geçerli bir kategori seçiniz' })
  }),
  timePeriod: z.enum(['1400-1600','1600-1800','1800-1850','1850-1900','1900-1960','1960-gunumuz'], {
    errorMap: () => ({ message: 'Geçerli bir dönem seçiniz' })
  }),
  neighborhood: z.enum(['Abbasağa','Akatlar','Arnavutköy','Balmumcu','Bebek','Cihannüma','Dikilitaş','Etiler','Gayrettepe','Konaklar','Kuruçeşme','Kültür','Levazım','Levent','Mecidiye','Muradiye','Nisbetiye','Ortaköy','Sinanpaşa','Türkali','Ulus','Vişnezade','Yıldız'], {
    errorMap: () => ({ message: 'Geçerli bir mahalle seçiniz' })
  }),
  address: z.string().optional().default(''),
  summary: z.string().optional().default(''),
  description: z.string().optional().default(''),
  era: z.string().optional().default(''),
  lat: z.coerce.number().optional().default(41.0425),
  lng: z.coerce.number().optional().default(29.0075),
  images: z.array(z.string()).optional().default([]),
});
type MekanFormData = z.input<typeof mekanSchema>;

const NEIGHBORHOOD_COORDINATES: Record<string, [number, number]> = {
  Abbasağa: [41.0460, 29.0040],
  Akatlar: [41.0900, 29.0200],
  Arnavutköy: [41.0675, 29.0430],
  Balmumcu: [41.0590, 29.0110],
  Bebek: [41.0765, 29.0435],
  Cihannüma: [41.0445, 29.0045],
  Dikilitaş: [41.0540, 29.0080],
  Etiler: [41.0820, 29.0330],
  Gayrettepe: [41.0680, 29.0070],
  Konaklar: [41.0870, 29.0170],
  Kuruçeşme: [41.0600, 29.0350],
  Kültür: [41.0730, 29.0280],
  Levazım: [41.0660, 29.0170],
  Levent: [41.0810, 29.0150],
  Mecidiye: [41.0495, 29.0230],
  Muradiye: [41.0475, 29.0005],
  Nisbetiye: [41.0772, 29.0145],
  Ortaköy: [41.0475, 29.0270],
  Sinanpaşa: [41.0425, 29.0065],
  Türkali: [41.0470, 29.0020],
  Ulus: [41.0690, 29.0260],
  Vişnezade: [41.0410, 29.0010],
  Yıldız: [41.0490, 29.0120],
};

export default function MekanlarPage() {
  const [mekanlar, setMekanlar] = useState<PinLocation[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>("all");
  const [timePeriodFilter, setTimePeriodFilter] = useState<string>("all");

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

  const filteredMekanlar = useMemo(() => {
    const list = mekanlar.filter((row) => {
      const catOk = categoryFilter === "all" || row.category === categoryFilter;
      const neighOk = neighborhoodFilter === "all" || row.neighborhood === neighborhoodFilter;
      const timeOk = timePeriodFilter === "all" || row.timePeriod === timePeriodFilter;
      return catOk && neighOk && timeOk;
    });
    // Sort newest added first (descending order)
    return list.slice().reverse();
  }, [mekanlar, categoryFilter, neighborhoodFilter, timePeriodFilter]);

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<MekanFormData>({
    resolver: zodResolver(mekanSchema),
    defaultValues: {
      title: '',
      category: 'tarihi-yapilar',
      timePeriod: '1900-1960',
      neighborhood: 'Sinanpaşa',
      address: '',
      summary: '',
      description: '',
      era: '',
      lat: 41.0422,
      lng: 29.0067,
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
    const existingDesc = (row as any).description || row.fullHistory || row.summary || '';
    reset({
      title: row.title || '',
      category: row.category as any,
      timePeriod: row.timePeriod as any,
      neighborhood: row.neighborhood as any,
      address: row.address || '',
      summary: row.summary || existingDesc.slice(0, 200),
      description: existingDesc,
      era: row.era || '',
      lat: row.coordinates?.[0] ?? 41.043,
      lng: row.coordinates?.[1] ?? 29.005,
      images: row.images || [],
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: MekanFormData) => {
    const categoryLabels: Record<string, string> = {
      heykeller: 'Heykeller & Anıtlar',
      saraylar: 'Saraylar & Kasırlar',
      'tarihi-yapilar': 'Tarihi Evler & Yapılar',
      spor: 'Stadyum & Spor Tarihi',
      'dini-kamusal': 'Dini & Kamusal Yapılar'
    };

    const descriptionText = data.description || data.summary || '';

    // Ensure pin doesn't overlap exactly with an existing pin
    let targetLat = data.lat ?? 41.0425;
    let targetLng = data.lng ?? 29.0075;
    const existingMekanlar = mekanlar.filter(m => m.id !== editingId);
    let attempts = 0;
    while (existingMekanlar.some(m => Math.abs(m.coordinates[0] - targetLat) < 0.0001 && Math.abs(m.coordinates[1] - targetLng) < 0.0001) && attempts < 10) {
      attempts++;
      targetLat += 0.0003 * (attempts % 2 === 0 ? 1 : -1);
      targetLng += 0.0003 * (attempts % 3 === 0 ? 1 : -1);
    }

    const finalCoordinates: [number, number] = [targetLat, targetLng];

    if (editingId) {
      await updateMekan(editingId, {
        ...data,
        categoryLabel: categoryLabels[data.category],
        fullHistory: descriptionText,
        summary: descriptionText.slice(0, 200),
        description: descriptionText,
        coordinates: finalCoordinates,
        images: data.images?.filter(img => img.trim() !== '') || [],
      });
    } else {
      await addMekan({
        id: Date.now().toString(),
        ...data,
        categoryLabel: categoryLabels[data.category],
        fullHistory: descriptionText,
        summary: descriptionText.slice(0, 200),
        description: descriptionText,
        coordinates: finalCoordinates,
        images: data.images?.filter(img => img.trim() !== '') || [],
      });
    }
    const freshData = await fetchMekanlar();
    setMekanlar(freshData);
    setDialogOpen(false);
  };

  const onInvalid = (formErrors: typeof errors) => {
    console.warn('[admin/mekanlar] Form validation errors:', formErrors);
    const errorMessages = Object.entries(formErrors)
      .map(([field, err]) => `• ${err?.message || field}`)
      .join('\n');
    alert(`Lütfen formdaki eksik veya hatalı alanları kontrol edin:\n\n${errorMessages}`);
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
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#14161d] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white [&>option]:bg-[#14161d] focus:outline-none"
            >
              <option value="all">Tüm Kategoriler</option>
              <option value="heykeller">Heykeller & Anıtlar</option>
              <option value="saraylar">Saraylar & Kasırlar</option>
              <option value="tarihi-yapilar">Tarihi Evler & Yapılar</option>
              <option value="spor">Stadyum & Spor Tarihi</option>
              <option value="dini-kamusal">Dini & Kamusal Yapılar</option>
            </select>

            {/* Neighborhood Filter */}
            <select
              value={neighborhoodFilter}
              onChange={(e) => setNeighborhoodFilter(e.target.value)}
              className="bg-[#14161d] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white [&>option]:bg-[#14161d] focus:outline-none"
            >
              <option value="all">Tüm Mahalleler</option>
              {['Abbasağa','Akatlar','Arnavutköy','Balmumcu','Bebek','Cihannüma','Dikilitaş','Etiler','Gayrettepe','Konaklar','Kuruçeşme','Kültür','Levazım','Levent','Mecidiye','Muradiye','Nisbetiye','Ortaköy','Sinanpaşa','Türkali','Ulus','Vişnezade','Yıldız'].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>

            {/* Time Period Filter */}
            <select
              value={timePeriodFilter}
              onChange={(e) => setTimePeriodFilter(e.target.value)}
              className="bg-[#14161d] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white [&>option]:bg-[#14161d] focus:outline-none"
            >
              <option value="all">Tüm Dönemler</option>
              <option value="1400-1600">1400-1600</option>
              <option value="1600-1800">1600-1800</option>
              <option value="1800-1850">1800-1850</option>
              <option value="1850-1900">1850-1900</option>
              <option value="1900-1960">1900-1960</option>
              <option value="1960-gunumuz">1960-Günümüz</option>
            </select>
          </div>

          <DataTable
            data={filteredMekanlar}
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

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!showMapPicker) setDialogOpen(open); }}>
        <DialogContent
          className="max-w-4xl lg:max-w-5xl p-0 overflow-hidden"
          style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)', color: 'var(--a-text)' }}
          onPointerDownOutside={(e) => { if (showMapPicker) e.preventDefault(); }}
          onInteractOutside={(e) => { if (showMapPicker) e.preventDefault(); }}
        >
          <DialogHeader>
            <DialogTitle>{editingId ? 'Mekân Düzenle' : 'Yeni Mekân Ekle'}</DialogTitle>
            <p className="text-xs text-[var(--a-muted)]">Harita pinine ait temel bilgileri, konum koordinatlarını ve görselleri güncelleyin.</p>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col flex-1 overflow-hidden min-h-0">
            {/* Validation Error Banner */}
            {Object.keys(errors).length > 0 && (
              <div className="mx-6 mt-4 p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-400 text-xs flex flex-col gap-1 shadow-inner">
                <div className="font-bold flex items-center gap-1.5 text-red-300">
                  <span>⚠️</span> Lütfen aşağıdaki eksik veya hatalı alanları düzeltiniz:
                </div>
                <ul className="list-disc list-inside space-y-0.5 opacity-90 pl-1">
                  {Object.entries(errors).map(([field, err]) => (
                    <li key={field}>{err?.message || `${field} alanı hatalı`}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* ── Left Column: Temel & Konum Bilgileri ── */}
                <div className="space-y-4 bg-[var(--a-bg)]/40 p-4 rounded-xl border border-[var(--a-border)]/50">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--a-primary)] pb-1 border-b border-[var(--a-border)]/50 flex items-center gap-1.5">
                    <span>📍</span> Temel & Konum Bilgileri
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Mekân Adı</Label>
                    <Input id="title" placeholder="Örn. Dolmabahçe Sarayı" {...register('title')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
                    {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
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
                              <SelectItem value="heykeller">Heykeller & Anıtlar</SelectItem>
                              <SelectItem value="saraylar">Saraylar & Kasırlar</SelectItem>
                              <SelectItem value="tarihi-yapilar">Tarihi Evler & Yapılar</SelectItem>
                              <SelectItem value="spor">Stadyum & Spor Tarihi</SelectItem>
                              <SelectItem value="dini-kamusal">Dini & Kamusal Yapılar</SelectItem>
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
                              <SelectItem value="1960-gunumuz">1960-Günümüz</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.timePeriod && <p className="text-xs text-red-600">{errors.timePeriod.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Mahalle</Label>
                      <Controller
                        name="neighborhood"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={(val) => {
                              field.onChange(val);
                              const coords = NEIGHBORHOOD_COORDINATES[val];
                              if (coords) {
                                setValue('lat', coords[0]);
                                setValue('lng', coords[1]);
                              }
                            }}
                          >
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
                      <Label htmlFor="era">Dönem Metni (Opsiyonel)</Label>
                      <Input id="era" placeholder="Örn. 19. Yüzyıl" {...register('era')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="address">Açık Adres</Label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowMapPicker(true)}
                          className="text-[11px] font-bold px-2.5 py-1 rounded bg-[var(--a-primary)]/15 border border-[var(--a-primary)]/40 text-[var(--a-primary)] hover:bg-[var(--a-primary)]/25 flex items-center gap-1 transition-all shadow-sm"
                          id="open-map-picker-btn"
                        >
                          🗺️ Haritada Seç
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const titleVal = watch('title') || '';
                            const addressVal = watch('address') || '';
                            const neighVal = watch('neighborhood') || '';
                            const query = `${titleVal} ${addressVal} ${neighVal} Beşiktaş İstanbul`.trim();
                            if (!query) return alert("Lütfen aramak için mekan adı veya adres yazın.");
                            try {
                              const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                              const data = await res.json();
                              if (data && data.length > 0) {
                                const lat = parseFloat(data[0].lat);
                                const lon = parseFloat(data[0].lon);
                                setValue('lat', lat);
                                setValue('lng', lon);
                                alert(`Konum bulundu! Enlem: ${lat}, Boylam: ${lon}`);
                              } else {
                                const fallback = NEIGHBORHOOD_COORDINATES[neighVal] || [41.0425, 29.0075];
                                setValue('lat', fallback[0]);
                                setValue('lng', fallback[1]);
                                alert(`Tam adres bulunamadı, mahalle (${neighVal}) merkez koordinatları atandı.`);
                              }
                            } catch (e) {
                              const fallback = NEIGHBORHOOD_COORDINATES[neighVal] || [41.0425, 29.0075];
                              setValue('lat', fallback[0]);
                              setValue('lng', fallback[1]);
                              alert("Mahalle merkez koordinatları atandı.");
                            }
                          }}
                          className="text-[11px] font-semibold text-[var(--a-muted)] hover:text-white flex items-center gap-1"
                        >
                          📍 Adresten Bul
                        </button>
                      </div>
                    </div>
                    <Input id="address" placeholder="Sokak, mahalle ve kapı no" {...register('address')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
                    {errors.address && <p className="text-xs text-red-600">{errors.address.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-2">
                      <Label htmlFor="lat">Enlem (Latitude)</Label>
                      <Input id="lat" type="number" step="any" placeholder="41.043" {...register('lat')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
                      {errors.lat && <p className="text-xs text-red-600">{errors.lat.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lng">Boylam (Longitude)</Label>
                      <Input id="lng" type="number" step="any" placeholder="29.005" {...register('lng')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
                      {errors.lng && <p className="text-xs text-red-600">{errors.lng.message}</p>}
                    </div>
                  </div>
                </div>

                {/* ── Right Column: İçerik & Görseller ── */}
                <div className="space-y-4 bg-[var(--a-bg)]/40 p-4 rounded-xl border border-[var(--a-border)]/50">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--a-primary)] pb-1 border-b border-[var(--a-border)]/50 flex items-center gap-1.5">
                    <span>📝</span> İçerik & Görseller
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea id="description" rows={6} placeholder="Detaylı tarihi ve mimari bilgiler..." {...register('description')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
                  </div>

                  <div className="space-y-2">
                    <Label>Fotoğraflar</Label>
                    <ImageUploadInput
                      images={images}
                      onChange={(imgs) => setValue('images', imgs)}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Sticky Footer with Save & Cancel Buttons */}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} style={{ borderColor: 'var(--a-border)', color: 'var(--a-text)' }}>
                İptal
              </Button>
              <Button
                type="button"
                onClick={handleSubmit(onSubmit, onInvalid)}
                style={{ backgroundColor: 'var(--a-primary)', color: 'var(--a-bg)' }}
                className="px-6 font-semibold shadow-md"
              >
                Kaydet
              </Button>
            </DialogFooter>
          </form>

          {/* ── Interactive Map Location Picker Modal ── */}
          {showMapPicker && (
            <LocationPickerModal
              initialLat={watch('lat')}
              initialLng={watch('lng')}
              initialAddress={watch('address') || watch('title')}
              onConfirm={(newLat, newLng, detectedAddress, detectedNeighborhood) => {
                setValue('lat', newLat);
                setValue('lng', newLng);
                if (detectedAddress) setValue('address', detectedAddress);
                if (detectedNeighborhood) setValue('neighborhood', detectedNeighborhood as any);
              }}
              onClose={() => setShowMapPicker(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
