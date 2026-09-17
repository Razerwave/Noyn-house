import { AdminProcessEditor } from "@/components/admin-process-editor";
import { AdminShell } from "@/components/admin-shell";
import { defaultProcessContent } from "@/lib/process-content";

export default function ProcessContentAdmin() {
  return <div className="admin-body"><AdminShell><AdminProcessEditor initialContent={defaultProcessContent} /></AdminShell></div>;
}
