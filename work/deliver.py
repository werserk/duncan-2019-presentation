"""Publish the already built offline archive as the repository's show package."""
from pathlib import Path
import hashlib
import json
import shutil
import tarfile

root = Path(__file__).resolve().parent.parent
source = root / 'presentation-offline.tar.gz'
sidecar = json.loads(source.with_name(source.name + '.presentation-output.json').read_text())
data = source.read_bytes()
digest = hashlib.sha256(data).hexdigest()
if digest != sidecar['sha256']:
    raise ValueError('Archive differs from the toolkit packaging record')
with tarfile.open(source, 'r:gz') as archive:
    for name in ['asset-manifest.json', 'config.js']:
        packed = archive.extractfile('./' + name)
        if packed is None or packed.read() != (root / 'dist' / name).read_bytes():
            raise ValueError('Archive is stale: rebuild and pack before delivering')
manifest = json.loads((root / 'dist/asset-manifest.json').read_text())
destination = root / 'delivery'
destination.mkdir(exist_ok=True)
shutil.copyfile(source, destination / source.name)
(destination / 'manifest.json').write_text(json.dumps({
    'archive': source.name, 'sha256': digest,
    'build': manifest,
    'source': json.loads((root / 'docs/REVEAL-SOURCE.json').read_text()),
}, ensure_ascii=False, indent=2) + '\n')
print('Ready delivery/presentation-offline.tar.gz; SHA-256 ' + digest)
