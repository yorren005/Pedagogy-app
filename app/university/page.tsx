"use client";

import GameHub from "@/components/GameHub";
import { getAgeRange } from "@/lib/gameConfig";

export default function UniHub() {
  return <GameHub ageRange={getAgeRange("university")} />;
}
