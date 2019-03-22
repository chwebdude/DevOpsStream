/// <reference path="element.ts"/>
import RestClient = require("TFS/Build/RestClient");
import Mustache = require("mustache");
import { Element } from "./element";

var projectId = VSS.getWebContext().project.id;


async function getBuilds() {
     var res: Element[] = [];
    var client = RestClient.getClient();
    try {

        var builds: any[] = await client.getBuilds(projectId);
        console.log("builds", builds);
        
        var template: string = await $.get('templates/build.html');
        console.log("template", template);
        builds.forEach(element => {
            var html = Mustache.render(template, element);
            res.push(new Element(html, element.lastChangedDate));
        });

    } catch (error) {
        console.error(error);
    }

    console.log(res);
    return res;
}


getBuilds();
// VSS.require(["VSS/Service", "TFS/Build/RestClient"], (service: any, api: any) => {
//     console.log("service", service);
//     console.log("api", api);
//     // VSS.getAccessToken().then(o => {console.log(o)});
//     var witClient = service.getCollectionClient(api.WorkItemTrackingHttpClient);
//     console.log(witClient);
// });
