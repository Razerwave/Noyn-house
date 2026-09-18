export type SiteSettings = {
  companyName: string;
  phone: string;
  phone2: string;
  email: string;
  businessHours: string;
  address: string;
  siteTitle: string;
  siteDescription: string;
};

export const defaultSiteSettings: SiteSettings = {
  companyName: "Ноён Хаус",
  phone: "+976 99596060",
  phone2: "",
  email: "noyonhouse2020@gmail.com",
  businessHours: "Даваа–Баасан, 09:00–18:00",
  address: "Улаанбаатар, Монгол",
  siteTitle: "Ноён хаус — Канад технологийн хаус",
  siteDescription: "Монгол орны уур амьсгалд тохируулсан Канад модон каркасан хаусын зураг төсөл, барилга угсралт.",
};

export function mergeSiteSettings(value?: Partial<SiteSettings> | null): SiteSettings {
  const settings = { ...defaultSiteSettings, ...(value ?? {}) };
  const phone2 = settings.phone2.trim();
  return {
    ...settings,
    phone2: phone2 ? (phone2.startsWith("+976") ? phone2 : phone2.startsWith("976") ? `+${phone2}` : `+976 ${phone2}`) : "",
  };
}
