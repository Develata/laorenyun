import {
  mkdir,
  access,
  readFile,
  writeFile,
  symlink,
  lstat,
  rename,
  readlink,
} from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { execFileSync, spawn } from "node:child_process";
process.umask(0o077);
const root = "/app/data";
const profile = process.env.LAORENYUN_PROFILE || "laorenyun";
if (!["laorenyun", "laorenyun-dev"].includes(profile))
  throw new Error("PROFILE_CONFIG: expected laorenyun or laorenyun-dev");
if (profile !== "laorenyun-dev" && process.env.LAORENYUN_PROBES === "true")
  throw new Error("PROFILE_CONFIG: probes require laorenyun-dev");
process.env.DSH_HOME = join(root, "dsh");
process.env.LAORENYUN_DATA_DIR = root;
process.env.LAORENYUN_PROFILE = profile;
process.env.LAORENYUN_PRESET_ROOT = "/opt/laorenyun/profiles/presets";
try {
  await access(root, constants.W_OK | constants.X_OK);
} catch {
  throw new Error(
    "DATA_PERMISSIONS: /app/data must be writable by UID/GID 10001; use the named volume or pre-create a bind mount with that owner",
  );
}
await mkdir(process.env.DSH_HOME, { recursive: true, mode: 0o700 });
try {
  await writeFile(
    join(process.env.DSH_HOME, "settings.yaml"),
    "locale:\n  preference: zh\nui-theme:\n  preference: light\n  fontSize: 17\n",
    { flag: "wx", mode: 0o600 },
  );
} catch (e) {
  if (e.code !== "EEXIST") throw e;
}
for (const name of ["laorenyun", "laorenyun-dev"]) {
  const dir = join(process.env.DSH_HOME, "profiles", name);
  const manifestPath = join(dir, "package.json");
  try {
    await access(manifestPath);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    execFileSync(
      "node",
      [
        "/opt/dsh/lib/bin.js",
        "--profile",
        name,
        "--from-default-profile",
        "web",
        "--dump-config",
      ],
      { stdio: ["ignore", "ignore", "pipe"], timeout: 20000 },
    );
  }
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.dsh.profile.bundles = [
    "@deepseek-ai/dsh-base",
    "@deepseek-ai/dsh-web-app",
    "dsh-laorenyun",
  ];
  manifest.dsh.profile.patchReload = "startup";
  await writeFile(
    manifestPath + ".tmp",
    JSON.stringify(manifest, null, 2) + "\n",
    { mode: 0o600 },
  );
  await rename(manifestPath + ".tmp", manifestPath);
  await mkdir(join(dir, "node_modules"), { recursive: true, mode: 0o700 });
  const target = join(dir, "node_modules", "dsh-laorenyun");
  try {
    const stat = await lstat(target);
    if (
      !stat.isSymbolicLink() ||
      (await readlink(target)) !== "/opt/dsh-laorenyun"
    )
      throw new Error(
        "PROFILE_CONFIG: plugin path must be the image-managed symlink",
      );
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    await symlink("/opt/dsh-laorenyun", target);
  }
}
const child = spawn(
  "node",
  [
    "/opt/dsh/lib/bin.js",
    "--profile",
    profile,
    "--patch",
    "/opt/laorenyun/profiles/common.patch.yml",
    "--patch",
    `/opt/laorenyun/profiles/${profile}.patch.yml`,
    "--no-open",
  ],
  { stdio: "inherit", cwd: root, env: process.env },
);
let timer;
for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, () => {
    child.kill(signal);
    timer ??= setTimeout(() => child.kill("SIGKILL"), 25000);
  });
child.once("error", (error) => {
  console.error("DSH_START_FAILED:", error.message);
  process.exitCode = 1;
});
child.once("exit", (code, signal) => {
  clearTimeout(timer);
  process.exitCode = code ?? (signal === "SIGTERM" ? 0 : 1);
});
