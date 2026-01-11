import { app } from "../../../main.js";
import { createTag } from "../ui/util.js";
import { CustomTag } from "./customTag.js";

export class IconTag extends CustomTag {
    constructor(/** @type {JTag} */jTag,t,parent,source,child,flag) {
        super();
        this.element = createTag(t, "div", {class: "icon"});
        this.img = createTag(this.element, "img");
        let src = child.src;
        if (src.path) {
            src = jTag.getParameter(source, src.path);
        }
        this.img.src = app.ui.getImgURLFromImgName(src);
    }
}