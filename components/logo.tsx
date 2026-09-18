import Link from "next/link";
import Image from "next/image";

export function Logo({ inverse = false, header = false }: { inverse?: boolean; header?: boolean }) {
  return (
    <Link href="/" className={`logo ${inverse ? "logo-inverse" : ""}`} aria-label="Ноён хаус нүүр хуудас">
      <Image className="logo-image" src={inverse || header ? "/images/LOGO.png" : "/images/NoyonHouse2.png"} alt="Ноён хаус construction" width={200} height={100} priority />
    </Link>
  );
}
