import Image from "next/image";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  copy: string;
  image?: string;
  imagePosition?: string;
};

export function PageHero({
  eyebrow,
  title,
  copy,
  image,
  imagePosition = "center",
}: PageHeroProps) {
  if (!image) {
    return (
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{copy}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-hero page-hero-banner">
      <div className="page-hero-media" aria-hidden="true">
        <Image
          src={image}
          alt=""
          fill
          sizes="100vw"
          loading="eager"
          style={{ objectPosition: imagePosition }}
        />
      </div>
      <div className="page-hero-overlay" />
      <div className="container page-hero-content">
        <div className="page-hero-copy">
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{copy}</p>
        </div>
      </div>
    </section>
  );
}
