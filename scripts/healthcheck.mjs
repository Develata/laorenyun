try {
  const r = await fetch("http://127.0.0.1:3080/laorenyun/healthz", {
    signal: AbortSignal.timeout(2000),
  });
  if (!r.ok || (await r.json()).status !== "ready") process.exitCode = 1;
} catch {
  process.exitCode = 1;
}
