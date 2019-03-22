import RestClient = require("TFS/Build/RestClient");
import Mustache = require("mustache");

var projectId = VSS.getWebContext().project.id;




var client = RestClient.getClient();
client.getBuilds(projectId)
    .then(b => {        
        var builds = "";
        $('../static/templates.build.html', (buildTemplate: string) => {
            b.forEach(element => {
                builds += Mustache.render(buildTemplate, element);
            });
            $("#target").html(builds);
        });
    });


// VSS.require(["VSS/Service", "TFS/Build/RestClient"], (service: any, api: any) => {
//     console.log("service", service);
//     console.log("api", api);
//     // VSS.getAccessToken().then(o => {console.log(o)});
//     var witClient = service.getCollectionClient(api.WorkItemTrackingHttpClient);
//     console.log(witClient);
// });
