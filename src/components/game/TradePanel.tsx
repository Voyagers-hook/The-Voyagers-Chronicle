import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeftRight, Check, X } from "lucide-react";
import { Rarity, rarityLabel } from "@/lib/rarities";

type Card = {
  id: string;
  name: string;
  image_url: string | null;
  rarity: Rarity;
};

type UserCardWithCard = {
  id: string;
  user_id: string;
  card_id: string;
  card: Card;
};

type TradeOffer = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  offered_card_id: string;
  requested_card_id: string;
  status: string;
  created_at: string;
  offered_card: { id: string; cards: Card };
  requested_card: { id: string; cards: Card };
  from_profile: { display_name: string };
  to_profile: { display_name: string };
};

type Profile = {
  user_id: string;
  display_name: string;
};

export const TradePanel = ({ userId }: { userId: string }) => {
  const [myCards, setMyCards] = useState<UserCardWithCard[]>([]);
  const [trades, setTrades] = useState<TradeOffer[]>([]);
  const [players, setPlayers] = useState<Profile[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [playerCards, setPlayerCards] = useState<UserCardWithCard[]>([]);
  const [offerCard, setOfferCard] = useState<string>("");
  const [requestCard, setRequestCard] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [myRes, profilesRes] = await Promise.all([
      supabase.from("user_cards").select("id, user_id, card_id, cards(*)").eq("user_id", userId),
      supabase.from("profiles").select("user_id, display_name"),
    ]);

    if (myRes.data) {
      setMyCards(myRes.data.map((d: any) => ({ id: d.id, user_id: d.user_id, card_id: d.card_id, card: d.cards })));
    }
    if (profilesRes.data) {
      setPlayers((profilesRes.data as Profile[]).filter((p) => p.user_id !== userId));
    }

    await loadTrades();
    setLoading(false);
  };

  const loadTrades = async () => {
    const { data } = await supabase
      .from("trade_offers")
      .select("*")
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (data) {
      const enriched: TradeOffer[] = [];
      for (const t of data) {
        const [offeredRes, requestedRes, fromProfile, toProfile] = await Promise.all([
          supabase.from("user_cards").select("id, cards(*)").eq("id", t.offered_card_id).single(),
          supabase.from("user_cards").select("id, cards(*)").eq("id", t.requested_card_id).single(),
          supabase.from("profiles").select("display_name").eq("user_id", t.from_user_id).single(),
          supabase.from("profiles").select("display_name").eq("user_id", t.to_user_id).single(),
        ]);
        enriched.push({
          ...t,
          offered_card: offeredRes.data as any,
          requested_card: requestedRes.data as any,
          from_profile: fromProfile.data as any,
          to_profile: toProfile.data as any,
        });
      }
      setTrades(enriched);
    }
  };

  useEffect(() => { load(); }, [userId]);

  const loadPlayerCards = async (playerId: string) => {
    setSelectedPlayer(playerId);
    setRequestCard("");
    const { data } = await supabase
      .from("user_cards")
      .select("id, user_id, card_id, cards(*)")
      .eq("user_id", playerId);
    if (data) {
      setPlayerCards(data.map((d: any) => ({ id: d.id, user_id: d.user_id, card_id: d.card_id, card: d.cards })));
    }
  };

  const proposeTrade = async () => {
    if (!offerCard || !requestCard) {
      toast.error("Select a card to offer and a card to request");
      return;
    }
    const { error } = await supabase.from("trade_offers").insert({
      from_user_id: userId,
      to_user_id: selectedPlayer,
      offered_card_id: offerCard,
      requested_card_id: requestCard,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Trade proposed!");
      setOfferCard("");
      setRequestCard("");
      loadTrades();
    }
  };

  const acceptTrade = async (tradeId: string) => {
    const { error } = await supabase.rpc("accept_trade", { trade_id: tradeId });
    if (error) toast.error(error.message);
    else {
      toast.success("Trade accepted! Cards swapped.");
      load();
    }
  };

  const declineTrade = async (tradeId: string) => {
    const { error } = await supabase.from("trade_offers").update({ status: "declined" }).eq("id", tradeId);
    if (error) toast.error(error.message);
    else {
      toast.success("Trade declined.");
      loadTrades();
    }
  };

  if (loading) return <div className="text-center text-muted-foreground py-12 font-display text-lg">Loading trades...</div>;

  const pendingIncoming = trades.filter((t) => t.to_user_id === userId && t.status === "pending");
  const pendingOutgoing = trades.filter((t) => t.from_user_id === userId && t.status === "pending");

  return (
    <div className="space-y-8">
      {/* Incoming trades */}
      {pendingIncoming.length > 0 && (
        <div>
          <h3 className="font-display text-xl mb-3">Incoming Offers</h3>
          <div className="space-y-3">
            {pendingIncoming.map((t) => (
              <div key={t.id} className="bg-card border-2 border-primary/30 rounded-2xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-display">{t.from_profile?.display_name}</span> wants your{" "}
                    <span className="text-primary font-display">{t.requested_card?.cards?.name}</span> for their{" "}
                    <span className="text-primary font-display">{t.offered_card?.cards?.name}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => acceptTrade(t.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-display flex items-center gap-1.5 hover:brightness-110"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button
                    onClick={() => declineTrade(t.id)}
                    className="bg-destructive text-destructive-foreground px-4 py-2 rounded-xl text-xs font-display flex items-center gap-1.5 hover:brightness-110"
                  >
                    <X className="w-3.5 h-3.5" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Propose a trade */}
      <div className="bg-card border-2 border-border rounded-2xl p-6">
        <h3 className="font-display text-xl mb-4">Propose a Trade</h3>

        {players.length === 0 ? (
          <p className="text-sm text-muted-foreground">No other players to trade with yet.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-display text-muted-foreground">Trade with</label>
              <select
                value={selectedPlayer}
                onChange={(e) => loadPlayerCards(e.target.value)}
                className="mt-1.5 w-full bg-input border-2 border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
              >
                <option value="">Select a player...</option>
                {players.map((p) => (
                  <option key={p.user_id} value={p.user_id}>{p.display_name || "Anonymous"}</option>
                ))}
              </select>
            </div>

            {selectedPlayer && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-display text-muted-foreground">Your card to offer</label>
                  <select
                    value={offerCard}
                    onChange={(e) => setOfferCard(e.target.value)}
                    className="mt-1.5 w-full bg-input border-2 border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">Select...</option>
                    {myCards.map((c) => (
                      <option key={c.id} value={c.id}>{c.card.name} ({rarityLabel[c.card.rarity]})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-display text-muted-foreground">Card you want</label>
                  <select
                    value={requestCard}
                    onChange={(e) => setRequestCard(e.target.value)}
                    className="mt-1.5 w-full bg-input border-2 border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">Select...</option>
                    {playerCards.map((c) => (
                      <option key={c.id} value={c.id}>{c.card.name} ({rarityLabel[c.card.rarity]})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {selectedPlayer && offerCard && requestCard && (
              <button
                onClick={proposeTrade}
                className="bg-primary text-primary-foreground font-display py-3 px-6 rounded-xl text-sm hover:brightness-110 flex items-center gap-2 transition-all"
              >
                <ArrowLeftRight className="w-4 h-4" /> Propose Trade
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pending outgoing */}
      {pendingOutgoing.length > 0 && (
        <div>
          <h3 className="font-display text-xl mb-3">Your Pending Offers</h3>
          <div className="space-y-3">
            {pendingOutgoing.map((t) => (
              <div key={t.id} className="bg-card border-2 border-border rounded-2xl p-4 flex items-center gap-4">
                <div className="flex-1 text-sm">
                  Offering <span className="font-display text-primary">{t.offered_card?.cards?.name}</span> to{" "}
                  <span className="font-display">{t.to_profile?.display_name}</span> for{" "}
                  <span className="font-display text-primary">{t.requested_card?.cards?.name}</span>
                </div>
                <span className="text-xs font-display text-yellow-500">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
