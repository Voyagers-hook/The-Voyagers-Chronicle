import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Trash2, Plus, Upload, Send, Shield } from "lucide-react";

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
  sort_order: number;
};

type Submission = {
  id: string;
  user_id: string;
  species: string;
  weight: string | null;
  photo_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  profile?: { display_name: string };
};

type Profile = { user_id: string; display_name: string };

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"cards" | "submissions" | "send">("cards");
  const [cards, setCards] = useState<Card[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  const refresh = async () => {
    const [cardsRes, subsRes, profilesRes] = await Promise.all([
      supabase.from("cards").select("*").order("sort_order").order("created_at"),
      supabase.from("catch_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, display_name"),
    ]);
    if (cardsRes.data) setCards(cardsRes.data as Card[]);
    if (profilesRes.data) setProfiles(profilesRes.data as Profile[]);
    if (subsRes.data && profilesRes.data) {
      const profileMap = new Map((profilesRes.data as Profile[]).map((p) => [p.user_id, p]));
      setSubmissions(
        (subsRes.data as any[]).map((s) => ({
          ...s,
          profile: profileMap.get(s.user_id),
        }))
      );
    }
  };

  useEffect(() => {
    if (user && isAdmin) refresh();
  }, [user, isAdmin]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return null;

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md text-center">
          <h1 className="font-display text-xl uppercase">Access Denied</h1>
          <p className="text-sm text-muted-foreground mt-2">Your account ({user.email}) is not an admin.</p>
          <div className="flex gap-4 mt-4 justify-center">
            <button onClick={signOut} className="text-xs text-muted-foreground underline">Sign out</button>
            <Link to="/" className="text-xs text-muted-foreground underline">Back</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="font-display text-lg text-primary tracking-tight">ADMIN PANEL</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">Back to app</Link>
            <button onClick={signOut} className="text-xs text-muted-foreground hover:text-foreground">Sign out</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <nav className="flex gap-1 mb-6 bg-card rounded-lg p-1 border border-border">
          {(["cards", "submissions", "send"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-display uppercase tracking-wider transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "send" ? "Send Cards" : t}
            </button>
          ))}
        </nav>

        {tab === "cards" && <CardsAdmin cards={cards} refresh={refresh} />}
        {tab === "submissions" && <SubmissionsAdmin submissions={submissions} refresh={refresh} />}
        {tab === "send" && <SendCards profiles={profiles} />}
      </div>
    </main>
  );
};

/* Cards Admin */
const CardsAdmin = ({ cards, refresh }: { cards: Card[]; refresh: () => void }) => {
  const addCard = async () => {
    const { error } = await supabase.from("cards").insert({ name: "New Card", rarity: "common" as Rarity, sort_order: cards.length });
    if (error) toast.error(error.message);
    else { toast.success("Card added"); refresh(); }
  };

  return (
    <div>
      <button onClick={addCard} className="mb-4 bg-primary text-primary-foreground font-display text-xs uppercase tracking-wider px-4 py-2 rounded flex items-center gap-2 hover:opacity-90">
        <Plus className="w-4 h-4" /> Add Card
      </button>
      <div className="grid md:grid-cols-2 gap-4">
        {cards.map((c) => <CardRow key={c.id} card={c} refresh={refresh} />)}
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
    await supabase.from("cards").update(patch).eq("id", card.id);
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
    } catch (err: any) { toast.error(err.message); }
    finally { setUploading(false); }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex gap-4">
      <label className="shrink-0 w-20 h-28 bg-secondary rounded overflow-hidden flex items-center justify-center cursor-pointer relative group">
        {local.image_url ? (
          <img src={local.image_url} alt="" className="w-full h-full object-contain" />
        ) : (
          <Upload className="w-5 h-5 text-muted-foreground" />
        )}
        <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={uploading} />
      </label>
      <div className="flex-1 space-y-2 min-w-0">
        <input value={local.name} onChange={(e) => setLocal({ ...local, name: e.target.value })} onBlur={() => save({ name: local.name })} className="w-full font-display text-sm bg-transparent border-b border-border focus:outline-none focus:border-primary" />
        <div className="flex gap-2 flex-wrap">
          <select value={local.rarity} onChange={(e) => save({ rarity: e.target.value as Rarity })} className="text-xs bg-input px-2 py-1 rounded">
            <option value="common">Common</option><option value="rare">Rare</option><option value="epic">Epic</option><option value="legendary">Legendary</option>
          </select>
          <input value={local.weight_or_size ?? ""} placeholder="Weight/size" onChange={(e) => setLocal({ ...local, weight_or_size: e.target.value })} onBlur={() => save({ weight_or_size: local.weight_or_size })} className="flex-1 text-xs bg-input px-2 py-1 rounded min-w-0" />
        </div>
        <div className="grid grid-cols-4 gap-1">
          {(["power", "stealth", "beauty", "energy"] as const).map((stat) => (
            <div key={stat} className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase">{stat}</span>
              <input type="number" value={local[stat]} onChange={(e) => setLocal({ ...local, [stat]: Number(e.target.value) })} onBlur={() => save({ [stat]: local[stat] })} className="w-full text-xs bg-input px-1.5 py-1 rounded" />
            </div>
          ))}
        </div>
        <textarea value={local.fact ?? ""} placeholder="Fact..." onChange={(e) => setLocal({ ...local, fact: e.target.value })} onBlur={() => save({ fact: local.fact })} rows={2} className="w-full text-xs bg-input px-2 py-1 rounded resize-none" />
        <div className="flex justify-between items-center">
          <input type="number" value={local.sort_order} onChange={(e) => setLocal({ ...local, sort_order: Number(e.target.value) })} onBlur={() => save({ sort_order: local.sort_order })} className="w-14 text-xs bg-input px-2 py-1 rounded" title="Sort" />
          <button onClick={del} className="text-destructive hover:opacity-70"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};

/* Submissions Admin */
const SubmissionsAdmin = ({ submissions, refresh }: { submissions: Submission[]; refresh: () => void }) => {
  const updateStatus = async (id: string, status: string, notes?: string) => {
    const update: any = { status };
    if (notes !== undefined) update.admin_notes = notes;
    const { error } = await supabase.from("catch_submissions").update(update).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Marked as ${status}`); refresh(); }
  };

  return (
    <div className="space-y-3">
      {submissions.length === 0 && <p className="text-muted-foreground text-sm">No submissions yet.</p>}
      {submissions.map((s) => (
        <div key={s.id} className="bg-card border border-border rounded-lg p-4 flex gap-4">
          {s.photo_url && <img src={s.photo_url} alt="" className="w-20 h-20 rounded object-cover shrink-0" />}
          <div className="flex-1 min-w-0">
            <div className="font-display text-sm uppercase">{s.species}</div>
            <div className="text-xs text-muted-foreground">{s.profile?.display_name || "Unknown"} · {s.weight || "no weight"}</div>
            <div className="text-xs text-muted-foreground mt-1">{new Date(s.created_at).toLocaleDateString()}</div>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <span className={`text-xs font-display uppercase ${s.status === "approved" ? "text-green-500" : s.status === "rejected" ? "text-red-500" : "text-yellow-500"}`}>{s.status}</span>
            {s.status === "pending" && (
              <>
                <button onClick={() => updateStatus(s.id, "approved")} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:opacity-90">Approve</button>
                <button onClick={() => updateStatus(s.id, "rejected")} className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded hover:opacity-90">Reject</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/* Send Cards */
const SendCards = ({ profiles }: { profiles: { user_id: string; display_name: string }[] }) => {
  const [targetUser, setTargetUser] = useState("");
  const [rarity, setRarity] = useState<Rarity>("common");
  const [count, setCount] = useState(1);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!targetUser) { toast.error("Select a player"); return; }
    setSending(true);
    try {
      for (let i = 0; i < count; i++) {
        const { error } = await supabase.rpc("send_random_card", {
          target_user_id: targetUser,
          rarity_filter: rarity,
        });
        if (error) throw error;
      }
      toast.success(`Sent ${count} random ${rarity} card(s)!`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 max-w-md">
      <h3 className="font-display text-lg uppercase tracking-wider mb-4">Send Random Cards</h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Player</label>
          <select value={targetUser} onChange={(e) => setTargetUser(e.target.value)} className="mt-1 w-full bg-input border border-border rounded px-3 py-2 text-sm">
            <option value="">Select player...</option>
            {profiles.map((p) => <option key={p.user_id} value={p.user_id}>{p.display_name || "Anonymous"}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Rarity</label>
          <select value={rarity} onChange={(e) => setRarity(e.target.value as Rarity)} className="mt-1 w-full bg-input border border-border rounded px-3 py-2 text-sm">
            <option value="common">Common</option><option value="rare">Rare</option><option value="epic">Epic</option><option value="legendary">Legendary</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-display uppercase tracking-wider text-muted-foreground">How many</label>
          <input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} className="mt-1 w-full bg-input border border-border rounded px-3 py-2 text-sm" />
        </div>
        <button onClick={send} disabled={sending} className="w-full bg-primary text-primary-foreground font-display uppercase tracking-wider py-2.5 rounded text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
          <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send Cards"}
        </button>
      </div>
    </div>
  );
};

export default Admin;
