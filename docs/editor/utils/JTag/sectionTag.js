import { IsString } from "../utility.js";
import { JTag } from "./JTag.js";
import { CustomTag } from "./customTag.js";
import { createTag } from "../ui/util.js";
import { InputCheckboxTag } from "./inputCheckboxTag.js";

export class SectionTag extends CustomTag {
    constructor(/** @type {JTag} */  jTag,t,parent,source,child,flag) {
        super();
        this.element = createTag(t, "div", {class: child?.options?.min ? "minSection" : "sectionOrPanel"});
        this.header = createTag(this.element, "div", {class: "sectionOrPanel-header"});

        const visibleCheck = new InputCheckboxTag(null,this.header,this,{}, {tagType: "input", type: "checkbox", look: {check: "right2", uncheck: "down2", size: "70%"}},"defo");
        visibleCheck.checkbox.setAttribute('disabled', true);
        // this.arrow = createTag(this.header, "span", {class: "downArrow"});
        this.sectionName = createTag(this.header, "p");
        if (IsString(child.name)) {
            this.sectionName.textContent = child.name;
        } else {
            this.sectionName.textContent = jTag.getParameter(source, child.name.path);
        }

        this.mainContainer = createTag(this.element, "div", {class: "sectionOrPanel-mainContainer"});
        this.main = createTag(this.mainContainer, "div", {class: "section-main"});

        let lastHeight = "fit-content";
        this.header.addEventListener("click", () => {
            if (this.mainContainer.classList.contains('close')) {
                // 開く
                this.mainContainer.style.height = lastHeight;
            } else {
                // 閉じる
                lastHeight = this.mainContainer.scrollHeight + "px";
                this.mainContainer.style.height = lastHeight;
                this.mainContainer.offsetHeight;
                this.mainContainer.style.height = "0px";
            }
            this.mainContainer.classList.toggle('close');
            visibleCheck.checkbox.checked = !visibleCheck.checkbox.checked;
            // this.arrow.classList.toggle('arrow');
            // this.arrow.classList.toggle('downArrow');
        });
        this.mainContainer.addEventListener("transitionend", (e) => {
            console.log("transition 終了:", e.propertyName);
            if (!this.mainContainer.classList.contains('close')) {
                this.mainContainer.style.height = "fit-content";
            }
        });
        this.children = [];
        if (child.children) {
            this.children = jTag.createFromStructures(this.main, this, child.children, source, flag);
        }
    }
}