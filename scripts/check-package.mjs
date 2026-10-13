// Runs publint and arethetypeswrong against a fresh Bun package tarball.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const env = { ...process.env };
delete env.npm_config_dry_run;

const packed = mkdtempSync(join(tmpdir(), "aphrody-typesafe-sdk-"));
const pack = spawnSync("bun", ["pm", "pack", "--destination", packed, "--quiet"], {
  stdio: "pipe",
  encoding: "utf8",
  env,
});
if (pack.status !== 0) process.exit(pack.status ?? 1);
const tarball = pack.stdout.trim();
try {
  for (const [cmd, args] of [
    ["publint", []],
    ["attw", ["--pack", tarball]],
  ]) {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
  }
} finally {
  rmSync(packed, { recursive: true, force: true });
}
