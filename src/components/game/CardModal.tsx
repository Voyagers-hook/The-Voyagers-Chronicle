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

export const CardModal = ({
  card,
  copies,
  onClose,
}: {
  card: Card;
  copies: number;
  onClose: () => void;
}) => {
  const stats = [
    { label: "Power", value: card.power, icon: <Zap className="w-4 h-4" />, color: "text-red-400" },
    { label: "Stealth", value: card.stealth, icon: <Eye className="w-4 h-4" />, color: "text-blue-400" },
    { label: "Beauty", value: card.beauty, icon: <Sparkles className="w-4 h-4" />, color: "text-amber-400" },
    { label: "Energy", value: card.energy, icon: <Battery className="w-4 h-4" />, color: "text-green-400" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`relative bg-card border-[3px] card-rarity-${card.rarity} rounded-2xl w-full max-w-sm overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 z-10 text-muted-foreground hover:text-foreground bg-card/80 rounded-full p-1">
          <X className="w-5 h-5" />
        </button>

        {/* Image */}
        <div className="aspect-[4/3] bg-secondary/20 flex items-center justify-center p-8">
          {card.image_url ? (
            <img src={card.image_url} alt={card.name} className="w-full h-full object-contain drop-shadow-xl" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground font-display text-4xl">
              ?
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* Header */}
          <div>
            <h2 className="font-display text-2xl">{card.name}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`chip-${card.rarity} text-[10px] font-display px-2.5 py-1 rounded-full`}>
                {rarityLabel[card.rarity]}
              </span>
              {copies > 1 && (
                <span className="text-xs text-muted-foreground font-display">x{copies} owned</span>
              )}
            </div>
          </div>

          {/* Weight/Size */}
          {card.weight_or_size && (
            <div className="flex justify-between text-sm border-b border-border pb-2">
              <span className="text-muted-foreground">Weight / Size</span>
              <span className="font-display">{card.weight_or_size}</span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="bg-secondary/60 rounded-xl px-3 py-2.5 flex items-center gap-2">
                <span className={s.color}>{s.icon}</span>
                <div>
                  <div className="font-display text-base leading-none">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Fact */}
          {card.fact && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
              <p className="text-xs text-primary font-display mb-1">Did you know?</p>
              <p className="text-sm text-foreground/90">{card.fact}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
