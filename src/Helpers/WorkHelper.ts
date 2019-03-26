import { IHelper } from "./IHelper";
import RestClientWit = require("TFS/WorkItemTracking/RestClient");
import { ReportingRevisionsExpand } from "TFS/WorkItemTracking/Contracts";
import { Element } from "../element";
import Mustache from "mustache";

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
                        var renderInfo = {
                            id: rev.id,
                            title: rev.fields["System.Title"],
                            link: VSS.getWebContext().host.uri + "/_workitems/edit/" + rev.id,
                            action: "",
                            date: new Date(),
                            updated: "",
                            assignedTo: "",
                            oldState: "",
                            newState: ""
                        }


                        // 
                        if (u.rev == 1) {
                            // First revision -> new WorkItem
                            renderInfo.action = "New Workitem";
                        }
                        else {
                            // Work item updated
                            renderInfo.action = "Workitem updated";

                            if (u.fields["System.Description"]) {
                                renderInfo.updated = "Description"
                            }

                            if (u.fields["System.AssignedTo"]) {
                                if (u.fields["AssignedTo"].newValue["displayName"]) {
                                    renderInfo.assignedTo = u.fields["AssignedTo"].newValue["displayName"];
                                } else {
                                    renderInfo.assignedTo = "nobody"; // unassign
                                }
                            }

                            if (u.fields["System.State"]) {
                                renderInfo.oldState = u.fields["System.State"].oldValue;
                                renderInfo.newState = u.fields["System.State"].newValue;
                            }

                        }



                        // Todo: Check this for linked items
                        if (u.revisedDate.getFullYear() == 9999 && u.fields["System.ChangedDate"].newValue != undefined) {
                            renderInfo.date = new Date(u.fields["System.ChangedDate"].newValue);
                        }

                        // Render and build element
                        var el: Element = {
                            action: renderInfo.action,
                            additionalInfo: Mustache.render(template, renderInfo),
                            date: u.revisedDate,
                            user: u.revisedBy.displayName,
                            imageUrl: u.revisedBy.imageUrl
                        };
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
