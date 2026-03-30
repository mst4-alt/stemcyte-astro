const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const HTML_PATH = path.resolve(__dirname, 'pregnancy-guide-brochure-v11.html');
const STRIP_WIDTH = 1904;
const STRIP_HEIGHT = 704;

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 2200, height: 900 });

  const fileUrl = 'file://' + HTML_PATH;
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 2000));

  for (const side of ['out', 'in']) {
    // Show the correct side
    await page.evaluate((s) => {
      document.getElementById('out').classList.toggle('show', s === 'out');
      document.getElementById('in').classList.toggle('show', s === 'in');
    }, side);
    await new Promise(r => setTimeout(r, 500));

    // Hide UI chrome
    await page.evaluate(() => {
      const topbar = document.querySelector('.topbar');
      if (topbar) topbar.style.display = 'none';
      document.querySelectorAll('.hint, .side-label, .pn').forEach(el => el.style.display = 'none');
      document.body.style.background = 'white';
    });

    const svgContent = await page.evaluate((sideId, W, H) => {
      const wrap = document.getElementById(sideId);
      const strip = wrap.querySelector('.strip');
      const stripRect = strip.getBoundingClientRect();

      const svgParts = [];
      const defsArr = [];
      let gradientId = 0;

      function escapeXml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }

      function parseRgba(color) {
        if (!color) return null;
        const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
        if (m) {
          return { r: parseInt(m[1]), g: parseInt(m[2]), b: parseInt(m[3]), a: m[4] !== undefined ? parseFloat(m[4]) : 1 };
        }
        return null;
      }

      function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
      }

      function isTransparent(color) {
        if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return true;
        const p = parseRgba(color);
        return p && p.a === 0;
      }

      function colorToSvgAttrs(color) {
        const p = parseRgba(color);
        if (p) return { hex: rgbToHex(p.r, p.g, p.b), opacity: p.a };
        return { hex: color, opacity: 1 };
      }

      // Parse gradient from computed backgroundImage
      function parseGradient(bgImage) {
        const gMatch = bgImage.match(/linear-gradient\((.+)\)/);
        if (!gMatch) return null;

        const raw = gMatch[1];

        // Smart split: split on commas NOT inside parentheses
        const tokens = [];
        let depth = 0, current = '';
        for (let i = 0; i < raw.length; i++) {
          const c = raw[i];
          if (c === '(') depth++;
          else if (c === ')') depth--;
          else if (c === ',' && depth === 0) {
            tokens.push(current.trim());
            current = '';
            continue;
          }
          current += c;
        }
        if (current.trim()) tokens.push(current.trim());

        let angle = 180;
        const colors = [];

        for (const t of tokens) {
          const angleMatch = t.match(/^(\d+)deg$/);
          if (angleMatch) {
            angle = parseInt(angleMatch[1]);
          } else if (t.match(/^(rgb|#)/)) {
            // May have percentage after color, strip it
            const colorPart = t.replace(/\s+[\d.]+%$/, '');
            colors.push(colorPart);
          }
        }

        if (colors.length < 2) return null;

        const id = 'grad' + (gradientId++);
        const rad = (angle - 90) * Math.PI / 180;
        const x1 = (0.5 - 0.5 * Math.cos(rad)).toFixed(4);
        const y1 = (0.5 - 0.5 * Math.sin(rad)).toFixed(4);
        const x2 = (0.5 + 0.5 * Math.cos(rad)).toFixed(4);
        const y2 = (0.5 + 0.5 * Math.sin(rad)).toFixed(4);

        let gradDef = `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">`;
        colors.forEach((c, i) => {
          const offset = (i / (colors.length - 1) * 100).toFixed(1) + '%';
          const { hex, opacity } = colorToSvgAttrs(c);
          gradDef += `<stop offset="${offset}" stop-color="${hex}" stop-opacity="${opacity}"/>`;
        });
        gradDef += '</linearGradient>';
        defsArr.push(gradDef);
        return `url(#${id})`;
      }

      function processElement(el) {
        if (el.nodeType !== Node.ELEMENT_NODE) return;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;

        const rect = el.getBoundingClientRect();
        const x = rect.left - stripRect.left;
        const y = rect.top - stripRect.top;
        const w = rect.width;
        const h = rect.height;

        if (x + w < -10 || y + h < -10 || x > W + 10 || y > H + 10) return;
        if (w < 0.5 || h < 0.5) return;

        const tagName = el.tagName.toLowerCase();

        // Handle images
        if (tagName === 'img') {
          const src = el.src;
          if (src) {
            svgParts.push(`<image x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" href="${escapeXml(src)}" preserveAspectRatio="xMidYMid slice"/>`);
          }
          return;
        }

        // Background
        const bgColor = cs.backgroundColor;
        const bgImage = cs.backgroundImage;
        const borderRadius = parseFloat(cs.borderRadius) || 0;

        if (bgImage && bgImage !== 'none' && bgImage.includes('gradient')) {
          const gradFill = parseGradient(bgImage);
          if (gradFill) {
            svgParts.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${gradFill}" rx="${borderRadius}"/>`);
          }
        }

        if (!isTransparent(bgColor)) {
          const { hex, opacity } = colorToSvgAttrs(bgColor);
          if (opacity > 0.005) {
            let attrs = `x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${hex}" rx="${borderRadius}"`;
            if (opacity < 1) attrs += ` fill-opacity="${opacity.toFixed(3)}"`;
            svgParts.push(`<rect ${attrs}/>`);
          }
        }

        // Borders
        function borderLine(style, width, color, lx1, ly1, lx2, ly2) {
          if (style === 'none' || width < 0.5 || isTransparent(color)) return;
          const { hex, opacity } = colorToSvgAttrs(color);
          let attrs = `x1="${lx1.toFixed(1)}" y1="${ly1.toFixed(1)}" x2="${lx2.toFixed(1)}" y2="${ly2.toFixed(1)}" stroke="${hex}" stroke-width="${width}"`;
          if (opacity < 1) attrs += ` stroke-opacity="${opacity.toFixed(3)}"`;
          if (style === 'dashed') attrs += ' stroke-dasharray="4,3"';
          svgParts.push(`<line ${attrs}/>`);
        }

        const btw = parseFloat(cs.borderTopWidth) || 0;
        const bbw = parseFloat(cs.borderBottomWidth) || 0;
        const blw = parseFloat(cs.borderLeftWidth) || 0;
        const brw = parseFloat(cs.borderRightWidth) || 0;
        const bts = cs.borderTopStyle;

        if (btw > 0 && btw === bbw && btw === blw && btw === brw && bts !== 'none') {
          const bc = cs.borderTopColor;
          if (!isTransparent(bc)) {
            const { hex, opacity } = colorToSvgAttrs(bc);
            let attrs = `x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="none" stroke="${hex}" stroke-width="${btw}" rx="${borderRadius}"`;
            if (opacity < 1) attrs += ` stroke-opacity="${opacity.toFixed(3)}"`;
            if (bts === 'dashed') attrs += ' stroke-dasharray="4,3"';
            svgParts.push(`<rect ${attrs}/>`);
          }
        } else {
          borderLine(bts, btw, cs.borderTopColor, x, y, x + w, y);
          borderLine(cs.borderBottomStyle, bbw, cs.borderBottomColor, x, y + h, x + w, y + h);
          borderLine(cs.borderLeftStyle, blw, cs.borderLeftColor, x, y, x, y + h);
          borderLine(cs.borderRightStyle, brw, cs.borderRightColor, x + w, y, x + w, y + h);
        }

        // Recurse into children (elements only for shape pass)
        for (const child of el.childNodes) {
          if (child.nodeType === Node.ELEMENT_NODE) {
            processElement(child);
          }
        }
      }

      function processTextNodes(el) {
        if (el.nodeType !== Node.ELEMENT_NODE) return;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;

        for (const child of el.childNodes) {
          if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent;
            if (!text || !text.trim()) continue;

            const range = document.createRange();
            range.selectNodeContents(child);
            const rects = range.getClientRects();
            if (rects.length === 0) continue;

            const parent = child.parentElement;
            const pcs = getComputedStyle(parent);
            const color = pcs.color;
            if (isTransparent(color)) continue;
            const { hex, opacity } = colorToSvgAttrs(color);
            const fontSize = parseFloat(pcs.fontSize);
            const fontFamily = pcs.fontFamily;
            const fontWeight = pcs.fontWeight;
            const fontStyle = pcs.fontStyle;
            const letterSpacing = pcs.letterSpacing;
            const textTransform = pcs.textTransform;

            let fullText = text;
            if (textTransform === 'uppercase') fullText = fullText.toUpperCase();

            if (rects.length === 1) {
              const r = rects[0];
              const tx = r.left - stripRect.left;
              const ty = r.top - stripRect.top + fontSize * 0.82;
              if (tx > W + 10 || ty > H + 10 || tx + r.width < -10) continue;

              let attrs = `x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${hex}"`;
              if (opacity < 1) attrs += ` fill-opacity="${opacity.toFixed(3)}"`;
              if (fontStyle === 'italic') attrs += ' font-style="italic"';
              if (letterSpacing && letterSpacing !== 'normal') attrs += ` letter-spacing="${letterSpacing}"`;
              svgParts.push(`<text ${attrs}>${escapeXml(fullText.trim())}</text>`);
            } else {
              // Multi-line: measure each line by grouping characters by vertical position
              const lines = [];
              let currentLine = null;

              for (let i = 0; i < child.textContent.length; i++) {
                range.setStart(child, i);
                range.setEnd(child, Math.min(i + 1, child.textContent.length));
                const charRects = range.getClientRects();
                if (charRects.length === 0) continue;

                const cr = charRects[0];
                const charTop = Math.round(cr.top);

                if (!currentLine) {
                  currentLine = { text: child.textContent[i], x: cr.left - stripRect.left, y: cr.top - stripRect.top + fontSize * 0.82, top: charTop };
                } else if (Math.abs(charTop - currentLine.top) > fontSize * 0.3) {
                  if (currentLine.text.trim()) lines.push({ ...currentLine });
                  currentLine = { text: child.textContent[i], x: cr.left - stripRect.left, y: cr.top - stripRect.top + fontSize * 0.82, top: charTop };
                } else {
                  currentLine.text += child.textContent[i];
                }
              }
              if (currentLine && currentLine.text.trim()) lines.push(currentLine);

              for (const line of lines) {
                let displayText = line.text.trim();
                if (textTransform === 'uppercase') displayText = displayText.toUpperCase();
                if (!displayText) continue;

                let attrs = `x="${line.x.toFixed(1)}" y="${line.y.toFixed(1)}" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${hex}"`;
                if (opacity < 1) attrs += ` fill-opacity="${opacity.toFixed(3)}"`;
                if (fontStyle === 'italic') attrs += ' font-style="italic"';
                if (letterSpacing && letterSpacing !== 'normal') attrs += ` letter-spacing="${letterSpacing}"`;
                svgParts.push(`<text ${attrs}>${escapeXml(displayText)}</text>`);
              }
            }
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            processTextNodes(child);
          }
        }
      }

      // Pass 1: backgrounds, borders, shapes
      processElement(strip);
      // Pass 2: text on top
      processTextNodes(strip);

      let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      svg += `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">\n`;
      if (defsArr.length > 0) {
        svg += '<defs>\n' + defsArr.join('\n') + '\n</defs>\n';
      }
      svg += svgParts.join('\n');
      svg += '\n</svg>';
      return svg;
    }, side, STRIP_WIDTH, STRIP_HEIGHT);

    const filename = side === 'out' ? 'pregnancy-guide-outside.svg' : 'pregnancy-guide-inside.svg';
    fs.writeFileSync(path.resolve(__dirname, filename), svgContent);
    console.log(`Saved ${filename} (${(svgContent.length / 1024).toFixed(0)} KB)`);
  }

  await browser.close();
  console.log('Done generating SVGs');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
