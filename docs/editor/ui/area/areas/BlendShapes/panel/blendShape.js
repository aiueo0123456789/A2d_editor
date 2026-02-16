import { app } from "../../../../../../main.js";
import { AppendBlendShapePointCommand, AppendShapeKeyInBlendShapeCommand, DeleteShapeKeyInBlendShapeCommand } from "../../../../../commands/mesh/shapeKey.js";

export class BlendShapePanel {
    constructor() {
        this.struct = {
            inputObject: {"context": app.context, "areaConfig": app.appConfig.areasConfig["BlendShape"], "scene": app.scene, "values": this.values},
            DOM: [
                {tagType: "panel", name: "BlendShape", children: [
                    {tagType: "path", sourceObject: "areaConfig/activeBlendShape", updateEventTarget: {path: "areaConfig/%activeBlendShape"}, children: [
                        {tagType: "label", text: "name", children: [
                            {tagType: "input", value: "/name", type: "text"},
                        ]},
                        {tagType: "label", text: "minX", children: [
                            {tagType: "input", value: "/min/0", type: "number"},
                        ]},
                        {tagType: "label", text: "minY", children: [
                            {tagType: "input", value: "/min/1", type: "number"},
                        ]},
                        {tagType: "label", text: "maxX", children: [
                            {tagType: "input", value: "/max/0", type: "number"},
                        ]},
                        {tagType: "label", text: "maxY", children: [
                            {tagType: "input", value: "/max/1", type: "number"},
                        ]},
                        {tagType: "label", text: "valueX", children: [
                            {tagType: "input", value: "/value/0", type: "number"},
                            {tagType: "hasKeyframeCheck", src: "/keyframeBlockManager/keyframeBlocks/0", value: "/value/0"},
                        ]},
                        {tagType: "label", text: "valueY", children: [
                            {tagType: "input", value: "/value/1", type: "number"},
                            {tagType: "hasKeyframeCheck", src: "/keyframeBlockManager/keyframeBlocks/1", value: "/value/1"},
                        ]},

                        {tagType: "operatorButton", label: "Add", onClick: (object) => {
                            app.operator.appendCommand(new AppendBlendShapePointCommand(object.normal));
                            app.operator.execute();
                        }},
                        {tagType: "dualListbox", available: "scene/objects/shapeKeys", selected: "/shapeKeys",
                            onAppend: (shapeKey) => {
                                app.operator.appendCommand(new AppendShapeKeyInBlendShapeCommand(app.appConfig.areasConfig["BlendShape"].activeBlendShape, shapeKey));
                                app.operator.execute();
                            },
                            onDelete: (shapeKey) => {
                                app.operator.appendCommand(new DeleteShapeKeyInBlendShapeCommand(app.appConfig.areasConfig["BlendShape"].activeBlendShape, shapeKey));
                                app.operator.execute();
                            }
                            , liStruct: [
                            {tagType: "gridBox", axis: "c", allocation: "1fr", children: [
                                {tagType: "dblClickInput", value: "/name"},
                            ]},
                        ]}
                    ]}
                ]}
            ]
        };
    }
}