const core = require('@actions/core');
const github = require('@actions/github');
const load = require('@commitlint/load').default;
const lint = require('@commitlint/lint').default;

function selectParserOpts(parserPreset){
    if (typeof parserPreset !== 'object') {
      return null
    }
  
    if (typeof parserPreset.parserOpts !== 'object') {
      return null
    }
  
    return parserPreset.parserOpts
}

function getLintOptions(config) {
    const opts = {
        parserOpts: {},
        plugins: {},
        ignores: [],
        defaultIgnores: true
    }

    if (config.parserPreset) {
        const parserOpts = selectParserOpts(config.parserPreset)
        if (parserOpts) opts.parserOpts = parserOpts
    }

    if (config.plugins) {
        opts.plugins = config.plugins
    }
      
    if (config.ignores) {
        opts.ignores = config.ignores
    }

    if (!config.defaultIgnores) {
        opts.defaultIgnores = false
    }
      
    return opts
}

function lintPR(title, configurationPath) {
    const config = load({}, {file: configurationPath, cwd: process.cwd()})
    const options = getLintOptions(config)
    const result = lint(title, config.rules, options)

    if (result.valid) return

    const errorMessage = result.errors.map(({message, name}) => `${name}:${message}`).join('\n')
    throw new Error(errorMessage);
}

function getPrTitle() {
    const pullRequest = github.context.payload.pull_request;
    if (!pullRequest) {
        return undefined
    }
    return pullRequest.title
}

async function run() {
    try {
        const configurationPath = core.getInput('configuration-path', {required: true})
        const prTitle = getPrTitle()

        if (!prTitle) {
            core.debug('Could not get Pull Request Title')
            return
        }

        lintPR(prTitle, configurationPath)

    } catch (error) {
        console.log(error)
    }
}

run()