// export default {
//   ...require('./exec'),
//   ...require('./path'),
//   ...require('./question'),
// }


import { execSync } from 'child_process'
import { resolve } from 'path'
import { normalize, dirname } from 'path'

function makeOptions(options) {
  return {
    stdio: options?.inherit ? 'inherit' : 'pipe',
    cwd: resolve(),
    encoding: 'utf8',
  }
}

export function exec(commands, options) {
  const outputs = []

  for (const command of commands) {
    const output = execSync(command, makeOptions(options))
    outputs.push(output)
  }

  return outputs
}


import { createInterface } from 'readline'

export function question(question) {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      readline.close()
      resolve(answer)
    })
  })
}

export function getDevFolder(path) {
  const [nodeModules, devFolder] = normalize(dirname(path)).split(/\/|\\/g)

  return [nodeModules, devFolder].join('/')
}

export function extractOwnerAndRepoFromGitRemoteURL(url) {
  return url
    ?.replace(/^git@github.com:|.git$/gims, '')
    ?.replace(/^https:\/\/github.com\/|.git$/gims, '')
    ?.trim()
}