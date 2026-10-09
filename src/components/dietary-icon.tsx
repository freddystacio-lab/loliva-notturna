import {Flame, Leaf, Sprout, WheatOff} from "lucide-react";
import type {DietaryTag} from "@/data/menu";

const icons = {vegetarian: Leaf, vegan: Sprout, glutenFree: WheatOff, spicy: Flame};
export function DietaryIcon({tag, label}: {tag: DietaryTag; label: string}) {
  const Icon = icons[tag];
  return <span title={label} aria-label={label} className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)]"><Icon aria-hidden="true" size={14} /></span>;
}
