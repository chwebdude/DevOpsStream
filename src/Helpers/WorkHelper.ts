import { IHelper } from "./IHelper";
import RestClientWit = require("TFS/WorkItemTracking/RestClient");
import { ReportingRevisionsExpand } from "TFS/WorkItemTracking/Contracts";
import { Element } from "../element";

var projectId = VSS.getWebContext().project.id;

export class WorkHelper implements IHelper {
    async getElements(): Promise<Element[]> {
        var res: Element[] = [];
        var client = RestClientWit.getClient();
        try {
            await client.readReportingRevisionsGet(projectId, undefined, undefined, undefined, undefined // todo: daterange,
                , undefined, true, false, true, ReportingRevisionsExpand.None, undefined, 200)
                .then(async (wi) => {
                    console.log("work items", wi);
                    for (const w of wi.values) {
                        if (w.fields["System.IsDeleted"]) {
                            console.log("Is deleted", w);
                        }
                        else {
                            var updates = await client.getUpdates(w.id);
                            // console.log("updates", updates);
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
                });
        }
        catch (error) {
            console.log(error);
        }
        return res;
    }
}
