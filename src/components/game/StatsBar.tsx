import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Eye, Sparkles, Battery, Star } from "lucide-react";

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

  const totalScore = stats.total_power + stats.total_stealth + stats.total_beauty + stats.total_energy;

  const items = [
    { label: "Power", value: stats.total_power, icon: <Zap className="w-5 h-5" />, color: "text-red-400", bg: "bg-red-400/10" },
    { label: "Stealth", value: stats.total_stealth, icon: <Eye className="w-5 h-5" />, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Beauty", value: stats.total_beauty, icon: <Sparkles className="w-5 h-5" />, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Energy", value: stats.total_energy, icon: <Battery className="w-5 h-5" />, color: "text-green-400", bg: "bg-green-400/10" },
  ];

  return (
    <div className="bg-card border-2 border-border rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-primary/20 rounded-full p-2">
          <Star className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="font-display text-2xl text-primary leading-none">{totalScore}</div>
          <div className="text-xs text-muted-foreground font-display">Total Score</div>
        </div>
        <div className="ml-auto text-right">
          <div className="font-display text-lg text-foreground leading-none">{stats.total_cards}</div>
          <div className="text-xs text-muted-foreground font-display">Cards</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {items.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl px-3 py-2 flex items-center gap-2`}>
            <span className={s.color}>{s.icon}</span>
            <div>
              <div className="font-display text-sm leading-none">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
