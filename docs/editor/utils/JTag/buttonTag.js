import { app } from "../../../main.js";
import { isFunction } from "../utility.js";
import { JTag } from "./JTag.js";
import { CustomTag } from "./customTag.js";
import { createTag, removeHTMLElementInObject } from "../ui/util.js";

export class ButtonTag extends CustomTag {
    constructor(/** @type {JTag} */jTag,t,parent,source,child,flag) {
        super();
        /** @type {HTMLElement} */
        this.element = createTag(t, "div");
        this.element.classList.add("button");
        this.icon = createTag(this.element, "img");
        this.text = createTag(this.element, "div");
        if (child.icon) {
            this.icon.src = app.ui.getImgURLFromImgName(child.icon);
        } else {
            this.icon.style.width = "0px";
        }
        if (child.textContent) {
            this.text.textContent = child.textContent;
        }
        if (isFunction(child.onClick)) {
            this.element.addEventListener("click", () => {
                child.onClick(source);
            })
        }
    }
}