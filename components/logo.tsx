import Link from "next/link";
import Image from "next/image";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className={`logo ${inverse ? "logo-inverse" : ""}`} aria-label="NOYON HOUSE нүүр">
      <Image className="logo-image" src="/images/LOGO.png" alt="NOYON House construction" width={200} height={100} priority />
    </Link>
  );
}
