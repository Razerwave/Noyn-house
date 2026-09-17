import Link from "next/link";
import Image from "next/image";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className={`logo ${inverse ? "logo-inverse" : ""}`} aria-label="NOYON HOUSE нүүр">
      <Image className="logo-image" src="/images/NoyonHouse.jpg" alt="NOYON House construction" width={190} height={64} priority style={{ objectFit: "cover" }} />
    </Link>
  );
}
