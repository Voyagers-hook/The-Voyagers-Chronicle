import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type Rarity = "common" | "rare" | "epic" | "legendary";

type FishCard = {
  id: string;
  name: string;
  image_url: string | null;
  rarity: Rarity;
  fact: string | null;
  weight_or_size: string | null;
};

type Challenge = {
  id: string;
  emoji: string | null;
  title: string;
  reward: string | null;
};

const rarityStyles: Record<Rarity, { ring: string; chip: string; bg: string; glow?: string }> = {
  common: { ring: "ring-rarity-common", chip: "bg-rarity-common text-white", bg: "from-slate-50 to-slate-100" },
  rare: { ring: "ring-rarity-rare", chip: "bg-rarity-rare text-white", bg: "from-blue-50 to-indigo-100" },
  epic: { ring: "ring-rarity-epic", chip: "bg-rarity-epic text-white", bg: "from-purple-50 to-fuchsia-100" },
  legendary: { ring: "ring-rarity-legendary", chip: "bg-gradient-legendary text-white", bg: "from-amber-50 to-orange-100", glow: "shadow-legendary" },
};

const FlipCard = ({ card }: { card: FishCard }) => {
  const [flipped, setFlipped] = useState(false);
  const r = rarityStyles[card.rarity];

  return (
    <div className="[perspective:1200px] w-full aspect-[3/4]">
      <motion.div
        onClick={() => setFlipped((f) => !f)}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-full cursor-pointer [transform-style:preserve-3d]"
        whileHover={{ scale: 1.03, y: -3 }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 [backface-visibility:hidden] rounded-xl ring-2 ${r.ring} bg-gradient-to-br ${r.bg} shadow-card-pop overflow-hidden flex flex-col ${r.glow ?? ""}`}
        >
          <div className="flex justify-between items-start p-2.5">
            <span className={`${r.chip} font-display text-[10px] px-2.5 py-1 rounded-sm uppercase tracking-widest`}>
              {card.rarity}
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center p-2 bg-white/40">
            {card.image_url ? (
              <img
                src={card.image_url}
                alt={card.name}
                className="w-full h-full object-contain drop-shadow-md"
                loading="lazy"
              />
            ) : (
              <div className="text-6xl opacity-30">🐟</div>
            )}
          </div>
          <div className="bg-card p-2.5 text-center border-t border-border">
            <h3 className="font-display text-sm md:text-base text-foreground uppercase tracking-wide">{card.name}</h3>
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl ring-2 ${r.ring} bg-card shadow-card-pop p-4 flex flex-col`}
        >
          <h3 className="font-display text-base md:text-lg text-foreground uppercase">{card.name}</h3>
          <span className={`${r.chip} self-start font-display text-[10px] px-2.5 py-1 rounded-sm mt-1 uppercase tracking-widest`}>
            {card.rarity}
          </span>
          {card.weight_or_size && (
            <div className="flex justify-between text-sm mt-4">
              <span className="text-muted-foreground">Weight / size</span>
              <span className="font-display text-sm">{card.weight_or_size}</span>
            </div>
          )}
          {card.fact && (
            <p className="text-xs italic text-muted-foreground border-t border-border pt-2 mt-auto">
              💡 {card.fact}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export const CardCollection = () => {
  const [cards, setCards] = useState<FishCard[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [cardsRes, chRes] = await Promise.all([
        supabase.from("cards").select("*").order("sort_order").order("created_at"),
        supabase.from("challenges").select("*").order("sort_order").order("created_at"),
      ]);
      if (cardsRes.data) setCards(cardsRes.data as FishCard[]);
      if (chRes.data) setChallenges(chRes.data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <section id="cards" className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-display mb-2">
          Your collection
        </p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground">
          Voyager Cards
        </h2>
        <p className="mt-3 text-base md:text-lg text-muted-foreground">
          Tap a card to flip it. Earn more by completing challenges below.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Loading cards…</div>
      ) : cards.length === 0 ? (
        <div className="text-center bg-card rounded-xl p-10 border-2 border-dashed border-border">
          <p className="font-display text-lg text-foreground">No cards yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Add your first card from the admin area.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {cards.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.05, 0.4) }}
            >
              <FlipCard card={c} />
            </motion.div>
          ))}
        </div>
      )}

      <ChallengesPanel challenges={challenges} />
    </section>
  );
};

const ChallengesPanel = ({ challenges }: { challenges: Challenge[] }) => (
  <div className="mt-20 bg-secondary rounded-2xl p-6 md:p-10 shadow-card-pop">
    <p className="text-center text-xs uppercase tracking-[0.3em] text-secondary-foreground/70 font-display mb-2">
      How to earn cards
    </p>
    <h3 className="font-display text-3xl md:text-4xl text-center text-secondary-foreground">
      Field Challenges
    </h3>
    <p className="text-center text-secondary-foreground/80 mt-2 mb-8 max-w-xl mx-auto">
      Complete tasks out on the water — or claim cards bundled with kit from the shop.
    </p>
    {challenges.length === 0 ? (
      <p className="text-center text-secondary-foreground/60">No challenges yet.</p>
    ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {challenges.map((ch, i) => (
          <motion.div
            key={ch.id}
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="bg-card rounded-lg p-4 shadow-pop flex items-center gap-3"
          >
            <div className="text-3xl shrink-0">{ch.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-sm text-foreground leading-tight uppercase tracking-wide">
                {ch.title}
              </div>
              {ch.reward && (
                <div className="text-xs text-accent font-bold mt-1">🎁 {ch.reward}</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
);
