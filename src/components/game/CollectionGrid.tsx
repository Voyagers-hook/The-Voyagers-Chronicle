import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CardModal } from "./CardModal";

type Rarity = "common" | "rare" | "epic" | "legendary";

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

const rarityLabel: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
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
    return <div className="text-center text-muted-foreground py-12 font-display">Loading collection...</div>;
  }

  if (userCards.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-card border border-border rounded-xl p-10 max-w-md mx-auto">
          <h3 className="font-display text-xl">No cards yet</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Submit your first catch to start earning cards!
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

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {Array.from(grouped.values()).map(({ card, copies }) => (
          <button
            key={card.id}
            onClick={() => setSelectedCard(copies[0])}
            className={`relative bg-card border-2 rounded-lg overflow-hidden transition-transform hover:scale-[1.03] hover:-translate-y-1 card-rarity-${card.rarity} aspect-[3/4] flex flex-col`}
          >
            {/* Rarity chip */}
            <div className="absolute top-2 left-2 z-10">
              <span className={`chip-${card.rarity} text-[9px] font-display uppercase tracking-widest px-2 py-0.5 rounded`}>
                {rarityLabel[card.rarity]}
              </span>
            </div>

            {/* Count badge */}
            {copies.length > 1 && (
              <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground font-display text-xs w-6 h-6 rounded-full flex items-center justify-center">
                x{copies.length}
              </div>
            )}

            {/* Image */}
            <div className="flex-1 flex items-center justify-center p-3 bg-secondary/30">
              {card.image_url ? (
                <img src={card.image_url} alt={card.name} className="w-full h-full object-contain" loading="lazy" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-display text-lg">
                  ?
                </div>
              )}
            </div>

            {/* Name */}
            <div className="p-2 text-center border-t border-border bg-card">
              <h3 className="font-display text-xs md:text-sm uppercase tracking-wide truncate">{card.name}</h3>
            </div>
          </button>
        ))}
      </div>

      {selectedCard && (
        <CardModal card={selectedCard.card} copies={grouped.get(selectedCard.card_id)!.copies.length} onClose={() => setSelectedCard(null)} />
      )}
    </>
  );
};
