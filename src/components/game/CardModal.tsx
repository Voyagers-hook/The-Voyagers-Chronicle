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
    { label: "Power", value: card.power, Icon: Zap, color: "hsl(0 75% 55%)", bg: "hsl(0 90% 95%)" },
    { label: "Stealth", value: card.stealth, Icon: Eye, color: "hsl(210 80% 50%)", bg: "hsl(210 90% 94%)" },
    { label: "Beauty", value: card.beauty, Icon: Sparkles, color: "hsl(38 90% 45%)", bg: "hsl(45 95% 92%)" },
    { label: "Energy", value: card.energy, Icon: Battery, color: "hsl(145 55% 40%)", bg: "hsl(145 65% 92%)" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`sticker card-rarity-${card.rarity} w-full max-w-sm overflow-hidden`}
        style={{ ['--tilt' as any]: '0deg' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white border-2 border-paper-edge shadow-md flex items-center justify-center hover:scale-110 transition-transform"
        >
          <X className="w-5 h-5 text-foreground" strokeWidth={2.5} />
        </button>

        {/* Image */}
        <div className="aspect-[4/3] bg-secondary/40 rounded-xl m-2 flex items-center justify-center p-6">
          {card.image_url ? (
            <img src={card.image_url} alt={card.name} className="w-full h-full object-contain" />
          ) : (
            <div className="font-hand text-7xl text-secondary-foreground/50">{card.name[0]}</div>
          )}
        </div>

        <div className="px-5 pb-5 pt-1 space-y-4">
          <div className="text-center">
            <h2 className="font-display text-2xl text-foreground">{card.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className={`chip chip-${card.rarity}`}>{rarityLabel[card.rarity]}</span>
              {copies > 1 && (
                <span className="font-hand text-lg text-primary">x{copies} owned!</span>
              )}
            </div>
          </div>

          {card.weight_or_size && (
            <div className="flex justify-between items-center text-sm bg-muted/50 rounded-xl px-4 py-2">
              <span className="text-muted-foreground font-display">Weight / Size</span>
              <span className="font-display text-foreground">{card.weight_or_size}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {stats.map(({ label, value, Icon, color, bg }) => (
              <div
                key={label}
                className="rounded-2xl px-3 py-2.5 flex items-center gap-2 border-2"
                style={{ background: bg, borderColor: color + "33" }}
              >
                <Icon className="w-5 h-5" style={{ color }} strokeWidth={2.5} />
                <div>
                  <div className="font-display text-lg leading-none" style={{ color }}>{value}</div>
                  <div className="text-[10px] text-foreground/60 font-display uppercase">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {card.fact && (
            <div className="bg-secondary/60 border-2 border-dashed border-accent/40 rounded-2xl p-4">
              <p className="font-hand text-xl text-accent mb-1">Did you know?</p>
              <p className="text-sm text-foreground/90">{card.fact}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
