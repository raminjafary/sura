# Sura
[![npm (scoped with tag)](https://img.shields.io/npm/v/@raminjafary/sura/latest)](https://www.npmjs.com/package/@raminjafary/sura)

> Generate PDF or screenshot with Node and Playwright.

## Installation

```bash
npm i @raminjafary/sura
# or
yarn add @raminjafary/sura
```
## Features
* Generate PDF
* Take screenshot
* Support Sass/Scss
## Usage

### Generate PDF
It returns the `data` buffer and the `fsPath` of the generated file if `pdf.path` is specefied. 

```js
import { generateFile } from 'sura'

const { data, fsPath } = await generateFile({
      type: 'pdf',
      htmlPath: 'path/to/html/file',
      stylePath: path.join(
        __dirname,
        'public',
        'assets',
        'style.scss'
      ),
      pageLoad: {
        waitUntil: 'networkidle',
      },
      pdf: {
        path: 'path/to/save/file.pdf',
        format: 'A4',
        printBackground: false,
      },
    })

```
### Take screenshot
It returns the `data` in base64 and the `fsPath` of the generated file if `screenshot.path` is specefied. 

```js
import { generateFile } from 'sura'

const { data, fsPath } = await generateFile({
      type: 'screenshot',
      htmlPath: 'path/to/html/file',
      pageLoad: {
        waitUntil: 'networkidle',
      },
      screenshot: {
        path: 'path/to/save/image.png',
        fullPage: true,
      },
    })

```
## Options

| Option | Default | Description |
|--------|---------|-------------|
| type | `pdf` | File type to be generated |
| htmlPath | `undefined` | Directory or path of html file |
| stylePath | `undefined` | Directory or path of style file |
| pdf | see [Playwright `page.pdf`](https://playwright.dev/docs/api/class-page?_highlight=pdf#pagepdfoptions) | PDF options |
| screenshot | see [Playwright `page.screenshot`](https://playwright.dev/docs/api/class-page#pagescreenshotoptions) | Screenshot options |
| pageLoad | see [Playwright `page.goto`](https://playwright.dev/docs/api/class-page?_highlight=goto#pagegotourl-options) | Options for URL to navigate page to |

## Development
- Clone this repository.
- Install dependencies using `yarn install` or `npm install`.
- Start development server using `npm run dev` or `yarn dev`.

## License

[MIT](./LICENSE)