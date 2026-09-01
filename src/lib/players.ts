import { handleFromDisplayName } from "./username";

export type CycleType = "monthly" | "weekly";

export type PlayerSeed = {
  displayName: string;
  username?: string;
  shortNote: string;
  webLink: string;
  profileImage: string;
  amountPaid: number;
  movement: number;
};

export const TOP_PLAYERS: PlayerSeed[] = [
  {
    displayName: "ApexPredator",
    username: "apexpredator",
    shortNote: "Consistency is the edge. Show up, ship, and climb — then do it again tomorrow.",
    webLink: "https://apexpredator.dev",
    profileImage: "/avatars/apex.jpg",
    amountPaid: 1250,
    movement: 0,
  },
  {
    displayName: "NovaStrike",
    shortNote: "Climb. Focus. Repeat. The board doesn't care how you feel, only where you finish.",
    webLink: "https://novastrike.io",
    profileImage: "/avatars/nova.jpg",
    amountPaid: 875,
    movement: 0,
  },
  {
    displayName: "GhostRider",
    shortNote: "Never back down. Quiet months still count if you keep stacking wins.",
    webLink: "https://ghostrider.dev",
    profileImage: "/avatars/ghost.jpg",
    amountPaid: 620,
    movement: 0,
  },
  {
    displayName: "CyberKnight",
    shortNote: "Eyes on the prize.",
    webLink: "https://cyberknight.dev",
    profileImage: "/avatars/cyber.jpg",
    amountPaid: 450,
    movement: 2,
  },
  {
    displayName: "LunaFlux",
    shortNote: "Building in silence. The work compounds long after the noise fades.",
    webLink: "https://lunaflux.io",
    profileImage: "/avatars/luna.jpg",
    amountPaid: 420,
    movement: -1,
  },
  {
    displayName: "CodeSamurai",
    shortNote: "Discipline over motivation — I show up even when the board is quiet.",
    webLink: "https://codesamurai.dev",
    profileImage: "/avatars/samurai.jpg",
    amountPaid: 390,
    movement: 3,
  },
  {
    displayName: "PixelQueen",
    shortNote: "Design. Build. Inspire.",
    webLink: "https://pixelqueen.co",
    profileImage: "/avatars/pixel.jpg",
    amountPaid: 360,
    movement: -2,
  },
  {
    displayName: "AlphaWolf",
    shortNote: "Lead. Don't follow.",
    webLink: "https://alphawolf.dev",
    profileImage: "/avatars/alpha.jpg",
    amountPaid: 310,
    movement: 1,
  },
  {
    displayName: "DevTitan",
    shortNote: "Titan mindset.",
    webLink: "https://devtitan.io",
    profileImage: "/avatars/titan.jpg",
    amountPaid: 280,
    movement: -1,
  },
  {
    displayName: "NeonNinja",
    shortNote: "Speed. Focus. Win.",
    webLink: "https://neonninja.dev",
    profileImage: "/avatars/neon.jpg",
    amountPaid: 260,
    movement: 4,
  },
  {
    displayName: "ShadowByte",
    shortNote: "In the shadows, we rise.",
    webLink: "https://shadowbyte.io",
    profileImage: "/avatars/shadow.jpg",
    amountPaid: 240,
    movement: -2,
  },
  {
    displayName: "ByteBunny",
    shortNote: "Small steps, big climbs.",
    webLink: "https://bytebunny.dev",
    profileImage: "/avatars/bunny.jpg",
    amountPaid: 220,
    movement: 2,
  },
  {
    displayName: "IronFist",
    shortNote: "Strength in action.",
    webLink: "https://ironfist.dev",
    profileImage: "/avatars/iron.jpg",
    amountPaid: 200,
    movement: -1,
  },
];

const FILLER_NAMES = [
  "StormHex", "VoidWalker", "GoldRush", "NightOwl", "QuantumLeap",
  "EmberFox", "SilkRoad", "AetherKing", "FrostBite", "PulseWave",
  "DarkMatter", "SolarFlare", "CryptoWolf", "Nimbus", "Ironclad",
  "Vesper", "KiteRunner", "Obsidian", "Lumen", "RazorEdge",
  "Cobalt", "Mythos", "DriftKing", "EchoPark", "FalconEye",
  "Gravity", "Helix", "IonStorm", "JadeFist", "KarmaBit",
  "Larkspur", "MonoChrome", "NovaCore", "Orbit", "Phantom",
  "Quasar", "Redline", "Sable", "Torque", "Umbra",
  "Vector", "Warden", "Xenon", "Yellowjacket", "Zenith",
  "ArcLight", "Blackout", "Circuit", "Dagger", "Eclipse",
  "Forge", "Glitch", "Havoc", "Inferno", "Jolt",
  "Knuckle", "Lynx", "Mosaic",
];

const FILLER_NOTES = [
  "Serial builder, eternal learner.",
  "Shipping fast, breaking nothing.",
  "Data-driven. Prize-hungry.",
  "One more rank. Always.",
  "Quiet grind. Loud results.",
  "Built different.",
  "Focus is a superpower.",
  "Win the week. Repeat.",
  "Precision over hype.",
  "Climb or get climbed.",
];

const AVATARS = [
  "/avatars/cyber.jpg",
  "/avatars/luna.jpg",
  "/avatars/samurai.jpg",
  "/avatars/pixel.jpg",
  "/avatars/alpha.jpg",
  "/avatars/titan.jpg",
  "/avatars/neon.jpg",
  "/avatars/ghost.jpg",
  "/avatars/nova.jpg",
  "/avatars/apex.jpg",
  "/avatars/shadow.jpg",
  "/avatars/bunny.jpg",
  "/avatars/iron.jpg",
  "/avatars/alex.jpg",
];

export function buildSeedPlayers(): PlayerSeed[] {
  const rest: PlayerSeed[] = FILLER_NAMES.map((name, i) => {
    const amount = Math.max(20, 195 - i * 3 - ((i * 7) % 5));
    const moveCycle = [1, -1, 2, -2, 3, 1, -1, 4, -3, 2];
    return {
      displayName: name,
      username: handleFromDisplayName(name),
      shortNote: FILLER_NOTES[i % FILLER_NOTES.length],
      webLink: `https://${name.toLowerCase()}.dev`,
      profileImage: AVATARS[i % AVATARS.length],
      amountPaid: amount,
      movement: moveCycle[i % moveCycle.length],
    };
  });
  return [...TOP_PLAYERS, ...rest].slice(0, 70).map((p) => ({
    ...p,
    username: p.username || handleFromDisplayName(p.displayName),
  }));
}

export const DEFAULT_PRIZES = [
  { position: 1, tier: "gold", label: "1st Place", amount: 1000, cycleType: "monthly" as const },
  { position: 2, tier: "silver", label: "2nd Place", amount: 500, cycleType: "monthly" as const },
  { position: 3, tier: "bronze", label: "3rd Place", amount: 250, cycleType: "monthly" as const },
  { position: 1, tier: "gold", label: "1st Place Only", amount: 100, cycleType: "weekly" as const },
];
