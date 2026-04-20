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
  { title: string; subtitle: string; color: string; bannerBg: string }
> = {
  common: {
    title: "Widespread",
    subtitle: "The friendly fish you'll find in every pond and stream",
    color: "hsl(145 50% 38%)",
    bannerBg: "bg-[hsl(145,55%,88%)]",
  },
  rare: {
    title: "Elusive",
    subtitle: "Trickier to spot — silver-scaled and quick!",
    color: "hsl(210 80% 45%)",
    bannerBg: "bg-[hsl(210,85%,90%)]",
  },
  epic: {
    title: "Specimen",
    subtitle: "The big golden ones that make your arms ache",
    color: "hsl(38 90% 40%)",
    bannerBg: "bg-[hsl(45,95%,88%)]",
  },
  legendary: {
    title: "Rare",
    subtitle: "Most fishers will never see one of these beauties",
    color: "hsl(285 70% 45%)",
    bannerBg: "bg-[hsl(285,75%,92%)]",
  },
  super_rare: {
    title: "Super Rare",
    subtitle: "Legendary catches — only the luckiest find these!",
    color: "hsl(0 80% 50%)",
    bannerBg: "bg-gradient-to-r from-[hsl(50,100%,88%)] via-[hsl(20,95%,90%)] to-[hsl(0,90%,90%)]",
  },
};
