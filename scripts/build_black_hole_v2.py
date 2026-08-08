#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'apps/black-hole-museum/src/v2'
CONTENT_DIR = ROOT / 'apps/black-hole-museum/content'


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def validate(data, schema_path: Path, label: str) -> None:
    schema = json.loads(schema_path.read_text(encoding='utf-8'))
    errors = sorted(Draft202012Validator(schema).iter_errors(data), key=lambda error: list(error.path))
    if errors:
        for error in errors:
            print(f'[schema:{label}] {list(error.path)}: {error.message}')
        raise SystemExit(2)


def copy(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)


def full_sha(value: str, label: str) -> str:
    value = value.strip().lower()
    if not re.fullmatch(r'[0-9a-f]{40}', value):
        raise SystemExit(f'{label} must be a full 40-character Git SHA')
    return value


def main() -> int:
    parser = argparse.ArgumentParser(description='Build a self-owned Black Hole Museum V2 release.')
    parser.add_argument('--release', required=True, help='Release id without leading v, for example 0.2.0-black-hole-v2-lab.2')
    parser.add_argument('--cdn-ref', required=True, help='Immutable CDN ref that will own this release, normally a release tag or committed immutable ref.')
    parser.add_argument('--source-commit', default=os.environ.get('HRV_RELEASE_SOURCE_COMMIT', ''), help='Full source commit SHA recorded in release metadata.')
    parser.add_argument('--verify-only', action='store_true')
    args = parser.parse_args()

    source_commit = full_sha(args.source_commit, 'source commit')
    release_id = args.release.removeprefix('v')
    folder = 'v' + release_id
    dist = ROOT / 'dist' / folder
    cdn = f'https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets@{args.cdn_ref}/dist/{folder}'

    content = yaml.safe_load((CONTENT_DIR / 'black-hole-museum.source.yaml').read_text(encoding='utf-8'))
    experience = yaml.safe_load((CONTENT_DIR / 'black-hole-experience.source.yaml').read_text(encoding='utf-8'))
    assets = yaml.safe_load((CONTENT_DIR / 'black-hole-assets.source.yaml').read_text(encoding='utf-8'))

    validate(content, ROOT / 'schemas/black-hole-museum.schema.json', 'content')
    validate(experience, ROOT / 'schemas/experience-profile.schema.json', 'experience')
    validate(assets, ROOT / 'schemas/black-hole-assets.schema.json', 'assets')

    numbers = [station['number'] for station in content['stations']]
    if numbers != [f'{index:02d}' for index in range(1, 11)]:
        raise SystemExit('V2 requires the verified ten-station science sequence 01-10.')

    required_source = ['renderer.js', 'runtime.js', 'interactions.js', 'presentation.css', 'amadeus-compat.css']
    for filename in required_source:
        if not (SRC / filename).is_file():
            raise SystemExit(f'Missing V2 source file: {filename}')

    if args.verify_only:
        print('[verify] V2 sources and authoritative data validate')
        return 0

    if dist.exists():
        shutil.rmtree(dist)
    (dist / 'content').mkdir(parents=True)
    (dist / 'assets').mkdir(parents=True)

    copy(SRC / 'renderer.js', dist / 'black-hole-museum.js')
    copy(SRC / 'runtime.js', dist / 'runtime.js')
    copy(SRC / 'interactions.js', dist / 'interactions.js')
    (dist / 'black-hole-museum.css').write_text(
        (SRC / 'presentation.css').read_text(encoding='utf-8').rstrip() + '\n\n' +
        (SRC / 'amadeus-compat.css').read_text(encoding='utf-8').rstrip() + '\n',
        encoding='utf-8'
    )

    runtime_assets = []
    for item in assets['assets']:
        out = dict(item)
        out['stub'] = True
        out['stubUrl'] = f'{cdn}/assets/{item["id"]}.svg'
        out['localUrl'] = out['stubUrl']

        if item.get('acquisitionStatus') == 'complete' and item.get('derivatives'):
            public_derivatives = []
            for derivative in item['derivatives']:
                src = ROOT / derivative['path']
                dest = dist / 'assets' / src.name
                copy(src, dest)
                public = dict(derivative)
                public['url'] = f'{cdn}/assets/{src.name}'
                public_derivatives.append(public)
            out['derivatives'] = public_derivatives

            preferred = next((d for d in public_derivatives if d.get('width') == 1280 and d.get('format') == 'webp'), None)
            if item['kind'] == 'video':
                preferred = next((d for d in public_derivatives if d.get('format') == 'webm'), None) or next((d for d in public_derivatives if d.get('format') == 'mp4'), None)
                poster = next((d for d in public_derivatives if d.get('format') == 'webp'), None)
                if poster:
                    out['posterUrl'] = poster['url']
            if preferred:
                out['localUrl'] = preferred['url']
                out['stub'] = False
        else:
            stub = ROOT / 'apps/black-hole-museum/assets/stubs' / f'{item["id"]}.svg'
            copy(stub, dist / 'assets' / stub.name)

        runtime_assets.append(out)

    built_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')
    built_content = dict(content)
    built_experience = dict(experience)
    built_content['generatedAt'] = built_at
    built_experience['generatedAt'] = built_at
    runtime_asset_manifest = {
        'schemaVersion': '1.0',
        'generatedAt': built_at,
        'retrievalStatus': assets['retrievalStatus'],
        'retrievalNote': assets.get('retrievalNote', ''),
        'assets': runtime_assets,
    }

    (dist / 'content/black-hole-museum.json').write_text(json.dumps(built_content, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    (dist / 'content/black-hole-experience.json').write_text(json.dumps(built_experience, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    (dist / 'content/black-hole-assets.json').write_text(json.dumps(runtime_asset_manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

    release = {
        'schemaVersion': '1.0',
        'release': release_id,
        'immutableRef': args.cdn_ref,
        'commit': source_commit,
        'builtAt': built_at,
        'minimumBootstrapVersion': 'v2-page-local-0.1.0',
        'deploymentReady': assets['retrievalStatus'] == 'complete',
        'releasePurpose': 'black-hole-v2',
        'dataFoundation': {
            'mode': 'v2-owned-copy',
            'source': 'authoritative friendly-source manifests',
        },
        'pageSystems': {
            'black-hole-museum-v2': {
                'script': {'url': f'{cdn}/black-hole-museum.js', 'type': 'module', 'sha256': digest(dist / 'black-hole-museum.js')},
                'style': {'url': f'{cdn}/black-hole-museum.css', 'sha256': digest(dist / 'black-hole-museum.css')},
                'content': {'url': f'{cdn}/content/black-hole-museum.json', 'schemaVersion': '1.0', 'sha256': digest(dist / 'content/black-hole-museum.json')},
                'assets': {'url': f'{cdn}/content/black-hole-assets.json', 'schemaVersion': '1.0', 'sha256': digest(dist / 'content/black-hole-assets.json')},
                'experience': {'url': f'{cdn}/content/black-hole-experience.json', 'schemaVersion': '1.0', 'sha256': digest(dist / 'content/black-hole-experience.json')},
            }
        },
        'rollbackRelease': 'native-fallback',
    }
    validate(release, ROOT / 'schemas/release-manifest.schema.json', 'release')
    (dist / 'release.json').write_text(json.dumps(release, indent=2) + '\n', encoding='utf-8')

    print(f'[build] {folder}')
    print('[build] dataFoundation=v2-owned-copy')
    print(f'[build] deploymentReady={release["deploymentReady"]}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
