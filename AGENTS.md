<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Sabina (AI assistant) lives in `src/components/sabina/` (UI, CSS, offline brain, voice) and `src/server/ai/sabina.server.ts` (prompt + gateway calls) behind `/api/public/sabina-chat` and `/api/public/sabina-tts`; it is mounted once in `__root.tsx`. Why: one self-contained module mirrors the Olga "Shams" assistant and keeps AI keys server-side.
- Sabina's body is two filmed green-screen loops in `public/sabina/` (idle + talk, same framing and figure scale) keyed live with WebGL in `SabinaLive.tsx`; the talk loop fades in and speeds up with her voice level. The older pose images stay as the fallback when WebGL/video fails or motion is reduced. Why: real footage is the only way to get natural breathing, blinking and lip/teeth motion, and the fallback keeps her visible everywhere.
- Sabina's chat must always fall back to the built-in brain (`sabina-brain.ts`) when the live AI fails, and the brain must route emergencies to 911 (covered by `src/test/sabina-brain.test.ts`). Why: visitors always get a safe answer.
