const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const htmlPath = path.resolve(__dirname, 'pregnancy-guide-brochure-v9.html');
  const outputPath = path.resolve(__dirname, 'pregnancy-guide-brochure.pdf');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });

  const page = await browser.newPage();

  // Set a large viewport so the strip renders fully
  await page.setViewport({ width: 2200, height: 900, deviceScaleFactor: 2 });

  // Load the HTML file
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for Google Fonts to load
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1000));

  // Helper: prepare the page for capture
  async function prepareForCapture() {
    await page.evaluate(() => {
      // Hide topbar, hint, side-label
      document.querySelectorAll('.topbar, .hint, .side-label').forEach(el => {
        el.style.display = 'none';
      });
      // Remove padding from wrap
      document.querySelectorAll('.wrap').forEach(el => {
        el.style.padding = '0';
        el.style.margin = '0';
      });
      // Body background white
      document.body.style.background = '#fff';
      // Remove strip box-shadow and border-radius
      document.querySelectorAll('.strip').forEach(el => {
        el.style.boxShadow = 'none';
        el.style.borderRadius = '0';
      });
    });
  }

  // Capture OUTSIDE strip
  console.log('Capturing outside strip...');
  // Click "Outside" toggle button (first button)
  await page.evaluate(() => {
    const btn = document.querySelector('.toggle button:first-child');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await prepareForCapture();
  await new Promise(r => setTimeout(r, 300));

  const outsideStrip = await page.$('#out .strip');
  if (!outsideStrip) throw new Error('Could not find #out .strip');
  const outsideBox = await outsideStrip.boundingBox();
  console.log(`Outside strip: ${outsideBox.width}x${outsideBox.height}`);
  const outsideScreenshot = await outsideStrip.screenshot({ type: 'png' });
  fs.writeFileSync('/tmp/outside.png', outsideScreenshot);
  console.log('Outside strip captured.');

  // Capture INSIDE strip
  console.log('Capturing inside strip...');
  await page.evaluate(() => {
    const btn = document.querySelector('.toggle button:last-child');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await prepareForCapture();
  await new Promise(r => setTimeout(r, 300));

  const insideStrip = await page.$('#in .strip');
  if (!insideStrip) throw new Error('Could not find #in .strip');
  const insideBox = await insideStrip.boundingBox();
  console.log(`Inside strip: ${insideBox.width}x${insideBox.height}`);
  const insideScreenshot = await insideStrip.screenshot({ type: 'png' });
  fs.writeFileSync('/tmp/inside.png', insideScreenshot);
  console.log('Inside strip captured.');

  // Now create a PDF by loading an HTML page with both images
  const pdfPage = await browser.newPage();

  // The strip is 1904x704 at 1x. With deviceScaleFactor 2, screenshots are 3808x1408.
  // We'll create an HTML doc that places each image on its own page, sized to fit.
  const outsideB64 = outsideScreenshot.toString('base64');
  const insideB64 = insideScreenshot.toString('base64');

  // Use the actual bounding box dimensions (CSS pixels) for the PDF page size
  const stripW = Math.round(outsideBox.width);
  const stripH = Math.round(outsideBox.height);

  const pdfHtml = `<!DOCTYPE html>
<html>
<head>
<style>
  @page { size: ${stripW}px ${stripH}px; margin: 0; }
  * { margin: 0; padding: 0; }
  body { margin: 0; padding: 0; }
  .page { width: ${stripW}px; height: ${stripH}px; page-break-after: always; overflow: hidden; }
  .page:last-child { page-break-after: auto; }
  img { width: ${stripW}px; height: ${stripH}px; display: block; }
</style>
</head>
<body>
  <div class="page"><img src="data:image/png;base64,${outsideB64}"></div>
  <div class="page"><img src="data:image/png;base64,${insideB64}"></div>
</body>
</html>`;

  await pdfPage.setContent(pdfHtml, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  await pdfPage.pdf({
    path: outputPath,
    width: `${stripW}px`,
    height: `${stripH}px`,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    printBackground: true,
    preferCSSPageSize: true
  });

  console.log(`PDF saved to ${outputPath}`);

  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
