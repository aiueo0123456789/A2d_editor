import { CustomTag } from "./customTag.js";
import { createTag } from "../ui/util.js";
import { IsString } from "../utility.js";
import { InputCheckboxTag } from "./inputCheckboxTag.js";

export class PanelTag extends CustomTag {
    constructor(jTag,t,parent,source,child,flag) {
        super();
        this.element = createTag(t, "div", {class: "panel"});
        this.header = createTag(this.element, "div", {class: "panel-header"});

        const visibleCheck = new InputCheckboxTag(null,this.header,this,{}, {tagType: "input", type: "checkbox", look: {check: "right2", uncheck: "down2", size: "70%"}},"defo");
        visibleCheck.checkbox.setAttribute('disabled', true);
        // this.arrow = createTag(this.header, "span", {class: "downArrow"});
        this.panelName = createTag(this.header, "p");
        if (IsString(child.name)) {
            this.panelName.textContent = child.name;
        } else {
            this.panelName.textContent = jTag.getParameter(source, child.name.path);
        }

        this.mainContainer = createTag(this.element, "div", {class: "panel-mainContainer"});
        this.main = createTag(this.mainContainer, "div", {class: "panel-main"});

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