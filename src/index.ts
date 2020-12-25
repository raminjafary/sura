import path from 'path'
import { chromium } from 'playwright'
//@ts-expect-error missing types
import sass from 'sass'

export interface PDFOutput {
  pdf: Buffer
  fsPath: string | undefined
}

export interface PDFOptions {
  style?: StyleOptions
  fsPath?: string
  waitUntil?: 'domcontentloaded' | 'load' | 'networkidle' | undefined
  htmlPath?: string
  format?: string
  printBackground?: boolean
  headerTemplate?: string
  footerTemplate?: string
  displayHeaderFooter?: boolean
}

export interface StyleOptions {
  file?: string | undefined
  outputStyle?: 'expanded' | 'compressed' | 'nested' | 'compact'
}

export function generatePDF(options: PDFOptions): Promise<PDFOutput>

export async function generatePDF({
  fsPath = undefined,
  htmlPath = path.join(__dirname, '..', 'public', 'index.html'),
  format = 'A4',
  waitUntil = 'networkidle',
  style = {} as StyleOptions,
  printBackground = false,
  displayHeaderFooter = true,
  headerTemplate = `
    <div style="font-size:7px;white-space:nowrap;margin-left:40px;">
        ${new Date().toDateString()}
        <span class="title" style="margin-left: 10px;"></span>
    </div>
`,
  footerTemplate = `
    <div style="font-size:6px;white-space:nowrap;margin-left:40px;width:100%;">
        <span style="display:inline-block;float:right;margin-right:10px;">
            <span class="pageNumber"></span> / <span class="totalPages"></span>
        </span>
    </div>`,
}: PDFOptions): Promise<PDFOutput> {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage'],
  })

  const page = await browser.newPage()

  await page.goto(`file:${htmlPath}`, {
    waitUntil,
  })

  await page.addStyleTag({
    content: `
        ${renderSass(style)}
        `,
  })

  await page.emulateMedia({ media: 'print' })

  const pdf = await page.pdf({
    format,
    path: fsPath,
    printBackground,
    displayHeaderFooter,
    headerTemplate,
    footerTemplate,
    margin: {
      top: '40px',
      right: '40px',
      bottom: '40px',
      left: '40px',
    },
  })

  await browser.close()

  return {
    pdf,
    fsPath,
  }
}

function renderSass(options: StyleOptions): Buffer

function renderSass({
  file = undefined,
  outputStyle = 'compressed',
}: StyleOptions) {
  if (file) {
    const compiledStyles = sass.renderSync({
      file,
      outputStyle: outputStyle,
    })
    return compiledStyles.css
  }
}
