import { app } from "../../../main.js";
import { CustomTag } from "./customTag.js";

const hadClass = {};

export class InputCheckboxTag extends CustomTag {
    constructor(jTag,t,parent,source,child,flag) {
        super();
        this.checkbox = document.createElement("input");
        this.checkbox.type = "checkbox";
        this.checkbox.style.display = "none";
        this.element = document.createElement("label");
        this.element.setAttribute("name", "checkbox");
        this.element.classList.add("customCheckbox");
        const imgNames = child.look;
        const className = `customCheckbox-${imgNames.check}-${imgNames.uncheck}`;
        if (!(className in hadClass)) {
            const style = document.createElement("style");
            style.textContent = `
            input[type="checkbox"]:checked + .${className} {
                background-image: url(${app.ui.getImgURLFromImgName(imgNames.check)});
            }
            input[type="checkbox"]:not(:checked) + .${className} {
                background-image: url(${app.ui.getImgURLFromImgName(imgNames.uncheck)});
            }
            `;
            document.head.appendChild(style);
            hadClass[className] = true;
        }
        const icon = document.createElement("span");
        icon.classList.add(className)
        if (child.checked) this.dataBlocks = [jTag.setWith(this.checkbox, child.checked, source, flag, child.useCommand, child.onChange)];
        if (imgNames.size) {
            icon.style.width = imgNames.size;
            icon.style.height = imgNames.size;
        }
        this.element.append(this.checkbox,icon);
        t.append(this.element);
    }
}