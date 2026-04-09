// Marketplace data adapter.
//
// All skill data lives in data-full.js (verbatim copy of the old repo).
// Components read from this module, never directly from data-full.js, so that
// a future per-skill file split only changes this adapter.
//
// The adapter does three things:
//   1. Re-exports SKILLS for card-level consumers (SkillCard, filters).
//   2. Provides getSkills() sorted by rating DESC (installs are 0 across the
//      snapshot; the old repo's install-first sort collapses to rating-first).
//   3. Provides getSkillBySlug() for /skills/[slug] detail page lookups.

import { SKILLS as FULL_SKILLS } from "./data-full.js";

export const SKILLS = FULL_SKILLS;

export function getSkills() {
  return [...FULL_SKILLS].sort((a, b) => (b.rating || 0) - (a.rating || 0));
}

export function getSkillBySlug(slug) {
  return FULL_SKILLS.find((s) => s.slug === slug) || null;
}

export function getAllSlugs() {
  return FULL_SKILLS.map((s) => s.slug);
}
