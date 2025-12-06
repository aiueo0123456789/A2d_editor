import { createTag } from "../ui/util.js";
import { JTag } from "./JTag.js";
import { CustomTag } from "./customTag.js";

export class BoxTag extends CustomTag {
    constructor(/** @type {JTag} */jTag,t,parent,searchTarget,child,flag) {
        super();
        this.element = createTag(t, "div");
        this.children = [];
        if (child.children) {
            this.children = jTag.createFromChildren(this.element, this, child.children, searchTarget, flag);
        }
    }
}