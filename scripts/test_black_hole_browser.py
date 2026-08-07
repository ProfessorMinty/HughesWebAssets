#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist/v0.1.0-black-hole-lab.1'
EVIDENCE=ROOT/'docs/evidence/black-hole-museum/v0.1.0-black-hole-lab.1'
EVIDENCE.mkdir(parents=True,exist_ok=True)
content=json.loads((DIST/'content/black-hole-museum.json').read_text(encoding='utf-8'))
assets=json.loads((DIST/'content/black-hole-assets.json').read_text(encoding='utf-8'))
experience=json.loads((DIST/'content/black-hole-experience.json').read_text(encoding='utf-8'))
release=json.loads((DIST/'release.json').read_text(encoding='utf-8'))
css=(DIST/'black-hole-museum.css').read_text(encoding='utf-8')
app=(DIST/'black-hole-museum.js').read_text(encoding='utf-8').replace('export async function mountBlackHoleMuseum','async function mountBlackHoleMuseum')
results=[]

def record(name,ok,detail=''):
    results.append({'test':name,'passed':bool(ok),'detail':detail})
    print('[PASS]' if ok else '[FAIL]',name,detail)

def load(page):
    html = "<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'></head><body style='margin:0;background:#02030a'><section id='hrv-black-hole-museum-root' class='hrv-native-fallback' data-hrv-page='repository-page-lab-black-holes' data-hrv-page-system='black-hole-museum' data-hrv-release-channel='black-hole-lab' data-hrv-schema='1.0'><h1>Fallback</h1><div data-hrv-fallback>Fallback remains.</div></section></body></html>"
    page.set_content(html)
    page.add_style_tag(content=css)
    page.add_script_tag(content=app)
    page.evaluate("""async ({release,content,assets,experience}) => {
      await mountBlackHoleMuseum({mount:document.getElementById('hrv-black-hole-museum-root'),release,content,assets,experience});
      document.documentElement.classList.add('hrv-route-black-hole-lab-ready');
      document.documentElement.dataset.harnessReady='true';
    }""",{'release':release,'content':content,'assets':assets,'experience':experience})

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    cases=[('desktop',1440,1000,False),('tablet',820,1100,False),('phone-320',320,740,False),('reduced-motion',1280,900,True)]
    for name,w,h,reduced in cases:
      context=browser.new_context(viewport={'width':w,'height':h},reduced_motion='reduce' if reduced else 'no-preference')
      page=context.new_page()
      load(page)
      count=page.locator('.bhm-chamber').count()
      record(name+' ten stations',count==10,str(count))
      overflow=page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 2")
      record(name+' no horizontal overflow',overflow,f"{page.evaluate('document.documentElement.scrollWidth')} / {w}")
      focusable=page.locator('button,select,a[href],summary,input').count()
      record(name+' interactive controls',focusable>=20,str(focusable))
      if reduced:
        mode=page.locator('.bhm-museum').get_attribute('data-motion')
        record(name+' still museum mode',mode=='still',str(mode))
      page.screenshot(path=str(EVIDENCE/f'{name}.png'),full_page=True)
      context.close()
    context=browser.new_context(viewport={'width':1280,'height':900})
    page=context.new_page();load(page)
    page.evaluate("document.body.style.zoom='2'")
    zoom_overflow=page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 2")
    record('200 percent zoom no horizontal overflow',zoom_overflow,f"{page.evaluate('document.documentElement.scrollWidth')} / 1280")
    zoom_controls=page.locator('.bhm-control-dock button,.bhm-control-dock select').count()
    record('200 percent zoom controls remain present',zoom_controls>=4,str(zoom_controls))
    page.screenshot(path=str(EVIDENCE/'zoom-200.png'),full_page=True)
    context.close()

    context=browser.new_context(viewport={'width':1280,'height':900})
    page=context.new_page();load(page)
    page.keyboard.press('Tab')
    tag=page.evaluate("document.activeElement.tagName")
    record('keyboard first focusable exists',tag in ('A','BUTTON','SELECT','INPUT','SUMMARY'),tag)
    page.locator('#invisible-sky-atrium button').nth(1).focus()
    outline=page.evaluate("getComputedStyle(document.activeElement).outlineStyle")
    record('focused control has visible outline',outline not in ('none',''),str(outline))
    page.keyboard.press('Enter')
    pressed=page.locator('#invisible-sky-atrium button').nth(1).get_attribute('aria-pressed')
    record('keyboard activates lensing state',pressed=='true',str(pressed))
    data_button=page.get_by_role('button',name='Use essential-content mode')
    data_button.click()
    data_mode=page.locator('.bhm-museum').get_attribute('data-data-mode')
    record('reduced-data essential-content mode',data_mode=='essential',str(data_mode))
    fallback_context=browser.new_context(viewport={'width':900,'height':700})
    fallback_page=fallback_context.new_page()
    fallback_page.set_content("<section id='hrv-black-hole-museum-root'><h1>Fallback</h1><div data-hrv-fallback>Fallback remains readable.</div><noscript>Fallback noscript.</noscript></section>")
    visible=fallback_page.locator('[data-hrv-fallback]').is_visible()
    record('native fallback is readable before enhancement',visible,str(visible))
    fallback_context.close()
    browser.close()
(EVIDENCE/'browser-results.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
if not all(r['passed'] for r in results): raise SystemExit(1)
