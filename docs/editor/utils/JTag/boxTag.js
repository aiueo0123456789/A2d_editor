import { createTag } from "../ui/util.js";
import { JTag } from "./JTag.js";
import { CustomTag } from "./customTag.js";

export class BoxTag extends CustomTag {
    constructor(/** @type {JTag} */jTag,t,parent,source,child,flag) {
        super();
        this.element = createTag(t, "div");
        this.children = [];
        if (child.children) {
            this.children = jTag.createFromStructures(this.element, this, child.children, source, flag);
        }
    }
}