import { app } from "../../../main.js";
import { createTag } from "../ui/util.js";
import { CustomTag } from "./customTag.js";
import { JTag } from "./JTag.js";

export class HTMLTag extends CustomTag {
    constructor(/** @type {JTag} */jTag,t,parent,source,child,flag) {
        super(parent);
        this.element = createTag(t, child.tag);
        if (child.children) jTag.createFromStructures(this.element, this, child.children, source, flag);
    }
}