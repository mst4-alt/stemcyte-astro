const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const W = 1904;
const H = 704;

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const outsideSvg = fs.readFileSync(path.resolve(__dirname, 'pregnancy-guide-outside.svg'), 'utf-8');
  const insideSvg = fs.readFileSync(path.resolve(__dirname, 'pregnancy-guide-inside.svg'), 'utf-8');

  const jspdfPath = path.resolve(__dirname, 'node_modules/jspdf/dist/jspdf.umd.min.js');
  const svg2pdfPath = path.resolve(__dirname, 'node_modules/svg2pdf.js/dist/svg2pdf.umd.min.js');

  const jspdfCode = fs.readFileSync(jspdfPath, 'utf-8');
  const svg2pdfCode = fs.readFileSync(svg2pdfPath, 'utf-8');

  // Load font files as base64
  const fontsDir = path.resolve(__dirname, 'fonts');
  const fontFiles = {
    'Lato-300': fs.readFileSync(path.join(fontsDir, 'Lato-300.ttf')).toString('base64'),
    'Lato-400': fs.readFileSync(path.join(fontsDir, 'Lato-400.ttf')).toString('base64'),
    'Lato-700': fs.readFileSync(path.join(fontsDir, 'Lato-700.ttf')).toString('base64'),
    'Lato-900': fs.readFileSync(path.join(fontsDir, 'Lato-900.ttf')).toString('base64'),
    'PlayfairDisplay-400': fs.readFileSync(path.join(fontsDir, 'PlayfairDisplay-400.ttf')).toString('base64'),
    'PlayfairDisplay-500': fs.readFileSync(path.join(fontsDir, 'PlayfairDisplay-500.ttf')).toString('base64'),
    'PlayfairDisplay-600': fs.readFileSync(path.join(fontsDir, 'PlayfairDisplay-600.ttf')).toString('base64'),
    'PlayfairDisplay-700': fs.readFileSync(path.join(fontsDir, 'PlayfairDisplay-700.ttf')).toString('base64'),
    'SourceSerif4-300': fs.readFileSync(path.join(fontsDir, 'SourceSerif4-300.ttf')).toString('base64'),
    'SourceSerif4-400': fs.readFileSync(path.join(fontsDir, 'SourceSerif4-400.ttf')).toString('base64'),
    'SourceSerif4-600': fs.readFileSync(path.join(fontsDir, 'SourceSerif4-600.ttf')).toString('base64'),
    'SourceSerif4-700': fs.readFileSync(path.join(fontsDir, 'SourceSerif4-700.ttf')).toString('base64'),
  };

  const html = `<!DOCTYPE html>
<html>
<head>
<script>${jspdfCode}<\/script>
<script>${svg2pdfCode}<\/script>
</head>
<body>
<div id="svgContainer1" style="display:none;">${outsideSvg.replace(/<\?xml[^?]*\?>/, '')}</div>
<div id="svgContainer2" style="display:none;">${insideSvg.replace(/<\?xml[^?]*\?>/, '')}</div>
<script>
var FONTS = ${JSON.stringify(fontFiles)};

async function convert() {
  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [${W}, ${H}],
      hotfixes: ['px_scaling'],
    });

    // Register fonts
    // Lato
    pdf.addFileToVFS('Lato-300.ttf', FONTS['Lato-300']);
    pdf.addFont('Lato-300.ttf', 'Lato', 'normal', 300);
    pdf.addFileToVFS('Lato-400.ttf', FONTS['Lato-400']);
    pdf.addFont('Lato-400.ttf', 'Lato', 'normal', 400);
    pdf.addFileToVFS('Lato-700.ttf', FONTS['Lato-700']);
    pdf.addFont('Lato-700.ttf', 'Lato', 'bold', 700);
    pdf.addFileToVFS('Lato-900.ttf', FONTS['Lato-900']);
    pdf.addFont('Lato-900.ttf', 'Lato', 'bold', 900);

    // Playfair Display
    pdf.addFileToVFS('PlayfairDisplay-400.ttf', FONTS['PlayfairDisplay-400']);
    pdf.addFont('PlayfairDisplay-400.ttf', 'Playfair Display', 'normal', 400);
    pdf.addFileToVFS('PlayfairDisplay-500.ttf', FONTS['PlayfairDisplay-500']);
    pdf.addFont('PlayfairDisplay-500.ttf', 'Playfair Display', 'normal', 500);
    pdf.addFileToVFS('PlayfairDisplay-600.ttf', FONTS['PlayfairDisplay-600']);
    pdf.addFont('PlayfairDisplay-600.ttf', 'Playfair Display', 'normal', 600);
    pdf.addFileToVFS('PlayfairDisplay-700.ttf', FONTS['PlayfairDisplay-700']);
    pdf.addFont('PlayfairDisplay-700.ttf', 'Playfair Display', 'bold', 700);

    // Source Serif 4
    pdf.addFileToVFS('SourceSerif4-300.ttf', FONTS['SourceSerif4-300']);
    pdf.addFont('SourceSerif4-300.ttf', 'Source Serif 4', 'normal', 300);
    pdf.addFileToVFS('SourceSerif4-400.ttf', FONTS['SourceSerif4-400']);
    pdf.addFont('SourceSerif4-400.ttf', 'Source Serif 4', 'normal', 400);
    pdf.addFileToVFS('SourceSerif4-600.ttf', FONTS['SourceSerif4-600']);
    pdf.addFont('SourceSerif4-600.ttf', 'Source Serif 4', 'normal', 600);
    pdf.addFileToVFS('SourceSerif4-700.ttf', FONTS['SourceSerif4-700']);
    pdf.addFont('SourceSerif4-700.ttf', 'Source Serif 4', 'bold', 700);

    // Also register sans-serif fallback to Lato
    pdf.addFont('Lato-400.ttf', 'sans-serif', 'normal', 400);
    pdf.addFont('Lato-700.ttf', 'sans-serif', 'bold', 700);

    console.log('Fonts registered');

    const svg1 = document.querySelector('#svgContainer1 svg');
    const svg2 = document.querySelector('#svgContainer2 svg');

    console.log('Converting page 1...');
    await pdf.svg(svg1, { x: 0, y: 0, width: ${W}, height: ${H} });

    pdf.addPage([${W}, ${H}], 'landscape');
    console.log('Converting page 2...');
    await pdf.svg(svg2, { x: 0, y: 0, width: ${W}, height: ${H} });

    console.log('Generating PDF...');
    const output = pdf.output('datauristring');
    window.__pdfOutput = output;
    console.log('DONE');
  } catch(e) {
    console.error('Error:', e.message, e.stack);
    window.__pdfError = e.message;
  }
}
convert();
<\/script>
</body>
</html>`;

  const tempHtml = path.resolve(__dirname, 'temp-svg2pdf.html');
  fs.writeFileSync(tempHtml, html);

  page.on('console', msg => {
    const text = msg.text();
    // Suppress the repeated font lookup warnings to reduce noise
    if (!text.includes('Unable to look up font label')) {
      console.log('Browser:', text);
    }
  });

  await page.goto('file://' + tempHtml, { waitUntil: 'networkidle0', timeout: 60000 });

  // Wait for conversion (can take a while with large SVGs)
  await page.waitForFunction(() => window.__pdfOutput || window.__pdfError, { timeout: 180000 });

  const error = await page.evaluate(() => window.__pdfError);
  if (error) {
    console.error('Conversion failed:', error);
    fs.unlinkSync(tempHtml);
    await browser.close();
    process.exit(1);
  }

  const dataUri = await page.evaluate(() => window.__pdfOutput);
  const base64 = dataUri.split(',')[1];
  const buffer = Buffer.from(base64, 'base64');

  const outputPath = path.resolve(__dirname, 'pregnancy-guide-brochure-editable-new.pdf');
  fs.writeFileSync(outputPath, buffer);
  console.log(`PDF saved: ${outputPath} (${(buffer.length / 1024).toFixed(0)} KB)`);

  fs.unlinkSync(tempHtml);
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
