import { useRef } from "react";
import { motion } from "framer-motion";
import heroLake from "@/assets/hero-lake.jpg";

const floatingFish = [
  { emoji: "🐟", top: "20%", left: "10%", delay: 0 },
  { emoji: "🐠", top: "60%", left: "85%", delay: 1.2 },
  { emoji: "🐡", top: "75%", left: "20%", delay: 0.6 },
];

export const Hero = ({ onStart }: { onStart: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden min-h-[88vh] flex items-center justify-center"
    >
      <img
        src={heroLake}
        alt="Cartoon lake with a friendly jumping fish at sunrise"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1024}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />

      {floatingFish.map((f, i) => (
        <motion.div
          key={i}
          className="absolute text-5xl md:text-6xl select-none pointer-events-none drop-shadow-lg"
          style={{ top: f.top, left: f.left }}
          animate={{ y: [0, -20, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, delay: f.delay, ease: "easeInOut" }}
        >
          {f.emoji}
        </motion.div>
      ))}

      <div className="relative z-10 text-center px-6 max-w-3xl">
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="inline-block bg-secondary text-secondary-foreground font-display text-sm md:text-base px-5 py-2 rounded-full shadow-pop -rotate-3"
        >
          🎣 Lil' Anglers Club
        </motion.div>

        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="font-display text-5xl md:text-7xl lg:text-8xl mt-6 text-secondary text-stroke-dark drop-shadow-[0_6px_0_rgba(0,0,0,0.2)]"
        >
          Welcome,<br/>Little Angler!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-lg md:text-xl text-foreground font-medium bg-card/80 backdrop-blur-sm rounded-2xl px-6 py-3 inline-block shadow-card-pop"
        >
          Learn to fish, collect cool cards, and become a true lake legend! 🌊
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex gap-4 justify-center flex-wrap"
        >
          <button
            onClick={onStart}
            className="font-display text-xl md:text-2xl bg-accent text-accent-foreground px-8 py-4 rounded-full shadow-pop hover:translate-y-1 hover:shadow-none transition-all"
          >
            Start Adventure ⚓
          </button>
          <button
            onClick={() => document.getElementById("cards")?.scrollIntoView({ behavior: "smooth" })}
            className="font-display text-xl md:text-2xl bg-card text-foreground px-8 py-4 rounded-full shadow-pop hover:translate-y-1 hover:shadow-none transition-all"
          >
            See My Cards 🎴
          </button>
        </motion.div>
      </div>

      {/* Wavy bottom */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path
          d="M0,40 C240,100 480,0 720,40 C960,80 1200,20 1440,50 L1440,100 L0,100 Z"
          fill="hsl(var(--background))"
        />
      </svg>
    </section>
  );
};
