import { app } from "../../../main.js";
import { isFunction, IsString } from "../utility.js";
import { CustomTag } from "./customTag.js";
import { createTag, useEffect } from "../ui/util.js";
import { InputCheckboxTag } from "./inputCheckboxTag.js";
import { createID } from "../idGenerator.js";

/**
 * 検索の仕方
 * all: すべて
 * parameter == value: parameterがvalueと等しいとき
 * parameter in value: parameterにvalueが含まれている
 * parameter < value: parameterよりvalueが大きい
 * parameter > value: parameterよりvalueが小さい
 * 条件 && 条件: and
 * 条件 || 条件: or
 * 条件 && 条件 || 条件 && 条件のような場合||で区切られる
 */
function isFilterIncluded(object, filter = "all") {
    // console.log(object, filter);
    if (filter == "all" || filter == "") {
        return true;
    } else {
        const bools = filter.split(" || ").filter(Boolean).map(block => {
            const bools_ = block.split(" && ").map(block_ => {
                if (block_.includes(" == ")) {
                    const condition = block_.split(" == ").map(string => string.replace(/\s+/g, ""));
                    return object[condition[0]] == condition[1];
                } else if (block_.includes(" in ")) {
                    const condition = block_.split(" in ").map(string => string.replace(/\s+/g, ""));
                    if (IsString(object[condition[0]])) {
                        return object[condition[0]].includes(condition[1]);
                    } else {
                        return condition[1] in object[condition[0]];
                    }
                } else if (block_.includes(" < ")) {
                    const condition = block_.split(" < ").map(string => string.replace(/\s+/g, ""));
                    return object[condition[0]] < condition[1];
                } else if (block_.includes(" > ")) {
                    const condition = block_.split(" > ").map(string => string.replace(/\s+/g, ""));
                    return object[condition[0]] > condition[1];
                }
            });
            return !bools_.includes(false);
        });
        return bools.includes(true);
    }
}

export class OutlinerTag extends CustomTag {
    constructor(jTag,t,parent,source,child,flag) {
        super();
        const options = child.options;
        const isSourceFunction = isFunction(child.withObject);
        const withObject = child.withObject;
        const structures = child.structures;
        let loopTarget = child.loopTarget;
        let loopTargetIsPlainObject = false;
        if (loopTarget.parameter && loopTarget.loopTargets) {
            loopTargetIsPlainObject = true;
        } else if (!Array.isArray(loopTarget)) {
            loopTarget = [loopTarget];
        }
        const outlinerID = createID();
        let searchFilter = "";

        this.element = createTag(t, "div", {style: "display: grid; width: 100%; height: 100%; gridTemplateRows: auto auto 1fr;"});
        const searchBox = createTag(this.element, "div", {class: "searchBox"});
        const input = createTag(searchBox, "input", {style: "fontSize: 120%",value: ""});
        input.addEventListener("input", () => {
            searchFilter = input.value;
            outlinerUpdate();
        })
        /** @type {HTMLElement} */
        this.scrollableContainer = createTag(this.element, "div", {style: "width: 100%; height: 100%;"});

        let result = {active: null, selects: []};
        if (options.selectSource) {
            result.selects = jTag.getParameter(source, options.selectSource.object);
        }
        let activeSource = null;
        if (options.activeSource) {
            activeSource = {object: jTag.getParameter(source, options.activeSource.object), parameter: options.activeSource.parameter};
        } else {
            activeSource = {object: result, parameter: "active"};
        }
        // 最後の更新時に更新されたオブジェクトたち
        this.objectDomMap = new Map();
        let lastUpdateObjects = [];
        let rangeStartIndex = 0;
        let rangeEndIndex = 0;
        /** @type {HTMLElement} */
        this.scrollable = createTag(this.scrollableContainer, "div", {class: "scrollable"});
        const array = [];
        let rootObject = isSourceFunction ? withObject() : jTag.getParameter(source, withObject);
        const getAllObject = () => {
            const getLoopChildren = (children, resultObject = []) => {
                let filterBool_ = false;
                const filterData = options.filter;
                const fn0 = (child) => {
                    let filterBool = true;
                    filterBool = isFilterIncluded(child, searchFilter);
                    if (loopTargetIsPlainObject) {
                        const targetType = child[loopTarget.parameter];
                        const loopTargets = loopTarget.loopTargets[targetType] ? loopTarget.loopTargets[targetType] : loopTarget.loopTargets["others"] ? loopTarget.loopTargets["others"] : [];
                        for (const l of loopTargets) {
                            const nextChildren = jTag.getParameter({normal: child, special: {}}, l);
                            if (nextChildren) { // 子要素がある場合ループする
                                const fnResult = getLoopChildren(nextChildren, resultObject);
                                if (fnResult.filter) {
                                    filterBool = true;
                                }
                            }
                        }
                    } else {
                        for (const l of loopTarget) {
                            const nextChildren = jTag.getParameter({normal: child, special: {}}, l);
                            if (nextChildren) { // 子要素がある場合ループする
                                const fnResult = getLoopChildren(nextChildren, resultObject);
                                if (fnResult.filter) {
                                    filterBool = true;
                                }
                            }
                        }
                    }
                    if (filterBool) {
                        resultObject.push(child);
                        filterBool_ = true;
                    }
                }
                if (Array.isArray(children)) {
                    for (const child of children) {
                        fn0(child);
                    }
                } else {
                    fn0(children);
                }
                return {filter: filterBool_,result: resultObject};
            }
            return getLoopChildren(rootObject).result;
        }
        const outlinerUpdate = () => {
            rootObject = isSourceFunction ? withObject() : jTag.getParameter(source, withObject);
            array.length = 0;
            const allObject = getAllObject();
            // 削除があった場合対応するDOMを削除
            for (const object of lastUpdateObjects) {
                /** @type {HTMLElement} */
                // const childrenElement = data[0].others.childrenContainer;
                // this.scrollable.append(...childrenElement.children);
                if (!allObject.includes(object)) {
                    const container = this.objectDomMap.get(object);
                    container.remove();
                    // data[0].others.container.remove();
                    // data[0].others.container = null;
                    // data[0].others.myContainer.remove();
                    // data[0].others.myContainer = null;
                    // data[0].others.childrenContainer.remove();
                    // data[0].others.childrenContainer = null;
                    // for (const tag of data[0].others.children) {
                    //     tag.remove();
                    // }
                    // data[0].others.children.length = 0;
                    // data[0].others = null;
                    this.objectDomMap.delete(object);
                }
            }
            // 追加があった場合新規作成
            for (const object of allObject) {
                if (!lastUpdateObjects.includes(object)) {
                    /** @type {HTMLElement} */
                    const container = createTag(null, "div", {style: "paddingLeft: 2px; height: fit-content; minHeight: auto;"});
                    container.addEventListener("click", (event) => {
                        if (app.input.keysDown["Shift"]) {
                            rangeEndIndex = array.indexOf(object);
                            if (isFunction(options.rangeonSelectFn)) {
                                options.rangeonSelectFn(event, array, rangeStartIndex, rangeEndIndex);
                            }
                        } else {
                            rangeStartIndex = array.indexOf(object);
                            if (isFunction(options.clickEventFn)) { // 関数が設定されていたら適応
                                options.clickEventFn(event, object);
                            } else {
                                activeSource.object[activeSource.parameter] = object;
                                result.active = object;
                                if (!app.input.keysDown["Shift"]) {
                                    result.selects.length = 0;
                                }
                                result.selects.push(object);
                                console.log(result,activeSource);
                                event.stopPropagation();
                            }
                        }
                    });

                    const upContainer = createTag(container, "div", {style: "display: grid; gridTemplateColumns: auto 1fr; height: fit-content;"});
                    const visibleCheck = new InputCheckboxTag(null,upContainer,this,{}, {tagType: "input", type: "checkbox", look: {check: "down", uncheck: "right", size: "70%"}},"defo");
                    visibleCheck.checkbox.checked = true;
                    /** @type {HTMLElement} */
                    const myContainer = createTag(upContainer, "div");
                    const childrenContainer = createTag(container, "div", {style: "marginLeft: 10px; height: fit-content;"});
                    const children = jTag.createFromStructures(myContainer, this, structures, {normal: object, special: {}}, flag);
                    visibleCheck.checkbox.addEventListener("change", () => {
                        childrenContainer.classList.toggle("hidden");
                    })
                    this.objectDomMap.set(object, container);
                }
            }
            lastUpdateObjects = [...allObject];
            // ヒエラルキーをセット
            const looper = (children, targetDOM = this.scrollable) => {
                const fn0 = (child) => {
                    if (allObject.includes(child)) {
                        try {
                            // const managerObject = managerForDOMs.get({o: child, g: jTag.groupID, i: outlinerID})[0].others;
                            /** @type {HTMLElement} */
                            const container = this.objectDomMap.get(child);
                            targetDOM.append(container);
                            if (loopTargetIsPlainObject) {
                                const targetType = child[loopTarget.parameter];
                                const loopTargets = loopTarget.loopTargets[targetType] ? loopTarget.loopTargets[targetType] : loopTarget.loopTargets["others"];
                                for (const l of loopTargets) {
                                    const nextChildren = jTag.getParameter({normal: child, special: {}}, l);
                                    if (nextChildren) { // 子要素がある場合ループする
                                        looper(nextChildren, container.children[1]);
                                    }
                                }
                            } else {
                                for (const l of loopTarget) {
                                    const nextChildren = jTag.getParameter({normal: child, special: {}}, l);
                                    if (nextChildren) { // 子要素がある場合ループする
                                        looper(nextChildren, container.children[1]);
                                    }
                                }
                            }
                            array.push(child);
                        } catch {
                            console.warn("ヒエラルキーが正常に生成できませんでした");
                        }
                    }
                }
                if (Array.isArray(children)) {
                    for (const child of children) {
                        fn0(child);
                    }
                } else {
                    fn0(children);
                }
            }
            looper(rootObject);
        }
        // 選択表示の更新
        const listActive = (o, gID, t) => {
            // console.log("ヒエラルキーアクティブ")
            // const createdTags = managerForDOMs.get({g: jTag.groupID, i: outlinerID}); // すでに作っている場合
            // createdTags.forEach((data, object) => {
            //     const bool_ = activeSource.object[activeSource.parameter] == object;
            //     if (bool_) {
            //         data.others.myContainer.classList.add("activeColor");
            //     } else {
            //         data.others.myContainer.classList.remove("activeColor");
            //         const bool__ = result.selects.includes(object);
            //         if (bool__) {
            //             data.others.myContainer.classList.add("activeColor2");
            //         } else {
            //             data.others.myContainer.classList.remove("activeColor2");
            //         }
            //     }
            // })
        }
        useEffect.set({o: activeSource.object, g: jTag.groupID, i: activeSource.parameter, f: flag}, listActive);
        useEffect.set({o: result.selects, g: jTag.groupID, f: flag}, listActive);
        console.log("ヒエラルキー更新対象", child.updateEventTarget)
        const setUpdateEventTarget = (updateEventTarget) => {
            if (updateEventTarget.path) {
                jTag.setUpdateEventByPath(source, updateEventTarget.path, outlinerUpdate, flag);
            } else { // 文字列に対応
                useEffect.set({o: updateEventTarget, g: jTag.groupID, f: flag}, outlinerUpdate);
            }
        }
        if (child.updateEventTarget) {
            if (Array.isArray(child.updateEventTarget)) {
                for (const updateEventTarget of child.updateEventTarget) {
                    setUpdateEventTarget(updateEventTarget);
                }
            } else {
                setUpdateEventTarget(child.updateEventTarget);
            }
        } else {
            if (!isSourceFunction) {
                useEffect.set({o: jTag.getParameter(source, withObject), g: jTag.groupID, f: flag}, outlinerUpdate);
            }
        }
        outlinerUpdate();
    }

    getDomFromObject(object) {
        return this.objectDomMap.get(object);
    }
}