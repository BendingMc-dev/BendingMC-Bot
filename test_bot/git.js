require('dotenv').config();

const simpleGit = require('simple-git');

const git = simpleGit('/test');
const USER = process.env.GIT_USER;
const PASS = process.env.GIT_PASSWORD;

exports.cloneRepo = () =>{
    const REPO = 'github.com/username/private-repo';

    const remote = `https://${USER}:${PASS}@${REPO}`;

    git.clone(remote)
        .then(() => console.log('finished'))
        .catch((err) => console.error('failed: ', err));
}