#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  rmdirSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { verifyVolume, verifyAttachment } from "./scripts/safety.mjs";
const dir = dirname(fileURLToPath(import.meta.url)),
  root = resolve(dir, "..");
const project = "laorenyun-demo",
  volume = "laorenyun-demo-data",
  owner = "laorenyun.synthetic-demo.v1";
const run = (cmd, args, timeout = 120000) =>
  execFileSync(cmd, args, {
    cwd: root,
    encoding: "utf8",
    timeout,
    maxBuffer: 16 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
const docker = (...args) => run("docker", args);
const compose = (...args) =>
  docker("compose", "-f", resolve(dir, "compose.yml"), "-p", project, ...args);
function inspect() {
  try {
    return JSON.parse(docker("volume", "inspect", volume))[0];
  } catch {
    return null;
  }
}
function owned() {
  const v = inspect();
  assert.ok(v, "demo volume missing");
  verifyVolume(v);
  return v;
}
function container() {
  return compose("ps", "-q", "laorenyun");
}
function start() {
  owned();
  compose("up", "-d", "--wait", "--wait-timeout", "120");
}
function stop() {
  if (inspect()) owned();
  compose("stop");
}
async function auth() {
  const log = docker("logs", container()),
    launch = [...log.matchAll(/dsh web: (http\S+)/g)].at(-1)?.[1];
  assert.ok(launch, "access initialization missing");
  const url = new URL("http://127.0.0.1:3085");
  url.search = new URL(launch).search;
  const r = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(10000),
  });
  const cookies = r.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  assert.ok(cookies, "access cookie absent");
  return cookies;
}
async function api(method, body = {}) {
  const cookie = await auth();
  const r = await fetch("http://127.0.0.1:3085/api/laorenyun/" + method, {
    method: "POST",
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
      Origin: "http://127.0.0.1:3085",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  const v = await r.json();
  assert.ok(v.ok, "demo API failed");
  return v.value;
}
async function smoke() {
  owned();
  const c = container();
  assert.ok(c);
  assert.equal(
    docker("inspect", c, "--format", "{{.State.Health.Status}}"),
    "healthy",
  );
  assert.equal(
    (
      await fetch("http://127.0.0.1:3085", {
        signal: AbortSignal.timeout(10000),
      })
    ).status,
    401,
  );
  const receipt = JSON.parse(
    readFileSync(resolve(dir, ".private/receipt.json")),
  );
  assert.match(receipt.archive, /^[a-zA-Z0-9-]+$/);
  assert.equal(docker("inspect", c, "--format", "{{.Image}}"), receipt.image);
  for (const file of ["PLUGIN.json", "UPSTREAM.json"])
    assert.deepEqual(
      JSON.parse(docker("exec", c, "cat", "/opt/laorenyun/" + file)),
      JSON.parse(readFileSync(resolve(root, file))),
    );
  const evidence = JSON.parse(
    docker("exec", c, "cat", `/app/data/archives/${receipt.archive}/DEMO.json`),
  );
  assert.equal(evidence.synthetic, true);
  assert.ok(evidence.nodes >= 12);
  const exported = docker(
    "exec",
    c,
    "cat",
    `/app/data/archives/${receipt.archive}/index.html`,
  );
  assert.ok(exported.includes("<html"));
  assert.ok(!/<script|https?:\/\//i.test(exported));
  console.log(
    JSON.stringify({
      healthy: true,
      access401: true,
      synthetic: true,
      nodes: evidence.nodes,
      export: true,
    }),
  );
}
async function seed() {
  start();
  const archive = await api("archive-create", { title: "周远山（合成演示）" });
  assert.match(archive.id, /^[a-zA-Z0-9-]+$/);
  stop();
  docker(
    "run",
    "--rm",
    "--user",
    "10001:10001",
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges:true",
    "--network",
    "none",
    "-v",
    volume + ":/app/data",
    "-e",
    "LAORENYUN_DEMO=true",
    "laorenyun-demo-seed:local",
    "/app/data/archives/" + archive.id,
    "--confirm-synthetic-demo",
  );
  mkdirSync(resolve(dir, ".private"), { recursive: true, mode: 0o700 });
  writeFileSync(
    resolve(dir, ".private/receipt.json"),
    JSON.stringify({
      application: run("git", ["rev-parse", "HEAD"]),
      dirty: !!run("git", ["status", "--porcelain"]),
      seedSha256: createHash("sha256")
        .update(readFileSync(resolve(dir, "seed/build.ts")))
        .digest("hex"),
      plugin: JSON.parse(readFileSync(resolve(root, "PLUGIN.json"))).commit,
      dsh: JSON.parse(readFileSync(resolve(root, "UPSTREAM.json"))).commit,
      archive: archive.id,
      project,
      volume,
      image: docker(
        "image",
        "inspect",
        "laorenyun:0.2.0",
        "--format",
        "{{.Id}}",
      ),
    }),
    { mode: 0o600 },
  );
  start();
  await smoke();
}
const command = process.argv[2];
let locked = false;
try {
  mkdirSync(resolve(dir, ".private"), { recursive: true, mode: 0o700 });
  if (command !== "status") {
    mkdirSync(resolve(dir, ".private/operation.lock"));
    locked = true;
  }
  if (
    ![
      "prepare",
      "start",
      "stop",
      "reset",
      "status",
      "smoke",
      "restart",
    ].includes(command)
  )
    throw Error("use prepare|start|stop|reset|status|smoke|restart");
  if (command === "prepare") {
    assert.ok(
      existsSync(resolve(dir, ".env")),
      "copy demo/.env.example to demo/.env first",
    );
    run("docker", ["build", "-t", "laorenyun:0.2.0", "."], 3600000);
    run(
      "docker",
      [
        "build",
        "--target",
        "plugin-build",
        "-t",
        "laorenyun-demo-tools-base",
        ".",
      ],
      3600000,
    );
    run(
      "docker",
      [
        "build",
        "-f",
        "demo/Dockerfile",
        "-t",
        "laorenyun-demo-seed:local",
        ".",
      ],
      600000,
    );
    if (!inspect()) {
      docker(
        "volume",
        "create",
        "--label",
        "org.laorenyun.demo=" + owner,
        volume,
      );
      await seed();
    } else {
      owned();
      start();
      await smoke();
    }
  } else if (command === "reset") {
    owned();
    // Refuse foreign attachments before stopping/removing anything.
    const attached = docker("ps", "-aq", "--filter", "volume=" + volume)
      .split("\n")
      .filter(Boolean);
    for (const id of attached) {
      const c = JSON.parse(docker("inspect", id))[0];
      verifyAttachment(c);
    }
    compose("down");
    owned();
    docker("volume", "rm", volume);
    docker(
      "volume",
      "create",
      "--label",
      "org.laorenyun.demo=" + owner,
      volume,
    );
    await seed();
  } else if (command === "start") {
    start();
    await smoke();
  } else if (command === "stop") stop();
  else if (command === "restart") {
    owned();
    compose("restart");
    start();
    await smoke();
  } else if (command === "smoke") await smoke();
  else {
    console.log(
      JSON.stringify({
        project,
        volume,
        exists: !!inspect(),
        running: !!container(),
        origin: "http://127.0.0.1:3085",
      }),
    );
  }
} catch (e) {
  mkdirSync(resolve(dir, ".private"), { recursive: true, mode: 0o700 });
  writeFileSync(resolve(dir, ".private/error.txt"), String(e), { mode: 0o600 });
  console.error(
    "Demo operation failed; " +
      (e.code ?? e.name) +
      ". Inspect locally without sharing access URLs.",
  );
  process.exitCode = 1;
} finally {
  if (locked) rmdirSync(resolve(dir, ".private/operation.lock"));
}
