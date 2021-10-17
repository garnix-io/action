const core = require('@actions/core');
const github = require('@actions/github');
const request = require('request');
const c = require('ansi-colors');

try {
  const baseUrl = core.getInput('url');
  const token = core.getInput('token');
  const tokenStr = typeof token === 'undefined' ? "" : "?token=" + token;
  const url = baseUrl + github.context.repo.owner + "/"
         + github.context.repo.repo + "/commit/" + github.context.sha + tokenStr ;
  console.log(`Starting run...`);
  let result = "success";
  request.post(url, (err, response, body) => {
    var jBody;
    try {
        jBody = JSON.parse(body);
    } catch (err) {
        core.notice(body);
        core.setFailed("There was a problem with your run");
        core.error();
    }
    if(jBody.status === "Success") {
      core.info(c.green("Run succeded!"));
      core.info("The following packages are part of your flake:");
    } else {
      core.notice(c.red("Run failed!"));
      core.info("The following packages are part of your flake:");
    }

    for (var sys in jBody.packages) {
        core.info(`System "${sys}" packages`);
        let pkgs = (jBody.packages)[sys]
        for (var pkg in pkgs) {
            if (pkgs[pkg] === null) {
                core.info(`  ${pkg} ${c.yellow("(not tried)")}`);
            } else {
                let groupName = pkgs[pkg].status === "Success" ?
                      `  ${pkg} ${c.green("(succeded)")}` :
                      `  ${pkg} ${c.red("(failed)")}`
                core.startGroup(groupName);
                if (pkgs[pkg].logs === null) {
                    core.info("No logs available");
                } else {
                    core.info("Logs:");
                    core.info(pkgs[pkg].logs);
                }
                core.endGroup();
            }
        }
    }
  })
} catch (error) {
  core.setFailed(error.message);
}
