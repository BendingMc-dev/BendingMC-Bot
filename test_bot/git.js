require('dotenv').config();
const simpleGit = require('simple-git');

const config = {
    auth_user: process.env.GIT_USER,
    auth_token: process.env.GIT_AUTH_TOKEN,
    repo_name: process.env.GIT_REPO_NAME,

    getRepoPath: function () {return `${__dirname}/test`},
    getRepo: function () {return `github.com/${this.auth_user}/${this.getRepoPath()}`},
    getRemote: function () {return `${this.auth_user}:${this.auth_token}@${this.getRepo()}`}
}

console.log("Pulling from path: " + config.getRepoPath()); //DEBUG

const git = simpleGit(config.getRepoPath());

exports.run = () =>{
    // check if repo exists
    pullRepo();
    fetchRepo();
}

function fetchRepo(){
    console.log("Attempting to fetch git repository...");

    git.fetch(config.remote, 'test')
        .then(() => console.log("Finished fetch git repository!"))
        .catch((err) => console.log("There was an error while fetching git repository: " + err))
}

function pullRepo(){
    console.log("Attempting to pull from git repository...");

    git.pull(config.remote, 'test', (err, update)=>{
        console.log("Changes: " + update.summary.changes);
    })
        .then(() => {console.log("Finished pull from git repository!")})
        .catch((err) => console.log("There was an error while pulling from git repository: " + err))
}

exports.cloneRepo = () =>{

    console.log('Attempting to clone git repository...');

    git.clone(remote, process.cwd() + '/test/')
        .then(() => console.log('Finished cloning git repository!'))
        .catch((err) => console.error('There was an error while cloning git repository: ', err));
}