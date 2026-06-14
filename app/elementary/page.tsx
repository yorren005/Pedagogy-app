"use client";

import GameHub from "@/components/GameHub";
import { getAgeRange } from "@/lib/gameConfig";

export default function ElementaryHub() {
  return <GameHub ageRange={getAgeRange("elementary")} />;
}
