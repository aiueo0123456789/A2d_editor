import { app } from "../../../main.js";
import { createTag } from "../ui/util.js";
import { CustomTag } from "./customTag.js";
import { JTag } from "./JTag.js";

export class IconTag extends CustomTag {
    constructor(/** @type {JTag} */jTag,t,parent,source,child,flag) {
        super();
        this.element = createTag(t, "div", {class: "icon"});
        this.img = createTag(this.element, "img");
        let src = jTag.getParameter(source, child.src);
        this.img.src = app.ui.getImgURLFromImgName(src);
    }
}