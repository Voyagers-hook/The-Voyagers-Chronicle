import { X, Zap, Eye, Sparkles, Battery } from "lucide-react";

type Rarity = "common" | "rare" | "epic" | "legendary";

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

const rarityLabel: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
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
    { label: "Beauty", value: card.beauty, icon: <Sparkles className="w-4 h-4" />, color: "text-purple-400" },
    { label: "Energy", value: card.energy, icon: <Battery className="w-4 h-4" />, color: "text-green-400" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`relative bg-card border-2 card-rarity-${card.rarity} rounded-xl w-full max-w-sm overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 z-10 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        {/* Image */}
        <div className="aspect-[4/3] bg-secondary/30 flex items-center justify-center p-6">
          {card.image_url ? (
            <img src={card.image_url} alt={card.name} className="w-full h-full object-contain" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-display text-3xl">
              ?
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl uppercase">{card.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`chip-${card.rarity} text-[10px] font-display uppercase tracking-widest px-2 py-0.5 rounded`}>
                  {rarityLabel[card.rarity]}
                </span>
                {copies > 1 && (
                  <span className="text-xs text-muted-foreground">x{copies} owned</span>
                )}
              </div>
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
              <div key={s.label} className="bg-secondary rounded-lg px-3 py-2 flex items-center gap-2">
                <span className={s.color}>{s.icon}</span>
                <div>
                  <div className="font-display text-sm leading-none">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Fact */}
          {card.fact && (
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-xs text-muted-foreground font-display uppercase tracking-wider mb-1">Did you know?</p>
              <p className="text-sm">{card.fact}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
