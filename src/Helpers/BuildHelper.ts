import { IHelper } from "./IHelper";
import { Element } from "../element";
import RestClientBuild = require("TFS/Build/RestClient");
import { Build, BuildResult, BuildStatus } from "TFS/Build/Contracts";
import Mustache from "mustache";

var projectId = VSS.getWebContext().project.id;

export class BuildHelper implements IHelper {
    async getElements(): Promise<Element[]> {
        var buildTemplate = await $.get("templates/build.html");
        var res: Element[] = [];
        var client = RestClientBuild.getClient();
        try {
            var builds: Build[] = await client.getBuilds(projectId);
            builds.forEach(element => {
                if (element.status == BuildStatus.Completed) {
                    element["resultString"] = BuildResult[element.result];
                    switch (element.result) {
                        case BuildResult.Succeeded:
                            element["resultStyle"] = "text-success";
                            break;
                        case BuildResult.PartiallySucceeded:
                            element["resultStyle"] = "text-warning";
                            break;
                        case BuildResult.None:
                        case BuildResult.Failed:
                        case BuildResult.Canceled:
                            element["resultStyle"] = "text-danger";
                            break;
                    }
                }
                else {
                    element["resultString"] = BuildStatus[element.status];
                }
                res.push({
                    action: "Build",
                    date: element.lastChangedDate,
                    imageUrl: element.requestedBy.imageUrl,
                    user: element.requestedBy.displayName,
                    additionalInfo: Mustache.render(buildTemplate, element)
                });
            });
        }
        catch (error) {
            console.error(error);
        }
        return res;
    }
}
