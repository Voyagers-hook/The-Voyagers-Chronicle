import { Hero } from "@/components/kids/Hero";
import { TackleBoard } from "@/components/kids/TackleBoard";
import { GuideSection } from "@/components/kids/GuideSection";
import { CardCollection } from "@/components/kids/CardCollection";
import logo from "@/assets/little-voyagers-logo.png";

const Index = () => {
  const scrollToGuide = () => {
    document.getElementById("guide")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Hero onStart={scrollToGuide} />
      <GuideSection />
      <TackleBoard />
      <CardCollection />

      <footer className="py-12 text-center border-t border-border bg-secondary/5">
        <img src={logo} alt="Little Voyagers" className="w-16 h-16 mx-auto opacity-80" />
        <p className="font-display text-sm uppercase tracking-widest text-foreground mt-3">
          Little Voyagers · Project Somerset
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Est. 2025 · Made for young explorers</p>
      </footer>
    </main>
  );
};

export default Index;
