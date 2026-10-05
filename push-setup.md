# Push notification setup (one time)

1. Generate keys: `npx web-push generate-vapid-keys`
2. Paste the **public** key into `window.VAPID_PUBLIC_KEY` in `config.js`.
3. Supabase → SQL Editor: run the "PUSH NOTIFICATIONS" block at the bottom of `supabase-setup.sql`.
4. Deploy the function and set secrets:
   ```
   supabase functions deploy notify-bill --no-verify-jwt
   supabase secrets set VAPID_PUBLIC_KEY=<public> VAPID_PRIVATE_KEY=<private>
   ```
5. Supabase → Database → Webhooks → Create: table `bills`, event `Insert`, type "Supabase Edge Functions", function `notify-bill`.
6. On each phone: open the app → Menu tab → "Notify me when a coffee is added". (iPhone: first Add to Home Screen.)

The person who adds a bill is not notified of their own bill (matched by the name set on that phone).
