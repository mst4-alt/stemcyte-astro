import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import { readFile, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, 'pregnancy-guide-presentation.html');
const outputPath = path.resolve(__dirname, 'pregnancy-guide-brochure.pdf');

const TOTAL_SLIDES = 14;
const PANEL_WIDTH = 272;
const PANEL_HEIGHT = 704;

async function main() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set viewport large enough
  await page.setViewport({ width: 1400, height: 900 });

  console.log(`Loading ${htmlPath}...`);
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1000));

  const panelPdfs = [];

  for (let i = 0; i < TOTAL_SLIDES; i++) {
    console.log(`Rendering slide ${i + 1}/${TOTAL_SLIDES}...`);

    // Navigate to this slide
    await page.evaluate((idx) => {
      // Bypass animation guard
      window.current = idx;
      updateCarousel();
    }, i);

    await new Promise(r => setTimeout(r, 500));

    // Isolate the active panel for PDF capture
    await page.evaluate((idx) => {
      // Hide all presentation chrome
      const topbar = document.querySelector('.topbar');
      if (topbar) topbar.style.display = 'none';

      const progressTrack = document.querySelector('.progress-track');
      if (progressTrack) progressTrack.style.display = 'none';

      const nav = document.querySelector('.nav');
      if (nav) nav.style.display = 'none';

      const navButtons = document.querySelectorAll('.nav-btn, .counter, .nav-hint');
      navButtons.forEach(el => el.style.display = 'none');

      const flipIndicator = document.getElementById('flipIndicator');
      if (flipIndicator) flipIndicator.style.display = 'none';

      // Hide all slides except the current one
      const slides = document.querySelectorAll('.slide');
      slides.forEach((slide, j) => {
        if (j === idx) {
          slide.style.transform = 'none';
          slide.style.opacity = '1';
          slide.style.position = 'absolute';
          slide.style.left = '0';
          slide.style.top = '0';
          slide.style.zIndex = '1000';

          // Remove slide label
          const label = slide.querySelector('.slide-label');
          if (label) label.style.display = 'none';

          // Remove slide-panel wrapper perspective/transform
          const panel = slide.querySelector('.slide-panel');
          if (panel) {
            panel.style.transform = 'none';
            panel.style.perspective = 'none';
            panel.style.boxShadow = 'none';
          }

          // Make the .p element fill and position correctly
          const p = slide.querySelector('.p');
          if (p) {
            p.style.width = '272px';
            p.style.height = '704px';
          }
        } else {
          slide.style.display = 'none';
        }
      });

      // Set body/carousel background
      document.body.style.background = 'white';
      document.body.style.overflow = 'visible';

      const carousel = document.getElementById('carousel');
      if (carousel) {
        carousel.style.perspective = 'none';
        carousel.style.position = 'relative';
        carousel.style.width = '272px';
        carousel.style.height = '704px';
      }
    }, i);

    await new Promise(r => setTimeout(r, 300));

    const pdfPath = path.resolve(__dirname, `panel-${i + 1}.pdf`);
    await page.pdf({
      path: pdfPath,
      width: `${PANEL_WIDTH}px`,
      height: `${PANEL_HEIGHT}px`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    panelPdfs.push(pdfPath);

    // Reload page for clean state for next slide
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 500));
  }

  await browser.close();

  // Combine into 2 pages (7 panels each, side by side)
  console.log('Combining into 2-page brochure...');
  const mergedPdf = await PDFDocument.create();

  // Puppeteer renders 272 CSS px → 204 PDF pts (0.75 ratio)
  // We want each panel to be 272×704 pts in the final PDF
  const TARGET_W = 272;
  const TARGET_H = 704;
  const PAGE_W = TARGET_W * 7; // 1904
  const SCALE = TARGET_W / 204; // ~1.333 to scale from 204→272 pts

  // Load all 14 panel PDFs as documents
  const panelDocs = [];
  for (const pdfPath of panelPdfs) {
    const pdfBytes = await readFile(pdfPath);
    panelDocs.push(await PDFDocument.load(pdfBytes));
  }

  // Page 1: panels 1-7, Page 2: panels 8-14
  for (let pageIdx = 0; pageIdx < 2; pageIdx++) {
    const newPage = mergedPdf.addPage([PAGE_W, TARGET_H]);
    const startPanel = pageIdx * 7;

    for (let col = 0; col < 7; col++) {
      const panelDoc = panelDocs[startPanel + col];
      const [embedded] = await mergedPdf.embedPdf(panelDoc, [0]);
      // Place at x offset, scaled up from 204×528 → 272×704
      newPage.drawPage(embedded, {
        x: col * TARGET_W,
        y: 0,
        width: TARGET_W,
        height: TARGET_H
      });
    }
  }

  const mergedBytes = await mergedPdf.save();
  await writeFile(outputPath, mergedBytes);
  console.log(`Saved: ${outputPath}`);

  // Clean up individual PDFs
  for (const pdfPath of panelPdfs) {
    await unlink(pdfPath);
  }
  console.log('Cleaned up individual panel PDFs.');

  // Verify
  const finalDoc = await PDFDocument.load(await readFile(outputPath));
  const pageCount = finalDoc.getPageCount();
  console.log(`\nVerification:`);
  console.log(`  Pages: ${pageCount}`);
  for (let i = 0; i < pageCount; i++) {
    const pg = finalDoc.getPage(i);
    const { width, height } = pg.getSize();
    console.log(`  Page ${i + 1}: ${width.toFixed(1)} x ${height.toFixed(1)} pts`);
  }
  console.log('\nDone!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
