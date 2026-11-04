/**
 * GET /api/health: answers { "status": "ok" }. It proves functions build,
 * bundle, test and serve, and it is the pattern v1's functions follow when
 * they are ported: the modern Netlify format, in TypeScript, in a folder of
 * its own so its test sits beside it without being deployed as a function.
 */
import type { Config, Context } from "@netlify/functions";

export default async (_req: Request, _context: Context) =>
  Response.json(
    { status: "ok" },
    {
      headers: {
        "Cache-Control": "no-store",
        // netlify.toml's header rules don't apply to function responses, so
        // the preview-site noindex is set here too. Remove it at the
        // switch-over, with the X-Robots-Tag rule in netlify.toml.
        "X-Robots-Tag": "noindex",
      },
    },
  );

export const config: Config = {
  path: "/api/health",
  method: ["GET"],
};
