import { CustomTag } from "./customTag.js";
import { createTag } from "../ui/util.js";
import { JTag } from "./JTag.js";

export class LabelTag extends CustomTag {
    constructor(/** @type {JTag} */jTag,t,parent,source,data,flag) {
        super(false);
        this.container = createTag(t,"div",{class: "label-input"});
        this.label = createTag(this.container,"label", {textContent: data.text});
        this.element = createTag(this.container,"div");
        this.children = jTag.createFromStructures(this.element, this, data.children, source, flag);
    }
}