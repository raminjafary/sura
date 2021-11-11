#!/usr/bin/env node

import { exec } from 'child_process'
import fs from 'fs'

const sassCliOptions = process.argv.slice(2, process.argv.length - 1)
const path = process.argv[process.argv.length - 1]

if (!path) {
  console.log('No file or path is specified for buidling styles')

  process.exit(1)
}

fs.stat(path, (err, stat) => {
  if (err) {
    throw new Error(path + ' is not a valid file or directory!')
  }
  if (stat) {
    const command = `./node_modules/.bin/sass ${sassCliOptions.join(
      ' '
    )} ${path}`
    exec(command, (error, stdout) => {
      stdout && console.log(`Running command: \n${stdout}`)
      if (error) {
        console.log(`Error running ${command}, try running npm install sass`)
      }
    })
  }
})
