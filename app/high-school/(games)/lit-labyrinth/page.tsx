"use client";

import GameLevelHub from "@/components/GameLevelHub";
import { getGameConfig } from "@/lib/gameConfig";

export default function GameHubPage() {
  const game = getGameConfig("litLabyrinth");
  if (!game) return <div>Game not found</div>;
  return <GameLevelHub game={game} ageRange="high-school" />;
}
