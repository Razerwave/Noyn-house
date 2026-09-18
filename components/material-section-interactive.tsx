"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { wallMaterials, type WallMaterial } from "@/lib/materials";
import styles from "./material-section.module.css";

const illustrationAlt = "Модон каркас, дулаалга, OSB хавтан, хамгаалалтын мембран, агаарын завсар ба гадна фасадын задаргаат зураг";
type Connector = { x: number; y: number; endX: number; endY: number };

export function MaterialSectionInteractive({ materials = wallMaterials, illustrationMarkup, illustrationSrc }: {
  materials?: readonly WallMaterial[];
  illustrationMarkup?: string;
  illustrationSrc?: string;
}) {
  const id = useId();
  const layout = useRef<HTMLDivElement>(null);
  const drawing = useRef<HTMLDivElement>(null);
  const controls = useRef<(HTMLButtonElement | null)[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [desktop, setDesktop] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const activeId = desktop ? hovered ?? focused ?? expanded : expanded;
  const active = materials.find(material => material.id === activeId);

  useEffect(() => {
    const screen = window.matchMedia("(min-width: 901px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setDesktop(screen.matches);
      setReducedMotion(motion.matches);
    };
    update();
    screen.addEventListener("change", update);
    motion.addEventListener("change", update);
    return () => {
      screen.removeEventListener("change", update);
      motion.removeEventListener("change", update);
    };
  }, []);

  const measure = useCallback(() => {
    if (!layout.current || !drawing.current) return;
    const box = layout.current.getBoundingClientRect();
    const image = drawing.current.getBoundingClientRect();
    setConnectors(materials.map((material, index) => {
      const button = controls.current[index]?.getBoundingClientRect();
      return {
        x: image.left - box.left + material.anchor[0] / 1200 * image.width,
        y: image.top - box.top + material.anchor[1] / 900 * image.height,
        endX: (button?.left ?? image.right) - box.left - 8,
        endY: (button ? button.top + button.height / 2 : image.top) - box.top,
      };
    }));
  }, [materials]);

  useEffect(() => {
    const observer = new ResizeObserver(measure);
    if (layout.current) observer.observe(layout.current);
    if (drawing.current) observer.observe(drawing.current);
    measure();
    return () => observer.disconnect();
  }, [measure, desktop]);

  // The server supplies only the checked-in SVG, never admin-provided markup.
  // Inline rendering lets the original groups respond without an SVG loader.
  useEffect(() => {
    const svg = drawing.current?.querySelector("svg");
    if (!svg) return;
    const scale = 1200 / (drawing.current?.getBoundingClientRect().width || 1200);
    for (const groupId of new Set(materials.map(material => material.groupId))) {
      const group = Array.from(svg.querySelectorAll<SVGElement>("g[id]")).find(group => group.id === groupId);
      if (!group) continue;
      const selected = active?.groupId === groupId;
      group.style.transition = reducedMotion ? "none" : "opacity 180ms ease, filter 180ms ease, translate 180ms ease";
      group.style.opacity = active && !selected ? "0.55" : "1";
      group.style.filter = selected ? "url(#softShadow) brightness(1.2)" : "url(#softShadow)";
      group.style.translate = selected && !reducedMotion ? `${6 * scale}px 0` : "0 0";
    }
    const anchors = svg.querySelector<SVGElement>("#label-anchors");
    if (anchors) anchors.style.opacity = active ? "0.45" : "1";
  }, [active, materials, reducedMotion, connectors]);

  return (
    <section className={styles.section} aria-labelledby={`${id}-title`}>
      <div className={`container ${styles.inner} ${illustrationSrc ? styles.imageMode : ""}`} ref={layout}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>TECHNOLOGY</span>
          <h2 id={`${id}-title`}>ХИЙЦ БА<br />МАТЕРИАЛ</h2>
          <p>Канадын батлагдсан модон каркас технологийг Монголын эрс тэс уур амьсгалд тохируулан ашиглана.</p>
          <Link className={styles.link} href="/technology">Технологи дэлгэрэнгүй <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>

        <div className={styles.diagram}>
          <div
            ref={drawing}
            className={styles.drawing}
            role="img"
            aria-label={illustrationAlt}
          >
            {illustrationSrc ? <img src={illustrationSrc} alt={illustrationAlt} /> : <div dangerouslySetInnerHTML={{ __html: illustrationMarkup ?? "" }} />}
          </div>
        </div>

        <svg className={styles.connectors} aria-hidden="true" focusable="false">
          {connectors.map((line, index) => {
            const selected = materials[index].id === activeId;
            const x = line.x + (selected && !reducedMotion ? 6 : 0);
            return <g key={materials[index].id} className={selected ? styles.selectedLine : undefined}>
              <path d={`M ${x} ${line.y} L ${line.endX - 16} ${line.endY} H ${line.endX}`} />
              <circle cx={x} cy={line.y} r={selected ? 4 : 3} />
            </g>;
          })}
        </svg>

        <ol className={styles.materials} aria-label="Ханын материалууд">
          {materials.map((material, index) => {
            const open = material.id === activeId;
            return (
              <li key={material.id} className={styles.material} data-active={open}
                onMouseEnter={() => { if (desktop) { setFocused(null); setHovered(material.id); } }}
                onMouseLeave={() => setHovered(null)}>
                <button
                  ref={element => { controls.current[index] = element; }}
                  type="button"
                  id={`${id}-${material.id}-control`}
                  aria-expanded={open}
                  aria-controls={`${id}-${material.id}-description`}
                  onFocus={() => { setHovered(null); setFocused(material.id); }}
                  onBlur={() => setFocused(null)}
                  onClick={() => setExpanded(current => current === material.id ? null : material.id)}
                  onKeyDown={event => {
                    if (event.key === "Escape") { setExpanded(null); setHovered(null); setFocused(null); }
                    const next = event.key === "ArrowDown" ? (index + 1) % materials.length
                      : event.key === "ArrowUp" ? (index + materials.length - 1) % materials.length
                      : event.key === "Home" ? 0 : event.key === "End" ? materials.length - 1 : null;
                    if (next !== null) { event.preventDefault(); controls.current[next]?.focus(); }
                  }}
                >
                  <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                  <span>{material.name}</span>
                  <Plus className={styles.plus} size={17} aria-hidden="true" />
                </button>
                <div id={`${id}-${material.id}-description`} className={styles.description}
                  role="region" aria-labelledby={`${id}-${material.id}-control`} hidden={!open}>
                  {material.description}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
