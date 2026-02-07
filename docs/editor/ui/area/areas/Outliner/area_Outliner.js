import { app } from "../../../../../main.js";
import { Layer } from "../../../../app/scene/scene.js";

export class Area_Outliner {
    constructor(area) {
        this.dom = area.main;

        this.struct = {
            inputObject: {"context": app.context, "scene": app.scene},
            DOM: [
                {
                    tagType: "outliner", name: "outliner", options: {
                    modes: ["scene", "layer"],
                    mode: "scene",
                    clickEventFn: (event, object) => {
                        event.stopPropagation();
                        if (app.context.currentMode == "オブジェクト") {
                            if (object instanceof Layer) {
                                app.context.setSelectedObject(null, false);
                                app.context.setActiveObject(object.children[0]);
                                for (const child of object.children) {
                                    app.context.setSelectedObject(child, true);
                                }
                            } else {
                                app.context.setSelectedObject(object, app.input.keysDown["Ctrl"]);
                                app.context.setActiveObject(object);
                            }
                        }
                    }, rangeonSelectFn: (event, array, startIndex, endIndex) => {
                        if (app.context.currentMode == "オブジェクト") {
                            let minIndex = Math.min(startIndex, endIndex);
                            let maxIndex = Math.max(startIndex, endIndex);
                            for (let i = minIndex; i < maxIndex; i ++) {
                                app.context.setSelectedObject(array[i], true);
                            }
                            app.context.setActiveObject(array[endIndex]);
                        }
                    },
                    activeSource: "context/activeObject", selectSource: "context/selectedObjects"}, withObject: {"scene": "scene/objects/rootObjects", "layer": "scene/layers/layers"}, updateEventTarget: "親変更", loopTarget: "/children", structures: [
                        {
                            tagType: "if",
                            formula: {source: "/", conditions: "in", value: "name"},
                            true: [
                                {
                                    tagType: "if",
                                    formula: {source: "/", conditions: "in", value: "zIndex"},
                                    true: [
                                        {tagType: "gridBox", axis: "c", allocation: "auto 50% 1fr auto 20%", children: [ // グラフィックメッシュ
                                            // {tagType: "icon", src: {path: "/type"}},
                                            {tagType: "texture", sourceTexture: "/texture/texture", width: "15px", height: "15px"},
                                            {tagType: "dblClickInput", value: "/name"},
                                            {tagType: "padding", size: "10px"},
                                            {tagType: "input", type: "checkbox", checked: "/visible", look: {check: "display", uncheck: "hide"}},
                                            {tagType: "input", value: "/zIndex", type: "number", min: 0, max: 100, step: 1},
                                        ]},
                                    ],
                                    false: [
                                        {tagType: "gridBox", axis: "c", allocation: "auto 50% 1fr", children: [
                                            {tagType: "icon", src: {path: "/type"}},
                                            {tagType: "dblClickInput", value: "/name"},
                                            {tagType: "padding", size: "10px"},
                                        ]},
                                    ]
                                }
                            ],
                            false: [
                                {tagType: "gridBox", axis: "c", allocation: "50% 1fr", children: [
                                    {tagType: "dblClickInput", value: "/type"},
                                    {tagType: "padding", size: "10px"},
                                ]},
                            ]
                        }
                    ],
                    contextmenu: [
                        {label: "テスト", children: [
                            {label: "テスト-テスト2", children: []},
                        ]},
                        {label: "テスト2", children: []},
                    ],
                },
            ],
            utility: {
                "testTest": {}
            }
        };

        this.jTag = area.jTag;
        this.jTag.create(area.main, this.struct);
    }
}