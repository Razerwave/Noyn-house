export type FeaturedProject = {
  enabled: boolean;
  eyebrow: string;
  title: string;
  description: string;
  benefits: string[];
  videoUrl: string;
  mobileVideoUrl: string;
  posterUrl: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  relatedProject: string;
  startsAt: string;
  endsAt: string;
  displayOrder: number;
  status: "draft" | "published";
};

export const defaultFeaturedProject: FeaturedProject = {
  enabled: true,
  eyebrow: "ОНЦЛОХ ТӨСӨЛ",
  title: "Сонгино хотхон",
  description: "Тав тухтай амьдралд зориулсан, инженерийн шийдэл бүрэн амины орон сууц",
  benefits: ["Айл бүр 500 м² газартай", "Цэвэр, бохир болон халаалтын шийдэлтэй", "Уян хатан төлбөрийн нөхцөл"],
  videoUrl: "",
  mobileVideoUrl: "",
  posterUrl: "/images/hero-house.png",
  primaryLabel: "Төсөлтэй танилцах",
  primaryHref: "/projects",
  secondaryLabel: "Үнийн санал авах",
  secondaryHref: "/quote",
  relatedProject: "",
  startsAt: "",
  endsAt: "",
  displayOrder: 0,
  status: "published",
};

export function mergeFeaturedProject(value?: Partial<FeaturedProject> | null): FeaturedProject {
  const merged = { ...defaultFeaturedProject, ...(value ?? {}) };
  return {
    ...merged,
    benefits: Array.isArray(merged.benefits) ? merged.benefits.filter(Boolean).slice(0, 6) : defaultFeaturedProject.benefits,
  };
}

export function isFeaturedProjectLive(project: FeaturedProject, now = new Date()) {
  if (!project.enabled || project.status !== "published") return false;
  const current = now.getTime();
  const startsAt = project.startsAt ? new Date(project.startsAt).getTime() : Number.NEGATIVE_INFINITY;
  const endsAt = project.endsAt ? new Date(project.endsAt).getTime() : Number.POSITIVE_INFINITY;
  return Number.isFinite(startsAt) ? current >= startsAt && current <= endsAt : current <= endsAt;
}
