import { CustomTag } from "./customTag.js";
import { createTag } from "../ui/util.js";
import { JTag } from "./JTag.js";

export class LabelTag extends CustomTag {
    constructor(/** @type {JTag} */jTag,t,parent,source,data,flag) {
        super(false);
        /** @type {HTMLElement} */
        this.container = createTag(t,"div")
        if (data.attributes?.includes("after")) this.container.classList.add("afterLabel");
        else if (data.attributes?.includes("top")) this.container.classList.add("topLabel");
        else this.container.classList.add("label");
        /** @type {HTMLElement} */
        this.label = createTag(this.container,"label", {textContent: data.text});
        /** @type {HTMLElement} */
        this.element = createTag(this.container,"div");
        this.children = jTag.createFromStructures(this.element, this, data.children, source, flag);
    }
}