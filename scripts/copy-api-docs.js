const path = require("path");
const fs = require("fs");

const projectsToPublish = require("../rush.json")
    .projects
    .filter(project => project.shouldPublish);
const projectPaths = projectsToPublish
    .map(project => path.resolve(project.projectFolder, "tmp", getProjectName(project)));

if (!fs.existsSync("tmp")){
    fs.mkdirSync("tmp");
}

for (let i = 0, iEnd = projectsToPublish.length; i < iEnd; ++i) {
    const projPath = projectPaths[i];
    const proj = projectsToPublish[i];
    fs.copyFileSync(projPath, path.resolve(path.join("tmp", getProjectName(proj))));
}

function getProjectName(project)
{
    return `${project.packageName.split("/")[1]}.api.json`;
}
