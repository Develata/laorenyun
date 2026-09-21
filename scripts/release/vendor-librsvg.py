"""Build a reviewable Rust source superset from locked librsvg release material.
No build or model calls. Cargo verifies registry checksums; external upgrades fail.
The resulting bundle is material, not approval of sharp's entire native closure.
"""
import argparse, difflib, gzip, hashlib, io, json, pathlib, subprocess, tarfile, tomllib
p=argparse.ArgumentParser();p.add_argument('archive');p.add_argument('output');args=p.parse_args()
archive=pathlib.Path(args.archive).resolve();out=pathlib.Path(args.output).resolve()
if out.exists(): raise SystemExit('Output must be a fresh directory')
out.mkdir(parents=True)
with tarfile.open(archive) as t:t.extractall(out/'work',filter='data')
roots=list((out/'work').iterdir())
if len(roots)!=1 or not roots[0].is_dir(): raise SystemExit('Unexpected source layout')
root=roots[0];original=(root/'Cargo.lock').read_bytes()
# Populate exact registry metadata/source first; no private prior Cargo cache required.
subprocess.run(['cargo','fetch','--locked'],cwd=root,check=True,timeout=900)
patch=[]
for name in ['rsvg/Cargo.toml','librsvg-c/Cargo.toml']:
 f=root/name;before=f.read_text();after=''.join(line.replace(', "gif", "webp"','') if 'image = ' in line else line for line in before.splitlines(keepends=True))
 after=''.join(line.replace(', "pdf", "ps"','') if 'cairo-rs = ' in line else line for line in after.splitlines(keepends=True));f.write_text(after)
 patch.extend(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+name,tofile='b/'+name))
# Match the fixed sharp recipe. A populated registry index is needed, but no
# floating external version is accepted even if Cargo's resolver changes.
subprocess.run(['cargo','update','--workspace','--offline'],cwd=root,check=True,timeout=180)
def registry(data):return {(x['name'],x['version'],x.get('source'),x.get('checksum')) for x in tomllib.loads(data.decode())['package'] if 'source' in x}
current=(root/'Cargo.lock').read_bytes();old,new=registry(original),registry(current)
if new-old: raise SystemExit('External Rust identity changed; review required')
with (out/'cargo-vendor.stdout').open('w') as log:
 subprocess.run(['cargo','vendor','--locked',str(out/'vendor')],cwd=root,stdout=log,check=True,timeout=900)
for directory in (out/'vendor').iterdir():
 checks=json.loads((directory/'.cargo-checksum.json').read_text())
 pkg=tomllib.loads((directory/'Cargo.toml').read_text())['package']
 if (pkg['name'],pkg['version'],'registry+https://github.com/rust-lang/crates.io-index',checks['package']) not in new: raise SystemExit('Unexpected vendored identity')
 for name,expected in checks['files'].items():
  f=(directory/name).resolve()
  if not f.is_relative_to(directory.resolve()) or hashlib.sha256(f.read_bytes()).hexdigest()!=expected: raise SystemExit('Vendor file hash mismatch')
(out/'Cargo.lock').write_bytes(current);(out/'Cargo.lock.original').write_bytes(original)
(out/'features.patch').write_text(''.join(patch));(out/'config.toml').write_text('[source.crates-io]\nreplace-with = "vendored-sources"\n[source.vendored-sources]\ndirectory = "vendor"\n')
report={'schema':1,'sourceArchiveSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'originalLockSha256':hashlib.sha256(original).hexdigest(),'updatedLockSha256':hashlib.sha256(current).hexdigest(),'externalPackages':len(new),'added':sorted(new-old),'removed':sorted(old-new),'scope':'locked workspace source superset, including test/build sources; not a claim all crates are distributed'}
(out/'receipt.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))

# Archive contains portable build material only, never local logs/absolute paths.
with (out/'librsvg-rust-sources.tar.gz').open('wb') as raw:
 with gzip.GzipFile(filename='',mode='wb',fileobj=raw,mtime=0) as gz:
  with tarfile.open(fileobj=gz,mode='w') as t:
   names=['Cargo.lock','Cargo.lock.original','features.patch','config.toml','receipt.json']
   names+=sorted(str(f.relative_to(out)) for f in (out/'vendor').rglob('*') if f.is_file())
   for name in sorted(names):
    path=out/name
    if path.is_symlink():raise SystemExit('Unexpected vendor symlink')
    b=path.read_bytes();info=tarfile.TarInfo(name);info.size=len(b);info.mode=path.stat().st_mode&0o777;t.addfile(info,io.BytesIO(b))
print('bundle SHA256:',hashlib.sha256((out/'librsvg-rust-sources.tar.gz').read_bytes()).hexdigest())
