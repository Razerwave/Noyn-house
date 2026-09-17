import { ModelGrid } from "@/components/model-grid";
import { PageHero } from "@/components/page-hero";
import { getPublishedHouses } from "@/lib/public-houses";

export const metadata = { title: "Хаусын загварууд" };
export const dynamic = "force-dynamic";

export default async function HousesPage() {
  const houses = await getPublishedHouses();
  return <><PageHero eyebrow="Загварын каталог" title="Хаусын загварууд" copy="Талбай, өрөөний тоо, амьдралын хэв маягтаа нийцэх эхлэл загварыг сонгоод өөрийн газрын нөхцөлд тохируулна уу."/><section className="section soft"><div className="container">{houses.length > 0 ? <ModelGrid models={houses}/> : <div className="empty-state"><h2>Нийтэлсэн загвар одоогоор алга</h2><p>Админ хэсгээс хаусын загварын төлөвийг “Нийтлэх” гэж сонгоход энд харагдана.</p></div>}</div></section></>;
}
