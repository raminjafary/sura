import http, { ServerResponse } from 'http'
import path from 'path'
import { exec } from 'child_process'
import fs from 'fs'
import { generateFile } from '../dist'

const host = 'localhost'
const port = 3000

export type Extensions =
  | '.html'
  | '.css'
  | '.js'
  | '.svg'
  | '.png'
  | '.gif'
  | '.jpg'
  | '.ttf'
  | '.pdf'

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
}

function getMimeType(ext: Extensions) {
  return mimeTypes[ext]
}

function getFileExtension(filename: string) {
  return path.extname(filename) as Extensions
}

function serveFiles(filePath: string, res: ServerResponse, mimeType: string) {
  fs.access(filePath, function access(error) {
    if (!error) {
      if (!['text/html', 'application/pdf'].includes(mimeType)) {
        const fileStream = fs.createReadStream(
          filePath,
          mimeType === 'text/css' ? 'UTF-8' : undefined
        )
        res.setHeader('Content-Type', mimeType)
        res.writeHead(200)
        fileStream.pipe(res)
      } else {
        fs.readFile(filePath, (error, data) => {
          if (error) {
            res.end({ status: 'error', msg: error })
          } else {
            res.setHeader('Content-Type', mimeType)
            res.setHeader('Content-Length', data.length)
            res.writeHead(200)
            res.write(data)
            res.end()
          }
        })
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('The requested file type is not supported!')
    }
  })
}

const server = http.createServer(async function reqHandler(req, res) {
  let outputPath = ''

  if (req.url === '/pdf') {
    const { fsPath } = await generateFile({
      type: 'pdf',
      htmlPath: 'http://localhost:3000/card',
      stylePath: path.join(
        __dirname,
        'public',
        'assets',
        'style',
        'style.scss'
      ),
      pageLoad: {
        waitUntil: 'networkidle',
      },
      pdf: {
        path: path.join(__dirname, 'files', new Date().getTime() + '.pdf'),
        margin: {
          top: '40px',
          right: '40px',
          bottom: '40px',
          left: '40px',
        },
        format: 'A4',
        printBackground: false,
        displayHeaderFooter: true,
        headerTemplate: `
      <div style="font-size:7px;white-space:nowrap;margin-left:40px;">
          ${new Date().toDateString()}
          <span class="title" style="margin-left: 10px;"></span>
      </div>
  `,
        footerTemplate: `
      <div style="font-size:6px;white-space:nowrap;margin-left:40px;width:100%;">
          <span style="display:inline-block;float:right;margin-right:10px;">
              <span class="pageNumber"></span> / <span class="totalPages"></span>
          </span>
      </div>`,
      },
    })

    outputPath = fsPath!
  }

  if (req.url === '/screenshot') {
    const { fsPath } = await generateFile({
      type: 'screenshot',
      htmlPath: 'http://localhost:3000/card',
      screenshot: {
        path: path.join(
          __dirname,
          'screenshots',
          new Date().getTime() + '.png'
        ),
        fullPage: true,
      },
    })

    outputPath = fsPath!
  }

  if (req.url) {
    const url = req.url === '/' ? req.url + '/index.html' : req.url
    const { ext } = path.parse(url)
    const filename = !ext ? url + '.html' : url
    const filePath = outputPath || path.join(__dirname, 'public', filename)
    serveFiles(
      filePath,
      res,
      getMimeType(getFileExtension(outputPath || filename))
    )
  }
})

server.listen(port, host, function listen() {
  console.log(`Server is running on http://${host}:${port}`)
  exec(
    process.platform === 'linux'
      ? `google-chrome http://${host}:${port}`
      : process.platform === 'darwin'
      ? `open -a chrome http://${host}:${port}`
      : `start chrome http://${host}:${port}`, //process.platform === 'win32' || process.platform === 'win64'
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`)
        return
      }
      console.log(stdout)
    }
  )
})
