/// <reference path="element.ts"/>
import RestClient = require("TFS/Build/RestClient");
import Mustache = require("mustache");
import { Element } from "./element";
import { async } from "q";

var projectId = VSS.getWebContext().project.id;


async function getBuilds(): Promise<Element[]> {
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

async function render() {
    var builds = await getBuilds();
    // Todo: Sort data
    var html = "";
    builds.forEach(el => {
        html += el.html;
    });
    $("#target").html(html);
}
render();

