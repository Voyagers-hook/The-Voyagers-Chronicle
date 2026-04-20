import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Zap, Eye, Sparkles, Battery } from "lucide-react";

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

  if (loading) return <div className="text-center text-muted-foreground py-12 font-display">Loading...</div>;

  if (entries.length === 0) {
    return <div className="text-center text-muted-foreground py-12">No players yet.</div>;
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left px-4 py-3 font-display text-xs uppercase tracking-wider text-muted-foreground">#</th>
              <th className="text-left px-4 py-3 font-display text-xs uppercase tracking-wider text-muted-foreground">Player</th>
              <th className="text-center px-3 py-3"><Zap className="w-4 h-4 text-red-400 mx-auto" /></th>
              <th className="text-center px-3 py-3"><Eye className="w-4 h-4 text-blue-400 mx-auto" /></th>
              <th className="text-center px-3 py-3"><Sparkles className="w-4 h-4 text-purple-400 mx-auto" /></th>
              <th className="text-center px-3 py-3"><Battery className="w-4 h-4 text-green-400 mx-auto" /></th>
              <th className="text-center px-3 py-3 font-display text-xs uppercase tracking-wider text-muted-foreground">Cards</th>
              <th className="text-right px-4 py-3 font-display text-xs uppercase tracking-wider text-primary">Score</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => {
              const isMe = e.user_id === currentUserId;
              return (
                <tr
                  key={e.user_id}
                  className={`border-b border-border/50 ${isMe ? "bg-primary/5" : "hover:bg-secondary/30"}`}
                >
                  <td className="px-4 py-3 font-display">
                    {i === 0 ? <Trophy className="w-4 h-4 text-yellow-500" /> : i + 1}
                  </td>
                  <td className="px-4 py-3 font-display uppercase tracking-wide">
                    {e.display_name || "Anonymous"}
                    {isMe && <span className="text-primary text-xs ml-2">(you)</span>}
                  </td>
                  <td className="text-center px-3 py-3">{e.total_power}</td>
                  <td className="text-center px-3 py-3">{e.total_stealth}</td>
                  <td className="text-center px-3 py-3">{e.total_beauty}</td>
                  <td className="text-center px-3 py-3">{e.total_energy}</td>
                  <td className="text-center px-3 py-3">{e.total_cards}</td>
                  <td className="text-right px-4 py-3 font-display text-primary">{e.total_score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
