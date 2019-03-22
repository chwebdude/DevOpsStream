

VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"], (service: any, api: any) => {
    console.log("service", service);
    console.log("api", api);

    var witClient = service.getCollectionClient(api.WorkItemTrackingHttpClient);
    console.log(witClient);
});
