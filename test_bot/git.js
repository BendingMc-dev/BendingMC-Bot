require('dotenv').config();

const simpleGit = require('simple-git');

const git = simpleGit();
const USER = process.env.GIT_USER;
const TOKEN = process.env.GIT_AUTH_TOKEN;

exports.cloneRepo = () =>{
    const REPO = `github.com/${USER}/Screeps`;

    const remote = `https://${USER}:${TOKEN}@${REPO}`;

    git.clone(remote, process.cwd() + '/test/')
        .then(() => console.log('finished'))
        .catch((err) => console.error('failed: ', err));
}