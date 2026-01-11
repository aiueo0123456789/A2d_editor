import { AdjustPanelOperator } from "../../operators/adjustPanelOperator.js";
import { Area } from "../../ui/area/Area.js";
import { createID } from "../../utils/idGenerator.js";
import { JTag } from "../../utils/JTag/JTag.js";
import { AutoGrid } from "../../utils/ui/grid.js";
import { createTag } from "../../utils/ui/util.js";
import { indexOfSplice } from "../../utils/utility.js";
import { Application } from "../app.js";

export class UI {
    constructor(/** @type {Application} */ app) {
        this.app = app;

        this.jTag = new JTag(createID("UI_jTagID"));
        this.jTag.create(
            app.dom,
            {
                inputObject: {"app": app},
                DOM: [
                    {tagType: "html", type: "div", class: "all", children: [
                        {tagType: "html", id: "contextmenu", class: "contextmenu hidden", tag: "ul"},
                        {tagType: "html", id: "popupMenu-items", class: "popupMenu-items hidden", tag: "ul"},
                        {tagType: "html", id: "custom-select-items", class: "custom-select-items hidden", tag: "ul"},
                        {tagType: "html", id: "parameterManagerSelecter", class: "custom-select-items hidden", tag: "ul"},
                        {tagType: "html", id: "popoverMenusContainer", class: "popoverMenusContainer", tag: "div"},
                        {tagType: "html", id: "loadingModalsContainer", class: "loadingModalsContainer hidden", tag: "ul"},
                        {tagType: "div", id: "headMenubar", class: "menubar", children: [
                            {tagType: "label", text: "projectName", children: [
                                {tagType: "input", value: "app/appConfig/projectName", type: "text"},
                            ]},
                            {tagType: "menu", title: "File", struct: [
                                {label: "clean", children: [], onClick: () => {
                                    app.scene.objects.clean();
                                }},
                                {label: "export", icon: "export", children: [], onClick: () => {
                                    app.fileIO.save();
                                }},
                                {label: "import", icon: "import", children: [
                                    {label: "zip", children: [], type: "file", onClick: (event) => {
                                        app.fileIO.loadFile(event.target.files[0], "open-btn");
                                    }},
                                    {label: "ww", children: [], type: "file", webkitdirectory: true, onClick: (event) => {
                                        app.fileIO.loadFile(event.target.files, "psd");
                                    }},
                                ]},
                            ]},
                            {tagType: "menu", title: "Edit", struct: [
                                {label: "setting", icon: "setting", children: [], onClick: () => {
                                }},
                            ]},
                            {tagType: "html", id: "workSpaces", style: "width: 100%; display: flex; gap: 10px; alignItems: center; overflowX: auto;", tag: "div"},
                        ]},
                        {tagType: "html", id: "main", class: "main", tag: "div"},
                        {tagType: "div", id: "headMenubar", class: "menubar", children: [
                            {tagType: "label", text: "メモリ", children: [
                                {tagType: "meter", valueSource: "app/appPerformance/usedJSHeapByteSize", maxSource: "app/appPerformance/totalJSHeapByteSize"},
                            ]},
                            {tagType: "label", text: "タグ数", children: [
                                {tagType: "input", value: "app/appPerformance/domCount", type: "number"},
                            ]}
                        ]}
                    ]}
                ]
            },
        );
        this.header = this.jTag.getDOMFromID("headMenubar");

        this.adjustPanelOperator = new AdjustPanelOperator();
        console.log(this.jTag.getDOMFromID("custom-select-items"));

        this.loadingModals = {};

        const appendModal = document.getElementById("appendModal");
        const directories = document.getElementById("directories");
        appendModal.classList.add("hidden");
    }

    getImgURLFromImgName(imgName) {
        return `./config/images/ui_icon/SVG/${imgName}.svg`;
    }

    updateLoadingModal(id, percentage, txt) {
        const tags = this.loadingModals[id];
        tags.percentage.style.width = `${percentage}%`;
        tags.txt.textContent = txt;
    }

    createLodingModal(processName) {
        /** @type {HTMLElement} */
        const loadingModalsContainer = this.jTag.getDOMFromID("loadingModalsContainer");
        loadingModalsContainer.classList.remove("hidden");
        const id = createID();
        const container = createTag(loadingModalsContainer, "div", {class: "loadingModalContainer"});
        const headerTag = createTag(container, "div", {class: "loadingModal-header"});
        const processNameTag = createTag(headerTag, "div", {class: "loadingModal-processName", textContent: processName});
        const mainTag = createTag(container, "div", {class: "loadingModal-main"});
        const txtTag = createTag(mainTag, "div", {class: "loadingModal-txt"});
        const percentageContainerTag = createTag(mainTag, "div", {class: "loadingModal-percentageContainer"});
        const percentageBackTag = createTag(percentageContainerTag, "div", {class: "loadingModal-percentageBack"});
        const percentageTag = createTag(percentageContainerTag, "div", {class: "loadingModal-percentage"});
        this.loadingModals[id] = {
            container: container,
            processName: processNameTag,
            txt: txtTag,
            percentage: percentageTag,
        }
        return id;
    }

    removeLodingModal(id) {
        const tags = this.loadingModals[id];
        tags.container.remove();
        delete this.loadingModals[id];
        if (Object.keys(this.loadingModals).length == 0) {
            /** @type {HTMLElement} */
            const loadingModalsContainer = this.jTag.getDOMFromID("loadingModalsContainer");
            loadingModalsContainer.classList.add("hidden");
        }
    }

    createArea(axis, target = this.jTag.getDOMFromID("main")) { // エリアの作成
        const area = new AutoGrid(createID(), target, axis, "50%");
        return area;
    }

    setAreaType(t, type) {
        const area_dom = document.createElement("div");
        area_dom.style.width = "100%";
        area_dom.style.height = "100%";
        const area = new Area(type,area_dom);
        t.append(area_dom);
        return area;
    }

    deleteArea(/** @type {Area} */area) {
        area.target.replaceChildren();
        /** @type {AutoGrid} */
        const grid = area.grid;
        const gridInnner = this.areaMap.get(grid);
        indexOfSplice(gridInnner, area);
        grid.t.replaceChildren();
        if (gridInnner.length) {
            grid.t.append(gridInnner[0].target);
        }
        indexOfSplice(this.areas, area);
        this.app.areaMap.delete(area);
    }
}