export type Rarity = "common" | "rare" | "epic" | "legendary" | "super_rare";

export const rarityLabel: Record<Rarity, string> = {
  common: "Widespread",
  rare: "Elusive",
  epic: "Specimen",
  legendary: "Rare",
  super_rare: "Super Rare",
};

export const rarityOrder: Rarity[] = ["common", "rare", "epic", "legendary", "super_rare"];

export const raritySectionInfo: Record<
  Rarity,
  { title: string; subtitle: string; color: string }
> = {
  common: {
    title: "Widespread",
    subtitle: "The common catches you'll find everywhere",
    color: "hsl(145 55% 42%)",
  },
  rare: {
    title: "Elusive",
    subtitle: "Silver-tier — harder to find",
    color: "hsl(210 80% 52%)",
  },
  epic: {
    title: "Specimen",
    subtitle: "Gold-tier trophies",
    color: "hsl(42 95% 50%)",
  },
  legendary: {
    title: "Rare",
    subtitle: "Seldom-seen beauties",
    color: "hsl(285 70% 52%)",
  },
  super_rare: {
    title: "Super Rare",
    subtitle: "Legendary pulls — the top tier",
    color: "hsl(0 85% 55%)",
  },
};
