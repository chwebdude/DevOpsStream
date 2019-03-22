/// <reference path="element.ts"/>
import RestClient = require("TFS/Build/RestClient");
import Mustache = require("mustache");
import { Element } from "./element";
import { Build, BuildResult, BuildStatus } from "TFS/Build/Contracts";

var projectId = VSS.getWebContext().project.id;


async function getBuilds(): Promise<Element[]> {
    var res: Element[] = [];
    var client = RestClient.getClient();
    try {
        var template = await $.get("templates/build.html");
        var builds: Build[] = await client.getBuilds(projectId);
        builds.forEach(element => {
            if (element.status == BuildStatus.Completed) {
                element["resultString"] = BuildResult[element.result];
                switch (element.result) {

                    case BuildResult.Succeeded:
                        element["resultStyle"] = "text-success"
                        break;
                    case BuildResult.PartiallySucceeded:
                        element["resultStyle"] = "text-warning"
                        break;
                    case BuildResult.None:
                    case BuildResult.Failed:
                    case BuildResult.Canceled:
                        element["resultStyle"] = "text-danger"
                        break;

                }
            } else {
                element["resultString"] = BuildStatus[element.status];
            }

            res.push(
                {
                    action: "Build",
                    date: element.lastChangedDate,
                    imageUrl: element.requestedBy.imageUrl,
                    user: element.requestedBy.displayName,
                    additionalInfo: Mustache.render(template, element)
                }
            );
        });

    } catch (error) {
        console.error(error);
    }

    return res;
}

async function render() {
    var builds = await getBuilds();
    var template = await $.get("templates/element.html");

    // Todo: Sort data

    // Generate output
    var html = "";
    builds.forEach((el: any) => {
        el["dateStr"] = el.date.toLocaleDateString() + " " + el.date.toLocaleTimeString();
        html += Mustache.render(template, el);
    });

    // Show data
    $("#target").html(html);
    console.log(html);
}
render();

