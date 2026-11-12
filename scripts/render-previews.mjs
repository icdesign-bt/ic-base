import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sources = path.join(__dirname, 'preview-sources');
const outDir = path.join(root, 'public', 'previews');

const jobs = [
  { file: 'docx.html', out: 'preview-docx.jpg', width: 640, height: 800 },
  { file: 'pdf.html', out: 'preview-pdf.jpg', width: 640, height: 800 },
  { file: 'xlsx.html', out: 'preview-xlsx.jpg', width: 720, height: 540 },
  { file: 'pptx.html', out: 'preview-pptx.jpg', width: 720, height: 480 },
  { file: 'md.html', out: 'preview-md.jpg', width: 640, height: 800 },
  { file: 'image.html', out: 'preview-image.jpg', width: 720, height: 540 },
];

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
});

try {
  for (const job of jobs) {
    const page = await browser.newPage({
      viewport: { width: job.width, height: job.height },
      deviceScaleFactor: 2,
    });
    const url = `file://${path.join(sources, job.file)}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.screenshot({
      path: path.join(outDir, job.out),
      type: 'jpeg',
      quality: 88,
      fullPage: false,
    });
    await page.close();
    console.log('wrote', job.out);
  }
} finally {
  await browser.close();
}
