import { CustomTag } from "./customTag.js";
import { createTag } from "../ui/util.js";

export class MeterTag extends CustomTag {
    constructor(jTag,t,parent,source,child,flag) {
        super(parent);
        this.bar = document.createElement("div");
        this.element = createTag(t, "div", {class: "meter"});
        this.bar = createTag(this.element, "div", {class: "meterBar"});

        let valueSource = jTag.getParameter(source, child.valueSource, "REFERENCE");
        let maxSource = jTag.getParameter(source, child.maxSource, "REFERENCE");
        // 値を関連づけ
        let updateDOMsValue = () => {
            this.bar.style.width = `${valueSource.value / maxSource.value * 100}%`;
        };
        this.dataBlocks = [jTag.setUpdateFunction(source, child.valueSource, updateDOMsValue, flag), jTag.setUpdateFunction(source, child.maxSource, updateDOMsValue, flag)];
        t.append(this.element);
    }
}