import { JTag } from "./JTag.js";
import { CustomTag } from "./customTag.js";
import { createTag } from "../ui/util.js";

export class HeaderTag extends CustomTag {
    constructor(/** @type {JTag} */jTag,t,parent,source,child,flag) {
        super();
        this.element = createTag(t, "div", {class: "header"});
        if (child.children) {
            this.children = jTag.createFromStructures(this.element, this, child.children, source, flag);
        }
    }
}