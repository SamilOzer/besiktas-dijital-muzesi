'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Calendar } from 'lucide-react';

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
import { getOlaylar, fetchOlaylar, addOlay, updateOlay, deleteOlay } from '@/lib/admin-store';
import { HistoricalEvent, EventCategory } from '@/data/ansiklopediData';
import ImageUploadInput from '@/components/ImageUploadInput';

const olaySchema = z.object({
  title: z.string().trim().min(2, 'Başlık en az 2 karakter olmalıdır'),
  date: z.string().trim().min(1, 'Tarih bilgisi girilmesi zorunludur'),
  era: z.string().trim().min(1, 'Dönem bilgisi girilmesi zorunludur'),
  category: z.enum(['siyasi','askeri','kulturel','toplumsal','spor','mimari'], {
    errorMap: () => ({ message: 'Geçerli bir kategori seçiniz' })
  }),
  categoryLabel: z.string().optional(),
  summary: z.string().trim().min(1, 'Özet bilgi girilmesi zorunludur'),
  description: z.string().optional(),
  location: z.string().optional(),
  tags: z.string().default(''), // comma-separated, convert to array on submit
  images: z.array(z.string()).optional(),
});
type OlayFormData = z.infer<typeof olaySchema>;

const CATEGORY_LABELS: Record<string, string> = {
  siyasi: 'Siyasi',
  askeri: 'Askeri',
  kulturel: 'Kültürel',
  toplumsal: 'Toplumsal',
  spor: 'Spor',
  mimari: 'Mimari',
};

export default function AnsiklopediPage() {
  const [olaylar, setOlaylar] = useState<HistoricalEvent[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadOlaylar = async () => {
      const data = await fetchOlaylar();
      if (isMounted) {
        setOlaylar(data);
      }
    };
    loadOlaylar();
    return () => {
      isMounted = false;
    };
  }, []);

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<OlayFormData>({
    resolver: zodResolver(olaySchema),
    defaultValues: {
      title: '',
      date: '',
      era: '',
      category: 'siyasi',
      categoryLabel: 'Siyasi',
      summary: '',
      description: '',
      location: '',
      tags: '',
      images: [],
    }
  });

  const images = watch('images') || [];

  const openAddDialog = () => {
    setEditingId(null);
    reset({
      title: '', date: '', era: '', category: 'siyasi', categoryLabel: 'Siyasi', summary: '', description: '', location: '', tags: '', images: []
    });
    setDialogOpen(true);
  };

  const openEditDialog = (row: HistoricalEvent) => {
    setEditingId(row.id);
    const existingImages = row.images && row.images.length > 0
      ? row.images
      : (row.image ? [row.image] : []);
    reset({
      title: row.title,
      date: row.date,
      era: row.era,
      category: row.category,
      categoryLabel: row.categoryLabel || CATEGORY_LABELS[row.category] || 'Toplumsal',
      summary: row.summary,
      description: (row as any).description || '',
      location: row.location || '',
      tags: (row.tags || []).join(', '),
      images: existingImages,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: OlayFormData) => {
    const tagsArray = (data.tags || '').split(',').map(t => t.trim()).filter(Boolean);
    const validImages = data.images?.filter(img => img.trim() !== '') || [];
    const primaryImage = validImages[0] || '';
    const catLabel = CATEGORY_LABELS[data.category] || 'Toplumsal';

    if (editingId) {
      updateOlay(editingId, {
        ...data,
        categoryLabel: catLabel,
        tags: tagsArray,
        image: primaryImage,
        images: validImages,
        fullText: data.summary,
        description: data.description,
      });
    } else {
      addOlay({
        id: Date.now().toString(),
        ...data,
        categoryLabel: catLabel,
        tags: tagsArray,
        image: primaryImage,
        images: validImages,
        fullText: data.summary,
        description: data.description,
      });
    }
    setOlaylar(getOlaylar());
    setDialogOpen(false);
  };

  const onInvalid = (formErrors: typeof errors) => {
    console.warn('[admin/ansiklopedi] Form validation errors:', formErrors);
    const errorMessages = Object.entries(formErrors)
      .map(([field, err]) => `• ${err?.message || field}`)
      .join('\n');
    alert(`Lütfen formdaki eksik veya hatalı alanları kontrol edin:\n\n${errorMessages}`);
  };

  const handleDelete = (id: string) => {
    deleteOlay(id);
    setOlaylar(getOlaylar());
  };

  const getCategoryVariant = (cat: EventCategory) => {
    switch (cat) {
      case 'askeri': return 'destructive';
      case 'siyasi': return 'default';
      case 'kulturel': return 'success';
      default: return 'secondary';
    }
  };

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [eraFilter, setEraFilter] = useState<string>("all");

  const filteredOlaylar = useMemo(() => {
    const list = olaylar.filter((row) => {
      const catOk = categoryFilter === "all" || row.category === categoryFilter;
      const eraOk = eraFilter === "all" || row.era === eraFilter;
      return catOk && eraOk;
    });
    return list.slice().reverse();
  }, [olaylar, categoryFilter, eraFilter]);

  const columns: Column<HistoricalEvent>[] = [
    { key: 'title', label: 'Başlık', sortable: true, render: (row) => <div className="font-medium" style={{ color: 'var(--a-text)' }}>{row.title}</div> },
    { key: 'category', label: 'Kategori', render: (row) => <Badge variant={getCategoryVariant(row.category) as any}>{row.categoryLabel}</Badge> },
    { key: 'date', label: 'Tarih', render: (row) => <div className="flex items-center gap-1" style={{ color: 'var(--a-text)' }}><Calendar size={14} /> <span>{row.date}</span></div> },
    { key: 'era', label: 'Dönem', render: (row) => <span className="text-xs" style={{ color: 'var(--a-muted)' }}>{row.era}</span> },
    { key: 'location', label: 'Konum', className: 'max-w-[150px] truncate hidden md:table-cell', render: (row) => <span style={{ color: 'var(--a-text)' }}>{row.location}</span> },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 style={{ color: 'var(--a-text)', fontSize: '1.5rem', fontWeight: 600 }}>Ansiklopedi</h2>
          <p style={{ color: 'var(--a-muted)' }}>Tarihi olayları yönetin</p>
        </div>
        <Button onClick={openAddDialog} style={{ backgroundColor: 'var(--a-primary)', color: 'var(--a-bg)' }}>
          <Plus size={15} className="mr-2" /> Yeni Olay
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
              <option value="siyasi">Siyasi</option>
              <option value="askeri">Askeri</option>
              <option value="kulturel">Kültürel</option>
              <option value="toplumsal">Toplumsal</option>
              <option value="spor">Spor</option>
              <option value="mimari">Mimari</option>
            </select>

            {/* Era Filter */}
            <select
              value={eraFilter}
              onChange={(e) => setEraFilter(e.target.value)}
              className="bg-[#14161d] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white [&>option]:bg-[#14161d] focus:outline-none"
            >
              <option value="all">Tüm Dönemler</option>
              <option value="19. Yüzyıl">19. Yüzyıl</option>
              <option value="20. Yüzyıl">20. Yüzyıl</option>
              <option value="Cumhuriyet Dönemi">Cumhuriyet Dönemi</option>
              <option value="Osmanlı Dönemi">Osmanlı Dönemi</option>
            </select>
          </div>

          <DataTable
            data={filteredOlaylar}
            columns={columns}
            searchKeys={['title', 'summary', 'location', 'date']}
            actions={(row) => (
              <div className="flex gap-2 items-center">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(row)} style={{ borderColor: 'var(--a-border)', color: 'var(--a-text)' }}>
                  <Pencil size={14} />
                </Button>
                <DeleteDialog
                  title="Olayı Sil"
                  description={`${row.title} isimli olayı silmek istediğinize emin misiniz?`}
                  onConfirm={() => handleDelete(row.id)}
                />
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl lg:max-w-5xl p-0 overflow-hidden" style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)', color: 'var(--a-text)' }}>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Olay Düzenle' : 'Yeni Olay Ekle'}</DialogTitle>
            <p className="text-xs text-[var(--a-muted)]">Ansiklopedi maddesine ait tarihi bilgileri, kategorileri ve görselleri güncelleyin.</p>
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
                
                {/* ── Left Column: Olay Bilgileri & Etiketler ── */}
                <div className="space-y-4 bg-[var(--a-bg)]/40 p-4 rounded-xl border border-[var(--a-border)]/50">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--a-primary)] pb-1 border-b border-[var(--a-border)]/50 flex items-center gap-1.5">
                    <span>📅</span> Olay Bilgileri & Etiketler
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Olay Başlığı</Label>
                    <Input id="title" placeholder="Örn. Beşiktaş'ın Kuruluşu" {...register('title')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
                    {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="date">Tarih / Yıl</Label>
                      <Input id="date" placeholder="Örn. 1903" {...register('date')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
                      {errors.date && <p className="text-xs text-red-600">{errors.date.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Dönem / Çağ</Label>
                      <Controller
                        name="era"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }}>
                              <SelectValue placeholder="Dönem seçin" />
                            </SelectTrigger>
                            <SelectContent style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
                              <SelectItem value="Osmanlı Klasik Dönemi">Osmanlı Klasik Dönemi</SelectItem>
                              <SelectItem value="Tanzimat Dönemi">Tanzimat Dönemi</SelectItem>
                              <SelectItem value="Hamidiye Dönemi">Hamidiye Dönemi</SelectItem>
                              <SelectItem value="II. Meşrutiyet Dönemi">II. Meşrutiyet Dönemi</SelectItem>
                              <SelectItem value="Cumhuriyet Dönemi">Cumhuriyet Dönemi</SelectItem>
                              <SelectItem value="19. Yüzyıl">19. Yüzyıl</SelectItem>
                              <SelectItem value="20. Yüzyıl">20. Yüzyıl</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.era && <p className="text-xs text-red-600">{errors.era.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={(val) => {
                              field.onChange(val);
                              const labels: Record<string, string> = {
                                siyasi: "Siyasi Tarih",
                                askeri: "Askeri Tarih",
                                kulturel: "Kültür & Sanat",
                                toplumsal: "Toplumsal Yaşam",
                                spor: "Spor Tarihi",
                                mimari: "Mimari Miras",
                              };
                              setValue("categoryLabel", labels[val] || "Tarihi Olay");
                            }}
                          >
                            <SelectTrigger style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }}>
                              <SelectValue placeholder="Seçin" />
                            </SelectTrigger>
                            <SelectContent style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
                              <SelectItem value="siyasi">Siyasi Tarih</SelectItem>
                              <SelectItem value="askeri">Askeri Tarih</SelectItem>
                              <SelectItem value="kulturel">Kültür & Sanat</SelectItem>
                              <SelectItem value="toplumsal">Toplumsal Yaşam</SelectItem>
                              <SelectItem value="spor">Spor Tarihi</SelectItem>
                              <SelectItem value="mimari">Mimari Miras</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.category && <p className="text-xs text-red-600">{errors.category.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoryLabel">Kategori Etiketi</Label>
                      <Input id="categoryLabel" placeholder="Örn. Spor Tarihi" {...register('categoryLabel')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
                      {errors.categoryLabel && <p className="text-xs text-red-600">{errors.categoryLabel.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Konum / Semt</Label>
                    <Controller
                      name="location"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <SelectTrigger style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }}>
                            <SelectValue placeholder="Konum seçin" />
                          </SelectTrigger>
                          <SelectContent style={{ backgroundColor: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
                            <SelectItem value="Beşiktaş Meydanı">Beşiktaş Meydanı</SelectItem>
                            <SelectItem value="Dolmabahçe">Dolmabahçe</SelectItem>
                            <SelectItem value="Ortaköy">Ortaköy</SelectItem>
                            <SelectItem value="Yıldız">Yıldız</SelectItem>
                            <SelectItem value="Akaretler">Akaretler</SelectItem>
                            <SelectItem value="Ihlamur">Ihlamur</SelectItem>
                            <SelectItem value="Bebek">Bebek</SelectItem>
                            <SelectItem value="Arnavutköy">Arnavutköy</SelectItem>
                            <SelectItem value="Levent">Levent</SelectItem>
                            <SelectItem value="Abbasağa">Abbasağa</SelectItem>
                            <SelectItem value="Vişnezade">Vişnezade</SelectItem>
                            <SelectItem value="Sinanpaşa">Sinanpaşa</SelectItem>
                            <SelectItem value="Cihannüma">Cihannüma</SelectItem>
                            <SelectItem value="Muradiye">Muradiye</SelectItem>
                            <SelectItem value="Türkali">Türkali</SelectItem>
                            <SelectItem value="Dikilitaş">Dikilitaş</SelectItem>
                            <SelectItem value="Balmumcu">Balmumcu</SelectItem>
                            <SelectItem value="Gayrettepe">Gayrettepe</SelectItem>
                            <SelectItem value="Nisbetiye">Nisbetiye</SelectItem>
                            <SelectItem value="Etiler">Etiler</SelectItem>
                            <SelectItem value="Kültür">Kültür</SelectItem>
                            <SelectItem value="Levazım">Levazım</SelectItem>
                            <SelectItem value="Akatlar">Akatlar</SelectItem>
                            <SelectItem value="Konaklar">Konaklar</SelectItem>
                            <SelectItem value="Kuruçeşme">Kuruçeşme</SelectItem>
                            <SelectItem value="Mecidiye">Mecidiye</SelectItem>
                            <SelectItem value="Ulus">Ulus</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Etiketler</Label>
                    <Input id="tags" placeholder="Beşiktaş, Futbol, Kulüp (virgülle ayırın)" {...register('tags')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
                  </div>
                </div>

                {/* ── Right Column: İçerik & Görseller ── */}
                <div className="space-y-4 bg-[var(--a-bg)]/40 p-4 rounded-xl border border-[var(--a-border)]/50">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--a-primary)] pb-1 border-b border-[var(--a-border)]/50 flex items-center gap-1.5">
                    <span>📖</span> Özet & Detaylı Açıklama
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summary">Özet Bilgi</Label>
                    <Textarea id="summary" rows={3} placeholder="Olay hakkında özet metin..." {...register('summary')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
                    {errors.summary && <p className="text-xs text-red-600">{errors.summary.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Detaylı Açıklama (Opsiyonel)</Label>
                    <Textarea id="description" rows={4} placeholder="Olayın detaylı hikayesi ve tarihsel önemi..." {...register('description')} style={{ backgroundColor: 'var(--a-bg)', borderColor: 'var(--a-border)' }} />
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
              <Button type="submit" style={{ backgroundColor: 'var(--a-primary)', color: 'var(--a-bg)' }} className="px-6 font-semibold shadow-md">
                Kaydet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
