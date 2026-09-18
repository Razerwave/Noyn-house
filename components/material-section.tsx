import { readFile } from "node:fs/promises";
import path from "node:path";
import { MaterialSectionInteractive } from "./material-section-interactive";
import type { WallMaterial } from "@/lib/materials";

export async function MaterialSection({ materials }: { materials?: readonly WallMaterial[] }) {
  // Trusted local asset only. Do not replace this with user-supplied SVG markup.
  const svg = await readFile(path.join(process.cwd(), "public/images/noyon-house-wall-assembly.svg"), "utf8");
  return <MaterialSectionInteractive materials={materials} illustrationMarkup={svg.replace(/<\?xml[^>]*\?>\s*/, "")} />;
}
