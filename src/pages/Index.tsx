import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CollectionGrid } from "@/components/game/CollectionGrid";
import { CatchSubmission } from "@/components/game/CatchSubmission";
import { Leaderboard } from "@/components/game/Leaderboard";
import { TradePanel } from "@/components/game/TradePanel";
import { StatsBar } from "@/components/game/StatsBar";
import { LogOut, BookOpen, Target, Trophy, ArrowLeftRight, Shield } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground font-display">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "collection", label: "Collection", icon: <BookOpen className="w-4 h-4" /> },
    { id: "submit", label: "Submit Catch", icon: <Target className="w-4 h-4" /> },
    { id: "leaderboard", label: "Leaderboard", icon: <Trophy className="w-4 h-4" /> },
    { id: "trade", label: "Trade", icon: <ArrowLeftRight className="w-4 h-4" /> },
  ];

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-display text-lg md:text-xl text-primary tracking-tight">
            THE VOYAGERS CHRONICLE
          </h1>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="text-xs font-display uppercase tracking-wider text-muted-foreground hover:text-primary flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <span className="text-xs text-muted-foreground hidden sm:block">{user.email}</span>
            <button
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <StatsBar userId={user.id} />

        {/* Tabs */}
        <nav className="flex gap-1 mt-6 mb-6 bg-card rounded-lg p-1 border border-border overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-display uppercase tracking-wider transition-colors whitespace-nowrap ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        {tab === "collection" && <CollectionGrid userId={user.id} />}
        {tab === "submit" && <CatchSubmission userId={user.id} />}
        {tab === "leaderboard" && <Leaderboard currentUserId={user.id} />}
        {tab === "trade" && <TradePanel userId={user.id} />}
      </div>
    </main>
  );
};

export default Index;
