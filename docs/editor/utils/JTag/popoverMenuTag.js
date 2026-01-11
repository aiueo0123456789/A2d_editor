import { app } from "../../../main.js";
import { createTag } from "../ui/util.js";
import { JTag } from "./JTag.js";
import { CustomTag } from "./customTag.js";
import { IconTag } from "./iconTag.js";

export class PopoverMenuTag extends CustomTag {
    constructor(/** @type {JTag} */jTag,t,parent,source,child,flag) {
        super(false);
        this.customTag = true;
        /** @type {HTMLElement} */
        this.container = createTag(t, "div");
        this.container.classList.add("popoverMenu");
        const titile = createTag(this.container, "div", {class: "title"});
        if (child.label) {
            const label = createTag(titile, "p", {textContent: child.label});
        }
        if (child.icon) {
            const icon = new IconTag(/** @type {JTag} */jTag,titile,parent,source,{tagType: "icon", src: child.icon},flag);
        }
        const downArrow = createTag(this.container, "span", {class: "downArrow"});
        /** @type {HTMLElement} */
        this.mainContainer = createTag(app.ui.jTag.getDOMFromID("popoverMenusContainer"), "div", {class: "mainContainer"});
        this.mainContainer.classList.add("hidden");
        /** @type {HTMLElement} */
        const speechBubbleTriangle = createTag(this.mainContainer, "div", {class: "speechBubbleTriangle"});
        /** @type {HTMLElement} */
        this.element = createTag(this.mainContainer, "div", {class: "speechBubbleMain"});
        this.children = jTag.createFromStructures(this.element, this, child.children, source, flag);
        this.container.addEventListener("click", (e) => {
            e.stopPropagation();
            const rect = this.container.getBoundingClientRect();
            this.mainContainer.style.top = `${rect.bottom}px`;
            this.mainContainer.style.left = `${rect.left + rect.width / 2}px`;
            this.mainContainer.classList.remove("hidden");
            const hiddenFn = (e) => {
                if (!this.mainContainer.contains(e.target)) {
                    this.mainContainer.classList.add("hidden");
                    document.removeEventListener("click", hiddenFn);
                }
            }
            document.addEventListener("click", hiddenFn);
        })
    }
}