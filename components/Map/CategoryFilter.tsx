"use client";
import { PinCategory } from "@/data/besiktasPinData";

const categories: { id: string; label: string; emoji: string }[] = [
  { id: "all", label: "Tümü", emoji: "🗺️" },
  { id: "heykeller", label: "Heykeller", emoji: "🗿" },
  { id: "saraylar", label: "Saraylar", emoji: "🏰" },
  { id: "tarihi-yapilar", label: "Tarihi Yapılar", emoji: "🏛️" },
  { id: "spor", label: "Stadyum & Spor", emoji: "🏟️" },
  { id: "dini-kamusal", label: "Dini & Kamusal", emoji: "⛪" },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(({ id, label, emoji }) => (
        <button
          key={id}
          id={`cat-filter-${id}`}
          onClick={() => onSelectCategory(id)}
          className={`cat-tab ${selectedCategory === id ? "active" : ""}`}
        >
          <span className="mr-1">{emoji}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
