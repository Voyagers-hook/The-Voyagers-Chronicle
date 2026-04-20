import { motion } from "framer-motion";
import logo from "@/assets/little-voyagers-logo.png";
import { Link } from "react-router-dom";

export const Hero = ({ onStart }: { onStart: () => void }) => {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center bg-gradient-water">
      {/* subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, hsl(38 35% 95%) 0%, transparent 40%), radial-gradient(circle at 80% 70%, hsl(188 78% 60%) 0%, transparent 40%)",
        }}
      />
      {/* admin link, top-right */}
      <Link
        to="/auth"
        className="absolute top-4 right-4 z-20 text-xs uppercase tracking-widest text-primary-foreground/70 hover:text-primary-foreground transition-colors font-display"
      >
        Members ›
      </Link>

      <div className="relative z-10 text-center px-6 max-w-3xl py-20">
        <motion.img
          src={logo}
          alt="Little Voyagers Project Somerset emblem"
          width={220}
          height={220}
          initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 14 }}
          className="mx-auto w-44 md:w-56 drop-shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
        />

        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-xs md:text-sm uppercase tracking-[0.4em] text-primary-foreground/80 font-display"
        >
          Members Area · Est. 2025
        </motion.p>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="font-display text-5xl md:text-7xl mt-3 text-primary-foreground leading-[1.05]"
        >
          Welcome,<br/><span className="text-secondary-foreground bg-treasure px-3 inline-block -rotate-1 mt-2">Voyager</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-base md:text-lg text-primary-foreground/90 max-w-xl mx-auto"
        >
          Learn the craft, complete real-world challenges, and collect cards
          earned out on the water. Your adventure log starts here.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 flex gap-3 md:gap-4 justify-center flex-wrap"
        >
          <button
            onClick={onStart}
            className="font-display text-base md:text-lg bg-accent text-accent-foreground px-6 py-3 md:px-8 md:py-4 rounded-md shadow-pop hover:translate-y-0.5 hover:shadow-none transition-all uppercase tracking-wider"
          >
            Open the Guide
          </button>
          <button
            onClick={() => document.getElementById("cards")?.scrollIntoView({ behavior: "smooth" })}
            className="font-display text-base md:text-lg bg-card text-foreground px-6 py-3 md:px-8 md:py-4 rounded-md shadow-pop hover:translate-y-0.5 hover:shadow-none transition-all uppercase tracking-wider"
          >
            View Card Collection
          </button>
        </motion.div>
      </div>

      {/* angled bottom edge */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,80 L1440,40 L1440,80 Z" fill="hsl(var(--background))" />
      </svg>
    </section>
  );
};
