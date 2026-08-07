#!/usr/bin/env python3
from __future__ import annotations
import json, re, subprocess, sys
from jsonschema import Draft202012Validator
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
RELEASE='v0.1.0-black-hole-lab.1'
DIST=ROOT/'dist'/RELEASE
failures=[]
passes=0

def check(cond,msg):
    global passes
    if cond:
        passes+=1;print('[PASS]',msg)
    else: failures.append(msg);print('[FAIL]',msg)

def load(path): return json.loads(path.read_text(encoding='utf-8'))

content=load(DIST/'content/black-hole-museum.json')
assets=load(DIST/'content/black-hole-assets.json')
release=load(DIST/'release.json')
routes=load(ROOT/'registry/routes.json')
html=(ROOT/'docs/deployment/black-hole-museum-edublogs-block.html').read_text(encoding='utf-8')
css=(DIST/'black-hole-museum.css').read_text(encoding='utf-8')
bootstrap=(DIST/'runtime-bootstrap.js').read_text(encoding='utf-8')
app=(DIST/'black-hole-museum.js').read_text(encoding='utf-8')

check(len(content['stations'])==10,'ten exhibit stations generated')
check(len({s['id'] for s in content['stations']})==10,'station ids are unique')
check(routes['routes'][0]['path']=='/repository-page-lab/','route is exact and hostname-neutral')
check(routes['routes'][0]['mountId']=='hrv-black-hole-museum-root','mount id matches approved contract')
check('@main/' not in json.dumps(release),'release contains no mutable @main reference')
check('@latest/' not in json.dumps(release),'release contains no mutable latest reference')
check('@v0.1.0-black-hole-lab.1/' in json.dumps(release),'release URLs use the immutable semantic ref')
check('hrv-black-hole-museum-root' in html,'handoff contains the exact mount root')
check('data-hrv-fallback' in html and '<noscript>' in html,'handoff contains readable fallback and noscript state')
check('SIMULATED CLASSROOM RECAP' in html,'handoff visibly labels dummy recap')
check('runtime-bootstrap.js' in html and 'release.json' in html,'handoff loads minimal bootstrap and exact release')
check('TODO' not in html and 'PLACEHOLDER_URL' not in html,'handoff has no TODO or URL placeholder')
check(css.lstrip().startswith('#hrv-black-hole-museum-root'),'CSS begins under the unique mount root')
check('html.hrv-route-black-hole-lab-ready' in css,'only route-ready compatibility class touches html')
check('prefers-reduced-motion' in css,'Still Museum reduced-motion rules exist')
check('max-width:430px' in css and 'max-width:767px' in css,'phone responsive rules exist')
check('focus-visible' in css,'visible keyboard focus styles exist')
check('replaceChildren(fragment)' in app,'renderer commits a detached fragment in one controlled operation')
check('Station failed' in app,'station-level failure isolation exists')
check('window[KEY]' in bootstrap,'bootstrap singleton guard exists')
check('path !== expectedPath' in bootstrap,'bootstrap exact route gate exists')
check('fallback-missing' in bootstrap,'bootstrap refuses to enhance an empty shell')
check(len(assets['assets'])==12,'all twelve approved core media records are present')
check(all(a.get('credit') and a.get('classification') and a.get('sourcePage') for a in assets['assets']),'every media record has credit, classification, and source')
check(all(a.get('alt') and a.get('caption') for a in assets['assets']),'every media record has alt text and caption')
for js in [DIST/'runtime-bootstrap.js',DIST/'black-hole-museum.js']:
    result=subprocess.run(['node','--check',str(js)],capture_output=True,text=True)
    check(result.returncode==0,f'JavaScript syntax valid: {js.name}')
check(release['deploymentReady'] is True,'release is deployment-ready after authoritative assets were acquired and validated')
check(assets.get('retrievalStatus')=='complete','runtime asset ledger reports complete authoritative acquisition')
check(all(not a.get('stub') for a in assets['assets']),'runtime asset ledger contains no offline acquisition stubs')
check(all('@v0.1.0-black-hole-lab.1/' in a.get('localUrl','') for a in assets['assets']),'every runtime media URL uses the immutable release ref')

content_schema=load(ROOT/'schemas/black-hole-museum.schema.json')
valid_fixture=load(ROOT/'fixtures/black-hole-museum/valid.json')
bad_fixture=load(ROOT/'fixtures/black-hole-museum/malformed-missing-stations.json')
unsupported_fixture=load(ROOT/'fixtures/black-hole-museum/unsupported-schema.json')
check(not list(Draft202012Validator(content_schema).iter_errors(valid_fixture)),'valid content fixture passes schema')
check(bool(list(Draft202012Validator(content_schema).iter_errors(bad_fixture))),'malformed content fixture is rejected')
check(bool(list(Draft202012Validator(content_schema).iter_errors(unsupported_fixture))),'unsupported schema fixture is rejected')

if failures:
    print('\nFailures:')
    for f in failures: print('-',f)
    raise SystemExit(1)
print(f'\nRepository checks passed: {passes}; failed: {len(failures)}.')
