# NOYON HOUSE

Монгол орны нөхцөлд тохируулсан timber-frame хаусын public сайт, үнийн саналын урсгал, Supabase-backed admin системийн Next.js суурь.

## Ажиллуулах

```bash
npm install
cp .env.example .env.local
npm run dev
```

`http://localhost:3000` — public сайт  
`http://localhost:3000/admin/login` — admin нэвтрэх

## Backend тохиргоо

1. Supabase төсөл үүсгээд `supabase/schema.sql`-ийг SQL Editor дээр ажиллуулна.
2. `.env.local`-д Supabase URL, anon key, service role key-г тохируулна.
3. Supabase Auth дээр admin хэрэглэгч үүсгээд `roles`, `profiles` хүснэгтэд эрх холбоно.
4. Resend эсвэл SMTP provider-ийн түлхүүрийг notification service-д холбоно.

Supabase тохиргоогүй development горимд үнийн хүсэлт `data/enquiries.ndjson` файлд хадгалагдана. Production горимд Supabase заавал шаардлагатай.

## Шалгалт

```bash
npm run build
npm audit
```
