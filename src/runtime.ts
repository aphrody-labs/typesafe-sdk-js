/** Runtime detection for browser guards and request headers. */

interface RuntimeGlobals {
  window?: { document?: unknown };
  navigator?: { userAgent?: string };
  process?: { versions?: Record<string, string | undefined>; platform?: string; arch?: string };
  Deno?: { version?: { deno?: string } };
  Bun?: { version?: string };
  EdgeRuntime?: unknown;
}

const g = globalThis as RuntimeGlobals;

/** Whether browser page globals are present. */
export const isBrowser = (globals: RuntimeGlobals = g): boolean =>
  typeof globals.window !== "undefined" &&
  typeof globals.window.document !== "undefined" &&
  typeof globals.navigator !== "undefined";

/** Runtime name, version, and platform for the `X-TypeSafe-Runtime` header. */
export const describeRuntime = (globals: RuntimeGlobals = g): string => {
  const platform =
    globals.process?.platform && globals.process?.arch
      ? ` (${globals.process.platform}; ${globals.process.arch})`
      : "";
  if (globals.Bun?.version) return `bun/${globals.Bun.version}${platform}`;
  if (globals.Deno?.version?.deno) return `deno/${globals.Deno.version.deno}${platform}`;
  if (globals.EdgeRuntime !== undefined) return "vercel-edge";
  if (globals.navigator?.userAgent === "Cloudflare-Workers") return "cloudflare-workers";
  if (globals.process?.versions?.node) return `node/${globals.process.versions.node}${platform}`;
  if (isBrowser(globals)) return "browser";
  return "unknown";
};
