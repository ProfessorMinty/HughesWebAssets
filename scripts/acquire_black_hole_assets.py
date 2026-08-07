#!/usr/bin/env python3
"""Acquire and optimize the approved Black Hole Museum media.

This script is intentionally strict:
- authoritative source URLs are defined in the friendly asset source;
- originals are checksummed;
- still derivatives are generated locally;
- video derivatives use ffmpeg;
- the asset manifest is updated only after successful processing.

Run from the repository root in a network-enabled environment.
"""
from __future__ import annotations
import argparse, hashlib, json, shutil, subprocess, sys, urllib.request
from pathlib import Path
import yaml
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'apps/black-hole-museum/content/black-hole-assets.source.yaml'
MASTER=ROOT/'apps/black-hole-museum/assets/source'
DERIVED=ROOT/'apps/black-hole-museum/assets/derived'

def sha256(path:Path)->str:
    h=hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''): h.update(chunk)
    return h.hexdigest()

def download(url:str,dest:Path):
    req=urllib.request.Request(url,headers={'User-Agent':'HughesRoomViews-BlackHoleMuseum/1.0'})
    with urllib.request.urlopen(req,timeout=45) as r, dest.open('wb') as out:
        shutil.copyfileobj(r,out)

def stills(master:Path,asset:dict)->list[dict]:
    out=[]
    with Image.open(master) as im:
        im=im.convert('RGB')
        for width in (480,768,1280,1920):
            if width>im.width and width!=480: continue
            height=round(im.height*(width/im.width))
            resized=im.resize((width,height),Image.Resampling.LANCZOS)
            for fmt,ext,kwargs in [('WEBP','webp',{'quality':84,'method':6}),('AVIF','avif',{'quality':60})]:
                dest=DERIVED/f"{asset['id']}-{width}.{ext}"
                try:
                    resized.save(dest,fmt,**kwargs)
                except Exception:
                    if fmt=='AVIF': continue
                    raise
                out.append({'width':width,'height':height,'format':ext,'path':dest.relative_to(ROOT).as_posix(),'sha256':sha256(dest),'bytes':dest.stat().st_size})
    return out

def video(master:Path,asset:dict)->list[dict]:
    poster=DERIVED/f"{asset['id']}-poster.webp"
    mp4=DERIVED/f"{asset['id']}-1280.mp4"
    webm=DERIVED/f"{asset['id']}-1280.webm"
    subprocess.run(['ffmpeg','-y','-i',str(master),'-frames:v','1','-vf','scale=1280:-2',str(poster)],check=True)
    subprocess.run(['ffmpeg','-y','-i',str(master),'-vf','scale=1280:-2','-c:v','libx264','-preset','slow','-crf','24','-movflags','+faststart','-an',str(mp4)],check=True)
    subprocess.run(['ffmpeg','-y','-i',str(master),'-vf','scale=1280:-2','-c:v','libvpx-vp9','-crf','34','-b:v','0','-an',str(webm)],check=True)
    return [{'format':p.suffix[1:],'path':p.relative_to(ROOT).as_posix(),'sha256':sha256(p),'bytes':p.stat().st_size} for p in (poster,mp4,webm)]

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--only',action='append',help='Acquire only one or more asset ids.')
    args=ap.parse_args()
    data=yaml.safe_load(SOURCE.read_text(encoding='utf-8'))
    MASTER.mkdir(parents=True,exist_ok=True);DERIVED.mkdir(parents=True,exist_ok=True)
    selected=[a for a in data['assets'] if not args.only or a['id'] in args.only]
    failures=[]
    for asset in selected:
        dest=MASTER/asset['filename']
        print(f"[acquire] {asset['id']} <- {asset['downloadUrl']}",flush=True)
        try:
            if not dest.exists(): download(asset['downloadUrl'],dest)
            asset['masterPath']=dest.relative_to(ROOT).as_posix()
            asset['masterSha256']=sha256(dest)
            asset['masterBytes']=dest.stat().st_size
            asset['derivatives']=stills(dest,asset) if asset['kind']=='image' else video(dest,asset)
            asset['acquisitionStatus']='complete'
        except Exception as exc:
            asset['acquisitionStatus']='failed'
            asset['acquisitionError']=str(exc)
            failures.append((asset['id'],str(exc)))
    data['retrievalStatus']='complete' if not failures else 'partial'
    data['retrievalNote']='Acquired by scripts/acquire_black_hole_assets.py; verify source-page rights notes before deployment.'
    SOURCE.write_text(yaml.safe_dump(data,sort_keys=False,allow_unicode=True,width=1000),encoding='utf-8')
    if failures:
        for aid,msg in failures: print(f"[failed] {aid}: {msg}",file=sys.stderr)
        return 1
    return 0

if __name__=='__main__': raise SystemExit(main())
