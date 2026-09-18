export type WallMaterial = {
  id: string;
  name: string;
  description: string;
  groupId: string;
  /** Anchor in the supplied SVG's 1200 × 900 viewBox. */
  anchor: readonly [number, number];
};

// Serializable content can later come from the admin panel.
export const wallMaterials: readonly WallMaterial[] = [
  { id: "timber", name: "Брусан хийц", description: "Бат бөх модон каркас", groupId: "timber-frame", anchor: [244, 202] },
  { id: "insulation", name: "Дулаалга", description: "Эрдэс хөвөн дулаалга", groupId: "insulation", anchor: [512, 239] },
  { id: "osb", name: "OSB хавтан", description: "Бүтээцийн хатуулаг хангах хавтан", groupId: "osb", anchor: [728, 217] },
  { id: "vapor", name: "Пароизоляци", description: "Дотор орчны чийгээс хамгаалах үе", groupId: "vapor-membrane", anchor: [875, 238] },
  // The supplied illustration combines vapor/weather protection in one group.
  { id: "wind", name: "Салхины хамгаалалт", description: "Гаднын салхи, чийгээс хамгаалах мембран", groupId: "vapor-membrane", anchor: [875, 470] },
  { id: "air", name: "Агаарын завсар", description: "Фасадын агаар сэлгэлтийн зай", groupId: "ventilation-battens", anchor: [981, 256] },
  { id: "facade", name: "Гадна фасад", description: "Цаг агаарт тэсвэртэй өнгөлгөө", groupId: "exterior-facade", anchor: [1084, 205] },
];
