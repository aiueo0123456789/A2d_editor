import { createTag } from "../ui/util.js";
import { createArrayNAndFill } from "../utility.js";
import { CustomTag } from "./customTag.js";
import { JTag } from "./JTag.js";

export class GroupTag extends CustomTag {
    constructor(/** @type {JTag} */jTag,t,parent,source,child,flag) {
        super();
        /** @type {HTMLElement} */
        this.element = createTag(t, "div", {class: "group"});
        this.element.style.gridTemplateColumns = child.template ? child.template : createArrayNAndFill(child.children.length, "1fr").join(" ");
        this.children = [];
        if (child.children) {
            this.children = jTag.createFromStructures(this.element, this, child.children, source, flag);
        }
    }
}