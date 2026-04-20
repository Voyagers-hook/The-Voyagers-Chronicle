import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Zap, Eye, Sparkles, Battery, Medal } from "lucide-react";

type LeaderboardEntry = {
  user_id: string;
  display_name: string;
  total_power: number;
  total_stealth: number;
  total_beauty: number;
  total_energy: number;
  total_cards: number;
  total_score: number;
};

export const Leaderboard = ({ currentUserId }: { currentUserId: string }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.rpc("get_leaderboard");
      if (data) setEntries(data as LeaderboardEntry[]);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="text-center text-muted-foreground py-12 font-display text-lg">Loading leaderboard...</div>;

  if (entries.length === 0) {
    return <div className="text-center text-muted-foreground py-12 font-display">No players yet.</div>;
  }

  const rankColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];

  return (
    <div className="space-y-3">
      {entries.map((e, i) => {
        const isMe = e.user_id === currentUserId;
        return (
          <div
            key={e.user_id}
            className={`bg-card border-2 rounded-2xl p-4 flex items-center gap-4 transition-colors ${
              isMe ? "border-primary/50 bg-primary/5" : "border-border"
            }`}
          >
            {/* Rank */}
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
              {i < 3 ? (
                <Trophy className={`w-5 h-5 ${rankColors[i]}`} />
              ) : (
                <span className="font-display text-sm text-muted-foreground">{i + 1}</span>
              )}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="font-display text-base truncate">
                {e.display_name || "Anonymous"}
                {isMe && <span className="text-primary text-xs ml-2">(you)</span>}
              </div>
              <div className="text-xs text-muted-foreground">{e.total_cards} cards</div>
            </div>

            {/* Stats mini */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs"><Zap className="w-3.5 h-3.5 text-red-400" />{e.total_power}</div>
              <div className="flex items-center gap-1 text-xs"><Eye className="w-3.5 h-3.5 text-blue-400" />{e.total_stealth}</div>
              <div className="flex items-center gap-1 text-xs"><Sparkles className="w-3.5 h-3.5 text-amber-400" />{e.total_beauty}</div>
              <div className="flex items-center gap-1 text-xs"><Battery className="w-3.5 h-3.5 text-green-400" />{e.total_energy}</div>
            </div>

            {/* Score */}
            <div className="text-right shrink-0">
              <div className="font-display text-xl text-primary leading-none">{e.total_score}</div>
              <div className="text-[10px] text-muted-foreground">score</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
