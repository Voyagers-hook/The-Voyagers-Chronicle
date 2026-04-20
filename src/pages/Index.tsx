import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CollectionGrid } from "@/components/game/CollectionGrid";
import { CatchSubmission } from "@/components/game/CatchSubmission";
import { Leaderboard } from "@/components/game/Leaderboard";
import { TradePanel } from "@/components/game/TradePanel";
import { StatsBar } from "@/components/game/StatsBar";
import { LogOut, BookOpen, Camera, Trophy, ArrowLeftRight, Shield, Sparkles } from "lucide-react";

type Tab = "collection" | "submit" | "leaderboard" | "trade";

const Index = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("collection");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center sticker-page">
        <div className="font-hand text-3xl text-primary">Opening your sticker book...</div>
      </div>
    );
  }

  if (!user) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "collection", label: "My Book", icon: <BookOpen className="w-4 h-4" /> },
    { id: "submit", label: "Submit Catch", icon: <Camera className="w-4 h-4" /> },
    { id: "leaderboard", label: "Leaderboard", icon: <Trophy className="w-4 h-4" /> },
    { id: "trade", label: "Trade", icon: <ArrowLeftRight className="w-4 h-4" /> },
  ];

  return (
    <main className="min-h-screen sticker-page">
      {/* Sky-blue header banner */}
      <header className="sky-banner sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary border-3 border-white shadow-[0_3px_0_hsl(22_90%_40%)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-lg md:text-xl text-white drop-shadow leading-none">
                The Voyagers Chronicle
              </h1>
              <p className="font-hand text-base text-white/90 leading-none mt-0.5">Sticker Book</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin" className="tab-pill !py-1.5 !px-3 text-xs flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <button onClick={signOut} className="tab-pill !py-1.5 !px-3 text-xs flex items-center gap-1.5" title="Sign out">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <StatsBar userId={user.id} />

        {/* Tabs */}
        <nav className="flex gap-2 mt-6 mb-6 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`tab-pill flex items-center gap-2 text-sm whitespace-nowrap ${tab === t.id ? "tab-pill-active" : ""}`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        {tab === "collection" && <CollectionGrid userId={user.id} />}
        {tab === "submit" && <CatchSubmission userId={user.id} />}
        {tab === "leaderboard" && <Leaderboard currentUserId={user.id} />}
        {tab === "trade" && <TradePanel userId={user.id} />}
      </div>
    </main>
  );
};

export default Index;
