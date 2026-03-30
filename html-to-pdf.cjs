const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const HTML_PATH = path.resolve(__dirname, 'pregnancy-guide-brochure-v11.html');
const STRIP_WIDTH = 1904;
const STRIP_HEIGHT = 704;

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Set viewport wide enough for the strip
  await page.setViewport({ width: STRIP_WIDTH + 100, height: STRIP_HEIGHT + 100 });

  let htmlContent = fs.readFileSync(HTML_PATH, 'utf-8');

  // Inject comprehensive print/screen CSS
  const injectCSS = `
    <style>
      @page {
        size: ${STRIP_WIDTH}px ${STRIP_HEIGHT}px;
        margin: 0;
      }
      body {
        background: white !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        width: ${STRIP_WIDTH}px !important;
      }
      .topbar, .hint, .side-label, .pn { display: none !important; }

      .wrap {
        display: block !important;
        padding: 0 !important;
        margin: 0 !important;
        overflow: visible !important;
        width: ${STRIP_WIDTH}px !important;
      }

      .strip {
        width: ${STRIP_WIDTH}px !important;
        height: ${STRIP_HEIGHT}px !important;
        margin: 0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        page-break-after: always;
        break-after: page;
        overflow: hidden !important;
      }

      .p {
        width: 272px !important;
        height: 704px !important;
        flex-shrink: 0 !important;
      }
    </style>
  `;

  htmlContent = htmlContent.replace('</head>', injectCSS + '</head>');

  const tempHtml = path.resolve(__dirname, 'temp-print.html');
  fs.writeFileSync(tempHtml, htmlContent);

  await page.goto('file://' + tempHtml, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 2000));

  // Force both wraps visible, hide chrome
  await page.evaluate(() => {
    document.querySelectorAll('.wrap').forEach(w => {
      w.classList.add('show');
      w.style.display = 'block';
      w.style.padding = '0';
      w.style.margin = '0';
      w.style.overflow = 'visible';
    });
    document.querySelectorAll('.topbar, .hint, .side-label, .pn').forEach(el => {
      el.style.display = 'none';
    });
    document.querySelectorAll('.strip').forEach(s => {
      s.style.margin = '0';
      s.style.boxShadow = 'none';
      s.style.borderRadius = '0';
    });
    document.body.style.background = 'white';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '1904px';
  });

  await new Promise(r => setTimeout(r, 500));

  // Check actual strip dimensions
  const dims = await page.evaluate(() => {
    const strips = document.querySelectorAll('.strip');
    return Array.from(strips).map(s => {
      const r = s.getBoundingClientRect();
      return { w: r.width, h: r.height, x: r.x, y: r.y };
    });
  });
  console.log('Strip dimensions:', JSON.stringify(dims));

  await page.pdf({
    path: path.resolve(__dirname, 'pregnancy-guide-brochure-editable-new.pdf'),
    width: `${STRIP_WIDTH}px`,
    height: `${STRIP_HEIGHT}px`,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    tagged: true
  });

  const stat = fs.statSync(path.resolve(__dirname, 'pregnancy-guide-brochure-editable-new.pdf'));
  console.log(`PDF generated: ${(stat.size / 1024).toFixed(0)} KB`);

  fs.unlinkSync(tempHtml);
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
