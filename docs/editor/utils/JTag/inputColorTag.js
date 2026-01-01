import { JTag } from "./JTag.js";
import { CustomTag } from "./customTag.js";
import { createTag, useEffect, removeHTMLElementInObject } from "../ui/util.js";

export class InputColorTag extends CustomTag {
    constructor(/** @type {JTag} */jTag,t,parent,source,child,flag) {
        super();
        this.element = createTag(t, "input", {type: "color"});
        this.dataBlocks = [jTag.setWith(this.element, child.value, source, flag, child.useCommand, child.onChange)];
        // if (child.custom && "collision" in child.custom && !child.custom.collision) {
        //     this.element.style.pointerEvents = "none";
        // }
    }
}