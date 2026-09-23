import Image from "next/image";

type AdminImageTooltipProps = {
  src: string;
  alt: string;
};

export function AdminImageTooltip({ src, alt }: AdminImageTooltipProps) {
  return <span className="admin-image-tooltip" tabIndex={0} aria-label={`${alt} зургийг томруулж харах`}>
    <Image src={src} alt="" width={70} height={45} sizes="70px" className="admin-thumb" />
    <span className="admin-image-tooltip-preview" role="tooltip">
      <Image src={src} alt={alt} fill sizes="280px" />
    </span>
  </span>;
}
