import assert from "node:assert/strict";
export function verifyVolume(v) {
  assert.equal(v?.Name, "laorenyun-demo-data");
  assert.equal(v.Labels?.["org.laorenyun.demo"], "laorenyun.synthetic-demo.v1");
}
export function verifyAttachment(c) {
  assert.equal(
    c.Config?.Labels?.["com.docker.compose.project"],
    "laorenyun-demo",
  );
}
