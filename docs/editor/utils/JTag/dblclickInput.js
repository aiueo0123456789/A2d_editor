import { JTag } from "./JTag.js";
import { CustomTag } from "./customTag.js";
import { createTag } from "../ui/util.js";

export class DblClickInput extends CustomTag {
    constructor(/** @type {JTag} */jTag,t,parent,searchTarget,child,flag) {
        super();
        this.element = createTag(t, "input");
        this.element.type = "text";
        this.element.classList.add("dblClickInput");
        this.element.setAttribute('readonly', true);
        this.element.addEventListener('dblclick', () => {
            this.element.removeAttribute('readonly');
            this.element.focus();
        });

        this.element.addEventListener('blur', () => {
            this.element.setAttribute('readonly', true);
        });
        this.dataBlocks = [jTag.setWith(this.element, child.value, searchTarget, flag, child.useCommand, child.onChange)];
    }
}