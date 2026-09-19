export type TechnologyCard = { title: string; description: string };

export type TechnologyContent = {
  eyebrow: string;
  title: string;
  copy: string;
  wallEyebrow: string;
  wallTitle: string;
  wallCopy: string;
  layers: string[];
  cards: TechnologyCard[];
};

const defaultCardDescription = "Тухайн хэсгийн шийдэл, материал, угсралтын дарааллыг ажлын зураг болон чанарын хяналтын баримттай уялдуулна.";

export const defaultTechnologyContent: TechnologyContent = {
  eyebrow: "Хийцийн зарчим",
  title: "Барилгын технологи",
  copy: "Техникийн үзүүлэлт бүрийг газрын нөхцөл, инженерийн тооцоо болон баталгаажсан материалд тулгуурлан төслөөр тодорхойлно.",
  wallEyebrow: "Ханын бүтэц",
  wallTitle: "Давхарга бүр өөрийн үүрэгтэй",
  wallCopy: "Дотор орчны чийгийн хяналтаас гадна орчны салхи, хур тунадасны хамгаалалт хүртэлх нэгдсэн систем. Доорх бүтэц нь тайлбарын дараалал бөгөөд бодит зузаан, марк төслөөр баталгаажна.",
  layers: ["Дотор өнгөлгөө", "Уурын хаалт", "OSB хавтан", "Дулаалгын материал", "Модон каркас", "Салхины хамгаалалт", "Гадна фасад"],
  cards: ["Талбайн бэлтгэл", "Суурь", "Модон каркас", "Дээврийн хийц", "Цонх ба хаалга", "Халаалт", "Агаар сэлгэлт", "Гадна өнгөлгөө", "Дотор өнгөлгөө", "Чанарын хяналт"].map(title => ({ title, description: defaultCardDescription })),
};

export function mergeTechnologyContent(value?: Partial<TechnologyContent> | null): TechnologyContent {
  return {
    ...defaultTechnologyContent,
    ...(value ?? {}),
    layers: value?.layers?.length ? value.layers : defaultTechnologyContent.layers,
    cards: value?.cards?.length ? value.cards : defaultTechnologyContent.cards,
  };
}
