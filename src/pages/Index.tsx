import { Hero } from "@/components/kids/Hero";
import { TackleBoard } from "@/components/kids/TackleBoard";
import { GuideSection } from "@/components/kids/GuideSection";
import { CardCollection } from "@/components/kids/CardCollection";

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

      <footer className="py-10 text-center text-muted-foreground text-sm">
        <p className="font-display text-base text-foreground">🐟 Lil' Anglers Club</p>
        <p className="mt-1">Made with love for little legends of the lake.</p>
      </footer>
    </main>
  );
};

export default Index;
