import "server-only";

import { revalidatePath } from "next/cache";

export function revalidateArticlePages() {
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/news/[slug]", "page");
}

export function revalidateHousePages() {
  revalidatePath("/");
  revalidatePath("/houses");
  revalidatePath("/houses/[slug]", "page");
  revalidatePath("/quote");
}

export function revalidateProjectPages() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/projects");
  revalidatePath("/projects/[slug]", "page");
}

export function revalidateProcessPages() {
  revalidatePath("/");
  revalidatePath("/process");
}

export function revalidateSiteContentPages() {
  revalidatePath("/");
  revalidatePath("/faq");
  revalidatePath("/services");
}
