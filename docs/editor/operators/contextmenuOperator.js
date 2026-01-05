import { Application } from "../app/app.js";
import { JTag } from "../utils/JTag/JTag.js";
import { createTag } from "../utils/ui/util.js";
import { looper } from "../utils/utility.js";

export class ContextmenuOperator {
    constructor(/** @type {Application} */app) {
        this.app = app;
        this.creator = new JTag();
        /** @type {HTMLElement} */
        this.dom = this.app.ui.jTag.getDOMFromID("contextmenu");
    }

    showContextmenu(position, structure) {
        this.dom.replaceChildren();
        const createItemTag = (object, parent, depth) => {
            /** @type {HTMLElement} */
            const li = createTag(parent,"li",{textContent: object.label});
            li.className = "menu";
            const children = createTag(li, "ul");
            li.addEventListener("click", (event) => {
                object.eventFn();
                event.stopPropagation();
            })
            children.className = "submenu";
            return children;
        }
        looper(structure, "children", createItemTag, this.dom);
        this.dom.style.left = `${position[0]}px`;
        this.dom.style.top = `${position[1]}px`;
        this.dom.classList.remove("hidden");

        const hiddenFn = (event) => {
            // コンテキストメニュー以外がクリックされたら非表示
            if (!this.dom.contains(event.target)) {
                this.dom.classList.add('hidden');
                document.removeEventListener("click", hiddenFn); // ドキュメントからイベントリスナーを削除
            }
        }
        document.addEventListener('click', hiddenFn);
    }
}