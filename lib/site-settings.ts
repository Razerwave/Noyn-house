export type SiteSettings = {
  companyName: string;
  phone: string;
  email: string;
  businessHours: string;
  address: string;
  siteTitle: string;
  siteDescription: string;
};

export const defaultSiteSettings: SiteSettings = {
  companyName: "Ноён Хаус",
  phone: "+976 99596060",
  email: "noyonhouse2020@gmail.com",
  businessHours: "Даваа–Баасан, 09:00–18:00",
  address: "Улаанбаатар, Монгол",
  siteTitle: "Ноён хаус — Канад технологийн хаус",
  siteDescription: "Монгол орны уур амьсгалд тохируулсан Канад модон каркасан хаусын зураг төсөл, барилга угсралт.",
};

export function mergeSiteSettings(value?: Partial<SiteSettings> | null): SiteSettings {
  return { ...defaultSiteSettings, ...(value ?? {}) };
}
