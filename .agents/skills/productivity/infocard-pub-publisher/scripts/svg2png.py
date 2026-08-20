#!/usr/bin/env python3
"""
SVG → 512x512 PNG converter for PWA icon generation.
Requires: PIL (pillow). Usage: python3 svg2png.py <input.svg> <output.png>
Fallback: parses rect/shape elements only — sufficient for simple flat icons.
"""
import sys
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

def hex2rgba(s, default=(255,255,255,255)):
    s = s.lstrip('#')
    if s == 'none': return (0,0,0,0)
    if len(s) == 6: return (int(s[0:2],16), int(s[2:4],16), int(s[4:6],16), 255)
    if len(s) == 8: return (int(s[0:2],16), int(s[2:4],16), int(s[4:6],16), int(s[6:8],16))
    return default

def main():
    svg_path = sys.argv[1] if len(sys.argv) > 1 else 'icon.svg'
    out_path = sys.argv[2] if len(sys.argv) > 2 else 'icon-512.png'

    svg = open(svg_path).read()
    root = ET.fromstring(svg)
    vb = root.get('viewBox', '0 0 256 256').split()
    src_w, src_h = int(vb[2]), int(vb[3])
    tgt_size = 512

    img = Image.new('RGBA', (tgt_size, tgt_size), (0,0,0,0))
    draw = ImageDraw.Draw(img)

    def sc(v): return int(float(v) * tgt_size / src_w)

    for el in root.iter():
        tag = el.tag.split('}')[-1] if '}' in el.tag else el.tag
        if tag not in ('rect', 'circle', 'ellipse', 'polygon', 'line', 'path'):
            continue
        x = float(el.get('x', 0))
        y = float(el.get('y', 0))
        w = float(el.get('width', 0))
        h = float(el.get('height', 0))
        rx = float(el.get('rx', 0))
        fill = hex2rgba(el.get('fill', 'none'))
        stroke = hex2rgba(el.get('stroke', 'none'))
        sw = float(el.get('stroke-width', 0))

        x1,y1,x2,y2 = sc(x), sc(y), sc(x+w), sc(y+h)
        rx_sc = sc(rx)

        if fill[3] > 0:
            if tag == 'rect':
                draw.rounded_rectangle([x1,y1,x2,y2], radius=rx_sc, fill=fill)
            else:
                draw.rectangle([x1,y1,x2,y2], fill=fill)
        if sw > 0 and stroke[3] > 0:
            draw.rounded_rectangle([x1,y1,x2,y2], radius=rx_sc, outline=stroke, width=int(sw))

    img.save(out_path)
    result = Image.open(out_path)
    print(f'DONE {result.size} → {out_path}')

if __name__ == '__main__':
    main()