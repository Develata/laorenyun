// Exact shipped occurrences, not only package names. Notice bytes come from the
// inspected image; review maps them to independently hashed bundle members.
export function accountingProblems(expected, component, manifest, files) {
 const problems=[];
 const observed=expected.shipped ?? [];
 if (!observed.length) return ['SHIPPED_EVIDENCE_MISSING'];
 const wanted=new Map(observed.map(x=>[x.id,x]));
 if (wanted.size!==observed.length) problems.push('DUPLICATE_SHIPPED_EVIDENCE');
 const declared=component.shipped ?? [];
 if (!Array.isArray(declared) || declared.length!==wanted.size || new Set(declared).size!==declared.length || declared.some(id=>!wanted.has(id))) problems.push('SHIPPED_COVERAGE_MISMATCH');
 const notices=new Map();
 for (const occurrence of observed) {
  if (!Array.isArray(occurrence.notices) || !occurrence.notices.length) problems.push('NOTICE_DISCOVERY_INCOMPLETE');
  for (const n of occurrence.notices ?? []) {
   if (!n.path || !/^[a-f0-9]{64}$/.test(n.sha256 ?? '')) problems.push('NOTICE_EVIDENCE_INVALID');
   if (notices.has(n.path) && notices.get(n.path)!==n.sha256) problems.push('NOTICE_EVIDENCE_CONFLICT');
   notices.set(n.path,n.sha256);
  }
 }
 const covered=new Set();
 for (const n of component.noticeCoverage ?? []) {
  if (covered.has(n.imagePath) || !notices.has(n.imagePath)) problems.push('NOTICE_COVERAGE_EXTRA');
  covered.add(n.imagePath);
  if (!component.notices?.includes(n.material) || !files.has(n.material) || manifest.files?.[n.material]!==notices.get(n.imagePath)) problems.push('NOTICE_BYTES_MISMATCH');
 }
 for (const path of notices.keys()) if (!covered.has(path)) problems.push('NOTICE_COVERAGE_MISSING');
 return [...new Set(problems)];
}
