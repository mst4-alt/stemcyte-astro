const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  for (const svgFile of ['pregnancy-guide-outside.svg', 'pregnancy-guide-inside.svg']) {
    const svgPath = path.resolve(__dirname, svgFile);
    let svg = fs.readFileSync(svgPath, 'utf-8');

    // Find all image elements and downscale the base64 data to match display size
    const imageRegex = /<image x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" href="(data:image\/[^"]+)"/g;
    let match;
    const replacements = [];

    while ((match = imageRegex.exec(svg)) !== null) {
      const displayWidth = Math.ceil(parseFloat(match[3]) * 2); // 2x for retina
      const displayHeight = Math.ceil(parseFloat(match[4]) * 2);
      const dataUri = match[5];

      console.log(`${svgFile}: Image at (${match[1]},${match[2]}) display ${match[3]}x${match[4]} -> resize to ${displayWidth}x${displayHeight}`);

      replacements.push({
        original: match[0],
        x: match[1],
        y: match[2],
        width: match[3],
        height: match[4],
        dataUri,
        targetWidth: displayWidth,
        targetHeight: displayHeight,
      });
    }

    if (replacements.length === 0) {
      console.log(`${svgFile}: No images to optimize`);
      continue;
    }

    // Use Puppeteer to resize images via canvas
    for (const rep of replacements) {
      const resizedDataUri = await page.evaluate(async (dataUri, tw, th) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = tw;
            canvas.height = th;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, tw, th);
            // Use JPEG for the large cover image, PNG for logos
            const isLarge = tw > 200;
            if (isLarge) {
              resolve(canvas.toDataURL('image/jpeg', 0.85));
            } else {
              resolve(canvas.toDataURL('image/png'));
            }
          };
          img.src = dataUri;
        });
      }, rep.dataUri, rep.targetWidth, rep.targetHeight);

      const newTag = `<image x="${rep.x}" y="${rep.y}" width="${rep.width}" height="${rep.height}" href="${resizedDataUri}"`;
      svg = svg.replace(rep.original, newTag);

      const oldSize = rep.dataUri.length;
      const newSize = resizedDataUri.length;
      console.log(`  Resized: ${(oldSize/1024).toFixed(0)}KB -> ${(newSize/1024).toFixed(0)}KB`);
    }

    fs.writeFileSync(svgPath, svg);
    const fileSize = fs.statSync(svgPath).size;
    console.log(`Saved ${svgFile}: ${(fileSize/1024).toFixed(0)} KB`);
  }

  await browser.close();
  console.log('Done optimizing SVGs');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
