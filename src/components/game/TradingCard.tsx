import { Rarity, rarityLabel } from "@/lib/rarities";

export type CardData = {
  id: string;
  name: string;
  image_url: string | null;
  rarity: Rarity;
  power: number;
  stealth: number;
  beauty: number;
  energy: number;
};

type Props = {
  card: CardData;
  count?: number;
  justRevealed?: boolean;
  onClick?: () => void;
  dragging?: boolean;
};

export const TradingCard = ({ card, count, justRevealed, onClick, dragging }: Props) => {
  return (
    <div
      className={`tcg-card rarity-${card.rarity} ${dragging ? "dragging" : ""} ${justRevealed ? "flip-reveal" : ""}`}
      onClick={onClick}
    >
      {count && count > 1 && (
        <div className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground font-display text-xs w-7 h-7 rounded-full flex items-center justify-center border-[3px] border-white shadow-md">
          x{count}
        </div>
      )}
      <div className="frame-top">
        <span className="truncate">{rarityLabel[card.rarity]}</span>
        <span className="flex items-center gap-0.5 text-[0.7rem]">
          {"★".repeat(Math.max(1, ["common","rare","epic","legendary","super_rare"].indexOf(card.rarity) + 1))}
        </span>
      </div>
      <div className="art">
        {card.image_url ? (
          <img src={card.image_url} alt={card.name} loading="lazy" />
        ) : (
          <div className="font-hand text-5xl text-foreground/30">{card.name[0]}</div>
        )}
      </div>
      <div className="name truncate">{card.name}</div>
      <div className="stat-row">
        <div className="s" title="Power">P {card.power}</div>
        <div className="s" title="Stealth">S {card.stealth}</div>
        <div className="s" title="Beauty">B {card.beauty}</div>
        <div className="s" title="Energy">E {card.energy}</div>
      </div>
    </div>
  );
};
