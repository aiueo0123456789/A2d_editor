import { app } from "../../../main.js";
import { isFunction } from "../utility.js";
import { JTag } from "./JTag.js";
import { CustomTag } from "./customTag.js";
import { ResizerForDOM } from "../ui/resizer.js";
import { createButton, createMinButton, createTag, useEffect } from "../ui/util.js";

export class ListTag extends CustomTag {
    constructor(/** @type {JTag} */jTag,t,parent,source,data,flag) {
        super(false);
        this.element;
        this.selected = [];
        this.active = null;
        if (data.type == "min") {
            this.listNameTag = createTag(t, "p", {textContent: data.label});
            this.element = createTag(t, "div", {class: "flex", style: "gap: 10px;"});
            this.listContainer = createTag(this.element, "div", {class: "minList", style: "height: 200px;"});
            new ResizerForDOM(this.listContainer, "b", 100, 600);
            /** @type {HTMLElement} */
            this.list = createTag(this.listContainer, "div", {class: "scrollable", style: "padding: 2px; gap: 2px;"});
            // アクション
            if (data.onAppend || data.onDelete) {
                this.actionBar = createTag(this.element, "div", {style: "width: 20px;"});
                if (data.onAppend) this.appendButton = createMinButton(this.actionBar, "+");
                if (data.onDelete) this.deleteButton = createMinButton(this.actionBar, "-");
            }
        } else if (data.type == "noScroll") {
            this.listNameTag = createTag(t, "p", {textContent: data.label});
            this.element = createTag(t, "div", {style: ""});
            // アクション
            if (data.onAppend || data.onDelete) {
                this.actionBar = createTag(this.element, "div", {style: "display: flex; height: 20px;"});
                if (data.onAppend) this.appendButton = createButton(this.actionBar, null, "新しい値を追加");
                if (data.onDelete) this.deleteButton = createMinButton(this.actionBar, "-");
            }
            this.listContainer = createTag(this.element, "div", {style: "height: fit-content;"});
            /** @type {HTMLElement} */
            this.list = createTag(this.listContainer, "div", {style: "height: fit-content;"});
            this.listContainer.append(this.appendButton);
        } else {
            this.listNameTag = createTag(t, "p", {textContent: data.label});
            this.element = createTag(t, "div", {style: ""});
            // アクション
            if (data.onAppend || data.onDelete) {
                this.actionBar = createTag(this.element, "div", {style: "display: flex; height: 20px;"});
                if (data.onAppend) this.appendButton = createMinButton(this.actionBar, "+");
                if (data.onDelete) this.deleteButton = createMinButton(this.actionBar, "-");
            }
            this.listContainer = createTag(this.element, "div", {style: "height: 200px;"});
            /** @type {HTMLElement} */
            this.list = createTag(this.listContainer, "div", {class: "scrollable", style: "padding: 2px; gap: 2px;"});
        }

        if (data.onAppend) {
            if (isFunction(data.onAppend)) {
                this.appendButton.addEventListener("click", () => {
                    data.onAppend(source);
                });
            }
        }
        if (data.onDelete) {
            if (isFunction(data.onDelete)) {
                this.deleteButton.addEventListener("click", () => {
                    data.onDelete(this.selected);
                });
            }
        }

        const keys = new Map();
        let items = jTag.getParameterByPath(source, data.src);
        this.children = [];
        const isPrimitive = data.isPrimitive;
        const listUpdate = () => {
            this.list.replaceChildren();
            const newKeys = items.map((item, index) => jTag.getKeyFromStructure(data.liStruct, isPrimitive ? {normal: items, special: {index: index, list: items, source: source}} : {normal: item, special: {index: index, list: items, source: source}}));
            console.log(newKeys)
            for (const key of keys.keys()) {
                if (!newKeys.includes(key)) { // 再利用ができないものは削除
                    const element = keys.get(key);
                    if (element instanceof HTMLElement || element instanceof CustomTag) {
                        element.remove();
                    }
                }
            }
            keys.clear();
            items.forEach((item, index) => {
                /** @type {HTMLElement} */
                const li = createTag(this.list, "li", {style: "width: 100%; minHeight: fit-content;"});
                li.classList.remove(["activeColor", "selectedColor"]);
                if (isPrimitive) {
                    if (this.active === index) li.classList.add("activeColor");
                    else if (this.selected.includes(index)) li.classList.add("selectedColor");
                } else {
                    if (this.active === item) li.classList.add("activeColor");
                    else if (this.selected.includes(item)) li.classList.add("selectedColor");
                }
                if (!data.notUseActiveAndSelect) {
                    li.addEventListener("click", (e) => {
                        if (isFunction(data.onActive)) {
                            if (isPrimitive) {
                                data.onActive(index);
                            } else {
                                data.onActive(item);
                            }
                        }
                        this.active = item;
                        if (isFunction(data.onSelect)) {
                            if (isPrimitive) {
                                data.onSelect(index, this.selected);
                            } else {
                                data.onSelect(item, this.selected);
                            }
                        }
                        if (!e.shiftKey) {
                            this.selected.length = 0;
                        }
                        if (isPrimitive) {
                            this.selected.push(index);
                        } else {
                            this.selected.push(item);
                        }
                        listUpdate();
                    })
                }
                let element = null;
                const key = newKeys[index];
                if (isPrimitive) {
                    if (key) {
                        if (keys.has(key)) { // 既存のタグ
                            JTag.tagAppendChildren(li, keys.get(key));
                        } else {
                            element = jTag.createFromStructures(li, this, [data.liStruct], {normal: items, special: {index: index, list: items, source: source}}, flag);
                            keys.set(key, element);
                        }
                    } else { // キーがない
                        element = jTag.createFromStructures(li, this, [data.liStruct], {normal: items, special: {index: index, list: items, source: source}}, flag);
                    }
                } else {
                    if (key) {
                        if (keys.has(key)) { // 既存のタグ
                            JTag.tagAppendChildren(li, keys.get(key));
                        } else {
                            element = jTag.createFromStructures(li, this, [data.liStruct], {normal: item, special: {index: index, list: items, source: source}}, flag);
                            keys.set(key, element);
                        }
                    } else { // キーがない
                        element = jTag.createFromStructures(li, this, [data.liStruct], {normal: item, special: {index: index, list: items, source: source}}, flag);
                    }
                }
                this.children.push(element);
            });
        }
        this.dataBlocks = [useEffect.set({o: items, g: jTag.groupID}, listUpdate)];
        listUpdate();
    }
}