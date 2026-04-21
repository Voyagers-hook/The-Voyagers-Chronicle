import { X, Zap, Eye, Sparkles, Battery } from "lucide-react";
import { Rarity, rarityLabel } from "@/lib/rarities";

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
};

export const CardModal = ({ card, copies, onClose }: { card: Card; copies: number; onClose: () => void }) => {
  const stats = [
    { label: "Power", value: card.power, Icon: Zap, color: "hsl(0 75% 55%)" },
    { label: "Stealth", value: card.stealth, Icon: Eye, color: "hsl(210 80% 50%)" },
    { label: "Beauty", value: card.beauty, Icon: Sparkles, color: "hsl(38 90% 45%)" },
    { label: "Energy", value: card.energy, Icon: Battery, color: "hsl(145 55% 40%)" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm" onClick={onClose}>
      <div className="panel w-full max-w-sm overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white border-2 border-border shadow-md flex items-center justify-center hover:scale-110 transition-transform">
          <X className="w-5 h-5 text-foreground" strokeWidth={2.5} />
        </button>

        <div className={`tcg-card rarity-${card.rarity} !rounded-none !border-0 !shadow-none !aspect-auto`} style={{ cursor: "default" }}>
          <div className="frame-top !text-sm !py-2">
            <span>{rarityLabel[card.rarity]}</span>
            {copies > 1 && <span>×{copies} owned</span>}
          </div>
          <div className="art !m-3 !aspect-[4/3] !flex-none">
            {card.image_url ? (
              <img src={card.image_url} alt={card.name} />
            ) : (
              <div className="font-hand text-7xl text-foreground/30">{card.name[0]}</div>
            )}
          </div>
          <div className="px-5 pb-5 space-y-4">
            <div className="text-center">
              <h2 className="font-display text-2xl text-foreground">{card.name}</h2>
              {card.weight_or_size && (
                <div className="text-sm text-muted-foreground mt-1">{card.weight_or_size}</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {stats.map(({ label, value, Icon, color }) => (
                <div key={label} className="rounded-xl px-3 py-2.5 flex items-center gap-2 border-2 bg-muted/50" style={{ borderColor: color + "33" }}>
                  <Icon className="w-5 h-5" style={{ color }} strokeWidth={2.5} />
                  <div>
                    <div className="font-display text-lg leading-none" style={{ color }}>{value}</div>
                    <div className="text-[10px] text-foreground/60 font-display uppercase">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {card.fact && (
              <div className="bg-accent/10 border-2 border-dashed border-accent/40 rounded-xl p-4">
                <p className="font-display text-sm text-accent mb-1 uppercase tracking-wide">Fact File</p>
                <p className="text-sm text-foreground/90">{card.fact}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
