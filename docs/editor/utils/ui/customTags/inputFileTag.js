import { CreatorForUI } from "../creatorForUI.js";
import { CustomTag } from "../customTag.js";
import { createTag, managerForDOMs, removeHTMLElementInObject } from "../util.js";

export class InputFileTag extends CustomTag{
    constructor(/** @type {CreatorForUI} */creatorForUI,t,parent,searchTarget,child,flag) {
        super();
        /** @type {HTMLElement} */
        this.element = createTag(t, "input", {type: "file"});
        if (child.webkitdirectory) {
            this.element.setAttribute("webkitdirectory", "");
            this.element.setAttribute("directory", "");
        }
        this.dataBlocks = [creatorForUI.setWith(this.element, child.value, searchTarget, flag, child.useCommand, child.onChange)];
        // if (child.custom && "collision" in child.custom && !child.custom.collision) {
        //     this.element.style.pointerEvents = "none";
        // }
    }
}