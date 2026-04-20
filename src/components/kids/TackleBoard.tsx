import { useRef, useState } from "react";
import { motion } from "framer-motion";

type Badge = {
  id: string;
  label: string;
  emoji: string;
  variant: "primary" | "treasure" | "leaf" | "accent" | "secondary";
  x: number;
  y: number;
};

const variantClasses: Record<Badge["variant"], string> = {
  primary: "bg-primary text-primary-foreground",
  treasure: "bg-treasure text-treasure-foreground",
  leaf: "bg-leaf text-leaf-foreground",
  accent: "bg-accent text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground",
};

const initialBadges: Badge[] = [
  { id: "rod", label: "Fishing Rod", emoji: "🎣", variant: "secondary", x: 30, y: 30 },
  { id: "bait", label: "Bait Box", emoji: "🪱", variant: "leaf", x: 200, y: 60 },
  { id: "boots", label: "Wellies", emoji: "🥾", variant: "treasure", x: 360, y: 40 },
  { id: "net", label: "Landing Net", emoji: "🥅", variant: "primary", x: 80, y: 200 },
  { id: "hat", label: "Lucky Hat", emoji: "🧢", variant: "accent", x: 260, y: 220 },
  { id: "snack", label: "Trail Snacks", emoji: "🍫", variant: "secondary", x: 420, y: 200 },
];

export const TackleBoard = () => {
  const [badges, setBadges] = useState(initialBadges);
  const [resetKey, setResetKey] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);

  const reset = () => {
    setBadges(initialBadges);
    setResetKey((k) => k + 1);
  };

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-display mb-2">
          Plan your kit
        </p>
        <h2 className="font-display text-4xl md:text-5xl text-foreground">
          Tackle Board
        </h2>
        <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
          Drag each piece of gear around. Build the perfect loadout for your next trip.
        </p>
      </div>

      <div className="relative bg-secondary rounded-2xl shadow-card-pop p-3 md:p-4 border-4 border-secondary">
        <div
          ref={boardRef}
          className="relative h-[440px] rounded-xl overflow-hidden"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, hsl(35 50% 60%) 0 8px, hsl(35 45% 55%) 8px 16px)",
          }}
        >
          {badges.map((b) => (
            <motion.div
              key={`${b.id}-${resetKey}`}
              drag
              dragMomentum={false}
              dragConstraints={boardRef}
              dragElastic={0}
              initial={{ x: b.x, y: b.y }}
              whileDrag={{ scale: 1.1, rotate: 4, zIndex: 50 }}
              whileHover={{ scale: 1.04 }}
              className={`absolute cursor-grab active:cursor-grabbing select-none touch-none ${variantClasses[b.variant]} font-display rounded-lg px-4 py-2 shadow-pop flex items-center gap-2 text-base`}
            >
              <span className="text-2xl">{b.emoji}</span>
              <span className="uppercase tracking-wide text-sm">{b.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={reset}
            className="font-display text-sm bg-card text-foreground px-5 py-2 rounded-md shadow-pop hover:translate-y-0.5 hover:shadow-none transition-all uppercase tracking-wider"
          >
            Reset Board ↺
          </button>
        </div>
      </div>
    </section>
  );
};
