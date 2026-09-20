import { test } from "node:test";
import assert from "node:assert/strict";
import { verifyVolume, verifyAttachment } from "./safety.mjs";
test("reset refuses production and unlabelled volumes", () => {
  for (const v of [
    { Name: "laorenyun-data" },
    { Name: "laorenyun-demo-data", Labels: {} },
    null,
  ])
    assert.throws(() => verifyVolume(v));
  verifyVolume({
    Name: "laorenyun-demo-data",
    Labels: { "org.laorenyun.demo": "laorenyun.synthetic-demo.v1" },
  });
});
test("reset refuses foreign container attachments", () => {
  assert.throws(() =>
    verifyAttachment({
      Config: { Labels: { "com.docker.compose.project": "production" } },
    }),
  );
  verifyAttachment({
    Config: { Labels: { "com.docker.compose.project": "laorenyun-demo" } },
  });
});

test("demo private state is excluded from Docker context", async () => {
  const { readFile } = await import("node:fs/promises");
  const ignored = await readFile(
    new URL("../../.dockerignore", import.meta.url),
    "utf8",
  );
  for (const entry of ["demo/.env", "demo/.private/", "demo/output/"])
    assert.ok(ignored.split("\n").includes(entry));
});
