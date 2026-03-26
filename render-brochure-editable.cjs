const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const htmlPath = path.resolve(__dirname, 'pregnancy-guide-brochure-v9.html');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });

  // Strip dimensions: 7 panels × 272px = 1904px wide, 704px tall
  const STRIP_W = 1904;
  const STRIP_H = 704;

  async function captureStripAsPdf(side, outputPath) {
    const page = await browser.newPage();
    await page.setViewport({ width: 2200, height: 900, deviceScaleFactor: 1 });

    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for Google Fonts
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 1000));

    // Click the correct toggle
    if (side === 'outside') {
      await page.evaluate(() => {
        document.querySelector('.toggle button:first-child').click();
      });
    } else {
      await page.evaluate(() => {
        document.querySelector('.toggle button:last-child').click();
      });
    }
    await new Promise(r => setTimeout(r, 500));

    // Inject print styles and prepare the page
    const wrapId = side === 'outside' ? 'out' : 'in';
    await page.evaluate((wrapId, STRIP_W, STRIP_H) => {
      // Remove everything except the target strip
      document.querySelector('.topbar').style.display = 'none';
      document.querySelectorAll('.hint').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.side-label').forEach(el => el.style.display = 'none');

      // Hide the other wrap
      document.querySelectorAll('.wrap').forEach(el => {
        if (el.id !== wrapId) el.style.display = 'none';
      });

      // Style the active wrap
      const wrap = document.getElementById(wrapId);
      wrap.style.display = 'block';
      wrap.style.padding = '0';
      wrap.style.margin = '0';
      wrap.style.overflow = 'visible';

      // Style the strip
      const strip = wrap.querySelector('.strip');
      strip.style.boxShadow = 'none';
      strip.style.borderRadius = '0';
      strip.style.margin = '0';

      // Body
      document.body.style.background = '#fff';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'visible';

      // Add print styles
      const style = document.createElement('style');
      style.textContent = `
        @page {
          size: ${STRIP_W}px ${STRIP_H}px;
          margin: 0;
        }
        @media print {
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }
          .topbar, .hint, .side-label { display: none !important; }
          .wrap {
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .strip {
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
          }
        }
      `;
      document.head.appendChild(style);
    }, wrapId, STRIP_W, STRIP_H);

    await new Promise(r => setTimeout(r, 300));

    // Generate PDF - Chrome renders text as text, vectors as vectors
    await page.pdf({
      path: outputPath,
      width: `${STRIP_W}px`,
      height: `${STRIP_H}px`,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      printBackground: true,
      preferCSSPageSize: true
    });

    console.log(`${side} PDF saved to ${outputPath}`);
    await page.close();
  }

  // Capture both sides
  await captureStripAsPdf('outside', '/tmp/outside-strip.pdf');
  await captureStripAsPdf('inside', '/tmp/inside-strip.pdf');

  await browser.close();
  console.log('Both strip PDFs generated. Merging...');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
