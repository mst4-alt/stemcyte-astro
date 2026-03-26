import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { setTimeout as sleep } from 'timers/promises';

const PANEL_W = 272;
const PANEL_H = 704;
const NUM_PANELS = 7;
const STRIP_W = PANEL_W * NUM_PANELS; // 1904
const STRIP_H = PANEL_H;             // 704

async function generateSVGForSide(page, htmlPath, side) {
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await sleep(1000);

  // Show correct side
  await page.evaluate((s) => {
    document.getElementById('out').classList.toggle('show', s === 'out');
    document.getElementById('in').classList.toggle('show', s === 'in');
  }, side);
  await sleep(500);

  // Clean up UI
  await page.evaluate(() => {
    const topbar = document.querySelector('.topbar');
    if (topbar) topbar.style.display = 'none';
    document.querySelectorAll('.hint').forEach(h => h.style.display = 'none');
    document.querySelectorAll('.side-label').forEach(h => h.style.display = 'none');
    document.body.style.background = 'white';
    document.querySelectorAll('.strip').forEach(s => s.style.boxShadow = 'none');
    document.querySelectorAll('.wrap').forEach(w => {
      w.style.padding = '0';
      w.style.overflow = 'visible';
    });
  });
  await sleep(300);

  // DOM-to-SVG serialization
  const svgStr = await page.evaluate((stripW, stripH) => {
    const wrap = document.querySelector('.wrap.show');
    const strip = wrap.querySelector('.strip');
    const stripRect = strip.getBoundingClientRect();

    let defs = '';
    let body = '';
    let defId = 0;

    function escXml(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    }

    function parsePx(v) {
      return parseFloat(v) || 0;
    }

    function walkElement(el, depth) {
      if (!el || el.nodeType === 8) return;

      if (el.nodeType === 3) {
        const text = el.textContent;
        if (!text || !text.trim()) return;

        const range = document.createRange();
        range.selectNodeContents(el);
        const rects = range.getClientRects();
        if (rects.length === 0) return;

        const parent = el.parentElement;
        if (!parent) return;
        const cs = getComputedStyle(parent);
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return;

        const fontFamily = cs.fontFamily;
        const fontSize = cs.fontSize;
        const fontWeight = cs.fontWeight;
        const fontStyle = cs.fontStyle;
        const color = cs.color;
        const letterSpacing = cs.letterSpacing;
        const textTransform = cs.textTransform;
        const textAlign = cs.textAlign;
        const lineHeight = cs.lineHeight;

        let displayText = text;
        if (textTransform === 'uppercase') displayText = displayText.toUpperCase();
        else if (textTransform === 'lowercase') displayText = displayText.toLowerCase();
        else if (textTransform === 'capitalize') {
          displayText = displayText.replace(/\b\w/g, c => c.toUpperCase());
        }

        // Use getClientRects to handle line wrapping properly
        // For multi-line text, we need to extract which text goes on which line
        // We'll use a character-by-character approach for accuracy
        if (rects.length === 1) {
          const r = rects[0];
          const x = r.left - stripRect.left;
          const y = r.top - stripRect.top;
          const w = r.width;
          const h = r.height;

          if (x + w < 0 || y + h < 0 || x > stripW || y > stripH) return;
          if (w < 0.5 || h < 0.5) return;

          const lineText = displayText.trim();
          if (!lineText) return;

          const lsAttr = letterSpacing !== 'normal' ? ` letter-spacing="${letterSpacing}"` : '';
          const fsAttr = fontStyle === 'italic' ? ` font-style="italic"` : '';
          const baselineY = y + h * 0.78;

          body += `<text x="${x.toFixed(1)}" y="${baselineY.toFixed(1)}" font-family="${escXml(fontFamily)}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}"${lsAttr}${fsAttr}>${escXml(lineText)}</text>\n`;
        } else {
          // Multi-line: extract text per line using Range
          const fullText = el.textContent;
          let charIdx = 0;
          let prevBottom = -999;
          let currentLine = '';
          let lineX = 0;
          let lineY = 0;
          let lineH = 0;
          const lines = [];

          for (let ci = 0; ci < fullText.length; ci++) {
            const charRange = document.createRange();
            charRange.setStart(el, ci);
            charRange.setEnd(el, Math.min(ci + 1, fullText.length));
            const charRects = charRange.getClientRects();
            if (charRects.length === 0) {
              currentLine += fullText[ci];
              continue;
            }
            const cr = charRects[0];
            // Detect new line (y changed significantly)
            if (Math.abs(cr.top - prevBottom) > 2 && prevBottom !== -999 && cr.top > prevBottom - 2) {
              if (currentLine.trim()) {
                lines.push({ text: currentLine, x: lineX, y: lineY, h: lineH });
              }
              currentLine = fullText[ci];
              lineX = cr.left - stripRect.left;
              lineY = cr.top - stripRect.top;
              lineH = cr.height;
            } else {
              if (!currentLine) {
                lineX = cr.left - stripRect.left;
                lineY = cr.top - stripRect.top;
                lineH = cr.height;
              }
              currentLine += fullText[ci];
            }
            prevBottom = cr.bottom;
          }
          if (currentLine.trim()) {
            lines.push({ text: currentLine, x: lineX, y: lineY, h: lineH });
          }

          const lsAttr = letterSpacing !== 'normal' ? ` letter-spacing="${letterSpacing}"` : '';
          const fsAttr = fontStyle === 'italic' ? ` font-style="italic"` : '';

          for (const line of lines) {
            let lt = line.text;
            if (textTransform === 'uppercase') lt = lt.toUpperCase();
            else if (textTransform === 'lowercase') lt = lt.toLowerCase();
            lt = lt.trim();
            if (!lt) continue;

            const baselineY = line.y + line.h * 0.78;
            body += `<text x="${line.x.toFixed(1)}" y="${baselineY.toFixed(1)}" font-family="${escXml(fontFamily)}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}"${lsAttr}${fsAttr}>${escXml(lt)}</text>\n`;
          }
        }
        return;
      }

      if (el.nodeType !== 1) return;

      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;

      const rect = el.getBoundingClientRect();
      const x = rect.left - stripRect.left;
      const y = rect.top - stripRect.top;
      const w = rect.width;
      const h = rect.height;

      if (x + w < -5 || y + h < -5 || x > stripW + 5 || y > stripH + 5) return;

      const bgColor = cs.backgroundColor;
      const bgImage = cs.backgroundImage;
      const borderRadius = parsePx(cs.borderRadius);
      const borderTop = parsePx(cs.borderTopWidth);
      const borderRight = parsePx(cs.borderRightWidth);
      const borderBottom = parsePx(cs.borderBottomWidth);
      const borderLeft = parsePx(cs.borderLeftWidth);
      const borderColor = cs.borderTopColor;
      const borderLeftColor = cs.borderLeftColor;
      const borderRightColor = cs.borderRightColor;
      const borderStyle = cs.borderTopStyle;
      const borderLeftStyle = cs.borderLeftStyle;
      const opacity = parseFloat(cs.opacity);
      const overflow = cs.overflow;

      const needsGroup = opacity < 1 && opacity > 0;
      if (needsGroup) {
        body += `<g opacity="${opacity.toFixed(2)}">`;
      }

      let clipId = null;
      if (overflow === 'hidden' && w > 0 && h > 0) {
        clipId = `clip${defId++}`;
        defs += `<clipPath id="${clipId}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${borderRadius.toFixed(1)}"/></clipPath>\n`;
        body += `<g clip-path="url(#${clipId})">`;
      }

      const hasBg = bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent';
      const hasGradient = bgImage && bgImage !== 'none' && bgImage.includes('gradient');

      if (hasGradient && w > 0 && h > 0) {
        const gradId = `grad${defId++}`;
        const match = bgImage.match(/linear-gradient\((.+)\)/);
        if (match) {
          const colorMatches = [...match[1].matchAll(/(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8})/g)];
          const colors = colorMatches.map(m => m[1]);
          if (colors.length >= 2) {
            defs += `<linearGradient id="${gradId}" x1="0" y1="0" x2="0.6" y2="1">`;
            for (let ci = 0; ci < colors.length; ci++) {
              const offset = ci / (colors.length - 1) * 100;
              defs += `<stop offset="${offset}%" stop-color="${colors[ci]}"/>`;
            }
            defs += `</linearGradient>\n`;
            body += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${borderRadius.toFixed(1)}" fill="url(#${gradId})"/>\n`;
          }
        }
      } else if (hasBg && w > 0 && h > 0) {
        body += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${borderRadius.toFixed(1)}" fill="${bgColor}"/>\n`;
      }

      // All borders
      if (borderTop > 0 && borderStyle === 'solid' && borderColor !== 'rgba(0, 0, 0, 0)') {
        body += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${borderTop.toFixed(1)}" fill="${borderColor}"/>\n`;
      }
      if (borderBottom > 0 && cs.borderBottomStyle === 'solid' && cs.borderBottomColor !== 'rgba(0, 0, 0, 0)') {
        body += `<rect x="${x.toFixed(1)}" y="${(y + h - borderBottom).toFixed(1)}" width="${w.toFixed(1)}" height="${borderBottom.toFixed(1)}" fill="${cs.borderBottomColor}"/>\n`;
      }
      if (borderRight > 0 && cs.borderRightStyle === 'solid' && borderRightColor !== 'rgba(0, 0, 0, 0)') {
        body += `<rect x="${(x + w - borderRight).toFixed(1)}" y="${y.toFixed(1)}" width="${borderRight.toFixed(1)}" height="${h.toFixed(1)}" fill="${borderRightColor}"/>\n`;
      }
      if (borderLeft > 0 && borderLeftStyle === 'solid' && borderLeftColor !== 'rgba(0, 0, 0, 0)' && borderStyle !== 'solid') {
        body += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${borderLeft.toFixed(1)}" height="${h.toFixed(1)}" fill="${borderLeftColor}"/>\n`;
      }

      // Dashed border
      if (borderStyle === 'dashed' && borderTop > 0) {
        body += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${borderRadius.toFixed(1)}" fill="none" stroke="${borderColor}" stroke-width="${borderTop}" stroke-dasharray="4 3"/>\n`;
      }

      // Timeline dots
      if (el.classList.contains('tl-dot')) {
        const dotBg = cs.backgroundColor;
        const dotBorder = cs.borderTopColor;
        const dotBW = parsePx(cs.borderTopWidth);
        const cx = x + w / 2;
        const cy = y + h / 2;
        const r = w / 2;
        if (dotBg && dotBg !== 'rgba(0, 0, 0, 0)') {
          body += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${dotBg}"/>`;
          if (dotBorder && dotBW > 0) {
            body += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r + dotBW / 2).toFixed(1)}" fill="none" stroke="${dotBorder}" stroke-width="${dotBW}"/>`;
          }
        }
      }

      // Checkbox boxes
      if (el.classList.contains('bx')) {
        const bxBorder = cs.borderTopColor;
        const bxBW = parsePx(cs.borderTopWidth);
        const bxRadius = parsePx(cs.borderRadius);
        body += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${bxRadius.toFixed(1)}" fill="none" stroke="${bxBorder}" stroke-width="${bxBW}"/>\n`;
      }

      // Images
      if (el.tagName === 'IMG') {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = el.naturalWidth || w;
          canvas.height = el.naturalHeight || h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(el, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          body += `<image x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" href="${dataUrl}" preserveAspectRatio="xMidYMid slice"/>\n`;
        } catch (e) {}
      }

      // SVG elements
      if (el.tagName === 'svg' || el.tagName === 'SVG') {
        const svgClone = el.cloneNode(true);
        svgClone.setAttribute('x', x.toFixed(1));
        svgClone.setAttribute('y', y.toFixed(1));
        svgClone.setAttribute('width', w.toFixed(1));
        svgClone.setAttribute('height', h.toFixed(1));
        body += svgClone.outerHTML + '\n';
        if (clipId) body += '</g>';
        if (needsGroup) body += '</g>';
        return;
      }

      // Recurse
      for (const child of el.childNodes) {
        walkElement(child, depth + 1);
      }

      if (clipId) body += '</g>';
      if (needsGroup) body += '</g>';
    }

    // Process pseudo-elements (timeline lines)
    function walkPseudoElements(el) {
      if (el.nodeType !== 1) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none') return;

      const before = getComputedStyle(el, '::before');
      if (before && before.content && before.content !== 'none' && before.content !== '""' && before.content !== "''") {
        if (el.classList.contains('tl-entry')) {
          const rect = el.getBoundingClientRect();
          const lineLeft = rect.left - stripRect.left + parsePx(before.left);
          const lineTop = rect.top - stripRect.top + parsePx(before.top);
          const lineW = parsePx(before.width);
          const lineH = rect.height - parsePx(before.top);
          const lineBg = before.backgroundColor;
          if (lineBg && lineBg !== 'rgba(0, 0, 0, 0)') {
            body += `<rect x="${lineLeft.toFixed(1)}" y="${lineTop.toFixed(1)}" width="${lineW.toFixed(1)}" height="${lineH.toFixed(1)}" fill="${lineBg}"/>\n`;
          }
        }
      }

      for (const child of el.children) {
        walkPseudoElements(child);
      }
    }

    for (const panel of strip.querySelectorAll('.p')) {
      walkElement(panel, 0);
    }
    walkPseudoElements(strip);

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 ${stripW} ${stripH}" width="${stripW}" height="${stripH}">
<defs>
${defs}
</defs>
${body}
</svg>`;
  }, STRIP_W, STRIP_H);

  return svgStr;
}

async function generatePDFForSide(page, htmlPath, side) {
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await sleep(1000);

  // Show correct side
  await page.evaluate((s) => {
    document.getElementById('out').classList.toggle('show', s === 'out');
    document.getElementById('in').classList.toggle('show', s === 'in');
  }, side);
  await sleep(500);

  // Set up for PDF printing - hide UI, size page to strip
  await page.evaluate((stripW, stripH) => {
    const topbar = document.querySelector('.topbar');
    if (topbar) topbar.remove();
    document.querySelectorAll('.hint').forEach(h => h.remove());
    document.querySelectorAll('.side-label').forEach(h => h.remove());

    // Remove the non-visible wrap entirely
    document.querySelectorAll('.wrap').forEach(w => {
      if (!w.classList.contains('show')) w.remove();
    });

    // Style body and wrap for print
    document.body.style.cssText = 'margin:0;padding:0;background:white;overflow:hidden;';
    const wrap = document.querySelector('.wrap.show');
    wrap.style.cssText = 'padding:0;overflow:visible;display:block;';

    const strip = wrap.querySelector('.strip');
    strip.style.cssText = `display:flex;width:${stripW}px;height:${stripH}px;margin:0;box-shadow:none;border-radius:0;overflow:hidden;`;

    // Add print stylesheet
    const style = document.createElement('style');
    style.textContent = `
      @page { size: ${stripW}px ${stripH}px; margin: 0; }
      @media print {
        body { margin: 0; padding: 0; background: white; }
        .wrap { padding: 0; overflow: visible; }
        .strip { box-shadow: none !important; border-radius: 0 !important; }
      }
    `;
    document.head.appendChild(style);
  }, STRIP_W, STRIP_H);
  await sleep(500);

  return page;
}

async function main() {
  const htmlPath = resolve('pregnancy-guide-brochure-v9.html');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
  });

  // --- Generate SVGs ---
  console.log('Generating outside SVG...');
  let page = await browser.newPage();
  await page.setViewport({ width: 2200, height: 800 });
  const outsideSVG = await generateSVGForSide(page, htmlPath, 'out');
  writeFileSync('pregnancy-guide-outside.svg', outsideSVG);
  console.log(`Outside SVG: ${outsideSVG.length} bytes`);
  await page.close();

  console.log('Generating inside SVG...');
  page = await browser.newPage();
  await page.setViewport({ width: 2200, height: 800 });
  const insideSVG = await generateSVGForSide(page, htmlPath, 'in');
  writeFileSync('pregnancy-guide-inside.svg', insideSVG);
  console.log(`Inside SVG: ${insideSVG.length} bytes`);
  await page.close();

  // --- Generate 2-page PDF directly from HTML ---
  console.log('Generating PDF page 1 (outside)...');
  const page1 = await browser.newPage();
  await page1.setViewport({ width: STRIP_W, height: STRIP_H });
  await generatePDFForSide(page1, htmlPath, 'out');
  const pdf1Buffer = await page1.pdf({
    width: `${STRIP_W}px`,
    height: `${STRIP_H}px`,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });
  writeFileSync('pregnancy-guide-outside.pdf', pdf1Buffer);
  console.log(`Outside PDF: ${pdf1Buffer.length} bytes`);
  await page1.close();

  console.log('Generating PDF page 2 (inside)...');
  const page2 = await browser.newPage();
  await page2.setViewport({ width: STRIP_W, height: STRIP_H });
  await generatePDFForSide(page2, htmlPath, 'in');
  const pdf2Buffer = await page2.pdf({
    width: `${STRIP_W}px`,
    height: `${STRIP_H}px`,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });
  writeFileSync('pregnancy-guide-inside.pdf', pdf2Buffer);
  console.log(`Inside PDF: ${pdf2Buffer.length} bytes`);
  await page2.close();

  // --- Merge PDFs using a simple approach ---
  // Create an HTML file that embeds both PDFs as iframes won't work
  // Instead, use a 2-page approach: create HTML with both strips and print
  console.log('Generating combined 2-page PDF...');
  const mergePage = await browser.newPage();
  await mergePage.setViewport({ width: STRIP_W, height: STRIP_H * 2 });

  // Build a combined HTML
  // We'll load both sides in sequence
  await mergePage.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await sleep(500);

  await mergePage.evaluate((stripW, stripH) => {
    // Remove UI
    document.querySelector('.topbar')?.remove();
    document.querySelectorAll('.hint').forEach(h => h.remove());
    document.querySelectorAll('.side-label').forEach(h => h.remove());

    // Show both wraps
    document.querySelectorAll('.wrap').forEach(w => {
      w.classList.add('show');
      w.style.cssText = 'padding:0;overflow:visible;display:block;page-break-after:always;';
    });

    document.body.style.cssText = 'margin:0;padding:0;background:white;';

    document.querySelectorAll('.strip').forEach(s => {
      s.style.cssText = `display:flex;width:${stripW}px;height:${stripH}px;margin:0;box-shadow:none;border-radius:0;overflow:hidden;`;
    });

    // Add print styles
    const style = document.createElement('style');
    style.textContent = `
      @page { size: ${stripW}px ${stripH}px; margin: 0; }
      @media print {
        body { margin: 0; padding: 0; background: white; }
        .wrap { padding: 0; overflow: visible; display: block; page-break-after: always; }
        .wrap:last-of-type { page-break-after: auto; }
        .strip { box-shadow: none !important; border-radius: 0 !important; }
      }
    `;
    document.head.appendChild(style);
  }, STRIP_W, STRIP_H);
  await sleep(500);

  const combinedPdf = await mergePage.pdf({
    width: `${STRIP_W}px`,
    height: `${STRIP_H}px`,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });
  writeFileSync('pregnancy-guide-brochure-editable.pdf', combinedPdf);
  console.log(`Combined PDF: ${combinedPdf.length} bytes`);
  await mergePage.close();

  await browser.close();
  console.log('Done!');
  console.log('Files generated:');
  console.log('  pregnancy-guide-outside.svg');
  console.log('  pregnancy-guide-inside.svg');
  console.log('  pregnancy-guide-brochure-editable.pdf (2-page)');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
