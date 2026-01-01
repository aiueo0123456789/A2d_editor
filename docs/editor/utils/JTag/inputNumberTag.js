import { JTag } from "./JTag.js";
import { CustomTag } from "./customTag.js";
import { createRange, createTag } from "../ui/util.js";

export class InputNumberTag extends CustomTag {
    constructor(/** @type {JTag} */jTag,t,parent,source,child,flag) {
        super();
        this.element;
        if (child?.custom?.visual == "range") {
            this.element = createTag(t, "div");
            this.element.style.width = "100%";
            this.element.style.display = "grid";
            this.element.style.gridTemplateColumns = "1fr 50px";
            /** @type {HTMLElement} */
            const range = createRange(this.element, child);
            range.style.gridColumn = "1/2";
            range.style.borderTopRightRadius = "0px";
            range.style.borderBottomRightRadius = "0px";
            /** @type {HTMLElement} */
            const number = createTag(this.element, "input", {type: "number"});
            number.style.gridColumn = "2/3";
            number.style.borderTopLeftRadius = "0px";
            number.style.borderBottomLeftRadius = "0px";
            this.dataBlocks = [jTag.setWith(range, child.value, source, flag, child.useCommand, child.onChange), jTag.setWith(number, child.value, source, flag, child.useCommand, child.onChange)];
        } else if (child?.custom?.visual == "rangeOnly") {
            /** @type {HTMLElement} */
            this.element = createRange(t, child);
            this.dataBlocks = [jTag.setWith(this.element, child.value, source, flag, child.useCommand, child.onChange)];
            console.log(child,this)
        } else {
            /** @type {HTMLElement} */
            this.element = createTag(t, "input", {type: "number"});
            this.dataBlocks = [jTag.setWith(this.element, child.value, source, flag, child.useCommand, child.onChange)];
            if (child.onChange) {
                this.element.addEventListener("input", () => {
                    child.onChange();
                })
            }
        }
    }
}