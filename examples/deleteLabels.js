let config = require('./config');
let labels = require('./config/labels');
let GILS = require('./../lib/LabelSync');
let {user, repo, token, options} = config.github;
let githubIssuesLabelSync = new GILS(options, user, repo, token);

githubIssuesLabelSync.deleteLabels(labels).then((response) => {
    // log raw response body
    console.log(response);
    // log deleted labels
    console.log(githubIssuesLabelSync.deletedLabels);
});
