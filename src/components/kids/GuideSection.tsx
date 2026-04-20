import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const guideTopics = [
  {
    emoji: "🎣",
    title: "How to Cast Your Line",
    color: "bg-primary text-primary-foreground",
    content:
      "Hold your rod tight, swing it back over your shoulder, then flick it forward and let go of the line. Plop! Your bait is in the water. (Add your full step-by-step guide here later.)",
  },
  {
    emoji: "🐟",
    title: "Meet the Fish",
    color: "bg-leaf text-leaf-foreground",
    content:
      "Trout love cool streams, bass hide in weeds, and carp munch on the bottom. Each fish has favourite spots and snacks!",
  },
  {
    emoji: "🛟",
    title: "Stay Safe on the Water",
    color: "bg-accent text-accent-foreground",
    content:
      "Always fish with a grown-up, wear your life jacket near deep water, and keep hooks pointed away from people.",
  },
  {
    emoji: "🌱",
    title: "Be a Lake Hero",
    color: "bg-treasure text-treasure-foreground",
    content:
      "Take all your rubbish home, handle fish gently with wet hands, and put them back carefully so they can grow big!",
  },
];

export const GuideSection = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="guide" className="py-16 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="font-display text-4xl md:text-6xl text-leaf text-stroke-dark drop-shadow-[0_4px_0_rgba(0,0,0,0.15)]">
          The Angler's Guide
        </h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Tap a card to learn a new fishing skill 📖
        </p>
      </div>

      <div className="space-y-4">
        {guideTopics.map((topic, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={topic.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-3xl shadow-card-pop overflow-hidden border-4 border-border"
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/50 transition-colors"
              >
                <div className={`${topic.color} w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-pop shrink-0`}>
                  {topic.emoji}
                </div>
                <h3 className="font-display text-xl md:text-2xl flex-1 text-foreground">
                  {topic.title}
                </h3>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                  <ChevronDown className="w-6 h-6 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-5 pb-5 pl-[5.5rem] text-base md:text-lg text-foreground/80">
                      {topic.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
