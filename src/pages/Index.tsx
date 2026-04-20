import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CollectionGrid } from "@/components/game/CollectionGrid";
import { CatchSubmission } from "@/components/game/CatchSubmission";
import { Leaderboard } from "@/components/game/Leaderboard";
import { TradePanel } from "@/components/game/TradePanel";
import { StatsBar } from "@/components/game/StatsBar";
import { LogOut, BookOpen, Target, Trophy, ArrowLeftRight, Shield, Fish } from "lucide-react";

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
        <div className="text-muted-foreground font-display text-lg">Loading your collection...</div>
      </div>
    );
  }

  if (!user) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "collection", label: "My Book", icon: <BookOpen className="w-5 h-5" /> },
    { id: "submit", label: "Submit Catch", icon: <Target className="w-5 h-5" /> },
    { id: "leaderboard", label: "Leaderboard", icon: <Trophy className="w-5 h-5" /> },
    { id: "trade", label: "Trade", icon: <ArrowLeftRight className="w-5 h-5" /> },
  ];

  return (
    <main className="min-h-screen sticker-page">
      {/* Header */}
      <header className="border-b-2 border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Fish className="w-6 h-6 text-primary" />
            <h1 className="font-display text-lg md:text-xl text-primary">
              The Voyagers Chronicle
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="text-xs font-display text-muted-foreground hover:text-primary flex items-center gap-1.5"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
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
        <nav className="flex gap-1.5 mt-6 mb-6 bg-card/60 rounded-2xl p-1.5 border-2 border-border overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display transition-all whitespace-nowrap ${
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
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
