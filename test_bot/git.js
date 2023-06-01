require('dotenv').config();
const simpleGit = require('simple-git');

const git = simpleGit();

const config = {
    auth_user: process.env.GIT_USER,
    auth_token: process.env.GIT_AUTH_TOKEN,
    repo: process.env.GIT_REPO_NAME
}

exports.cloneRepo = () =>{
    const REPO = `github.com/${config.auth_user}/${config.repo}`;
    const remote = `https://${config.auth_user}:${config.auth_token}@${REPO}`;

    console.log('Attempting to clone git repository...');

    git.clone(remote, process.cwd() + '/test/')
        .then(() => console.log('Finished cloning git repository!'))
        .catch((err) => console.error('There was an error while cloning git repository: ', err));
}