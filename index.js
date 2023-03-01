const core = require('@actions/core');
const github = require('@actions/github');
const lintPR = require('./lint-pr');

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

        await lintPR(prTitle, configurationPath)

    } catch (error) {
        console.log(error)
    }
}

run()