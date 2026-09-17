import Link from "next/link";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className={`logo ${inverse ? "logo-inverse" : ""}`} aria-label="NOYON HOUSE нүүр">
      <span className="logo-mark" aria-hidden="true"><i /><i /><i /></span>
      <span><b>NOYON HOUSE</b><small>КАНАД ТЕХНОЛОГИ · МОНГОЛ АХУЙ</small></span>
    </Link>
  );
}
