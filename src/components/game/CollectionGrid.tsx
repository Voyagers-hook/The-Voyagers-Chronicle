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

// Slight pseudo-random tilt per slot — gives stuck-on-paper feel
const tilts = ["-2deg", "1deg", "-1deg", "2deg", "-1.5deg", "1.5deg", "0deg", "-2.5deg"];

export const CollectionGrid = ({ userId }: { userId: string }) => {
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<UserCard | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: ucData }, { data: allData }] = await Promise.all([
        supabase
          .from("user_cards")
          .select("id, card_id, obtained_at, cards(*)")
          .eq("user_id", userId)
          .order("obtained_at", { ascending: false }),
        supabase.from("cards").select("*").order("sort_order", { ascending: true }),
      ]);

      if (ucData) {
        setUserCards(
          ucData.map((d: any) => ({
            id: d.id,
            card_id: d.card_id,
            obtained_at: d.obtained_at,
            card: d.cards,
          }))
        );
      }
      if (allData) setAllCards(allData as Card[]);
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="font-hand text-3xl text-primary">Opening your sticker book...</div>
      </div>
    );
  }

  // Group owned by card_id
  const owned = new Map<string, { card: Card; copies: UserCard[] }>();
  for (const uc of userCards) {
    const existing = owned.get(uc.card_id);
    if (existing) existing.copies.push(uc);
    else owned.set(uc.card_id, { card: uc.card, copies: [uc] });
  }

  // Group ALL cards by rarity (so empty slots show too)
  const byRarity = new Map<Rarity, Card[]>();
  for (const c of allCards) {
    if (!byRarity.has(c.rarity)) byRarity.set(c.rarity, []);
    byRarity.get(c.rarity)!.push(c);
  }

  const totalOwned = owned.size;
  const totalCards = allCards.length;

  return (
    <>
      {/* Book cover info */}
      <div className="paper-card p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="font-hand text-3xl text-primary leading-none">My Sticker Book</div>
          <div className="text-sm text-muted-foreground mt-1">
            Tap a sticker to read fun facts about your fish
          </div>
        </div>
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2 border-2 border-white">
          <span className="font-display text-2xl text-secondary-foreground leading-none">{totalOwned}</span>
          <span className="text-secondary-foreground/70 font-display">/</span>
          <span className="font-display text-lg text-secondary-foreground/70 leading-none">{totalCards || "?"}</span>
          <span className="text-xs text-secondary-foreground/80 ml-1 font-display">collected</span>
        </div>
      </div>

      {totalCards === 0 && (
        <div className="paper-card p-10 text-center">
          <div className="font-hand text-3xl text-primary mb-2">No fish in the pond yet!</div>
          <p className="text-muted-foreground">Ask the grown-ups to add some cards to the book.</p>
        </div>
      )}

      <div className="space-y-10">
        {rarityOrder.map((rarity) => {
          const cards = byRarity.get(rarity);
          if (!cards || cards.length === 0) return null;
          const info = raritySectionInfo[rarity];

          return (
            <section key={rarity}>
              {/* Section banner */}
              <div className={`section-banner mb-5 ${info.bannerBg}`} style={{ borderColor: info.color, color: info.color }}>
                <div>
                  <h2 className="text-xl leading-tight" style={{ color: info.color }}>{info.title}</h2>
                  <p className="text-xs text-foreground/70 font-normal mt-0.5 normal-case tracking-normal" style={{ fontFamily: 'Nunito' }}>
                    {info.subtitle}
                  </p>
                </div>
                <div className="ml-auto chip" style={{ background: info.color, color: 'white' }}>
                  {cards.filter(c => owned.has(c.id)).length} / {cards.length}
                </div>
              </div>

              {/* Sticker grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 px-2">
                {cards.map((card, i) => {
                  const entry = owned.get(card.id);
                  const tilt = tilts[(card.id.charCodeAt(0) + i) % tilts.length];

                  if (!entry) {
                    // Empty slot — show silhouette
                    return (
                      <div
                        key={card.id}
                        className="card-slot-empty aspect-[3/4] flex flex-col items-center justify-center p-3 text-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-paper-edge/40 flex items-center justify-center mb-2">
                          <span className="font-hand text-3xl text-muted-foreground/60">?</span>
                        </div>
                        <div className="font-hand text-base text-muted-foreground/70">Not yet!</div>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={card.id}
                      onClick={() => setSelectedCard(entry.copies[0])}
                      style={{ ['--tilt' as any]: tilt }}
                      className={`sticker card-rarity-${card.rarity} aspect-[3/4] flex flex-col p-2 group`}
                    >
                      <span className="tape" />

                      {/* Count badge */}
                      {entry.copies.length > 1 && (
                        <div className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground font-display text-sm w-9 h-9 rounded-full flex items-center justify-center border-[3px] border-white shadow-md">
                          x{entry.copies.length}
                        </div>
                      )}

                      {/* Image area */}
                      <div className="flex-1 flex items-center justify-center p-3 bg-secondary/40 rounded-xl">
                        {card.image_url ? (
                          <img src={card.image_url} alt={card.name} className="w-full h-full object-contain" loading="lazy" />
                        ) : (
                          <div className="font-hand text-5xl text-secondary-foreground/50">{card.name[0]}</div>
                        )}
                      </div>

                      {/* Name + chip */}
                      <div className="pt-2 pb-1 px-1 text-center">
                        <div className="font-display text-sm text-foreground truncate">{card.name}</div>
                        <div className="mt-1.5">
                          <span className={`chip chip-${card.rarity}`}>{rarityLabel[card.rarity]}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {selectedCard && (
        <CardModal card={selectedCard.card} copies={owned.get(selectedCard.card_id)!.copies.length} onClose={() => setSelectedCard(null)} />
      )}
    </>
  );
};
