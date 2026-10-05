// Sends a push to every subscribed phone (except the person who added the bill).
// Triggered by a Supabase Database Webhook on INSERT into public.bills.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") ?? "mailto:erp@heerugroup.in",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

Deno.serve(async (req) => {
  const { record } = await req.json();
  if (!record) return new Response("no record", { status: 400 });
  const items = (record.items ?? []).map((i: any) => `${i.qty}x ${i.name}`).join(", ");
  const payload = JSON.stringify({
    title: `Bill #${record.no} · ₹${record.total}`,
    body: `${items}${record.by_person ? " — by " + record.by_person : ""}`,
    tag: `bill-${record.no}`,
  });
  const { data: subs } = await sb.from("push_subscriptions").select("*");
  await Promise.all((subs ?? [])
    .filter((s) => !record.by_person || s.person !== record.by_person)
    .map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
      } catch (e: any) {
        if (e.statusCode === 404 || e.statusCode === 410) await sb.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      }
    }));
  return new Response("ok");
});
