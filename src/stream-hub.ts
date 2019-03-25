import RestClientBuild = require("TFS/Build/RestClient");
import RestClientWit = require("TFS/WorkItemTracking/RestClient");

import Mustache = require("mustache");
import { Element } from "./element";
import { Build, BuildResult, BuildStatus } from "TFS/Build/Contracts";
import { ReportingRevisionsExpand } from "TFS/WorkItemTracking/Contracts";
import { reject, async } from "q";

var projectId = VSS.getWebContext().project.id;


async function getBuilds(): Promise<Element[]> {
    var res: Element[] = [];
    var client = RestClientBuild.getClient();
    try {
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
                    additionalInfo: Mustache.render(buildTemplate, element)
                }
            );
        });

    } catch (error) {
        console.error(error);
    }

    return res;
}

async function getWork(): Promise<Element[]> {
    var res: Element[] = [];
    var client = await RestClientWit.getClient();

    try {
        var wi = await client.readReportingRevisionsGet(projectId, undefined, undefined, undefined, undefined// todo: daterange,
            , undefined, true, false, true, ReportingRevisionsExpand.None, undefined, 200);

        console.log("work items", wi);
        wi.values.forEach(async w => {
            if (w.fields["System.IsDeleted"]) {
                console.log("Is deleted", w);
            } else {


                var updates = await client.getUpdates(w.id);
                console.log("updates", updates);

                updates.forEach(u => {
                    var el: Element = {
                        action: "",
                        additionalInfo: "wi id:" + u.workItemId + "- rev: " + u.rev,
                        date: u.revisedDate,
                        user: u.revisedBy.displayName,
                        imageUrl: u.revisedBy.imageUrl
                    };

                    if (u.rev == 1) {
                        // First revision -> new WorkItem
                        el.action = "New Workitem";
                    } else {
                        // Work item updated
                        el.action = "Workitem updated"
                    }

                    // Todo: Check this for linked items
                    if (el.date.getFullYear() == 9999 && u.fields["System.ChangedDate"].newValue != undefined) {
                        el.date = new Date(u.fields["System.ChangedDate"].newValue);
                    }

                    res.push(el);
                });
            }
        });
    } catch (error) {
        console.log(error);
    }

    return res;
}

async function getResults(): Promise<Element[][]> {
    return await Promise.all([getBuilds(), getWork()]);
}

function render() {

    getResults().then(results => {

        var elements: Element[] = [];

        // Combine data
        results.forEach(element => {
            elements = elements.concat(element);
        });

        console.info("elements " + elements.length, elements);

        // Sort data
        elements.sort((a, b) => {
            return b.date.getTime() - a.date.getTime()
        });

        // Generate output
        var html = "";
        elements.forEach((el: any) => {
            el["dateStr"] = el.date.toLocaleDateString() + " " + el.date.toLocaleTimeString();
            html += Mustache.render(elementTemplate, el);
        });

        // Show data
        $("#target").html(html);

        setTimeout(() => {
            render();
        }, 5000);
    });


}

async function getTemplates() {
    elementTemplate = await $.get("templates/element.html");
    buildTemplate = await $.get("templates/build.html");

}

getTemplates();
render();

var elementTemplate: string;
var buildTemplate: string;