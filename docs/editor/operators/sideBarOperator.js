import { createTag, setClass, setStyle } from "../utils/ui/util.js";
import { JTag } from "../utils/JTag/JTag.js";
import { createID } from "../utils/idGenerator.js";
import { ResizerForDOM } from "../utils/ui/resizer.js";

export class SideBarOperator {
    constructor(/** @type {HTMLElement} */t, shelfes) {
        this.shelfes = shelfes;
        this.id = createID();
        this.jTag = new JTag();
        /** @type {HTMLElement} */
        this.dom = createTag(t, "div", {style: "width: 100%; height: 100%; position: absolute; pointerEvents: none; display: grid; gridTemplateColumns: 1fr auto auto;"});
        /** @type {HTMLElement} */
        this.dummyContainer = createTag(this.dom, "div");
        /** @type {HTMLElement} */
        this.domForMainContainer = createTag(this.dom, "div", {style: "width: 100%; height: 100%; pointerEvents: none;"});
        setStyle(new ResizerForDOM(this.domForMainContainer, "l", 100, 500).resizer, "backgroundColor: rgba(0,0,0,0);");
        this.domForMain = createTag(this.domForMainContainer, "div", {style: "width: 100%; height: 100%; pointerEvents: none; overflow-y: auto;"});
        /** @type {HTMLElement} */
        this.domForSideBar = createTag(this.dom, "div", {style: `
            width: 20px;
            height: 100%;
            overflow-y: auto;
            pointerEvents: all;
            height: 100%;
            padding: 4px;
            padding-left: 0px;
            display: flex;
            flex-flow: column;
            gap: 4px;
            background-color: rgba(0, 0, 0, 0.386);
            border-radius: 0px;`
        });
        this.update();
        this.nowModal = null;
    }

    changeShelfes(newShelfes) {
        this.shelfes = newShelfes;
        this.update();
    }

    update() {
        this.domForMain.replaceChildren();
        this.domForSideBar.replaceChildren();
        this.jTag.remove();
        for (const shelfeName in this.shelfes) {
            // 横
            this.jTag.createFromStructures(this.domForSideBar,null,[
                {tagType: "div", children: [
                    {tagType: "div", options: {textContent: shelfeName}, style: "writingMode: vertical-rl;"},
                ], style: `
                padding: 5px 0px;
                background-color: rgb(36, 36, 36);
                border: 1px solid var(--color-border);
                border-top-left-radius: 0px;
                border-bottom-left-radius: 0px;
                `}
            ], {});
            // パネル
            const panel = new this.shelfes[shelfeName];
            if (!panel.jTag) {
                panel.jTag = new JTag();
            }
            panel.jTag.create(this.domForMain, panel.struct);
        }
    }
}