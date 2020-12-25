import http, { ServerResponse } from 'http'
import fs from 'fs'
import { generatePDF } from '../src/index'
import path from 'path'

const host = 'localhost'
const port = 3000

export type MimeTypes =
  | '.html'
  | '.css'
  | '.js'
  | '.svg'
  | '.png'
  | '.gif'
  | '.jpg'
  | '.ttf'
  | '.pdf'

const extensions = {
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

function getMimeType(ext: MimeTypes) {
  return extensions[ext]
}

function getFileExtension(filename: string): MimeTypes {
  return path.extname(filename) as MimeTypes
}

function serveFiles(filePath: string, res: ServerResponse, mimeType: string) {
  fs.access(filePath, function access(error) {
    if (!error) {
      if (!['text/html', 'application/pdf'].includes(mimeType)) {
        const fileStram = fs.createReadStream(
          filePath,
          mimeType === 'text/css' ? 'UTF-8' : undefined
        )
        res.setHeader('Content-Type', mimeType)
        res.writeHead(200)
        fileStram.pipe(res)
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
  let pdfPath = ''

  if (req.url === '/pdf') {
    const { fsPath } = await generatePDF({
      fsPath: path.join(__dirname, 'files', new Date().getTime() + '.pdf'),
      htmlPath: path.join(__dirname, 'public', 'card.html'),
      style: {
        file: path.join(__dirname, 'public', 'assets', 'style', 'style.scss'),
      },
    })

    pdfPath = fsPath!
  }

  if (req.url) {
    const url = req.url === '/' ? req.url + '/index.html' : req.url
    const { ext } = path.parse(url)
    const filename = !ext ? url + '.html' : url
    const filePath = pdfPath || path.join(__dirname, 'public', filename)
    serveFiles(
      filePath,
      res,
      getMimeType(getFileExtension(pdfPath || filename))
    )
  }
})

server.listen(port, host, function listen() {
  console.log(`Server is running on http://${host}:${port}`)
})
