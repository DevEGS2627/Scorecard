# EGS Quiz Arena

Static live scoreboard for the EGS annual inter-school quiz. The website runs without a build step. For a single device it saves scores in that browser. To share a scoreboard across devices, connect a dedicated Supabase project (steps below).

## Cross-device setup (one-time)

1. Create a **new, dedicated Supabase project** for this quiz. Do not reuse a project that stores unrelated data. Save the database password privately; the site does not need it.
2. In Supabase **Project Settings → API**, copy the **Project URL** and **publishable key**. A publishable key is designed for use in a browser; never use or share a secret/service-role key.
3. In Supabase **SQL Editor**, run `supabase/schema.sql` from this repository. It creates the scoreboard table with public read-only access and signed-in judge writes, enables live updates, and creates a public logo bucket where only signed-in users can upload. Team names and logo URLs are shared through the database; logo files live in Storage.
4. In **Authentication → Users**, create the judge account. Keep public sign-ups disabled so only accounts you explicitly add can edit. Use a strong password and share it only with the judge.
5. Set the Project URL and publishable key in `supabase-config.js` (this copy is already configured for EGS-Quizit). These two values are safe to publish when the database policies above are installed.
6. Host the `outputs` folder using GitHub Pages, Netlify, or Cloudflare Pages. The site must be opened through its hosted HTTPS address; opening `index.html` as a local file cannot sync across devices.
7. Open the hosted link on the projector and other devices. Viewers see live scores; the judge signs in to award marks or edit setup. All devices need internet access.

For the quickest workflow, after step 1 send the project URL (or project reference) here, plus the GitHub repository URL you want to use. Do not send the database password or any secret/service-role key. I can then complete the schema, public-key configuration, and repository push. If you prefer, you can follow steps 2–5 yourself and send only the URL and publishable key.

## Local preview

Open `index.html` in a modern browser. With blank Supabase settings, data is saved on that device only.

## Deployment through GitHub Pages

Push the contents of this folder to a GitHub repository. In that repository, open **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/(root)`, then save. GitHub Pages will publish the site and assets.

## Notes

- The judge should be the only authenticated account in this dedicated project. Every signed-in account can edit the scoreboard by design.
- Public viewers can read the scoreboard and team logos. Do not enter private personal information.
- Current synchronization stores scoreboard data in one JSON row; logo files are stored separately in Supabase Storage so they can be shared without filling browser storage.
