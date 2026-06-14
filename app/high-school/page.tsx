"use client";

import GameHub from "@/components/GameHub";
import { getAgeRange } from "@/lib/gameConfig";

export default function HSHub() {
  return <GameHub ageRange={getAgeRange("high-school")} />;
}
