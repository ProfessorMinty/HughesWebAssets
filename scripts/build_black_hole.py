#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, os, re, shutil, subprocess, sys
from datetime import datetime, timezone
from pathlib import Path
import yaml
from jsonschema import Draft202012Validator

ROOT=Path(__file__).resolve().parents[1]
RELEASE='v0.1.0-black-hole-lab.1'
DIST=ROOT/'dist'/RELEASE
CDN=f'https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets@{RELEASE}/dist/{RELEASE}'

def resolve_source_commit()->str:
    candidate=os.environ.get('HRV_RELEASE_SOURCE_COMMIT','').strip().lower()
    if not candidate:
        try:
            candidate=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip().lower()
        except Exception as exc:
            raise SystemExit(f'Unable to determine release source commit: {exc}')
    if not re.fullmatch(r'[0-9a-f]{40}',candidate):
        raise SystemExit('Release source commit must be a full 40-character Git SHA')
    return candidate

def digest(path:Path)->str:
    h=hashlib.sha256(path.read_bytes()).hexdigest()
    return h

def validate(data,schema_path,label):
    schema=json.loads(schema_path.read_text(encoding='utf-8'))
    errors=sorted(Draft202012Validator(schema).iter_errors(data),key=lambda e:list(e.path))
    if errors:
        for e in errors: print(f'[schema:{label}] {list(e.path)}: {e.message}',file=sys.stderr)
        raise SystemExit(2)

def copy(src:Path,dest:Path):
    dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(src,dest)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--verify-only',action='store_true')
    args=ap.parse_args()

    content=yaml.safe_load((ROOT/'apps/black-hole-museum/content/black-hole-museum.source.yaml').read_text(encoding='utf-8'))
    experience=yaml.safe_load((ROOT/'apps/black-hole-museum/content/black-hole-experience.source.yaml').read_text(encoding='utf-8'))
    assets=yaml.safe_load((ROOT/'apps/black-hole-museum/content/black-hole-assets.source.yaml').read_text(encoding='utf-8'))
    routes=json.loads((ROOT/'registry/routes.json').read_text(encoding='utf-8'))

    validate(routes,ROOT/'schemas/route-registry.schema.json','routes')
    validate(content,ROOT/'schemas/black-hole-museum.schema.json','content')
    validate(experience,ROOT/'schemas/experience-profile.schema.json','experience')
    validate(assets,ROOT/'schemas/black-hole-assets.schema.json','assets')

    ids=[s['id'] for s in content['stations']]
    if len(ids)!=len(set(ids)): raise SystemExit('Duplicate station ids')
    if len(content['stations'])!=10: raise SystemExit('Exactly ten stations are required')
    if [s['number'] for s in content['stations']]!=[f'{i:02d}' for i in range(1,11)]: raise SystemExit('Station numbering is not deterministic')

    if args.verify_only:
        print('[verify] friendly sources and route registry are valid')
        return 0

    if DIST.exists(): shutil.rmtree(DIST)
    (DIST/'content').mkdir(parents=True)
    (DIST/'assets').mkdir(parents=True)

    copy(ROOT/'packages/runtime-bootstrap/src/index.js',DIST/'runtime-bootstrap.js')
    copy(ROOT/'apps/black-hole-museum/src/index.js',DIST/'black-hole-museum.js')
    (DIST/'black-hole-museum.css').write_text(
        (ROOT/'apps/black-hole-museum/src/page.css').read_text(encoding='utf-8').rstrip() + '\n\n' +
        (ROOT/'apps/black-hole-museum/src/viewport-breakout.css').read_text(encoding='utf-8').lstrip(),
        encoding='utf-8'
    )

    # Admit real optimized derivatives only after acquisition marks the asset complete.
    # In an offline evidence build, copy only that asset's honest stub. In a deployment-ready
    # release, copy every generated derivative so the immutable tag owns the responsive media set.
    runtime_assets=[]
    for item in assets['assets']:
        out=dict(item)
        out['stub']=True
        out['stubUrl']=f'{CDN}/assets/{item["id"]}.svg'
        out['localUrl']=out['stubUrl']
        if item.get('acquisitionStatus')=='complete' and item.get('derivatives'):
            choices=item['derivatives']
            public_derivatives=[]
            for derivative in choices:
                src=ROOT/derivative['path']
                dest=DIST/'assets'/Path(derivative['path']).name
                copy(src,dest)
                public=dict(derivative)
                public['url']=f'{CDN}/assets/{dest.name}'
                public_derivatives.append(public)
            out['derivatives']=public_derivatives
            preferred=next((d for d in public_derivatives if d.get('width')==1280 and d.get('format')=='webp'),None)
            if item['kind']=='video':
                preferred=next((d for d in public_derivatives if d.get('format')=='webm'),None) or next((d for d in public_derivatives if d.get('format')=='mp4'),None)
                poster=next((d for d in public_derivatives if d.get('format')=='webp'),None)
                if poster: out['posterUrl']=poster['url']
            if preferred:
                out['localUrl']=preferred['url']
                out['stub']=False
        else:
            stub=ROOT/'apps/black-hole-museum/assets/stubs'/f'{item["id"]}.svg'
            copy(stub,DIST/'assets'/stub.name)
        runtime_assets.append(out)

    built_at=os.environ.get('HRV_BUILD_TIMESTAMP') or datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
    content['generatedAt']=built_at
    experience['generatedAt']=built_at
    runtime_asset_manifest={
      'schemaVersion':'1.0',
      'generatedAt':built_at,
      'retrievalStatus':assets['retrievalStatus'],
      'retrievalNote':assets.get('retrievalNote',''),
      'assets':runtime_assets
    }

    (DIST/'content/black-hole-museum.json').write_text(json.dumps(content,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    (DIST/'content/black-hole-experience.json').write_text(json.dumps(experience,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    (DIST/'content/black-hole-assets.json').write_text(json.dumps(runtime_asset_manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')

    release={
      'schemaVersion':'1.0',
      'release':'0.1.0-black-hole-lab.1',
      'immutableRef':RELEASE,
      'commit':resolve_source_commit(),
      'builtAt':built_at,
      'minimumBootstrapVersion':'0.1.0',
      'deploymentReady':assets['retrievalStatus']=='complete',
      'pageSystems':{
        'black-hole-museum':{
          'script':{'url':f'{CDN}/black-hole-museum.js','type':'module','sha256':digest(DIST/'black-hole-museum.js')},
          'style':{'url':f'{CDN}/black-hole-museum.css','sha256':digest(DIST/'black-hole-museum.css')},
          'content':{'url':f'{CDN}/content/black-hole-museum.json','schemaVersion':'1.0','sha256':digest(DIST/'content/black-hole-museum.json')},
          'assets':{'url':f'{CDN}/content/black-hole-assets.json','schemaVersion':'1.0','sha256':digest(DIST/'content/black-hole-assets.json')},
          'experience':{'url':f'{CDN}/content/black-hole-experience.json','schemaVersion':'1.0','sha256':digest(DIST/'content/black-hole-experience.json')}
        }
      },
      'bootstrap':{'url':f'{CDN}/runtime-bootstrap.js','sha256':digest(DIST/'runtime-bootstrap.js')},
      'rollbackRelease':'native-fallback'
    }
    validate(release,ROOT/'schemas/release-manifest.schema.json','release')
    (DIST/'release.json').write_text(json.dumps(release,indent=2)+'\n',encoding='utf-8')

    channel={
      'schemaVersion':'1.0',
      'channel':'black-hole-lab',
      'currentRelease':{'id':release['release'],'manifestUrl':f'{CDN}/release.json','immutableRef':RELEASE},
      'previousRelease':{'id':'native-fallback','manifestUrl':None}
    }
    (ROOT/'channels/black-hole-lab.json').write_text(json.dumps(channel,indent=2)+'\n',encoding='utf-8')
    (DIST/'channel.json').write_text(json.dumps(channel,indent=2)+'\n',encoding='utf-8')

    print(f'[build] {RELEASE}')
    print(f'[build] deploymentReady={release["deploymentReady"]}')
    print(f'[build] files={sum(1 for p in DIST.rglob("*") if p.is_file())}')
    return 0

if __name__=='__main__': raise SystemExit(main())
