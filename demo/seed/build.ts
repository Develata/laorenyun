/** Explicit offline fixture CLI. Never imported by the Host/Client plugin. */
import { access, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { DomainDatabase } from "../src/storage/database.ts";
import { sourceMarker } from "../src/domain/source-reference.ts";
import { DerivedService } from "../src/derived/service.ts";
import type { InternalModel } from "../src/memory/model.ts";
import { type SourceId, type BranchId } from "../src/domain/types.ts";
import { exportDocuments } from "../src/derived/export.ts";
import assert from "node:assert/strict";

const root = resolve(process.argv[2] || ".");
if (
  process.env.LAORENYUN_DEMO !== "true" ||
  !process.argv.includes("--confirm-synthetic-demo")
)
  throw Error(
    "Explicit LAORENYUN_DEMO=true and --confirm-synthetic-demo required; use an EMPTY isolated volume",
  );
try {
  await access(join(root, "laorenyun.db"));
  throw Error("Refusing existing database; demo never merges into an archive");
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
}
const timings: Record<string, number> = {};
async function measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const t = performance.now();
  try {
    return await fn();
  } finally {
    timings[name] = Math.round((performance.now() - t) * 100) / 100;
  }
}
const db = await measure("databaseStartupMs", () => DomainDatabase.open(root));
const main = "synthetic-demo-周远山";
let first = "",
  latestTranscript = "",
  nodes = 0,
  revisions = 0,
  sources = 0;
async function human(
  text: string,
  role: "self" | "child" = "self",
  sourceId?: SourceId,
  sessionId = main,
) {
  await db.call("setSessionSpeaker", {
    sessionId,
    speaker: { role, authority: "explicit-user" },
  });
  const t = (
    await db.call("acceptHuman", {
      sessionId,
      role: "user",
      sourceKind: "user",
      messageId: randomUUID(),
      requestId: randomUUID(),
      text: (sourceId ? sourceMarker(sourceId) : "") + text,
    })
  ).transcript!;
  if (sessionId === main) latestTranscript = t.id;
  sources++;
  return t;
}
async function extract(
  t: Awaited<ReturnType<typeof human>>,
  year: number | null,
  targetId?: string,
  comparisons: any[] = [],
  edges: any[] = [],
) {
  const i = (await db.call("memoryClaim", null))!;
  assert.equal(i.transcript.id, t.id);
  await db.call("memoryProposal", {
    id: i.operation.id,
    result: {
      proposals: [
        {
          keySentence: t.text,
          basis: "stated",
          time: {
            start: year === null ? null : year * 12,
            end: year === null ? null : year * 12 + 11,
            precision: year === null ? "unknown" : "year",
            certainty: "stated",
            originalText: year === null ? "" : `${year}年`,
          },
          evidence: [{ transcriptId: t.id, text: t.text, field: "claim" }],
          people: [],
          places: [],
          edges,
          ...(targetId ? { targetId } : {}),
        },
      ],
      comparisons,
      resolutions: [],
    },
  });
  const n = (
    await db.call("memoryApply", {
      id: i.operation.id,
      expected: i.operation.graphRevision,
    })
  ).nodeIds[0]!;
  revisions++;
  if (!targetId) nodes++;
  return n;
}
const model = {
  async json(
    route: { model: string },
    _system: string,
    input: any,
    parse: (raw: string) => unknown,
    signal: AbortSignal,
  ) {
    signal.throwIfAborted();
    let value: any;
    if (input.transcripts) {
      const t = input.transcripts.find((t: any) => t.text.includes("那时候啊"));
      value = {
        observations: t
          ? [
              {
                category: "lexical",
                observation: "在这些合成讲述中使用那时候啊作为转场",
                examples: [{ transcriptId: t.id, quote: "那时候啊" }],
              },
            ]
          : [],
        unknown: t
          ? ["rhythm", "ordering", "address", "emotion"]
          : ["lexical", "rhythm", "ordering", "address", "emotion"],
      };
    } else if (input.sentences) {
      value = {
        complete: true,
        problems: [],
        claims: input.sentences.map((sentence: any) => {
          const support = input.facts.filter((f: any) =>
            sentence.text.includes(f.claim),
          );
          return {
            sentenceId: sentence.id,
            claim: sentence.text,
            kind: input.task.startsWith("title:")
              ? "narrative_glue"
              : "factual",
            supportedBy: support.map((f: any) => f.id),
            status: input.task.startsWith("title:")
              ? "nonfactual"
              : support.length
                ? "supported"
                : "unsupported",
          };
        }),
      };
    } else if (input.brief && input.facts) {
      input.facts = input.brief.factRefs.map((id: string) =>
        input.facts.find((f: any) => f.id === id),
      );
      value = {
        text: input.facts
          .map(
            (f: any) =>
              (f.attribution.required ? "我的子女回忆说，" : "") + f.claim,
          )
          .join(""),
        factRefs: input.facts.map((f: any) => f.id),
        attributions: input.facts
          .filter((f: any) => f.attribution.required)
          .map((f: any) => ({ factRef: f.id, surface: "我的子女回忆说" })),
      };
    } else if (input.facts) {
      const eligible = input.facts.filter(
        (f: any) =>
          !["excluded", "optional_ambiguous"].includes(f.narrativePolicy),
      );
      const groups = [[], [], []] as any[][];
      for (const f of eligible) {
        const year =
          f.time?.start == null ? null : Math.floor(f.time.start / 12);
        groups[year == null || year < 1970 ? 0 : year < 1990 ? 1 : 2]!.push(f);
      }
      value = {
        chapters: [],
        omissions: input.facts
          .filter((f: any) => !eligible.includes(f))
          .map((f: any) => ({
            factRef: f.id,
            reason:
              f.conflictPolicy === "open"
                ? "open_conflict"
                : "ambiguous_attribution",
          })),
      };
      for (const [i, group] of groups.entries()) {
        if (!group.length) continue;
        // Stable editorial ordering of this authored fixture only; null stays null.
        group.sort(
          (a: any, b: any) =>
            (a.time?.start ?? Infinity) - (b.time?.start ?? Infinity) ||
            a.claim.localeCompare(b.claim, "zh-CN"),
        );
        const chapter = {
          title: ["童年与老师", "学手艺和工作", "家门口的生活"][i],
          titleMode: "thematic",
          titleFactRefs: [group[0].id],
          paragraphs: [] as any[],
        };
        for (let n = 0; n < group.length; n += 3)
          chapter.paragraphs.push({
            brief: "整理这一组明确标记的合成材料，不补写时间",
            factRefs: group.slice(n, n + 3).map((f: any) => f.id),
          });
        value.chapters.push(chapter);
      }
    } else
      throw Error(
        "Unexpected fixture task; never fall back to a production provider",
      );
    return {
      value: parse(JSON.stringify(value)),
      evidence: { model: route.model, latencyMs: 0, repairs: 0 },
    };
  },
} as unknown as InternalModel;
const derived = new DerivedService(db, model, root);
async function generate(kind: "persona" | "biography" | "export", extra = {}) {
  const g = await db.call("derivedBegin", {
    id: randomUUID(),
    kind,
    sessionId: main,
    route: { provider: "explicit-demo-fixture", model: "synthetic-offline-v1" },
    ...extra,
  });
  derived.tick();
  const end = Date.now() + 20000;
  while (Date.now() < end) {
    const v = await db.call("derivedGet", g.id);
    if (v.state === "published") return v;
    if (v.state === "failed") throw Error(v.error);
    await new Promise((r) => setTimeout(r, 20));
  }
  throw Error("demo generation timeout");
}
try {
  await derived.start();
  const text = "那时候啊，1952年，我在村里出生。";
  first = await extract(await human(text), 1952);
  const school = await extract(await human("1960年，我开始读小学。"), 1960);
  async function detail(
    text: string,
    parent: string,
    kind = "ELABORATES",
    year: number | null = 1960,
  ) {
    const t = await human(text);
    return extract(
      t,
      year,
      undefined,
      [],
      [
        {
          to: parent,
          kind,
          evidence: [{ transcriptId: t.id, text: t.text, field: "claim" }],
        },
      ],
    );
  }
  const writing = await detail("1960年，我每天在窗前练字。", school);
  await detail("1960年，我用旧报纸练习横和竖。", writing);
  await detail("1960年，老师教我把字写端正。", school);
  await extract(await human("1972年，我开始在村里学习修自行车。"), 1972);
  const move = await extract(
    await human("1985年，我把修理工具搬到家门口。"),
    1985,
  );
  await detail(
    "1985年，因为工具搬到家门口，我在那里接修自行车。",
    move,
    "CAUSES",
    1985,
  );
  await extract(await human("1995年，我和家人一起在院里种了一棵树。"), 1995);
  const left = await extract(await human("1977年，我进入合肥一中。"), 1977);
  await extract(await human("1977年，我进入合肥六中。"), 1977, undefined, [
    {
      proposal: 0,
      nodeId: left,
      revision: 1,
      verdict: "material_conflict",
      explanation: "合成案例的同一入学事件",
    },
  ]);
  const target = await extract(
    await human("那时候啊，1982年，我在村里工作。"),
    1982,
  );
  const correction = await db.call("correctionCreate", {
    sessionId: main,
    nodeId: target,
    revision: 1,
    text: "那时候啊，1983年，我在村里工作。",
  });
  await extract(
    await human(correction.draft, "self", correction.id),
    1983,
    target,
  );
  await extract(
    await human("小时候有一次我掉进河里，具体哪一年记不得了。"),
    null,
  );
  await extract(await human("家里过去用煤油灯照明。", "child"), null);
  const related = await human("那时候啊，1992年，我在家门口种花。");
  await extract(
    related,
    1992,
    undefined,
    [],
    [
      {
        to: target,
        kind: "RELATES_TO",
        evidence: [
          { transcriptId: related.id, text: related.text, field: "claim" },
        ],
      },
    ],
  );
  const child = "synthetic-branch",
    bid = randomUUID() as BranchId;
  await db.call("reserveBranch", {
    id: bid,
    parentSessionId: main,
    sessionId: child,
    state: "provisioning",
    answerCount: 0,
    memo: null,
    topic: "老师的故事（合成演示）",
    returnAnchor: "求学",
  });
  await db.call("activateBranch", child);
  const bt = await human(
    "王老师常说，先把字写端正。",
    "self",
    undefined,
    child,
  );
  const branchNode = await extract(bt, null);
  const branchExtra = await human(
    "王老师让我每天留一页练习。",
    "self",
    undefined,
    child,
  );
  const branchNode2 = await extract(branchExtra, null);
  await db.call("branchClosing", child);
  await db.call("branchMemo", {
    sessionId: child,
    memo: {
      title: "老师的故事（合成演示）",
      key_sentence: bt.text,
      summary: bt.text,
      source_turns: [bt.id, branchExtra.id],
      related_memory_nodes: [],
      new_memory_candidates: [],
      people: [],
      places: [],
      time: null,
      unresolved_questions: [],
      suggested_return_bridge: "我们接着聊求学的经历。",
      status: "complete",
      input_revision: 2,
    },
  });
  await db.call("branchReturned", child);
  // Same explicit projection-fixture boundary as tests/fixtures/river-scale.ts.
  // Production branchMemo currently accepts no relatedNodes. Never claim this
  // offline association was inferred by the Branch agent.
  const { DatabaseSync } = await import("node:sqlite");
  const fixture = new DatabaseSync(join(root, "laorenyun.db"));
  const row = fixture
    .prepare("SELECT json FROM branch_memos WHERE branch_id=?")
    .get(bid)!;
  const memo = JSON.parse(String(row.json));
  memo.related_memory_nodes = [branchNode, branchNode2];
  fixture
    .prepare("UPDATE branch_memos SET json=? WHERE branch_id=?")
    .run(JSON.stringify(memo), bid);
  fixture.close();
  const persona = await measure("personaManifestAndFixtureMs", () =>
    generate("persona"),
  );
  const biography = await measure("biographyManifestAndFixtureMs", () =>
    generate("biography", { personaId: persona.id, narrativeVersion: 2 }),
  );
  const exported = await measure("exportPublishMs", () =>
    generate("export", { biographyId: biography.id }),
  );
  const docs = await measure("exportRenderMs", async () =>
    exportDocuments(exported),
  );
  for (const [name, content] of Object.entries(docs))
    await writeFile(join(root, name), content);
  const river = await measure("riverInitialMs", () => db.call("river", {}));
  assert.equal(river.nodes.length, Math.min(nodes, 500));
  await measure("riverPeriodMs", () =>
    db.call("river", { start: 1970 * 12, end: 1980 * 12 - 1 }),
  );
  await measure("riverPageMs", () => db.call("river", { offset: 450 }));
  await measure("sourceDeepReadMs", () =>
    db.call("memoryDetail", { id: target }),
  );
  await measure("timelineSearchMs", () =>
    db.call("timeline", { method: "search", text: "村里", limit: 50 }),
  );
  await measure("schedulerMs", () =>
    db.call("schedule", {
      sessionId: main,
      boundary: true,
      userChoseTopic: false,
      currentMonth: 1980 * 12,
      transcriptId: latestTranscript,
    }),
  );
  const p = await measure("personaManifestMs", () =>
    db.call("derivedBegin", {
      id: randomUUID(),
      kind: "persona",
      sessionId: main,
      route: {
        provider: "explicit-demo-fixture",
        model: "synthetic-offline-v1",
      },
    }),
  );
  await db.call("derivedCancel", p.id);
  assert.deepEqual(await db.call("graphIntegrity", null), []);
  const evidence = {
    synthetic: true,
    person: "周远山（合成演示）",
    fixtureModel: "synthetic-offline-v1",
    nodes,
    revisions,
    sources,
    graphRevision: river.graphRevision,
    timings,
    peakRssKiB: process.resourceUsage().maxRSS,
    exportBytes: Object.fromEntries(
      Object.entries(docs).map(([k, v]) => [k, Buffer.byteLength(v)]),
    ),
    exportGeneration: exported.id,
  };
  await writeFile(
    join(root, "DEMO.json"),
    JSON.stringify(evidence, null, 2) + "\n",
    { mode: 0o600, flag: "wx" },
  );
  console.log(JSON.stringify(evidence));
} finally {
  await derived.close();
  await db.close();
}
