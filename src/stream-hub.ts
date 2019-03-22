/// <reference path="element.ts"/>
import RestClient = require("TFS/Build/RestClient");
import Mustache = require("mustache");
import { Element } from "./element";
import { ContractFieldsMetadata } from "VSS/Serialization";
import { Build } from "TFS/Build/Contracts";

var projectId = VSS.getWebContext().project.id;


async function getBuilds(): Promise<Element[]> {
    var res: Element[] = [];
    var client = RestClient.getClient();
    try {
        var builds: Build[] = await client.getBuilds(projectId);
        builds.forEach(element => {
            res.push(
                {
                    action: "Build",
                    date: element.lastChangedDate.toLocaleDateString() + element.lastChangedDate.toLocaleTimeString(),
                    imageUrl: element.requestedBy.imageUrl,
                    user: element.requestedBy.displayName
                }
            );
            console.info("result", element.result.toString);
        });

    } catch (error) {
        console.error(error);
    }

    console.log(res);
    return res;
}

async function render() {
    var builds = await getBuilds();
    var template = await $.get("templates/element.html");
    
    // Todo: Sort data
    
    // Generate output
    var html = "";
    builds.forEach(el => {
        html += Mustache.render(template, el);
    });

    // Show data
    $("#target").html(html);
}
render();

