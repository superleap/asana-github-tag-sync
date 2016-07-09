let GitHubApi = require("github");
let Promise = require('bluebird');

/**
 * Simple wrapper around the github module issues function
 * @access public
 */
export default class GithubIssuesLabelSync {
    /**
     * The GitHub issue label model
     * @typedef {Object} Label
     * @property {String} Label.name - The name of the label
     * @property {String} [Label.color] - The colour of the label
     * @property {String} [Label.status] - Once a label operation is complete this field gets updated
     */

    /**
     * In order to work as an NPM module this class has to be called with specific parameters
     * @example
     * let fs = require('fs');
     * let Promise = require('bluebird');
     * let config = {
     *   "github": {
     *     "user": "superleap",
     *     "repo": "github-issues-label-sync",
     *     "token": "dab5ae868be49ec9179b34d2532d699a603f8be0",
     *     "options": {
     *       // all other values in this array are defaults
     *       "debug": true,
     *       "followRedirects": false,
     *       "Promise": Promise
     *     }
     *   }
     * };
     * let {user, repo, token, options} = config.github;
     * let labels = [];
     * array.from(JSON.parse(fs.readFileSync('./.issuesrc', 'utf8')).categories).forEach((category) => {
     *   category.labels.forEach((label) => {
     *     label.name = `${category.name}: ${label.name}`;
     *     labels.push(label);
     *   });
     * });
     * let githubSync = new (require('./lib/LabelSync'))(options, user, repo, token);
     * @param {Object} [options={}] - GitHubApi connect options
     * @param {String} user - GitHub repository user
     * @param {String} repo - GitHub repository name
     * @param {String} token - GitHub personal access token
     */
    constructor(options = {}, user, repo, token) {
        this.options = options;
        this.user = user;
        this.repo = repo;
        this.token = token;
        this.github = new GitHubApi(this.options);
        this._labels = [];
        this._deletedLabels = [];
        this._createdLabels = [];

        this.authenticate();
    }

    /**
     * Get GitHubApi module connect options
     * @type {Object}
     */
    get options() {
        return this._options;
    }

    /**
     * Get GitHub repository username
     * @type {String}
     */
    get user() {
        return this._user;
    }

    /**
     * Get GitHub repository name
     * @type {String}
     */
    get repo() {
        return this._repo;
    }

    /**
     * Get GitHub repository token
     * @type {String}
     */
    get token() {
        return this._token;
    }

    /**
     * Get GitHubApi module
     * @link github/Client
     * @type {github/Client|module.exports}
     */
    get github() {
        return this._github;
    }

    /**
     * Get GitHub repository labels
     * @type {Array<GithubIssuesLabelSync.Label>}
     */
    get labels() {
        return this._labels;
    }

    /**
     * Get GitHubApi repository deleted labels
     * @type {Array<GithubIssuesLabelSync.Label>}
     */
    get deletedLabels() {
        return this._deletedLabels;
    }

    /**
     * Get GitHubApi repository created labels
     * @type {Array<GithubIssuesLabelSync.Label>}
     */
    get createdLabels() {
        return this._createdLabels;
    }

    /**
     * Set GitHubApi module connect options
     * @type {Object}
     * @property {Boolean} [options.debug=false] - Get request information with each call
     * @property {Boolean} [options.followRedirects=false] - We don't need this for issues
     * @property {Promise} Promise - We are using bluebird promises peering with github api package
     */
    set options(object) {
        this._options = object;
    }

    /**
     * Set GitHubApi repository username
     * @type {String}
     */
    set user(repoUrlUser) {
        this._user = repoUrlUser;
    }

    /**
     * Set GitHubApi repository name
     * @type {String}
     */
    set repo(repoUrlName) {
        this._repo = repoUrlName;
    }

    /**
     * Set GitHubApi OAuth2 personal access token
     * @type {String}
     */
    set token(personalAccessToken) {
        this._token = personalAccessToken;
    }

    /**
     * Set GitHubApi Client
     * @type {github/Client|module.exports}
     */
    set github(Client) {
        this._github = Client;
    }

    /**
     * Set GitHubApi repository labels
     * @type {Array<GithubIssuesLabelSync.Label>}
     */
    set labels(labels) {
        this._labels = labels;
    }

    /**
     * Push GitHubApi repository deleted label
     * @type {GithubIssuesLabelSync.Label}
     */
    set deletedLabel(label) {
        this._deletedLabels.push(label);
    }

    /**
     * Push GitHubApi repository created label
     * @type {GithubIssuesLabelSync.Label}
     */
    set createdLabel(label) {
        this._createdLabels.push(label);
    }

    /**
     * We only do this once
     * @access private
     */
    authenticate() {
        this.github.authenticate({
            type: "oauth",
            token: this.token
        });
    }

    /**
     * Get GitHubApi repository labels from remote
     * @example
     * githubSync.getLabels().then((response) => {
     *   // log labels
     *   console.log(response);
     * });
     * @async
     * @param {Boolean} [meta=false] - Get extended response information
     * @returns {Promise}
     */
    getLabels(meta = false) {
        return this.github.issues.getLabels({
            user: this.user,
            repo: this.repo
        }).then((response) => {
            if (true !== meta) {
                delete response["meta"];
            }

            this.labels = response;

            return this.labels;
        });
    }

    /**
     * Delete GitHubApi repository label from remote
     * @example
     * githubSync.deleteLabel(labels).then((response) => {
     *   // log raw response bodies
     *   console.log(response);
     *   // log deleted label
     *   console.log(githubSync.createdLabels);
     * });
     * @async
     * @param {GithubIssuesLabelSync.Label} label - The label we want to delete
     * @param {String} label.name - The label's name
     * @returns {Promise}
     */
    deleteLabel(label) {
        return this.github.issues.deleteLabel({
            user: this.user,
            repo: this.repo,
            name: label.name
        }).then((response) => {
            label.status = 'success';

            return response;
        }).catch((error) => {
            label.status = 'error';

            return error.message;
        }).lastly(() => {
            this.deletedLabel = label;

            return label;
        });
    }

    /**
     * Delete GitHubApi repository labels from remote
     * @example
     * githubSync.deleteLabels(labels).then((response) => {
     *   // log raw response bodies
     *   console.log(response);
     *   // log delete labels
     *   console.log(githubSync.deletedLabels);
     * });
     * @async
     * @param {Array<GithubIssuesLabelSync.Label>} labels - The labels we want to delete
     * @returns {Promise}
     */
    deleteLabels(labels) {
        return Promise.all(labels).map((label) => {
            return this.deleteLabel(label);
        });
    }

    /**
     * Create GitHubApi repository label on remote
     * @example
     * githubSync.createLabel(label).then((response) => {
     *   // log raw response bodies
     *   console.log(response);
     *   // log created label
     *   console.log(githubSync.createdLabels);
     * });
     * @async
     * @param {GithubIssuesLabelSync.Label} label - The label we want to create
     * @param {String} label.name - The label's name
     * @param {String} label.color - The label's colour
     * @param {String} label.status - Promise status of operation
     * @returns {Promise}
     */
    createLabel(label) {
        return this.github.issues.createLabel({
            user: this.user,
            repo: this.repo,
            name: label.name,
            color: label.color
        }).then((response) => {
            label.status = 'success';

            return response;
        }).catch((response) => {
            let error = JSON.parse(response);
            let code = error["errors"][0].code;

            if (code === "already_exists") {
                label.status = 'duplicate';
            } else {
                label.status = 'error';
            }

            return error;
        }).lastly(() => {
            this.createdLabel = label;
        });
    }

    /**
     * Create GitHubApi repository labels on remote
     * @example
     * githubSync.createLabels(labels).then((response) => {
     *   // log raw response bodies
     *   console.log(response);
     *   // log created/updated labels
     *   console.log(githubSync.createdLabels);
     * });
     * @async
     * @param {Array<GithubIssuesLabelSync.Label>} labels - The labels we want to create
     * @returns {Promise}
     */
    createLabels(labels) {
        return Promise.all(labels).map((label) => {
            return this.createLabel(label);
        });
    }

    /**
     * Delete all GitHubApi repository labels on remote
     * @example
     * githubSync.purgeLabels().then((response) => {
     *   // log raw response bodies
     *   console.log(response);
     *   // log deleted labels
     *   console.log(githubSync.deletedLabels);
     * });
     * @async
     * @returns {Promise}
     */
    purgeLabels() {
        return this.getLabels().then((labels) => {
            return Promise.all(labels).map((label) => {
                return this.deleteLabel(label);
            });
        });
    }

    /**
     * Import all GitHubApi repository labels on remote while optionally removing all the others
     * @example
     * githubSync.importLabels(labels).then((response) => {
     *   // log raw response bodies
     *   console.log(response);
     *   // log created/updated labels
     *   console.log(githubSync.createdLabels);
     * });
     * @async
     * @param {Array<GithubIssuesLabelSync.Label>} labels - The labels we want to import
     * @param {Boolean} [purge=false] - Wether to delete all existing tags on remote or not
     * @returns {Promise}
     */
    importLabels(labels, purge = true) {
        return Promise.resolve(true === purge ? this.purgeLabels() : true).then(() => {
            return this.createLabels(labels);
        });
    }
}
