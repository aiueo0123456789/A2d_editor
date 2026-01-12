import { app } from "../../../main.js";
import { KeyframeInsertInKeyframeCommand } from "../../commands/animation/keyframeInsert.js";
import { CustomTag } from "./customTag.js";
import { useEffect } from "../ui/util.js";

function update(o,g,others) {
    others.checkbox.checked = others.targetKeyframeBlock.hasKeyFromFrame(app.scene.frame_current, 0.2);
}

export class HasKeyframeCheck extends CustomTag {
    constructor(jTag,t,parent,source,child,flag) {
        super();
        this.checkbox = document.createElement("input");
        this.checkbox.type = "checkbox";
        this.checkbox.style.display = "none";
        this.element = document.createElement("label");
        this.element.setAttribute("name", "checkbox");
        this.span = document.createElement("span");
        this.span.classList.add("hasKeyframeCheck");
        this.element.append(this.checkbox,this.span);

        this.targetKeyframeBlock = jTag.getParameterByPath(source, child.src);
        this.checkbox.addEventListener("click", () => {
            if (this.targetKeyframeBlock.hasKeyFromFrame(app.scene.frame_current, 0.2)) {
            } else {
                app.operator.appendCommand(new KeyframeInsertInKeyframeCommand(this.targetKeyframeBlock, app.scene.frame_current, jTag.getParameterByPath(source, child.value)));
                app.operator.execute();
            }
        });
        update(null,null,{targetKeyframeBlock: this.targetKeyframeBlock, checkbox: this.checkbox});
        this.dataBlocks = [
            useEffect.set({o: app.scene, i: "frame_current", f: flag, g: jTag.groupID}, update, {targetKeyframeBlock: this.targetKeyframeBlock, checkbox: this.checkbox}),
            useEffect.set({o: this.targetKeyframeBlock, i: "keys", f: flag, g: jTag.groupID}, update, {targetKeyframeBlock: this.targetKeyframeBlock, checkbox: this.checkbox})
        ];
        t.append(this.element);
    }
}