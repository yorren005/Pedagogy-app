"use client";

import GameHub from "@/components/GameHub";
import { getAgeRange } from "@/lib/gameConfig";

export default function MSUHub() {
  return <GameHub ageRange={getAgeRange("middle-school-upper")} />;
}
