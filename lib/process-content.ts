import { processSteps } from "@/lib/data";

export type ProcessStep = {
  id?: string;
  title: string;
  description: string;
};

export type ProcessContent = {
  eyebrow: string;
  title: string;
  copy: string;
  homeEyebrow: string;
  homeTitle: string;
  steps: ProcessStep[];
};

const defaultDescription = "Энэ үе шатанд шаардлагатай мэдээлэл, шийдвэр, баримт бичгийг нэгтгэн дараагийн ажлын суурийг бүрдүүлнэ.";

export const defaultProcessContent: ProcessContent = {
  eyebrow: "Ил тод дараалал",
  title: "Бид хэрхэн ажилладаг вэ?",
  copy: "Төслийн үе шат, хүлээгдэж буй үр дүн, шийдвэр бүрийг захиалагчтай хамт баталгаажуулна.",
  homeEyebrow: "Ажлын дараалал",
  homeTitle: "Санаанаас түлхүүр гардуулах хүртэл",
  steps: processSteps.map(title => ({ title, description: defaultDescription })),
};

export function mergeProcessContent(value?: Partial<ProcessContent> | null): ProcessContent {
  return {
    eyebrow: value?.eyebrow || defaultProcessContent.eyebrow,
    title: value?.title || defaultProcessContent.title,
    copy: value?.copy || defaultProcessContent.copy,
    homeEyebrow: value?.homeEyebrow || defaultProcessContent.homeEyebrow,
    homeTitle: value?.homeTitle || defaultProcessContent.homeTitle,
    steps: value?.steps?.length ? value.steps : defaultProcessContent.steps,
  };
}
