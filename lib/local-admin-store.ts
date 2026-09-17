import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function readLocalRecords<T>(fileName: string): Promise<T[]> {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "data", fileName), "utf8")) as T[];
  } catch {
    return [];
  }
}

export async function writeLocalRecords<T>(fileName: string, records: T[]) {
  const dir = path.join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), JSON.stringify(records, null, 2), "utf8");
}
