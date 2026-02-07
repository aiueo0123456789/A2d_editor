import { isPlainObject } from "../utility.js";
import { UseEffect } from "../useEffect.js";

export const useEffect = new UseEffect();

export function createTag(target, type, option = {}) {
    const element = document.createElement(type);
    if (target) {
        target.append(element);
    }
    for (const key in option) {
        if (key == "class") {
            setClass(element, option[key]);
        } else if (key == "style") {
            setStyle(element, option[key]);
        } else {
            element[key] = option[key];
        }
    }
    return element;
}

export function setClass(element, classString) {
    element.classList.add(...classString.split(" ").filter(Boolean));
}

export function setStyle(element,style) {
    // style = style.replace(/\s+/g, ""); // 半角・全角スペースを削除
    const styles = style.split(";").filter(Boolean); // ;で区切る
    for (const style of styles) {
        const code = style.split(":");
        code[0] = code[0].replace(/\s+/g, "");
        if (code[1][0] == " ") {
            code[1] = code[1].slice(1);
        }
        element.style[code[0]] = code[1];
    }
}

export function setLabel(target, labelText, inner) {
    const label = document.createElement("label");
    label.textContent = labelText;
    const div = document.createElement("div");
    div.className = "label";
    // div.append(document.createElement("span"),label,document.createElement("span"),inner,document.createElement("span"));
    div.append(label,inner);
    target.append(div);
    return div;
}

export function createMinButton(target, text) {
    const button = document.createElement("button");
    button.classList.add("button-min");
    button.textContent = text;
    target.append(button)
    return button;
}

// チェック
export function createChecks(target, checks) {
    const div = createTag(target, "div", {class: "flex"});
    const result = {html: div, checkList: []};

    function createCheckbox(target, icon, text) {
        const check = document.createElement("input");
        check.type = "checkbox";
        check.style.display = "none";
        const label = document.createElement("label");
        label.classList.add("box");
        const div = document.createElement("div");
        div.classList.add("radioElement");
        createIcon(div, icon);
        const textNode = document.createTextNode(text);
        div.append(textNode);
        label.append(check,div);
        target.append(label);
        return {label, div, check};
    }

    checks.forEach((check, index) => {
        const element = createCheckbox(div, check.icon, check.label);
        result.checkList.push(element.check);
        if (index == 0) {
            element.div.style.borderTopRightRadius = "0px";
            element.div.style.borderBottomRightRadius = "0px";
        } else if (index == checks.length - 1) {
            element.div.style.borderTopLeftRadius = "0px";
            element.div.style.borderBottomLeftRadius = "0px";
        } else {
            element.div.style.borderRadius = "0px";
        }
    })
    return result;
}

// ラジオ
export function createRadios(target, radios) {
    const fieldset = createTag(target, "fieldset", {class: "flex"});
    const legend = createTag(fieldset, "legend");
    radios.forEach((radio, index) => {
        // const element = createTag(fieldset, "input", {type: "radio"});
        const element = createRadio(fieldset, "test", radio.icon, radio.label);
        if (index == 0) {
            element.div.style.borderTopRightRadius = "0px";
            element.div.style.borderBottomRightRadius = "0px";
        } else if (index == radios.length - 1) {
            element.div.style.borderTopLeftRadius = "0px";
            element.div.style.borderBottomLeftRadius = "0px";
        } else {
            element.div.style.borderRadius = "0px";
        }
    })
    console.log(fieldset)
}
export function createRadio(target, radioName, icon, text) {
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.setAttribute("name", radioName);
    const label = document.createElement("label");
    label.classList.add("box");
    label.setAttribute("name", "radio");
    const div = document.createElement("div");
    div.classList.add("radioElement");
    createIcon(div, icon);
    const textNode = document.createTextNode(text);
    div.append(textNode);
    label.append(radio,div);
    target.append(label);
    return {label, div, radio};
}

// ボタン
export function createButton(target, icon, text = "") {
    const button = document.createElement("button");
    if (icon) createIcon(button, icon);
    const textNode = document.createTextNode(text);
    button.append(textNode);
    target.append(button);
    return button;
}
export function createGroupButton(target, buttons) {
    const container = createTag(target, "div", {class: "flex"});
    buttons.forEach((button, index) => {
        const element = createButton(container,button.icon, button.label);
        if (index == 0) {
            element.style.borderTopRightRadius = "0px";
            element.style.borderBottomRightRadius = "0px";
        } else if (index == buttons.length - 1) {
            element.style.borderTopLeftRadius = "0px";
            element.style.borderBottomLeftRadius = "0px";
        } else {
            element.style.borderRadius = "0px";
        }
    })
}

export function createIcon(target, imgName) {
    const container = document.createElement("div");
    container.classList.add("icon");
    const icon = document.createElement("img");
    icon.src = `./config/images/ui_icon/${imgName}.png`;
    let errorC = 0;
    icon.addEventListener("error", () => {
        // console.warn("画像の読み込みに失敗",imgName)
        if (errorC < 3) {
            errorC ++;
            icon.src = `./config/images/ui_icon/${imgName}.png`;
        } else {
            // console.error("画像の読み込みに失敗",imgName,`config/images/ui_icon/${imgName}.png`)
        }
    })
    container.append(icon);
    target.append(container);
}

export function createToolBar(target, tools) {
    const container = document.createElement("ul");
    container.classList.add("toolbar");
    for (const tool of tools) {
        const item = document.createElement("li");
        createIcon(item, tool);
        container.append(item);
    }
    target.append(container);
    return container;
}

export function createDoubleClickInput(fn, object) {
    const inputTag = document.createElement("input");
    inputTag.type = "text";
    inputTag.classList.add("dblClickInput");
    inputTag.setAttribute('readonly', true);
    inputTag.addEventListener('dblclick', () => {
        inputTag.removeAttribute('readonly');
        inputTag.focus();
    });

    inputTag.addEventListener('blur', () => {
        inputTag.setAttribute('readonly', true);
    });
    return inputTag;
}

export function createRange(target, options) {
    const range = createTag(target, "input", options);
    range.type = "range";
    target.append(range);
    return range;
}

export function updateRangeStyle(target) {
    const value = target.value;
    const min = target.min;
    const max = target.max;
    const percentage = ((value - min) / (max - min)) * 100;
    target.style.background = `linear-gradient(to right,rgb(172, 194, 183) ${percentage}%,rgb(64, 64, 64) ${percentage}%)`;
}
export function setRangeStyle(target) {
    updateRangeStyle(target);
    target.addEventListener("input", () => {
        updateRangeStyle(target);
    });
}

export function removeHTMLElementInObject(object, maxDepth = 10) {
    // 全てループしてメモリ解放
    const fn = (data, depth = 0) => {
        if (maxDepth <= depth) return ;
        if (data instanceof HTMLElement) { // HTMLElementなら削除
            data.remove();
        } else if (data?.customTag) { // カスタムタグなら削除
            data.remove();
        } else if (isPlainObject(data)) { // 連想配列なら中身をループ
            for (const key in data) {
                fn(data[key], depth + 1);
            }
        } else if (Array.isArray(data)) { // 配列なら中身をループ
            for (const value of data) {
                fn(value, depth + 1);
            }
        }
    }
    fn(object);
}