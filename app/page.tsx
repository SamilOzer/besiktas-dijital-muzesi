import LoadingScreen from "@/components/LoadingScreen";
import HomeContent from "@/components/HomeContent";

export default function HomePage() {
  return (
    <main className="relative">
      <LoadingScreen />
      <HomeContent />
    </main>
  );
}
