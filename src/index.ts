import { chromium, Page } from 'playwright'
import sass from 'sass'

interface FileOutput {
  data: Buffer | string
  fsPath: string | undefined
}

type Parameters<T> = T extends (...args: infer T) => any ? T : never

export interface FileOptions {
  type: 'screenshot' | 'pdf'
  htmlPath?: string | undefined
  stylePath?: string | undefined
  pdf?: Parameters<Page['pdf']>[0]
  screenshot?: Parameters<Page['screenshot']>[0]
  pageLoad?: Parameters<Page['goto']>[1]
}

export async function generateFile(options: FileOptions): Promise<FileOutput> {
  const {
    type = 'pdf',
    htmlPath = undefined,
    stylePath = undefined,
    pdf,
    screenshot,
    pageLoad,
  } = options

  if (!htmlPath) {
    throw new Error('htmlPath is not defined!')
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage'],
  })

  const page = await browser.newPage({ viewport: null })

  await page.goto(htmlPath, pageLoad)

  if (stylePath) {
    await page.addStyleTag({
      content: `
          ${renderStyle(stylePath)}
          `,
    })
  }

  const data = await genreateFileWithType(type, page, pdf, screenshot)

  await browser.close()

  const savedPath = screenshot?.path || pdf?.path || undefined

  return {
    data,
    fsPath: savedPath,
  }
}

async function generatePDF(page: Page, pdf: FileOptions['pdf']) {
  await page.emulateMedia({ media: 'print' })
  return page.pdf(pdf)
}

function takeScreenshot(page: Page, screenshot: FileOptions['screenshot']) {
  return page.screenshot(screenshot)
}

async function genreateFileWithType(
  type: FileOptions['type'],
  page: Page,
  pdf: FileOptions['pdf'],
  screenshot: FileOptions['screenshot']
) {
  let data: string | Buffer = ''

  if (type === 'pdf') {
    await generatePDF(page, pdf)
  }

  if (type === 'screenshot' && screenshot) {
    data = (await takeScreenshot(page, screenshot)).toString('base64')
  }
  return data
}

function renderStyle(file: string) {
  if (file) {
    const compiledStyles = sass.renderSync({
      file,
      outputStyle: 'compressed',
    })
    return compiledStyles.css
  }
  return ''
}
