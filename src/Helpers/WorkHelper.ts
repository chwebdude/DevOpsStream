import { IHelper } from "./IHelper";
import RestClientWit = require("TFS/WorkItemTracking/RestClient");
import { ReportingRevisionsExpand } from "TFS/WorkItemTracking/Contracts";
import { Element } from "../element";
import Mustache from "mustache";
import { VssConnection } from "VSS/Service";
import { ReviewResourceType } from "VSS/Gallery/Contracts";

var projectId = VSS.getWebContext().project.id;

export class WorkHelper implements IHelper {
    async getElements(): Promise<Element[]> {
        var template = await $.get("templates/work.html");
        var res: Element[] = [];
        var client = RestClientWit.getClient();
        try {
            var wi = await client.readReportingRevisionsGet(projectId, undefined, undefined, undefined, undefined // todo: daterange,
                , undefined, true, false, true, ReportingRevisionsExpand.None, undefined, 200);

            for (const rev of wi.values) {
                if (rev.fields["System.IsDeleted"]) {
                    console.log("Is deleted", rev);
                }
                else {
                    var updates = await client.getUpdates(rev.id);
                    updates.forEach(u => {
                        var el: Element = {
                            action: "",
                            additionalInfo: Mustache.render(template, {
                                id: rev.id,
                                title: rev.fields["System.Title"],
                                link: "https://" + VSS.getWebContext().host + "/" + VSS.getWebContext().collection + "/_workitems/edit/" + rev.id
                            }),
                            date: u.revisedDate,
                            user: u.revisedBy.displayName,
                            imageUrl: u.revisedBy.imageUrl
                        };
                        if (u.rev == 1) {
                            // First revision -> new WorkItem
                            el.action = "New Workitem";
                        }
                        else {
                            // Work item updated
                            el.action = "Workitem updated";
                        }
                        // Todo: Check this for linked items
                        if (el.date.getFullYear() == 9999 && u.fields["System.ChangedDate"].newValue != undefined) {
                            el.date = new Date(u.fields["System.ChangedDate"].newValue);
                        }
                        res.push(el);
                    });
                }
            }
        }
        catch (error) {
            console.log(error);
        }
        return res;
    }
}
