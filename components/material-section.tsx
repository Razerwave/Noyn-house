import { MaterialSectionInteractive } from "./material-section-interactive";
import type { WallMaterial } from "@/lib/materials";

export async function MaterialSection({ materials }: { materials?: readonly WallMaterial[] }) {
  return <MaterialSectionInteractive materials={materials} illustrationSrc="/images/karkaz1.png" />;
}
