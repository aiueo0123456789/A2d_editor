import { JTag, ParameterReference } from "./JTag.js";
import { CustomTag } from "./customTag.js";
import { createTag, useEffect } from "../ui/util.js";
import { isFunction } from "../utility.js";
import { app } from "../../../main.js";
import { createID } from "../idGenerator.js";

export class PathTag extends CustomTag {
    constructor(/** @type {JTag} */jTag,/** @type {HTMLElement}} */t,parent,source,child,flag) {
        super(parent);
        if (parent instanceof PathTag) { // 親がpathTagの場合特殊
            this.element = parent.element;
            this.parentElement = parent.parentElement;
            this.notRemoveList = ["element", "parentElement"];
        } else {
            this.notRemoveList = ["parentElement"];
            this.parentElement = t;
            this.element = createTag(t, "div", {style: "width: 0px; height: 0px; position: absolute;"})
        };
        const myFlag = createID();
        this.isRemoved = false;
        const childrenReset = () => {
            // 関連づけられていない小要素を削除
            for (const childTag of this.children) {
                if (isFunction(childTag.remove)) childTag.remove();
            }
            const keep = createTag(null, "div", {style: "width: 0px; height: 0px;"});
            if (child.children) {
                const o = jTag.getParameter(source, child.src, "REFERENCE_IF_VALUE");
                if (o) {
                    if (isFunction(o)) {
                        jTag.createFromStructures(keep, this, child.children, {normal: o(), special: {}}, myFlag);
                    } else if (o instanceof ParameterReference) {
                        if ("errorChildren" in child) {
                            jTag.createFromStructures(keep, this, child.errorChildren, {normal: {}, special: {}}, myFlag);
                        }
                    } else {
                        jTag.createFromStructures(keep, this, child.children, {normal: o, special: {}}, myFlag);
                    }
                }
            }
            for (const childTag of Array.from(keep.children)) {
                this.parentElement.insertBefore(childTag, this.element);
            }
            keep.remove();
        }
        const setUpdateEventTarget = (updateTarget) => {
            this.dataBlocks.push(jTag.setUpdateFunction(source, updateTarget, childrenReset, flag));
        }
        this.dataBlocks = [];
        if (Array.isArray(child.updateTarget)) {
            for (const updateTarget of child.updateTarget) {
                setUpdateEventTarget(updateTarget);
            }
        } else {
            setUpdateEventTarget(child.updateTarget);
        }
        childrenReset();
    }
}