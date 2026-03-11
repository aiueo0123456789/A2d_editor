import { CustomTag } from "./customTag.js";
import { createGroupButton, createRadios, createTag, useEffect, setClass, setStyle, updateRangeStyle } from "../ui/util.js";
import { changeParameter, hexToRgba, isFunction, isNumber, isPassByReference, IsString, rgbToHex } from "../utility.js";
import { app } from "../../../main.js";
import { MenuTag } from "./menuTag.js";
import { CodeEditorTag } from "./codeEditorTag.js";
import { SelectTag } from "./selectTag.js";
import { ChangeParameterCommand } from "../../commands/ChangeParameterCommand.js";
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
import { createID } from "../idGenerator.js";
import { PopoverMenuTag } from "./popoverMenuTag.js";
import { IconTag } from "./iconTag.js";
import { GroupTag } from "./groupTag.js";
import { InputRadioTag } from "./radioTag.js";
import { HeaderTag } from "./headerTag.js";
import { HTMLTag } from "./htmlTag.js";
import { IfTag } from "./ifTag.js";

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
            element.textContent = jTag.getParameter(source, child.src);
        }
        update();
        jTag.setUpdateFunction(source, child.src, update, flag);
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
    "select": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new SelectTag(jTag,t,parent,source,child,flag);
    },
    "menu": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        let element = new MenuTag(jTag,t,parent,source,child,flag);
        return element;
    },
    "dblClickInput": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => { // ダブルクッリク入力
        return new DblClickInput(jTag,t,parent,source,child,flag);
    },
    "list": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new ListTag(jTag,t,parent,source,child,flag);
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
        /** @type {HTMLElement} */
        let element = createTag(t, "div");
        element.style.display = "flex";
        element.style.gap = child.gap;
        element.style.width = "fit-content";
        element.style.height = "100%";
        element.style.alignItems = "center";
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
        if ("size" in child) element.style.width = child.size;
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
        return new IfTag(jTag,t,parent,source,child,flag);
    },
    "hasKeyframeCheck": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new HasKeyframeCheck(jTag,t,parent,source,child,flag);
    },
    "nodeFromFunction": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        const functionResult = jTag.getParameter(source, child.source)();
        return jTag.createFromStructures(t, null, functionResult, source, flag);
    },
    "html": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new HTMLTag(jTag,t,parent,source,child,flag);
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
        if (t instanceof HTMLElement) t.style.backgroundColor = jTag.getParameter(source, child.src);
        else t.element.style.backgroundColor = jTag.getParameter(source, child.src);
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
    },
    "header": (/** @type {JTag} */ jTag,t,parent,source,child,flag) => {
        return new HeaderTag(jTag,t,parent,source,child,flag);
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

class SourceAndRoot {
    constructor(source, root) {
        this.source = source;
        this.root = root;
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
    static createTag(type, t, options) {

    }
    constructor(groupID) {
        this.groupID = groupID ? groupID : createID();
        this.dom = null;
        this.globalSource = {};
        this.keyRef = new Map();
    }

    setUpdateFunction(source, value, /** @type {Function} */ submitFunction, flag) {
        const template = flag ? {g: this.groupID, f: flag} : {g: this.groupID};
        try {
            const parameter = this.getParameter(source, value, "SOURCE_AND_ROOT");
            if (parameter instanceof SourceAndRoot) {
                const {root: root, source: startObject} = parameter;
                const mainRoot = root.slice(0, -1);
                let lastRoot = root[root.length - 1];
                let lastIsParameter = false;
                console.log(root)
                if (lastRoot.startsWith("[S]")) { // ~/[S]...の場合オブジェクト内のidを対象とする
                    console.log(lastRoot)
                    lastRoot = lastRoot.slice(3); // [S]を取り除く
                    lastIsParameter = true;
                }
                let object = startObject;
                for (let next of mainRoot) {
                    if (next in object) {
                        object = object[next];
                    } else {
                        return null;
                    }
                }
                if (lastIsParameter) {
                    return useEffect.set(Object.assign(template,{o: object, i: lastRoot}), submitFunction);
                } else {
                    const final = object[lastRoot];
                    if (isPassByReference(final)) {
                        return useEffect.set(Object.assign(template,{o: final}), submitFunction);
                    } else {
                        return useEffect.set(Object.assign(template,{o: object, i: lastRoot}), submitFunction);
                    }
                }
            } else {
                return useEffect.set(Object.assign(template,{o: parameter}), submitFunction);
            }
        } catch(e) {
            console.error(e)
            console.warn("値の取得", value, source, "でエラーが出ました");
        }
    }

    getParameter(source, value, option = "VALUE") {
        try {
            if (isFunction(value)) {
                return value;
            } else if (value[0] == "{" && value[value.length - 1] == "}") { // {string}という構造か
                let path = value.slice(1, -1); // string部分
                let startObject;
                // 最初の参照
                if (path[0] == "/") { // normalから
                    path = path.slice(1);
                    startObject = source.normal;
                } else if (path[0] == "!") { // specialから
                    path = path.slice(1);
                    startObject = source.special;
                } else if (path[0] == "<") { // pathから {<{!index}} の場合
                    path = path.slice(1);
                    return this.getParameter(source, path, "FIRST_PATH"); // optionをつけて呼び直す
                } else { // globalから
                    startObject = this.globalSource;
                }
                if (path == "") return startObject;

                // ルート
                let root = [];
                if (path.includes("{") && path.includes("}")) {
                    const matches = [];
                    // {〜} 部分を抽出しつつ置換
                    let checked = false;
                    let replaced = path.replace(/\{([^{}]*)\}/g, (match, content, index) => {
                        const currentIndex = matches.length;
                        if (path.startsWith("[S]", index - 3)) {
                            checked = true;
                            matches.push(`[S]${this.getParameter(source, content)}`);
                        } else matches.push(this.getParameter(source, content));
                        return `[ref]${currentIndex}`;
                    });
                    if (checked) replaced = replaced.replace("%", "");
                    root = replaced.split("/").map(root => {
                        if (root.startsWith("[ref]")) return matches[root.slice(5)];
                        else return root;
                    });
                } else {
                    // 一般的
                    root = path.split("/");
                }
                if (option == "FIRST_PATH") return root[0];
                root = root.map(root => {
                    if (isNumber(root)) return Number(root)
                    else return root;
                });
                if (option == "SOURCE_AND_ROOT") return new SourceAndRoot(startObject, root);
                const mainRoot = root.slice(0, -1);
                let lastRoot = root[root.length - 1];

                // ルートで取得
                let object = startObject;
                for (let next of mainRoot) {
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
                console.log(final, object, lastRoot)
                if (option == "VALUE") {
                    if (isFunction(final)) return final.bind(object);
                    else if (isPassByReference(final)) return final;
                    else return final;
                } else if (option == "REFERENCE") {
                    return new ParameterReference(object, lastRoot);
                } else if (option == "REFERENCE_IF_VALUE") {
                    if (isFunction(final)) return final.bind(object);
                    else if (isPassByReference(final)) return final;
                    else {
                        if (option == 2) return new ParameterReference(object, lastRoot);
                        else return final;
                    }
                }
            } else { // ただの文字列
                return value;
            }
        } catch(e) {
            // console.error(e)
            console.warn("値の取得", value, source, this.globalSource, "でエラーが出ました");
        }
    }

    removeReference(tagData) {
        if (tagData.key) {
            let id = "";
            if (tagData.key.path) {
                id = this.getParameter(source, tagData.key.path);
            } else {
                id = tagData.key;
            }
            this.keyRef.delete(id);
        }
    }

    // inputとselectを値と関連付ける
    setWith(/** @type {HTMLElement} */t, path, source, flag, useCommand = true, submitFunction = null) {
        let object = this.getParameter(source, path, "REFERENCE");
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
        return this.setUpdateFunction(source, path, updateDOMsValue, flag);
    }

    getKeyFromStructure(structure, source) {
        if (!structure.key) return null;
        if (structure.key.path) {
            return this.getParameter(source, structure.key.path);
        } else {
            return structure.key;
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
                        if (structure.key) {
                            let key = this.getKeyFromStructure(structure, source);
                            element.key = structure.key;
                            this.keyRef.set(key, element);
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
        this.keyRef.clear();
        useEffect.delete({g: this.groupID});
    }
}