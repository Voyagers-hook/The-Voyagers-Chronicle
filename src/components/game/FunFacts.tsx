import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Shuffle, Info } from "lucide-react";

type Card = {
  id: string;
  name: string;
  image_url: string | null;
  rarity: string;
  fact: string | null;
};

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function FunFacts({ userId }: { userId: string }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("cards").select("id, name, image_url, rarity, fact").not("fact", "is", null);
      setCards((data as Card[]) ?? []);
      setLoading(false);
    };
    void load();
  }, [userId]);

  const active = useMemo(() => {
    if (cards.length === 0) return null;
    const current = cards.find((c) => c.id === activeId);
    return current ?? pick(cards);
  }, [cards, activeId]);

  const next = () => {
    if (cards.length === 0) return;
    const options = cards.filter((c) => c.id !== active?.id);
    setActiveId(pick(options.length ? options : cards).id);
  };

  if (loading) {
    return <div className="text-center py-16 font-display text-xl text-muted-foreground">Finding fun facts…</div>;
  }

  if (!active) {
    return (
      <div className="panel p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent border-4 border-white shadow-[0_4px_0_hsl(188_85%_28%)] mb-3">
          <Info className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="font-display text-2xl">No fun facts yet</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Add facts to cards in Admin → Cards, and they’ll show up here.
        </p>
      </div>
    );
  }

  return (
    <section className="panel p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-display text-2xl leading-none">Campfire Fun Facts</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            A quick tale from your adventure log.
          </p>
        </div>
        <button onClick={next} className="btn-teal text-sm flex items-center gap-2">
          <Shuffle className="w-4 h-4" /> Another!
        </button>
      </div>

      <div className="mt-6 grid md:grid-cols-[240px_1fr] gap-5 items-start">
        <div className="tcg-card rarity-common !cursor-default">
          <div className="frame-top">
            <span className="uppercase tracking-wide">Adventure Log</span>
            <span className="chip chip-common">Fact</span>
          </div>
          <div className="art">
            {active.image_url ? (
              <img src={active.image_url} alt="" />
            ) : (
              <div className="text-xs text-muted-foreground font-display text-center">
                No art yet
              </div>
            )}
          </div>
          <div className="name">{active.name}</div>
          <div className="stat-row">
            <div className="s">WOW</div>
            <div className="s">NEAT</div>
            <div className="s">COOL</div>
            <div className="s">FUN</div>
          </div>
        </div>

        <div className="bg-card/70 border-2 border-border rounded-3xl p-6">
          <div className="font-display text-sm text-muted-foreground uppercase tracking-wide">Did you know?</div>
          <div className="font-display text-2xl mt-2 leading-snug">{active.fact}</div>
          <div className="mt-5 text-sm text-muted-foreground">
            Tip: add more facts in Admin to make this section feel like a never‑ending storybook.
          </div>
        </div>
      </div>
    </section>
  );
}

