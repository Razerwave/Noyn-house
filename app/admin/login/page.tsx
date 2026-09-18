import { AdminLoginForm } from "@/components/admin-login-form";

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const requestedPath = (await searchParams).next;
  const nextPath = requestedPath?.startsWith("/admin") && !requestedPath.startsWith("//") ? requestedPath : "/admin";

  return <div className="login">
    <div className="login-visual"><div><h1>NOYON HOUSE</h1><p>Контент, төсөл, үнийн хүсэлтийн нэгдсэн удирдлага.</p></div></div>
    <div className="login-form-wrap"><AdminLoginForm nextPath={nextPath} /></div>
  </div>;
}
