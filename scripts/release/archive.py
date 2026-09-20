"""Stream-verify bundle members; never extract untrusted tar paths or follow links."""
import hashlib, json, sys, tarfile
archive, manifest_path = sys.argv[1:]
m = json.load(open(manifest_path))
expected = dict(m['files'])
seen = set()
with tarfile.open(archive, 'r:gz') as tar:
    for member in tar:
        if not member.isfile() or member.name not in expected or member.name in seen:
            raise ValueError('unexpected/duplicate/non-file archive member')
        seen.add(member.name)
        h = hashlib.sha256()
        with tar.extractfile(member) as f:
            for chunk in iter(lambda: f.read(1024*1024), b''):
                h.update(chunk)
        if h.hexdigest() != expected[member.name]:
            raise ValueError('archive payload hash mismatch')
if seen != set(expected):
    raise ValueError('missing archive member')
print('Source bundle byte integrity verified (not a legal completeness assertion)')
