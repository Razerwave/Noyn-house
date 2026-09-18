type AdminImageTooltipProps = {
  src: string;
  alt: string;
};

export function AdminImageTooltip({ src, alt }: AdminImageTooltipProps) {
  return <span className="admin-image-tooltip" tabIndex={0} aria-label={`${alt} зургийг томруулж харах`}>
    <img src={src} alt="" width="70" height="45" className="admin-thumb" />
    <span className="admin-image-tooltip-preview" role="tooltip">
      <img src={src} alt={alt} />
    </span>
  </span>;
}
