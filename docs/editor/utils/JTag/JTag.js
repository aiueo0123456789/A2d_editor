import { CustomTag } from "./customTag.js";
import { createGroupButton, createRadios, createTag, useEffect, setClass, setStyle, updateRangeStyle } from "../ui/util.js";
import { changeParameter, hexToRgba, isFunction, isNumber, isPassByReference, IsString, rgbToHex } from "../utility.js";
import { app } from "../../../main.js";
import { MenuTag } from "./menuTag.js";
import { CodeEditorTag } from "./codeEditorTag.js";
import { SelectTag } from "./selectTag.js";
import { ChangeParameterCommand } from "../../commands/utile/utile.js";
import { createGrid } from "../ui/grid.js";
import { OutlinerTag } from "./outlinerTag.js";
import { InputCheckboxTag } from "./inputCheckboxTag.js";
import { MeterTag } from "./meterTag.js";
import { HasKeyframeCheck } from "./hasKeyframeCheckTag.js";
import { TextureTag } from "./textureTag.js";
import { PathTag } from "./pathTag.js";
import { BoxTag } from "./boxTag.js";
import { InputTextTag } from "./inputTextTag.js";
import { InputColorTag } from "./inputColorTag.js";
import { InputFileTag } from "./inputFileTag.js";
import { InputNumberTag } from "./inputNumberTag.js";
import { OperatorButtonTag } from "./operatorButtonTag.js";
import { LabelTag } from "./labelTag.js";
import { GridBoxTag } from "./gridBoxTag.js";
import { DblClickInput } from "./dblclickInput.js";
import { PanelTag } from "./panelTag.js";
import { ListTag } from "./listTag.js";
import { CanvasTag } from "./canvasTag.js";
import { DualListboxTag } from "./dualListbox.js";
import { ParameterManagerTag } from "./parameterManagerTag.js";
import { ChecksTag } from "./checksTag.js";
import { createID } from "../idGenerator.js";
import { PopoverMenuTag } from "./popoverMenuTag.js";
import { IconTag } from "./iconTag.js";
import { GroupTag } from "./groupTag.js";
import { InputRadioTag } from "./radioTag.js";

function isFocus(t) {
    return document.hasFocus() && document.activeElement === t;
}

const tagCreater = {
    // 要素の作成
    "box": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new BoxTag(/** @type {JTag} */ jTag,t,parent,source,child,flag);
    },
    "codeEditor": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new CodeEditorTag(/** @type {JTag} */ jTag,t,parent,source,child,flag);
    },
    "text": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        let element = createTag(t, "p");
        setClass(element, "text");
        const update = () => {
            element.textContent = jTag.getParameterByPath(source, child.withObject);
        }
        update();
        jTag.setUpdateEventByPath(source, child.withObject, update, flag);
        return element;
    },
    "heightCenter": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        let element = createTag(t, "div");
        setClass(element, "heightCenter");
        if (child.children) {
            jTag.createFromStructures(element, null, child.children, source, flag);
        }
        return element;
    },
    "title": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        let element = createTag(t, "div", {textContent: child.text});
        return element;
    },
    "div": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        let element = createTag(t, "div", child?.options);
        if (child.children) {
            jTag.createFromStructures(element, null, child.children, source, flag);
        }
        return element;
    },
    "input": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => { // 入力
        let element;
        if (child.type == "text") {
            element = new InputTextTag(/** @type {JTag} */ jTag,t,parent,source,child,flag);
        } else if (child.type == "file") {
            element = new InputFileTag(/** @type {JTag} */ jTag,t,parent,source,child,flag);
        } else if (child.type == "color") {
            element = new InputColorTag(/** @type {JTag} */ jTag,t,parent,source,child,flag);
        } else if (child.type == "checkbox") {
            element = new InputCheckboxTag(/** @type {JTag} */ jTag,t,parent,source,child,flag);
        } else if (child.type == "radio") {
            element = new InputRadioTag(/** @type {JTag} */ jTag,t,parent,source,child,flag);
        } else { // 数字型
            element = new InputNumberTag(/** @type {JTag} */ jTag,t,parent,source,child,flag);
        }
        if (child.custom && "collision" in child.custom && !child.custom.collision) {
            element.element.style.pointerEvents = "none";
        }
        return element;
    },
    "operatorButton": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new OperatorButtonTag(/** @type {JTag} */ jTag,t,parent,source,child,flag);
    },
    "buttons": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        createGroupButton(t, [{icon: "グループ", label: "a"},{icon: "グループ", label: "b"},{icon: "グループ", label: "c"}]);
    },
    "checks": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        const a = (child.withObjects).map((data, index) => {
            return {icon: "グループ", label: data.text};
        });
        let element = new ChecksTag(t, a);
        child.withObjects.forEach((data, index) => {
            jTag.setWith(element.checks[index], data.path, source);
        })
        return element;
    },
    "select": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new SelectTag(/** @type {JTag} */ jTag,t,parent,source,child,flag);
    },
    "menu": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        let element = new MenuTag(t, child.title, child.struct, child?.options);
        return element;
    },
    "dblClickInput": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => { // ダブルクッリク入力
        return new DblClickInput(jTag,t,parent,source,child,flag);
    },
    "list": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new ListTag(/** @type {JTag} */ jTag,t,parent,source,child,flag);
    },
    "container": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        let element = createTag(t, "ul");
        if (child.children) {
            jTag.createFromStructures(element, null, child.children, source, flag);
        }
        return element;
    },
    "panel": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new PanelTag(jTag,t,parent,source,child,flag);
    },
    "option": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        let element = createTag(t, "div", {class: "ui_options"});
        if (child.children) {
            jTag.createFromStructures(element, null, child.children, source, flag);
        }
        return element;
    },
    "icon": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new IconTag(jTag,t,parent,source,child,flag);
    },
    "flexBox": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        let element = createTag(t, "div");
        element.style.display = "flex";
        element.style.gap = child.interval;
        element.style.width = "fit-content";
        if (child.children) {
            jTag.createFromStructures(element, null, child.children, source, flag);
        }
        return element;
    },
    "grid": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        let element = createGrid(t, child.axis, child.template ? child.template : "1fr");
        jTag.createFromStructures(element.child1, null, child.child1, source, flag);
        jTag.createFromStructures(element.child2, null, child.child2, source, flag);
        return element;
    },
    "gridBox": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new GridBoxTag(jTag,t,parent,source,child,flag);
    },
    "padding": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        let element = createTag(t, "div");
        element.style.width = child.size;
        return element;
    },
    "separator": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        let element = createTag(t, "span");
        element.classList.add("separator");
        element.style.width = child.size;
        return element;
    },
    "outliner": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new OutlinerTag(jTag,t,parent,source,child,flag);
    },
    "scrollable": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        let element = createTag(t, "div", {class: "scrollable"});
        if (child.children) {
            jTag.createFromStructures(element, null, child.children, source, flag);
        }
        return element;
    },
    "canvas": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new CanvasTag(jTag,t,parent,source,child,flag);
    },
    "path": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new PathTag(jTag,t,parent,source,child,flag);
    },
    "if": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        // console.log(source, child, jTag.getParameterByPath(source,child.formula.source))
        let bool = false;
        if (child.formula.conditions == "==") {
            bool = jTag.getParameterByPath(source,child.formula.source) == child.formula.value;
        } else if (child.formula.conditions == ">") {
            bool = jTag.getParameterByPath(source,child.formula.source) > child.formula.value;
        } else if (child.formula.conditions == "<") {
            bool = jTag.getParameterByPath(source,child.formula.source) < child.formula.value;
        } else if (child.formula.conditions == "in") {
            bool = child.formula.value in jTag.getParameterByPath(source,child.formula.source);
        }
        if (bool) {
            if (child.true) {
                return jTag.createFromStructures(t, null, child.true, source, flag);
            }
        } else {
            if (child.false) {
                return jTag.createFromStructures(t, null, child.false, source, flag);
            }
        }
    },
    "hasKeyframeCheck": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new HasKeyframeCheck(jTag,t,parent,source,child,flag);
    },
    "nodeFromFunction": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        const functionResult = jTag.getParameterByPath(source, child.source)();
        return jTag.createFromStructures(t, null, functionResult, source, flag);
    },
    "html": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        const element = createTag(t, child.tag);
        if (child.children) {
            jTag.createFromStructures(element, null, child.children, source, flag);
        }
        return element;
    },
    "meter": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new MeterTag(jTag,t,parent,source,child,flag);
    },
    "texture": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new TextureTag(jTag,t,parent,source,child,flag);
    },
    "dualListbox": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new DualListboxTag(jTag,t,parent,source,child,flag);
    },
    "color": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        if (t instanceof HTMLElement) t.style.backgroundColor = jTag.getParameterByPath(source, child.src);
        else t.element.style.backgroundColor = jTag.getParameterByPath(source, child.src);
        return null;
    },
    "parameterManager": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new ParameterManagerTag(jTag,t,parent,source,child,flag);
    },
    "popoverMenu": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new PopoverMenuTag(jTag,t,parent,source,child,flag);
    },
    "label": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new LabelTag(jTag,t,parent,source,child,flag);
    },
    "group": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new GroupTag(jTag,t,parent,source,child,flag);
    }
}

export class ParameterReference {
    constructor(object, parameter) {
        this.object = object;
        this.parameter = parameter;
    }

    get value() {
        return this.object[this.parameter];
    }
}

// UIを作るクラス
export class JTag {
    static tagAppendChildren(t, children) {
        let appendTarget = t instanceof HTMLElement ? t : t.element;
        for (const child of children) {
            let appendChild = child instanceof HTMLElement ? child : child.element;
            appendTarget.append(appendChild);
        }
    }
    constructor(groupID) {
        this.groupID = groupID ? groupID : createID();
        this.dom = null;
        this.lists = new Map();
        this.globalSource = {};
        this.keyRef = new Map();
    }

    setUpdateEventByPath(source, path, event, flag) {
        const template = flag ? {g: this.groupID, f: flag} : {g: this.groupID};
        try {
            // pathをもとに参照
            let useSearchTarget;
            // 一般的
            if (path[0] == "/") {
                path = path.slice(1);
                useSearchTarget = source.normal;
            } else if (path[0] == "!") {
                path = path.slice(1);
                useSearchTarget = source.special;
            } else {
                useSearchTarget = this.globalSource;
            }
            if (path == "") {
                useEffect.set(Object.assign(template,{o: useSearchTarget}), event);
            }
            let roots = [];
            if (path.includes("{") && path.includes("}")) {
                const matches = [];
                // {〜} 部分を抽出しつつ置換
                let checked = false;
                let replaced = path.replace(/\{([^{}]*)\}/g, (match, content, index) => {
                    const currentIndex = matches.length;
                    if (path[index - 1] == "%") {
                        checked = true;
                        matches.push(`%${this.getParameterByPath(source, content)}`);
                    } else matches.push(this.getParameterByPath(source, content));
                    return `&${currentIndex}`;
                });
                if (checked) replaced = replaced.replace("%", "");
                roots = replaced.split("/").map(root => {
                    if (root[0] == "&") return matches[root.slice(1)];
                    else return root;
                });
            } else {
                // 一般的
                roots = path.split("/");
            }
            roots = roots.map(root => {
                if (isNumber(root)) return Number(root)
                else return root;
            });
            const root = roots.slice(0, -1);
            let lastRoot = roots[roots.length - 1];
            let lastIsParameter = false;
            if (lastRoot[0] == "%") { // ~/%parameterNameの場合オブジェクト内のidを対象とする
                lastRoot = lastRoot.slice(1); // %を取り除く
                lastIsParameter = true;
            }
            let object = useSearchTarget;
            for (let next of root) {
                if (next in object) {
                    object = object[next];
                } else {
                    return null;
                }
            }
            if (lastIsParameter) {
                return useEffect.set(Object.assign(template,{o: object, i: lastRoot}), event);
            } else {
                const final = object[lastRoot];
                if (isPassByReference(final)) {
                    return useEffect.set(Object.assign(template,{o: final}), event);
                } else {
                    return useEffect.set(Object.assign(template,{o: object, i: lastRoot}), event);
                }
            }
        } catch {
            console.trace("値の取得", path, source, "でエラーが出ました");
        }
    }

    getParameter(source, value) {
        if (IsString(value.path)) {
            return this.getParameterByPath(source, value);
        } else if (isFunction(value)) {
            return value();
        } else {
            return value;
        }
    }

    getParameterByPath(source, path, option = 0) {
        try {
            let useSearchTarget;
            path = path.replace("%", ""); // %はじゃまなので削除
            // 一般的
            if (path[0] == "/") { // normalから
                path = path.slice(1);
                useSearchTarget = source.normal;
            } else if (path[0] == "!") { // specialから
                path = path.slice(1);
                useSearchTarget = source.special;
            } else if (path[0] == "<") {
                path = path.slice(1);
                return this.getParameterByPath(source, path, "fromSource");
            } else { // globalから
                useSearchTarget = this.globalSource;
            }
            if (path == "") {
                return useSearchTarget;
            }
            let roots = [];
            if (path.includes("{") && path.includes("}")) {
                const matches = [];
                // {〜} 部分を抽出しつつ置換
                const replaced = path.replace(/\{([^{}]*)\}/g, (match, content, index) => {
                    const currentIndex = matches.length;
                    matches.push(this.getParameterByPath(source, content));
                    return `&${currentIndex}`;
                });
                roots = replaced.split("/").map(root => {
                    if (root[0] == "&") return matches[root.slice(1)];
                    else return root;
                });
            } else { // 通常
                roots = path.split("/");
            }
            if (option == "fromSource") return roots[0];
            roots = roots.map(root => {
                if (isNumber(root)) return Number(root)
                else return root;
            });
            const root = roots.slice(0, -1);
            let lastRoot = roots[roots.length - 1];
            let object = useSearchTarget;
            for (let next of root) {
                if (object instanceof Map) {
                    object = object.get(next);
                } else if (next in object) {
                    object = object[next];
                } else {
                    return null;
                }
            }
            let final;
            if (object instanceof Map) {
                final = object.get(lastRoot);
            } else if (lastRoot in object) {
                final = object[lastRoot];
            } else {
                return null;
            }
            if (option == 1) { // optionが1ならParameterReference型で返す
                return new ParameterReference(object, lastRoot);
            } else {
                if (isFunction(final)) {
                    return final.bind(object);
                } else if (isPassByReference(final)) {
                    return final;
                } else {
                    if (option == 2) {
                        return new ParameterReference(object, lastRoot);
                    } else {
                        return final;
                    }
                }
            }
        } catch(e) {
            // console.error(e);
            console.warn("値の取得", path, source, "でエラーが出ました");
        }
    }

    removeReference(tagData) {
        if (tagData.id) {
            let id = "";
            if (tagData.id.path) {
                id = this.getParameterByPath(source, tagData.id.path);
            } else {
                id = tagData.id;
            }
            this.keyRef.delete(id);
        }
    }

    // inputとselectを値と関連付ける
    setWith(/** @type {HTMLElement} */t, path, source, flag, useCommand = true, submitFunction = null) {
        let object = this.getParameterByPath(source, path, 1);
        if (!object) { // 取得できなかったら切り上げ
            console.warn("UIとパラメータの連携ができませんでした", path, source, this.globalSource);
            if (t.type == "number" || t.type == "range") { // 数字型
                t.value = 0.5;
            } else if (t.type == "color") {
                t.value = rgbToHex(0,0,0,1);
            } else {
                t.value = "エラー";
            }
            return ;
        }
        // 値を関連づけ
        let updateDOMsValue = null;
        if (t.type == "checkbox") {
            updateDOMsValue = () => {
                t.checked = object.value;
            };
        } else if (t.type == "range") {
            updateDOMsValue = () => {
                t.value = object.value;
                updateRangeStyle(t);
            };
        } else if (t.type == "color") {
            updateDOMsValue = () => {
                t.value = rgbToHex(...object.value);
            };
        } else {
            updateDOMsValue = () => {
                if (!isFocus(t)) {
                    t.value = object.value;
                }
            };
        }
        let command;
        // イベントを作成
        const update = () => {
            let newValue;
            if (t.type == "number" || t.type == "range") newValue = Number(t.value);
            else if (t.type == "checkbox") newValue = t.checked;
            else if (t.type == "color") {
                const valueColor = hexToRgba(t.value, 1);
                newValue = valueColor;
            } else if (t.tagName === "SELECT") newValue = t.value;
            else newValue = t.value;
            if (useCommand) {
                if (command) command.update(newValue); // commandがある場合は値だけ更新
                else command = new ChangeParameterCommand(object.object, object.parameter, newValue, (object, parameter, value) => {
                    changeParameter(object, parameter, value);
                    if (isFunction(submitFunction)) submitFunction(value);
                }); // commandを作成
            } else {
                changeParameter(object.object, object.parameter, newValue);
                if (isFunction(submitFunction)) submitFunction(newValue);
            }
        }
        t.addEventListener("input", update);
        t.addEventListener("change", () => {
            update();
            if (useCommand) { // commandを実行
                app.operator.appendCommand(command);
                app.operator.execute();
                command = null;
            }
        })
        updateDOMsValue();
        return this.setUpdateEventByPath(source, path, updateDOMsValue, flag);
    }

    getKeyFromStructure(structure, source) {
        if (!structure.id) return null;
        if (structure.id.path) {
            return this.getParameterByPath(source, structure.id.path);
        } else {
            return structure.id;
        }
    }

    // 構造の配列をもとにDOMの構築
    createFromStructures(/** @type {HTMLElement} */t, parent, structures, source, flag = "defo") {
        // const myChildrenTag = [...childrenTag];
        const myChildrenTag = [];
        for (const structure of structures) {
            /** @type {HTMLElement} */
            let element;
            // 要素の作成
            try {
                element = tagCreater[structure.tagType](this, t, parent, source, structure, flag);
            } catch (e) {
                console.error(e)
                console.log(structure.tagType)
            }
            try {
                if (element) {
                    if (element instanceof CustomTag && element.isSetLabel || element instanceof HTMLElement) {
                        const setTarget = element instanceof HTMLElement ? element : element.element;
                        if (structure.style) {
                            setStyle(setTarget, structure.style);
                        }
                        if (structure.class) {
                            setClass(setTarget, structure.class);
                        }
                        if (structure.event) {
                            for (const eventName in structure.event) {
                                setTarget.addEventListener(eventName, () => {
                                    structure.event[eventName](source, element);
                                })
                            }
                        }
                        if (structure.id) {
                            let id = this.getKeyFromStructure(structure, source);
                            element.id = structure.id;
                            this.keyRef.set(id, element);
                        }
                        // if (structure.label) element = new LabelTag(setTarget, structure.label);
                        if (structure.labelIn) {
                            const label = createTag(t, "label");
                            const span = createTag(label, "span");
                            span.textContent = structure.labelIn;
                            label.append(setTarget);
                        }
                        if (structure.contextmenu) {
                            setTarget.addEventListener("contextmenu", (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                app.contextmenu.showContextmenu([e.clientX,e.clientY], isFunction(structure.contextmenu) ? structure.contextmenu() : structure.contextmenu);
                            })
                        }
                    }
                }
            } catch (e) {
                console.error(e)
                console.error("属性の付与に失敗しました", structure)
            }
            if (Array.isArray(element)) {
                myChildrenTag.push(...element);
            } else {
                myChildrenTag.push(element);
            }
        }
        return myChildrenTag;
    }

    create(/** @type {HTMLElement} */target, struct) {
        this.remove();
        this.dom = target;
        this.globalSource = struct.inputObject; // グローバル参照

        // const t = createTag(target, "div");

        // t.style.height = "100%";
        // t.style.width = "100%";
        this.createFromStructures(this.dom, null,struct.DOM, {normal: struct.inputObject, special: {}});
    }

    getDOMFromID(id) {
        return this.keyRef.get(id);
    }

    remove() {
        if (this.dom instanceof HTMLElement) {
            this.dom.replaceChildren();
        }
        this.globalSource = {};
        this.lists.clear();
        this.keyRef.clear();
        useEffect.delete({g: this.groupID});
    }
}