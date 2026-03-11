import { CustomTag } from "./customTag.js";
import { JTag } from "./JTag.js";

export class IfTag extends CustomTag {
    constructor(/** @type {JTag} */jTag,t,parent,source,child,flag) {
        super(parent);
        console.log(child)
        let bool = false;
        if (child.formula.conditions == "==") {
            bool = jTag.getParameter(source,child.formula.src) == child.formula.value;
        } else if (child.formula.conditions == ">") {
            bool = jTag.getParameter(source,child.formula.src) > child.formula.value;
        } else if (child.formula.conditions == "<") {
            bool = jTag.getParameter(source,child.formula.src) < child.formula.value;
        } else if (child.formula.conditions == "in") {
            bool = child.formula.value in jTag.getParameter(source,child.formula.src);
        }
        if (bool) {
            if (child.true) {
                jTag.createFromStructures(t, null, child.true, source, flag);
            }
        } else {
            if (child.false) {
                jTag.createFromStructures(t, null, child.false, source, flag);
            }
        }
        this.element = parent.element;
        this.notRemoveList = ["element"];
    }
}