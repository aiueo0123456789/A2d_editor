import { isFunction } from "../utility.js";
import { createIcon, createID, createTag, useEffect, removeHTMLElementInObject, setClass } from "../ui/util.js";

export class CustomTag {
    constructor(isSetLabel = true) {
        this.isSetLabel = isSetLabel;
        this.customTag = true;
        this.isRemoved = false;
        this.dataBlocks = [];
        this.notRemoveList = [];
        this.id = createID();
    }

    remove() {
        if (this.isRemoved) {
            console.trace("すでに削除済みです", this);
        } else {
            // console.trace("削除されました", this);
        }
        for (const key in this) {
            if (!this.notRemoveList.includes(key)) {
                if (this[key] instanceof HTMLElement) {
                    this[key].remove();
                    this[key] = null;
                }
            }
        }
        for (const dataBlock of this.dataBlocks) {
            useEffect.deleteDataBlock(dataBlock);
        }
        this.dataBlocks.length = 0;
        this.children?.forEach(tag => {
            if (isFunction(tag?.remove)) tag.remove()
        });
        this.isRemoved = true;
    }

}