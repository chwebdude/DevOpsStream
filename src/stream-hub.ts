import RestClient = require("TFS/Build/RestClient");

var client = RestClient.getClient();
client.getBuilds()
    .then(b => {
        console.log(b);
        b.forEach(element => {
            console.log(element.definition.name);
        });
    });



// VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"], (service: any, api: any) => {
//     console.log("service", service);
//     console.log("api", api);
// VSS.getAccessToken().then(o => {console.log(o)});
//     var witClient = service.getCollectionClient(api.WorkItemTrackingHttpClient);
//     console.log(witClient);
// });
