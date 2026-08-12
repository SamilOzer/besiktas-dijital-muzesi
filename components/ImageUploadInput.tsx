"use client";

import { useState, useRef } from "react";
import { Upload, Link as LinkIcon, Plus, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadInputProps {
  images: string[];
  onChange: (images: string[]) => void;
  darkStyle?: boolean;
}

const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return resolve("");

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(src);
        }
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
};

export default function ImageUploadInput({
  images = [],
  onChange,
  darkStyle = false,
}: ImageUploadInputProps) {
  const [urlInput, setUrlInput] = useState("");
  const [tab, setTab] = useState<"file" | "url">("file");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processFiles = async (fileList: File[]) => {
    try {
      const compressedImages = await Promise.all(fileList.map((file) => compressImage(file)));
      const validNewImages = compressedImages.filter(Boolean);
      onChange([...images, ...validNewImages]);
    } catch (err) {
      console.error("Image compression error:", err);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput("");
  };

  const handleRemove = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    onChange(next);
  };

  const inputBg = darkStyle
    ? "bg-white/5 border-white/10 text-white"
    : "bg-[var(--a-bg)] border-[var(--a-border)] text-[var(--a-text)]";

  return (
    <div className="space-y-3">
      {/* Upload Option Tabs */}
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setTab("file")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all ${
            tab === "file"
              ? "bg-[var(--accent)] text-black border-[var(--accent)] font-semibold"
              : darkStyle
              ? "bg-white/5 border-white/10 text-white/70 hover:text-white"
              : "bg-[var(--a-bg)] border-[var(--a-border)] text-[var(--a-muted)] hover:text-[var(--a-text)]"
          }`}
        >
          <Upload size={13} /> Bilgisayardan Yükle
        </button>
        <button
          type="button"
          onClick={() => setTab("url")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all ${
            tab === "url"
              ? "bg-[var(--accent)] text-black border-[var(--accent)] font-semibold"
              : darkStyle
              ? "bg-white/5 border-white/10 text-white/70 hover:text-white"
              : "bg-[var(--a-bg)] border-[var(--a-border)] text-[var(--a-muted)] hover:text-[var(--a-text)]"
          }`}
        >
          <LinkIcon size={13} /> Görsel URL Bağlantısı
        </button>
      </div>

      {/* Mode Controls */}
      {tab === "file" ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
            isDragging
              ? "border-[var(--accent)] bg-[var(--accent)]/10 scale-[1.01]"
              : darkStyle
              ? "border-white/15 hover:border-[var(--accent)]/50 bg-white/3 hover:bg-white/5"
              : "border-[var(--a-border)] hover:border-[var(--a-primary)] bg-[var(--a-bg)]"
          }`}
        >
          <Upload className={`w-6 h-6 ${isDragging ? "text-[var(--accent)] scale-110" : darkStyle ? "text-[var(--accent)]" : "text-[var(--a-primary)]"} transition-transform`} />
          <p className={`text-xs font-medium ${darkStyle ? "text-white/80" : "text-[var(--a-text)]"}`}>
            {isDragging ? "Bırakın!" : "Fotoğraf seçmek için tıklayın veya dosyaları sürükleyin"}
          </p>
          <p className="text-[10px] opacity-60">PNG, JPG, WEBP (Birden fazla dosya seçilebilir)</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://örnek.com/fotograf.jpg"
            className={`flex-1 rounded-lg border px-3 py-2 text-xs focus:outline-none ${inputBg}`}
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddUrl}
            className="bg-[var(--accent)] text-black hover:brightness-110 text-xs px-3"
          >
            <Plus size={14} className="mr-1" /> Ekle
          </Button>
        </div>
      )}

      {/* Image Thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative group w-full h-20 rounded-lg overflow-hidden border border-white/15 bg-black/40 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`Fotoğraf ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/90 text-white flex items-center justify-center opacity-80 group-hover:opacity-100 hover:scale-110 transition-all shadow-md"
                title="Kaldır"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
