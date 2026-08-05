-- ============================================================================
-- BEŞİKTAŞ DİJİTAL MÜZESİ - SUPABASE VERİTABANI ŞEMASI VE RLS POLİTİKALARI
-- ============================================================================
-- Bu SQL kodunu Supabase Dashboard -> SQL Editor kısmına yapıştırıp RUN butonuna basınız.

-- 1. MEKÂNLAR TABLOSU (Harita Pinleri)
CREATE TABLE IF NOT EXISTS public.mekanlar (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  "categoryLabel" TEXT,
  coordinates JSONB NOT NULL,
  summary TEXT NOT NULL,
  "fullHistory" TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  era TEXT,
  address TEXT,
  description TEXT,
  "timePeriod" TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. OLAYLAR TABLOSU (Ansiklopedi Tarihi Olaylar)
CREATE TABLE IF NOT EXISTS public.olaylar (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  era TEXT NOT NULL,
  category TEXT NOT NULL,
  "categoryLabel" TEXT,
  summary TEXT NOT NULL,
  "fullText" TEXT,
  description TEXT,
  location TEXT,
  image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROW LEVEL SECURITY (RLS) AKTİFLEŞTİRME
ALTER TABLE public.mekanlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.olaylar ENABLE ROW LEVEL SECURITY;

-- 4. HERKESE AÇIK ERİŞİM (SELECT, INSERT, UPDATE, DELETE) POLİTİKALARI
-- (Admin paneli ve ziyaretçi erişimi için gerekli izinler)

-- Mekanlar İzinleri
DROP POLICY IF EXISTS "Allow public select on mekanlar" ON public.mekanlar;
CREATE POLICY "Allow public select on mekanlar" ON public.mekanlar FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on mekanlar" ON public.mekanlar;
CREATE POLICY "Allow public insert on mekanlar" ON public.mekanlar FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on mekanlar" ON public.mekanlar;
CREATE POLICY "Allow public update on mekanlar" ON public.mekanlar FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on mekanlar" ON public.mekanlar;
CREATE POLICY "Allow public delete on mekanlar" ON public.mekanlar FOR DELETE USING (true);

-- Olaylar İzinleri
DROP POLICY IF EXISTS "Allow public select on olaylar" ON public.olaylar;
CREATE POLICY "Allow public select on olaylar" ON public.olaylar FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on olaylar" ON public.olaylar;
CREATE POLICY "Allow public insert on olaylar" ON public.olaylar FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on olaylar" ON public.olaylar;
CREATE POLICY "Allow public update on olaylar" ON public.olaylar FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on olaylar" ON public.olaylar;
CREATE POLICY "Allow public delete on olaylar" ON public.olaylar FOR DELETE USING (true);
