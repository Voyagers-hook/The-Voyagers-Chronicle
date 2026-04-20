import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CardModal } from "./CardModal";
import { Rarity, rarityLabel, rarityOrder, raritySectionInfo } from "@/lib/rarities";

type Card = {
  id: string;
  name: string;
  image_url: string | null;
  rarity: Rarity;
  fact: string | null;
  weight_or_size: string | null;
  power: number;
  stealth: number;
  beauty: number;
  energy: number;
};

type UserCard = {
  id: string;
  card_id: string;
  obtained_at: string;
  card: Card;
};

export const CollectionGrid = ({ userId }: { userId: string }) => {
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<UserCard | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("user_cards")
        .select("id, card_id, obtained_at, cards(*)")
        .eq("user_id", userId)
        .order("obtained_at", { ascending: false });

      if (data) {
        setUserCards(
          data.map((d: any) => ({
            id: d.id,
            card_id: d.card_id,
            obtained_at: d.obtained_at,
            card: d.cards,
          }))
        );
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) {
    return <div className="text-center text-muted-foreground py-12 font-display text-lg">Loading your sticker book...</div>;
  }

  if (userCards.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-card border-2 border-dashed border-border rounded-2xl p-12 max-w-md mx-auto">
          <div className="text-5xl mb-4">&#x1F3A3;</div>
          <h3 className="font-display text-2xl text-foreground">Your book is empty!</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Submit your first catch and we'll send you some cards to get started.
          </p>
        </div>
      </div>
    );
  }

  // Group by card_id to show count
  const grouped = new Map<string, { card: Card; copies: UserCard[] }>();
  for (const uc of userCards) {
    const existing = grouped.get(uc.card_id);
    if (existing) {
      existing.copies.push(uc);
    } else {
      grouped.set(uc.card_id, { card: uc.card, copies: [uc] });
    }
  }

  // Group by rarity for sticker book sections
  const byRarity = new Map<Rarity, { card: Card; copies: UserCard[] }[]>();
  for (const entry of grouped.values()) {
    const r = entry.card.rarity;
    if (!byRarity.has(r)) byRarity.set(r, []);
    byRarity.get(r)!.push(entry);
  }

  return (
    <>
      <div className="space-y-8">
        {rarityOrder.map((rarity) => {
          const cards = byRarity.get(rarity);
          if (!cards || cards.length === 0) return null;
          const info = raritySectionInfo[rarity];

          return (
            <section key={rarity}>
              {/* Section banner */}
              <div className={`section-banner border-2 ${info.bgClass} mb-4`}>
                <h2 className={`text-lg ${info.textClass}`}>{info.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{info.subtitle}</p>
              </div>

              {/* Card grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {cards.map(({ card, copies }) => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCard(copies[0])}
                    className={`relative bg-card border-[3px] rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.05] hover:-translate-y-1 card-rarity-${card.rarity} aspect-[3/4] flex flex-col group`}
                  >
                    {/* Rarity chip */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className={`chip-${card.rarity} text-[9px] font-display px-2.5 py-1 rounded-full`}>
                        {rarityLabel[card.rarity]}
                      </span>
                    </div>

                    {/* Count badge */}
                    {copies.length > 1 && (
                      <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground font-display text-xs w-7 h-7 rounded-full flex items-center justify-center shadow-lg">
                        x{copies.length}
                      </div>
                    )}

                    {/* Image */}
                    <div className="flex-1 flex items-center justify-center p-4 bg-secondary/20">
                      {card.image_url ? (
                        <img src={card.image_url} alt={card.name} className="w-full h-full object-contain drop-shadow-lg" loading="lazy" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground font-display text-2xl">
                          ?
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <div className="p-2.5 text-center border-t-2 border-border/50 bg-card">
                      <h3 className="font-display text-xs md:text-sm truncate">{card.name}</h3>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {selectedCard && (
        <CardModal card={selectedCard.card} copies={grouped.get(selectedCard.card_id)!.copies.length} onClose={() => setSelectedCard(null)} />
      )}
    </>
  );
};
