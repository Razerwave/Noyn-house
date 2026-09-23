import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_USER_ID_HEADER = "x-noyon-admin-user-id";

export async function proxy(request:NextRequest){
  const isAdminApi=request.nextUrl.pathname.startsWith('/api/admin/');
  if(request.nextUrl.pathname==='/admin/login'||request.nextUrl.pathname==='/api/admin/local-login')return NextResponse.next();
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key){
    if(process.env.NODE_ENV !== "production" && request.cookies.get("noyon_admin_session")?.value === "authenticated") return NextResponse.next();
    if(isAdminApi)return NextResponse.json({error:'Нэвтрэх эрх шаардлагатай.'},{status:401});
    const login=request.nextUrl.clone();login.pathname='/admin/login';return NextResponse.redirect(login);
  }
  const requestHeaders=new Headers(request.headers);
  requestHeaders.delete(ADMIN_USER_ID_HEADER);
  const refreshedCookies:{name:string;value:string;options:CookieOptions}[]=[];
  const supabase=createServerClient(url,key,{cookies:{getAll(){return request.cookies.getAll()},setAll(cookies:{name:string;value:string;options:CookieOptions}[]){cookies.forEach(({name,value})=>request.cookies.set(name,value));refreshedCookies.push(...cookies)}}});
  const {data,error}=await supabase.auth.getClaims();
  if(error||!data?.claims?.sub){
    if(isAdminApi)return NextResponse.json({error:'Нэвтрэх эрх шаардлагатай.'},{status:401});
    const login=request.nextUrl.clone();login.pathname='/admin/login';return NextResponse.redirect(login);
  }
  requestHeaders.set(ADMIN_USER_ID_HEADER,data.claims.sub);
  const response=NextResponse.next({request:{headers:requestHeaders}});
  refreshedCookies.forEach(({name,value,options})=>response.cookies.set(name,value,options));
  return response;
}
export const config={matcher:['/admin/:path*','/api/admin/:path*']};
