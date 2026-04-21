import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CardModal } from "./CardModal";
import { TradingCard, CardData } from "./TradingCard";
import { CardBack } from "./CardBack";
import { Rarity, rarityOrder, raritySectionInfo } from "@/lib/rarities";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, arrayMove, rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

type UserCard = {
  id: string;
  card_id: string;
  obtained_at: string;
  revealed: boolean;
  slot_position: number | null;
  card: CardData & { fact: string | null; weight_or_size: string | null };
};

type SlotItem =
  | { kind: "owned"; id: string; uc: UserCard; count: number }
  | { kind: "sealed"; id: string; uc: UserCard }
  | { kind: "empty"; id: string; card: CardData };

const SortableSlot = ({ item, onClick, justRevealedId }: { item: SlotItem; onClick: () => void; justRevealedId: string | null }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative touch-none">
      {item.kind === "owned" && (
        <TradingCard
          card={item.uc.card}
          count={item.count}
          justRevealed={justRevealedId === item.uc.id}
          dragging={isDragging}
          onClick={onClick}
        />
      )}
      {item.kind === "sealed" && <CardBack onClick={onClick} />}
      {item.kind === "empty" && (
        <div className="slot-empty">
          <div className="text-center opacity-70">
            <div className="font-display truncate max-w-full px-1">{item.card.name}</div>
            <div className="text-[10px] mt-1 opacity-60">Not yet</div>
          </div>
        </div>
      )}
    </div>
  );
};

export const CollectionGrid = ({ userId }: { userId: string }) => {
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [allCards, setAllCards] = useState<(CardData & { fact: string | null; weight_or_size: string | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserCard, setSelectedUserCard] = useState<UserCard | null>(null);
  const [justRevealedId, setJustRevealedId] = useState<string | null>(null);
  // Persist per-rarity order of owned card_ids locally
  const [order, setOrder] = useState<Record<Rarity, string[]>>({
    common: [], rare: [], epic: [], legendary: [], super_rare: [],
  });
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const orderKey = `vc-order-${userId}`;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    const load = async () => {
      const [{ data: ucData }, { data: allData }] = await Promise.all([
        supabase.from("user_cards")
          .select("id, card_id, obtained_at, revealed, slot_position, cards(*)")
          .eq("user_id", userId)
          .order("obtained_at", { ascending: false }),
        supabase.from("cards").select("*").order("sort_order", { ascending: true }),
      ]);
      if (ucData) {
        setUserCards(ucData.map((d: any) => ({
          id: d.id, card_id: d.card_id, obtained_at: d.obtained_at,
          revealed: d.revealed, slot_position: d.slot_position, card: d.cards,
        })));
      }
      if (allData) setAllCards(allData as any);
      try {
        const saved = localStorage.getItem(orderKey);
        if (saved) setOrder(JSON.parse(saved));
      } catch {}
      setLoading(false);
    };
    load();
  }, [userId]);

  const revealCard = async (uc: UserCard) => {
    const { error } = await supabase.from("user_cards").update({ revealed: true }).eq("id", uc.id);
    if (error) { toast.error(error.message); return; }
    setUserCards(prev => prev.map(x => x.id === uc.id ? { ...x, revealed: true } : x));
    setJustRevealedId(uc.id);
    toast.success(`You pulled ${uc.card.name}!`);
    setTimeout(() => setJustRevealedId(null), 900);
  };

  // Group
  const ownedByCardId = useMemo(() => {
    const m = new Map<string, UserCard[]>();
    for (const uc of userCards.filter(u => u.revealed)) {
      if (!m.has(uc.card_id)) m.set(uc.card_id, []);
      m.get(uc.card_id)!.push(uc);
    }
    return m;
  }, [userCards]);

  const sealed = userCards.filter(u => !u.revealed);

  const allCardsByRarity = useMemo(() => {
    const m = new Map<Rarity, typeof allCards>();
    for (const c of allCards) {
      if (!m.has(c.rarity)) m.set(c.rarity, []);
      m.get(c.rarity)!.push(c);
    }
    return m;
  }, [allCards]);

  const persistOrder = (next: Record<Rarity, string[]>) => {
    setOrder(next);
    try { localStorage.setItem(orderKey, JSON.stringify(next)); } catch {}
  };

  const buildSlots = (rarity: Rarity): SlotItem[] => {
    const cardsInRarity = allCardsByRarity.get(rarity) ?? [];
    const ownedIds = cardsInRarity.map(c => c.id).filter(id => ownedByCardId.has(id));
    const savedOrder = order[rarity] ?? [];
    const sortedOwned = [
      ...savedOrder.filter(id => ownedIds.includes(id)),
      ...ownedIds.filter(id => !savedOrder.includes(id)),
    ];

    const slots: SlotItem[] = [];
    for (const cardId of sortedOwned) {
      const copies = ownedByCardId.get(cardId)!;
      slots.push({ kind: "owned", id: `owned-${cardId}`, uc: copies[0], count: copies.length });
    }
    for (const c of cardsInRarity) {
      if (!ownedByCardId.has(c.id)) slots.push({ kind: "empty", id: `empty-${c.id}`, card: c });
    }
    return slots;
  };

  const onDragStart = (e: DragStartEvent) => setActiveDragId(String(e.active.id));
  const onDragEnd = (rarity: Rarity) => (e: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    // only reorder owned-owned swaps
    if (!activeId.startsWith("owned-") || !overId.startsWith("owned-")) return;
    const slots = buildSlots(rarity).filter(s => s.kind === "owned") as Extract<SlotItem, {kind:"owned"}>[];
    const oldIndex = slots.findIndex(s => s.id === activeId);
    const newIndex = slots.findIndex(s => s.id === overId);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(slots, oldIndex, newIndex);
    persistOrder({ ...order, [rarity]: reordered.map(s => s.uc.card_id) });
  };

  if (loading) {
    return <div className="text-center py-16 font-display text-xl text-muted-foreground">Loading your collection...</div>;
  }

  const totalOwned = ownedByCardId.size;
  const totalCards = allCards.length;

  return (
    <>
      {/* Header stats */}
      <div className="panel p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="font-display text-2xl text-foreground leading-none">My Collection</div>
          <div className="text-sm text-muted-foreground mt-1.5">
            Drag cards to arrange your binder. Tap a sealed pack to reveal it.
          </div>
        </div>
        <div className="flex items-center gap-2 bg-accent/10 rounded-xl px-4 py-2 border-2 border-accent/30">
          <span className="font-display text-2xl text-accent leading-none">{totalOwned}</span>
          <span className="text-accent/60 font-display">/</span>
          <span className="font-display text-lg text-accent/70 leading-none">{totalCards || "?"}</span>
          <span className="text-xs text-accent/80 ml-1 font-display uppercase tracking-wide">unique</span>
        </div>
      </div>

      {/* Unopened packs */}
      {sealed.length > 0 && (
        <section className="panel p-5 mb-6 border-primary/40" style={{ borderColor: "hsl(var(--primary) / 0.4)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg text-foreground">You have {sealed.length} unopened card{sealed.length > 1 ? "s" : ""}!</h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {sealed.map(uc => (
              <CardBack key={uc.id} onClick={() => revealCard(uc)} />
            ))}
          </div>
        </section>
      )}

      {totalCards === 0 && (
        <div className="panel p-10 text-center">
          <div className="font-display text-2xl text-foreground mb-2">No cards in the set yet</div>
          <p className="text-muted-foreground">An admin needs to add cards before you can collect them.</p>
        </div>
      )}

      <div className="space-y-8">
        {rarityOrder.map((rarity) => {
          const cards = allCardsByRarity.get(rarity);
          if (!cards || cards.length === 0) return null;
          const info = raritySectionInfo[rarity];
          const slots = buildSlots(rarity);
          const ownedCount = cards.filter(c => ownedByCardId.has(c.id)).length;
          const activeItem = activeDragId ? slots.find(s => s.id === activeDragId) : null;

          return (
            <section key={rarity}>
              <div className="section-banner" style={{ borderColor: info.color + "44" }}>
                <span className="pip" style={{ background: info.color }} />
                <div className="flex-1">
                  <h2 className="font-display text-lg" style={{ color: info.color }}>{info.title}</h2>
                  <p className="text-xs text-muted-foreground">{info.subtitle}</p>
                </div>
                <span className="chip" style={{ background: info.color, color: "white" }}>
                  {ownedCount} / {cards.length}
                </span>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd(rarity)}
              >
                <SortableContext items={slots.map(s => s.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {slots.map(slot => (
                      <SortableSlot
                        key={slot.id}
                        item={slot}
                        justRevealedId={justRevealedId}
                        onClick={() => {
                          if (slot.kind === "owned") setSelectedUserCard(slot.uc);
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeItem && activeItem.kind === "owned" ? (
                    <TradingCard card={activeItem.uc.card} count={activeItem.count} />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </section>
          );
        })}
      </div>

      {selectedUserCard && (
        <CardModal
          card={selectedUserCard.card as any}
          copies={ownedByCardId.get(selectedUserCard.card_id)?.length ?? 1}
          onClose={() => setSelectedUserCard(null)}
        />
      )}
    </>
  );
};
