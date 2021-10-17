const core = require('@actions/core');
const github = require('@actions/github');
const request = require('request');

try {
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  const baseUrl = core.getInput('url');
  const token = core.getInput('token');
  const tokenStr = typeof token === 'undefined' ? "" : "?token=" + token;
  const url = baseUrl + github.context.repo.owner + "/"
         + github.context.repo.repo + "/commit/" + github.context.sha + tokenStr ;
  console.log(`Querying ${url}!`);
  let result = "success";
  request.post(url, (err, response, body) => {
    if(response.statusCode != 200) {
      core.notice(body);
      result = "failure";
      core.setFailed("Server says bad!")
    } else {
      core.info(body);
    }
  })
  core.setOutput("result", result);
} catch (error) {
  core.setFailed(error.message);
}
