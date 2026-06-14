"use client";

import GameHub from "@/components/GameHub";
import { getAgeRange } from "@/lib/gameConfig";

export default function MSLHub() {
  return <GameHub ageRange={getAgeRange("middle-school-lower")} />;
}
