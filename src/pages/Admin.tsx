import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Trash2, Plus, Upload } from "lucide-react";
import logo from "@/assets/little-voyagers-logo.png";

type Rarity = "common" | "rare" | "epic" | "legendary";

type Card = {
  id: string;
  name: string;
  image_url: string | null;
  rarity: Rarity;
  fact: string | null;
  weight_or_size: string | null;
  sort_order: number;
};

type Challenge = {
  id: string;
  emoji: string | null;
  title: string;
  reward: string | null;
  sort_order: number;
};

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"cards" | "challenges">("cards");
  const [cards, setCards] = useState<Card[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  const refresh = async () => {
    const [c, ch] = await Promise.all([
      supabase.from("cards").select("*").order("sort_order").order("created_at"),
      supabase.from("challenges").select("*").order("sort_order").order("created_at"),
    ]);
    if (c.data) setCards(c.data as Card[]);
    if (ch.data) setChallenges(ch.data);
  };

  useEffect(() => {
    if (user) refresh();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user) return null;

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="bg-card rounded-2xl p-8 shadow-card-pop max-w-md text-center">
          <h1 className="font-display text-xl uppercase">Not an admin</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your account ({user.email}) doesn't have admin access. Ask the site owner to grant
            it, or run this SQL in Lovable Cloud:
          </p>
          <pre className="mt-3 text-[10px] bg-muted p-3 rounded-md text-left overflow-x-auto">
{`INSERT INTO user_roles (user_id, role)
VALUES ('${user.id}', 'admin');`}
          </pre>
          <div className="flex gap-2 mt-4 justify-center">
            <button onClick={signOut} className="text-xs underline text-muted-foreground">Sign out</button>
            <Link to="/" className="text-xs underline text-muted-foreground">Back to site</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-secondary text-secondary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="" className="w-10 h-10" />
            <span className="font-display uppercase tracking-wider text-sm">Little Voyagers · Admin</span>
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <span className="opacity-70 hidden md:inline">{user.email}</span>
            <button onClick={signOut} className="underline hover:opacity-80">Sign out</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6">
          <TabBtn active={tab === "cards"} onClick={() => setTab("cards")}>Cards ({cards.length})</TabBtn>
          <TabBtn active={tab === "challenges"} onClick={() => setTab("challenges")}>Challenges ({challenges.length})</TabBtn>
        </div>

        {tab === "cards" ? (
          <CardsAdmin cards={cards} refresh={refresh} />
        ) : (
          <ChallengesAdmin challenges={challenges} refresh={refresh} />
        )}
      </div>
    </main>
  );
};

const TabBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md font-display text-xs uppercase tracking-wider transition-colors ${
      active ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
    }`}
  >
    {children}
  </button>
);

/* ---------------- CARDS ---------------- */
const CardsAdmin = ({ cards, refresh }: { cards: Card[]; refresh: () => void }) => {
  const addCard = async () => {
    const { error } = await supabase.from("cards").insert({
      name: "New Card",
      rarity: "common" as Rarity,
      sort_order: cards.length,
    });
    if (error) toast.error(error.message);
    else { toast.success("Card added"); refresh(); }
  };

  return (
    <div>
      <button
        onClick={addCard}
        className="mb-4 inline-flex items-center gap-2 bg-accent text-accent-foreground font-display text-xs uppercase tracking-wider px-4 py-2 rounded-md shadow-pop hover:translate-y-0.5 hover:shadow-none transition-all"
      >
        <Plus className="w-4 h-4" /> Add Card
      </button>

      <div className="grid md:grid-cols-2 gap-4">
        {cards.map((c) => (
          <CardRow key={c.id} card={c} refresh={refresh} />
        ))}
      </div>
    </div>
  );
};

const CardRow = ({ card, refresh }: { card: Card; refresh: () => void }) => {
  const [local, setLocal] = useState(card);
  const [uploading, setUploading] = useState(false);

  useEffect(() => setLocal(card), [card]);

  const save = async (patch: Partial<Card>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    const { error } = await supabase.from("cards").update(patch).eq("id", card.id);
    if (error) toast.error(error.message);
  };

  const del = async () => {
    if (!confirm(`Delete "${local.name}"?`)) return;
    const { error } = await supabase.from("cards").delete().eq("id", card.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); refresh(); }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${card.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("card-images").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("card-images").getPublicUrl(path);
      await save({ image_url: data.publicUrl });
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl p-4 shadow-card-pop flex gap-4">
      <label className="shrink-0 w-24 h-32 bg-muted rounded-md overflow-hidden flex items-center justify-center cursor-pointer relative group">
        {local.image_url ? (
          <img src={local.image_url} alt={local.name} className="w-full h-full object-contain" />
        ) : (
          <Upload className="w-6 h-6 text-muted-foreground" />
        )}
        <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={uploading} />
        <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-card font-display uppercase">
          {uploading ? "…" : "Change"}
        </div>
      </label>

      <div className="flex-1 space-y-2 min-w-0">
        <input
          value={local.name}
          onChange={(e) => setLocal({ ...local, name: e.target.value })}
          onBlur={() => save({ name: local.name })}
          className="w-full font-display text-base bg-transparent border-b border-border focus:outline-none focus:border-primary"
        />
        <div className="flex gap-2">
          <select
            value={local.rarity}
            onChange={(e) => save({ rarity: e.target.value as Rarity })}
            className="text-xs bg-muted px-2 py-1 rounded"
          >
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
          <input
            value={local.weight_or_size ?? ""}
            placeholder="Weight / size"
            onChange={(e) => setLocal({ ...local, weight_or_size: e.target.value })}
            onBlur={() => save({ weight_or_size: local.weight_or_size })}
            className="flex-1 text-xs bg-muted px-2 py-1 rounded focus:outline-none"
          />
        </div>
        <textarea
          value={local.fact ?? ""}
          placeholder="Fact / description…"
          onChange={(e) => setLocal({ ...local, fact: e.target.value })}
          onBlur={() => save({ fact: local.fact })}
          rows={2}
          className="w-full text-xs bg-muted px-2 py-1 rounded focus:outline-none resize-none"
        />
        <div className="flex justify-between items-center">
          <input
            type="number"
            value={local.sort_order}
            onChange={(e) => setLocal({ ...local, sort_order: Number(e.target.value) })}
            onBlur={() => save({ sort_order: local.sort_order })}
            className="w-16 text-xs bg-muted px-2 py-1 rounded"
            title="Sort order"
          />
          <button onClick={del} className="text-destructive hover:opacity-70">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- CHALLENGES ---------------- */
const ChallengesAdmin = ({ challenges, refresh }: { challenges: Challenge[]; refresh: () => void }) => {
  const add = async () => {
    const { error } = await supabase.from("challenges").insert({
      title: "New Challenge",
      emoji: "⭐",
      sort_order: challenges.length,
    });
    if (error) toast.error(error.message);
    else { toast.success("Added"); refresh(); }
  };

  return (
    <div>
      <button
        onClick={add}
        className="mb-4 inline-flex items-center gap-2 bg-accent text-accent-foreground font-display text-xs uppercase tracking-wider px-4 py-2 rounded-md shadow-pop hover:translate-y-0.5 hover:shadow-none transition-all"
      >
        <Plus className="w-4 h-4" /> Add Challenge
      </button>
      <div className="space-y-2">
        {challenges.map((ch) => (
          <ChallengeRow key={ch.id} ch={ch} refresh={refresh} />
        ))}
      </div>
    </div>
  );
};

const ChallengeRow = ({ ch, refresh }: { ch: Challenge; refresh: () => void }) => {
  const [local, setLocal] = useState(ch);
  useEffect(() => setLocal(ch), [ch]);

  const save = async (patch: Partial<Challenge>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    const { error } = await supabase.from("challenges").update(patch).eq("id", ch.id);
    if (error) toast.error(error.message);
  };

  const del = async () => {
    if (!confirm("Delete this challenge?")) return;
    const { error } = await supabase.from("challenges").delete().eq("id", ch.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); refresh(); }
  };

  return (
    <div className="bg-card rounded-md p-3 shadow-pop flex gap-2 items-center">
      <input
        value={local.emoji ?? ""}
        onChange={(e) => setLocal({ ...local, emoji: e.target.value })}
        onBlur={() => save({ emoji: local.emoji })}
        className="w-12 text-2xl text-center bg-muted rounded"
      />
      <input
        value={local.title}
        onChange={(e) => setLocal({ ...local, title: e.target.value })}
        onBlur={() => save({ title: local.title })}
        className="flex-1 bg-transparent border-b border-border px-1 py-1 focus:outline-none focus:border-primary text-sm"
        placeholder="Title"
      />
      <input
        value={local.reward ?? ""}
        onChange={(e) => setLocal({ ...local, reward: e.target.value })}
        onBlur={() => save({ reward: local.reward })}
        className="w-32 text-xs bg-muted px-2 py-1 rounded"
        placeholder="Reward"
      />
      <input
        type="number"
        value={local.sort_order}
        onChange={(e) => setLocal({ ...local, sort_order: Number(e.target.value) })}
        onBlur={() => save({ sort_order: local.sort_order })}
        className="w-14 text-xs bg-muted px-2 py-1 rounded"
      />
      <button onClick={del} className="text-destructive hover:opacity-70 p-1">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Admin;
