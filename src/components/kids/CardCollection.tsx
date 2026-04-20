import { useState } from "react";
import { motion } from "framer-motion";
import trout from "@/assets/card-trout.png";
import bass from "@/assets/card-bass.png";
import carp from "@/assets/card-carp.png";
import pike from "@/assets/card-pike.png";
import catfish from "@/assets/card-catfish.png";
import mythic from "@/assets/card-mythic.png";

type Rarity = "common" | "rare" | "epic" | "legendary";

type FishCard = {
  id: string;
  name: string;
  img: string;
  rarity: Rarity;
  power: number;
  speed: number;
  weight: string;
  fact: string;
};

const cards: FishCard[] = [
  { id: "trout", name: "Rainbow Trout", img: trout, rarity: "common", power: 40, speed: 75, weight: "2 kg", fact: "Loves cool, clean streams!" },
  { id: "bass", name: "Bouncy Bass", img: bass, rarity: "common", power: 55, speed: 60, weight: "3 kg", fact: "Hides under lily pads." },
  { id: "carp", name: "Golden Carp", img: carp, rarity: "rare", power: 70, speed: 45, weight: "8 kg", fact: "A symbol of luck!" },
  { id: "pike", name: "Sneaky Pike", img: pike, rarity: "epic", power: 85, speed: 80, weight: "10 kg", fact: "Lightning-fast hunter!" },
  { id: "catfish", name: "Whiskers", img: catfish, rarity: "epic", power: 90, speed: 30, weight: "15 kg", fact: "Lurks at the bottom." },
  { id: "mythic", name: "Rainbow Wyrm", img: mythic, rarity: "legendary", power: 120, speed: 95, weight: "??? kg", fact: "A legend of the deep!" },
];

const rarityStyles: Record<Rarity, { ring: string; chip: string; bg: string; glow?: string }> = {
  common: { ring: "ring-rarity-common", chip: "bg-rarity-common text-white", bg: "from-blue-50 to-blue-100" },
  rare: { ring: "ring-rarity-rare", chip: "bg-rarity-rare text-white", bg: "from-blue-100 to-indigo-200" },
  epic: { ring: "ring-rarity-epic", chip: "bg-rarity-epic text-white", bg: "from-purple-100 to-fuchsia-200" },
  legendary: { ring: "ring-rarity-legendary", chip: "bg-gradient-legendary text-white", bg: "from-yellow-100 to-orange-200", glow: "shadow-legendary" },
};

const FlipCard = ({ card, owned }: { card: FishCard; owned: boolean }) => {
  const [flipped, setFlipped] = useState(false);
  const r = rarityStyles[card.rarity];

  return (
    <div className="[perspective:1200px] w-full aspect-[3/4]">
      <motion.div
        onClick={() => setFlipped((f) => !f)}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-full cursor-pointer [transform-style:preserve-3d]"
        whileHover={{ scale: 1.04, y: -4 }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 [backface-visibility:hidden] rounded-3xl ring-4 ${r.ring} bg-gradient-to-br ${r.bg} shadow-card-pop overflow-hidden flex flex-col ${r.glow ?? ""} ${!owned ? "grayscale opacity-60" : ""}`}
        >
          <div className="flex justify-between items-start p-3">
            <span className={`${r.chip} font-display text-xs px-3 py-1 rounded-full shadow-pop uppercase`}>
              {card.rarity}
            </span>
            {!owned && <span className="text-2xl">🔒</span>}
          </div>
          <div className="flex-1 flex items-center justify-center p-2">
            <motion.img
              src={card.img}
              alt={card.name}
              className="w-full h-full object-contain drop-shadow-xl"
              animate={owned ? { y: [0, -8, 0] } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              loading="lazy"
              width={512}
              height={512}
            />
          </div>
          <div className="bg-card/90 backdrop-blur p-3 text-center border-t-4 border-border">
            <h3 className="font-display text-lg text-foreground">{card.name}</h3>
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl ring-4 ${r.ring} bg-card shadow-card-pop p-5 flex flex-col`}
        >
          <h3 className="font-display text-xl text-primary">{card.name}</h3>
          <span className={`${r.chip} self-start font-display text-xs px-3 py-1 rounded-full shadow-pop mt-1 uppercase`}>
            {card.rarity}
          </span>
          <div className="mt-4 space-y-3 text-sm flex-1">
            <Stat label="Power" value={card.power} max={120} color="bg-accent" />
            <Stat label="Speed" value={card.speed} max={100} color="bg-primary" />
            <div className="flex justify-between font-medium">
              <span className="text-muted-foreground">Weight</span>
              <span className="font-display text-base">{card.weight}</span>
            </div>
          </div>
          <p className="text-xs italic text-muted-foreground border-t border-border pt-2 mt-2">
            💡 {card.fact}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const Stat = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
  <div>
    <div className="flex justify-between text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
      <motion.div
        className={`h-full ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.8 }}
      />
    </div>
  </div>
);

export const CardCollection = () => {
  // Demo: first 4 owned, last 2 locked
  const ownedIds = new Set(["trout", "bass", "carp", "pike"]);
  const owned = cards.filter((c) => ownedIds.has(c.id)).length;

  return (
    <section id="cards" className="py-16 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="font-display text-4xl md:text-6xl text-accent text-stroke-dark drop-shadow-[0_4px_0_rgba(0,0,0,0.15)]">
          My Card Collection
        </h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Tap a card to flip it! You've caught{" "}
          <span className="font-display text-foreground">{owned}/{cards.length}</span> 🎴
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 md:gap-8">
        {cards.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 30, rotate: -5 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, type: "spring" }}
          >
            <FlipCard card={c} owned={ownedIds.has(c.id)} />
          </motion.div>
        ))}
      </div>

      <ChallengesPanel />
    </section>
  );
};

const challenges = [
  { emoji: "🎣", title: "Catch your first fish", reward: "Common Card" },
  { emoji: "📏", title: "Land a 30cm+ fish", reward: "Rare Card" },
  { emoji: "🌧️", title: "Fish in the rain", reward: "Epic Card" },
  { emoji: "🛒", title: "Buy a starter kit", reward: "Bonus Pack" },
  { emoji: "👥", title: "Bring a friend", reward: "2x Cards" },
  { emoji: "🏆", title: "Win the monthly tournament", reward: "Legendary Card" },
];

const ChallengesPanel = () => (
  <div className="mt-16 bg-gradient-treasure rounded-[2rem] p-6 md:p-10 shadow-card-pop border-8 border-treasure">
    <h3 className="font-display text-3xl md:text-5xl text-center text-treasure-foreground text-stroke-dark drop-shadow-[0_4px_0_rgba(0,0,0,0.2)]">
      Earn New Cards!
    </h3>
    <p className="text-center text-treasure-foreground/90 mt-2 mb-6">
      Complete challenges or grab gear from the shop 🪙
    </p>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {challenges.map((ch, i) => (
        <motion.div
          key={ch.title}
          whileHover={{ y: -4, rotate: -1 }}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className="bg-card rounded-2xl p-4 shadow-pop flex items-center gap-3"
        >
          <div className="text-4xl">{ch.emoji}</div>
          <div className="flex-1">
            <div className="font-display text-base text-foreground leading-tight">{ch.title}</div>
            <div className="text-xs text-accent font-semibold mt-1">🎁 {ch.reward}</div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);
