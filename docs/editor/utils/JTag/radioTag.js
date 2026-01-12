import { app } from "../../../main.js";
import { createTag } from "../ui/util.js";
import { isFunction } from "../utility.js";
import { CustomTag } from "./customTag.js";
import { InputCheckboxTag } from "./inputCheckboxTag.js";

export class InputRadioTag extends CustomTag {
    constructor(jTag,t,parent,source,child,flag) {
        super();
        this.element = createTag(t, "div", {class: "radio"});
        this.checkboxs = [];
        this.value = child.value;
        for (const input of child.inputs) {
            const checkboxTag = new InputCheckboxTag(jTag, this.element, this, source, {look: input.look});
            if (input.value == this.value) {
                checkboxTag.checkbox.checked = true;
            }
            checkboxTag.checkbox.addEventListener("change", () => {
                this.checkboxs.forEach(checkboxTag_ => {
                    checkboxTag_.checkbox.checked = false;
                });
                checkboxTag.checkbox.checked = true;
                this.value = input.value;
                if (isFunction(child.onChange)) child.onChange(this.value);
            })
            this.checkboxs.push(checkboxTag);
        }
    }
}