import { CustomTag } from "./customTag.js";
import { createTag } from "../ui/util.js";

export class MeterTag extends CustomTag {
    constructor(jTag,t,parent,source,child,flag) {
        super();
        this.bar = document.createElement("div");
        this.element = createTag(t, "div", {class: "meter"});
        this.bar = createTag(this.element, "div", {class: "meterBar"});

        let valueSource = jTag.getParameterByPath(source, child.valueSource, 1);
        let maxSource = jTag.getParameterByPath(source, child.maxSource, 1);
        // 値を関連づけ
        let updateDOMsValue = () => {
            this.bar.style.width = `${valueSource.value / maxSource.value * 100}%`;
        };
        this.dataBlocks = [jTag.setUpdateEventByPath(source, child.valueSource, updateDOMsValue, flag), jTag.setUpdateEventByPath(source, child.maxSource, updateDOMsValue, flag)];
        t.append(this.element);
    }
}