import type { MetadataRoute } from "next";
import { getPublishedHouses } from "@/lib/public-houses";
import { getPublishedProjects } from "@/lib/public-projects";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://noyonhouse.mn";
  const routes = ["", "/houses", "/projects", "/technology", "/services", "/process", "/about", "/faq", "/news", "/contact", "/quote", "/privacy", "/terms"];
  const [houses, projects] = await Promise.all([getPublishedHouses(), getPublishedProjects()]);

  return [
    ...routes.map(url => ({ url: `${base}${url}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: url === "" ? 1 : .7 })),
    ...houses.map(house => ({ url: `${base}/houses/${house.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: .8 })),
    ...projects.map(project => ({ url: `${base}/projects/${project.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: .7 })),
  ];
}
