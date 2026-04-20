export type Rarity = "common" | "rare" | "epic" | "legendary" | "super_rare";

export const rarityLabel: Record<Rarity, string> = {
  common: "Widespread",
  rare: "Elusive",
  epic: "Specimen",
  legendary: "Rare",
  super_rare: "Super Rare",
};

export const rarityOrder: Rarity[] = ["common", "rare", "epic", "legendary", "super_rare"];

export const raritySectionInfo: Record<Rarity, { title: string; subtitle: string; bgClass: string; textClass: string }> = {
  common: {
    title: "Widespread",
    subtitle: "The fish you'll find in every pond and river",
    bgClass: "bg-[hsl(200,15%,50%)]/20 border-[hsl(200,15%,50%)]/40",
    textClass: "text-[hsl(200,15%,70%)]",
  },
  rare: {
    title: "Elusive",
    subtitle: "Harder to spot -- you need skill to land these",
    bgClass: "bg-[hsl(210,75%,55%)]/20 border-[hsl(210,75%,55%)]/40",
    textClass: "text-[hsl(210,75%,70%)]",
  },
  epic: {
    title: "Specimen",
    subtitle: "The big ones that make your arms ache",
    bgClass: "bg-[hsl(42,90%,55%)]/20 border-[hsl(42,90%,55%)]/40",
    textClass: "text-[hsl(42,90%,65%)]",
  },
  legendary: {
    title: "Rare",
    subtitle: "Most anglers will never see one of these",
    bgClass: "bg-[hsl(280,65%,58%)]/20 border-[hsl(280,65%,58%)]/40",
    textClass: "text-[hsl(280,65%,72%)]",
  },
  super_rare: {
    title: "Super Rare",
    subtitle: "Legendary catches -- only the luckiest find these",
    bgClass: "bg-[hsl(0,85%,60%)]/20 border-[hsl(0,85%,60%)]/40",
    textClass: "text-[hsl(0,85%,72%)]",
  },
};
