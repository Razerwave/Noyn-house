import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import styles from "./material-section.module.css";

const layers = [
  { name: "Брус модон хийц", className: styles.timber },
  { name: "Дулаалга", className: styles.insulation },
  { name: "OSB хавтан", className: styles.osb },
  { name: "Уур, ус тусгаарлалт", className: styles.membrane },
  { name: "Гадна фасад", className: styles.facade },
];

export function MaterialSection() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.intro}>
          <div className={styles.eyebrow}>Канад технологи</div>
          <h2>Хийц ба<br />материал</h2>
          <p>Монголын эрс тэс уур амьсгалд зориулсан дулаан, бат бөх олон үе давхаргат ханын шийдэл.</p>
          <Link className={styles.link} href="/technology">Технологи дэлгэрэнгүй <ArrowRight size={16} /></Link>
        </div>

        <div className={styles.diagram} role="img" aria-label="Канад каркасан ханын үе давхаргын бүтэц">
          <div className={styles.studFrame} aria-hidden="true">
            <i /><i /><i /><i />
          </div>
          <div className={styles.layers}>
            {layers.map((layer, index) => (
              <div className={styles.layerRow} key={layer.name}>
                <div
                  className={`${styles.layer} ${layer.className}`}
                  style={{ "--layer-index": index } as CSSProperties}
                />
                <div className={styles.connector}><i /></div>
                <span>{layer.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.statement}>
          <span>Нарийвчлал<br />бол удаан<br />амьдралын<br />суурь.</span>
          <i />
          <small>Монгол орны<br />нөхцөлд зориулсан</small>
        </div>
      </div>
    </section>
  );
}
