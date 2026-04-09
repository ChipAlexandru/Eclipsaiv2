// /skills/[slug] — per-skill detail page.
// Server component: generateStaticParams pre-renders all slugs at build time,
// generateMetadata gives each skill its own OG title/description so LinkedIn +
// Slack previews get real content instead of a generic site title.
// Rendering delegates to the client-side SkillDetailView (it has a CopyBtn
// that uses navigator.clipboard + local useState).
import { notFound } from "next/navigation";
import { getSkillBySlug, getAllSlugs } from "../../../src/marketplace/data.js";
import { SkillDetailView } from "../../../src/marketplace/SkillDetailView.jsx";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) {
    return { title: "Skill not found — Eclipsai" };
  }
  return {
    title: `${skill.name} — Eclipsai`,
    description: skill.description,
  };
}

export default async function SkillDetailPage({ params }) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) notFound();
  return <SkillDetailView skill={skill} />;
}
