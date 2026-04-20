import { useState } from "react";
import { motion } from "framer-motion";

type Badge = {
  id: string;
  label: string;
  emoji: string;
  color: string;
  x: number;
  y: number;
};

const initialBadges: Badge[] = [
  { id: "rod", label: "Fishing Rod", emoji: "🎣", color: "bg-secondary text-secondary-foreground", x: 30, y: 30 },
  { id: "bait", label: "Bait Box", emoji: "🪱", color: "bg-leaf text-leaf-foreground", x: 200, y: 60 },
  { id: "boots", label: "Wellies", emoji: "🥾", color: "bg-treasure text-treasure-foreground", x: 360, y: 40 },
  { id: "net", label: "Landing Net", emoji: "🥅", color: "bg-primary text-primary-foreground", x: 80, y: 180 },
  { id: "hat", label: "Lucky Hat", emoji: "🧢", color: "bg-accent text-accent-foreground", x: 260, y: 200 },
  { id: "snack", label: "Snacks", emoji: "🍪", color: "bg-secondary text-secondary-foreground", x: 420, y: 180 },
];

export const TackleBoard = () => {
  const [badges, setBadges] = useState(initialBadges);

  const reset = () => setBadges(initialBadges);

  return (
    <section className="py-16 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display text-4xl md:text-6xl text-primary text-stroke-dark drop-shadow-[0_4px_0_rgba(0,0,0,0.15)]">
          My Tackle Board
        </h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Drag the gear around — pack your perfect fishing kit! 🎒
        </p>
      </div>

      <div className="relative bg-gradient-treasure rounded-[2rem] shadow-card-pop p-4 border-8 border-treasure">
        {/* cork-board look */}
        <div
          className="relative h-[420px] rounded-3xl overflow-hidden"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, hsl(40 60% 80%) 0%, transparent 30%), radial-gradient(circle at 80% 60%, hsl(40 60% 78%) 0%, transparent 30%), linear-gradient(135deg, hsl(35 55% 70%), hsl(30 50% 60%))",
          }}
        >
          {badges.map((b) => (
            <motion.div
              key={b.id}
              drag
              dragMomentum={false}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0}
              initial={false}
              style={{ x: b.x, y: b.y }}
              whileDrag={{ scale: 1.15, rotate: 6, zIndex: 50 }}
              whileHover={{ scale: 1.05 }}
              className={`absolute cursor-grab active:cursor-grabbing select-none ${b.color} font-display rounded-2xl px-5 py-3 shadow-pop flex items-center gap-2 text-lg`}
            >
              <span className="text-3xl">{b.emoji}</span>
              <span>{b.label}</span>
            </motion.div>
          ))}
        </div>

        <button
          onClick={reset}
          className="mt-4 mx-auto block font-display bg-card text-foreground px-6 py-2 rounded-full shadow-pop hover:translate-y-1 hover:shadow-none transition-all"
        >
          Reset Board ↺
        </button>
      </div>
    </section>
  );
};
