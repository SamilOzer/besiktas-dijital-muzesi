import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kültür Haritası | Beşiktaş Dijital Müzesi",
  description:
    "Beşiktaş'taki tarihi ve kültürel mekânları interaktif haritada keşfedin.",
};

// The harita page renders its own full-screen fixed layout;
// it gets the RootLayout Header but NOT the Footer
// (implemented by wrapping children in a <div> that hides footer via CSS below)
export default function HaritaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* Footer intentionally omitted for full-screen map page */}
    </>
  );
}
