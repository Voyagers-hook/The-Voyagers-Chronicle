import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CollectionGrid } from "@/components/game/CollectionGrid";
import { CatchSubmission } from "@/components/game/CatchSubmission";
import { Leaderboard } from "@/components/game/Leaderboard";
import { TradePanel } from "@/components/game/TradePanel";
import { StatsBar } from "@/components/game/StatsBar";
import { Logo } from "@/components/game/Logo";
import { FunFacts } from "@/components/game/FunFacts";
import { Quiz } from "@/components/game/Quiz";
import { AdminAccessHelper } from "@/components/game/AdminAccessHelper";
import { LogOut, BookOpen, Camera, Trophy, ArrowLeftRight, Shield, Sparkles, HelpCircle } from "lucide-react";

type Tab = "collection" | "submit" | "leaderboard" | "trade" | "facts" | "quiz";

const Index = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("collection");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center tcg-felt">
        <div className="font-display text-xl text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "collection", label: "Collection", icon: <BookOpen className="w-4 h-4" /> },
    { id: "submit", label: "Submit Catch", icon: <Camera className="w-4 h-4" /> },
    { id: "leaderboard", label: "Leaderboard", icon: <Trophy className="w-4 h-4" /> },
    { id: "trade", label: "Trade", icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: "facts", label: "Fun Facts", icon: <Sparkles className="w-4 h-4" /> },
    { id: "quiz", label: "Quiz", icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <main className="min-h-screen tcg-felt">
      <header className="topbar sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-12 h-12" />
            <div>
              <h1 className="font-display text-lg md:text-xl text-white leading-none">
                The Voyagers Chronicle
              </h1>
              <p className="text-xs text-white/70 leading-none mt-1">Digital trading card collection</p>
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

        <nav className="chapter-nav flex gap-1.5 mt-6 mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`chapter-btn text-sm ${tab === t.id ? "chapter-btn-active" : ""}`}
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
        {tab === "facts" && <FunFacts userId={user.id} />}
        {tab === "quiz" && <Quiz userId={user.id} />}

        {!isAdmin && <AdminAccessHelper userId={user.id} email={user.email ?? ""} />}
      </div>
    </main>
  );
};

export default Index;
