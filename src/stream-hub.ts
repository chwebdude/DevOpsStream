import Mustache = require("mustache");
import { Element } from "./element";
import { IHelper } from "./Helpers/IHelper";
import { WorkHelper } from "./Helpers/WorkHelper";
import { BuildHelper } from "./Helpers/BuildHelper";


async function getResults(): Promise<Element[][]> {
    var workHelper: IHelper = new WorkHelper();
    var buildHelper: IHelper = new BuildHelper();

    return await Promise.all([workHelper.getElements(), buildHelper.getElements()]);
}

async function render() {
    var elementTemplate = await $.get("templates/element.html");
    var results = await getResults();
    var elements: Element[] = [];

    // Combine data
    results.forEach(element => {
        elements = elements.concat(element);
    });

    // Sort data
    elements.sort((a, b) => {
        return b.date.getTime() - a.date.getTime()
    });

    // Generate output
    var html = "";
    elements.forEach((el: any) => {
        el["dateStr"] = el.date.toLocaleDateString() + " " + el.date.toLocaleTimeString();
        html += Mustache.render(elementTemplate, el);
    });

    // Show data
    $("#target").html(html);

    setTimeout(() => {
        render();
    }, 5000);
}



render();

