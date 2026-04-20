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
        setStats(me ?? { total_power: 0, total_stealth: 0, total_beauty: 0, total_energy: 0, total_cards: 0 });
      }
    };
    load();
  }, [userId]);

  if (!stats) return null;

  const totalScore = stats.total_power + stats.total_stealth + stats.total_beauty + stats.total_energy;

  const items = [
    { label: "Power", value: stats.total_power, icon: Zap, color: "hsl(0 75% 55%)", bg: "hsl(0 90% 95%)" },
    { label: "Stealth", value: stats.total_stealth, icon: Eye, color: "hsl(210 80% 50%)", bg: "hsl(210 90% 94%)" },
    { label: "Beauty", value: stats.total_beauty, icon: Sparkles, color: "hsl(38 90% 45%)", bg: "hsl(45 95% 92%)" },
    { label: "Energy", value: stats.total_energy, icon: Battery, color: "hsl(145 55% 40%)", bg: "hsl(145 65% 92%)" },
  ];

  return (
    <div className="paper-card p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary border-4 border-white shadow-[0_4px_0_hsl(22_90%_40%)] flex items-center justify-center">
            <Star className="w-7 h-7 text-white fill-white" strokeWidth={2} />
          </div>
          <div>
            <div className="font-display text-3xl text-foreground leading-none">{totalScore}</div>
            <div className="font-hand text-lg text-muted-foreground leading-none mt-0.5">Total Score</div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 min-w-[260px]">
          {items.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="rounded-2xl px-3 py-2 flex items-center gap-2 border-2"
              style={{ background: bg, borderColor: color + "33" }}
            >
              <Icon className="w-5 h-5" style={{ color }} strokeWidth={2.5} />
              <div>
                <div className="font-display text-lg leading-none" style={{ color }}>{value}</div>
                <div className="text-[10px] text-foreground/60 font-display uppercase tracking-wide">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-right">
          <div className="font-display text-2xl text-accent leading-none">{stats.total_cards}</div>
          <div className="font-hand text-base text-muted-foreground leading-none mt-0.5">stickers</div>
        </div>
      </div>
    </div>
  );
};
