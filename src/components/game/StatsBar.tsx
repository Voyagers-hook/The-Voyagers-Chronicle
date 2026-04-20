import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Eye, Sparkles, Battery } from "lucide-react";

type Stats = { total_power: number; total_stealth: number; total_beauty: number; total_energy: number; total_cards: number };

export const StatsBar = ({ userId }: { userId: string }) => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.rpc("get_leaderboard");
      if (data) {
        const me = (data as any[]).find((r: any) => r.user_id === userId);
        if (me) setStats(me);
        else setStats({ total_power: 0, total_stealth: 0, total_beauty: 0, total_energy: 0, total_cards: 0 });
      }
    };
    load();
  }, [userId]);

  if (!stats) return null;

  const items = [
    { label: "Power", value: stats.total_power, icon: <Zap className="w-4 h-4" />, color: "text-red-400" },
    { label: "Stealth", value: stats.total_stealth, icon: <Eye className="w-4 h-4" />, color: "text-blue-400" },
    { label: "Beauty", value: stats.total_beauty, icon: <Sparkles className="w-4 h-4" />, color: "text-purple-400" },
    { label: "Energy", value: stats.total_energy, icon: <Battery className="w-4 h-4" />, color: "text-green-400" },
  ];

  const totalScore = stats.total_power + stats.total_stealth + stats.total_beauty + stats.total_energy;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {items.map((s) => (
        <div key={s.label} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3">
          <span className={s.color}>{s.icon}</span>
          <div>
            <div className="font-display text-lg leading-none">{s.value}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
          </div>
        </div>
      ))}
      <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 flex items-center gap-3">
        <span className="text-primary font-display text-lg">{stats.total_cards}</span>
        <div>
          <div className="font-display text-lg leading-none text-primary">{totalScore}</div>
          <div className="text-xs text-primary/70 uppercase tracking-wider">Total Score</div>
        </div>
      </div>
    </div>
  );
};
