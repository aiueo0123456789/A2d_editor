import { app } from "../../../main.js";
import { createTag } from "../ui/util.js";
import { JTag } from "./JTag.js";
import { CustomTag } from "./customTag.js";

export class FoldedBoxTag extends CustomTag {
    constructor(/** @type {JTag} */jTag,t,parent,source,child,flag) {
        super();
        this.customTag = true;
        /** @type {HTMLElement} */
        this.container = createTag(t, "div");
        this.container.classList.add("foldedBoxTag");
        const titile = createTag(this.container, "p", {class: "nowrap"});
        titile.textContent = "テストaakdwokdoa";
        const downArrow = createTag(this.container, "span", {class: "downArrow"});
        /** @type {HTMLElement} */
        this.boxContainer = createTag(app.ui.jTag.getDOMFromID("foldedBoxContainer"), "div", {class: "boxContainer"});
        this.boxContainer.classList.add("hidden");
        /** @type {HTMLElement} */
        const speechBubbleTriangle = createTag(this.boxContainer, "div", {class: "speechBubbleTriangle"});
        /** @type {HTMLElement} */
        this.element = createTag(this.boxContainer, "div", {class: "speechBubbleMain"});
        this.children = jTag.createFromStructures(this.element, this, child.children, source, flag);
        this.container.addEventListener("click", () => {
            const rect = this.container.getBoundingClientRect();
            this.boxContainer.style.top = `${rect.bottom}px`;
            this.boxContainer.style.left = `${rect.left + rect.width / 2}px`;
            this.boxContainer.classList.toggle("hidden");
        })
    }
}