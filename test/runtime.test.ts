import { describe, expect, it } from "vitest";
import { describeRuntime, isBrowser } from "../src/runtime";
import { nativeRuntimeHeader } from "./helpers";

const nodeProcess = { versions: { node: "22.15.0" }, platform: "linux", arch: "x64" };

describe("describeRuntime", () => {
  it("reports the native runtime with its exact version, platform and arch", () => {
    expect(describeRuntime()).toBe(nativeRuntimeHeader());
  });

  it("reports node with platform and arch in an isolated environment", () => {
    expect(describeRuntime({ process: nodeProcess })).toBe("node/22.15.0 (linux; x64)");
  });

  it("prefers Bun over node when both are present", () => {
    expect(describeRuntime({ process: nodeProcess, Bun: { version: "1.2.3" } })).toBe(
      "bun/1.2.3 (linux; x64)",
    );
  });

  it("recognizes Deno", () => {
    expect(describeRuntime({ process: nodeProcess, Deno: { version: { deno: "2.1.0" } } })).toBe(
      "deno/2.1.0 (linux; x64)",
    );
  });

  it("recognizes edge runtimes by their markers", () => {
    expect(describeRuntime({ process: nodeProcess, EdgeRuntime: "edge-runtime" })).toBe(
      "vercel-edge",
    );
    expect(
      describeRuntime({ process: nodeProcess, navigator: { userAgent: "Cloudflare-Workers" } }),
    ).toBe("cloudflare-workers");
  });

  it("falls back to browser, then unknown", () => {
    const browser = { window: { document: {} }, navigator: { userAgent: "Mozilla/5.0" } };
    expect(isBrowser(browser)).toBe(true);
    expect(describeRuntime(browser)).toBe("browser");
    const unknown = { navigator: browser.navigator };
    expect(isBrowser(unknown)).toBe(false);
    expect(describeRuntime(unknown)).toBe("unknown");
  });
});
