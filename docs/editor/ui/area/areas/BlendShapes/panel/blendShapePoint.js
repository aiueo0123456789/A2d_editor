import { app } from "../../../../../../main.js";

export class BlendShapePointPanel {
    constructor() {
        this.struct = {
            inputObject: {"context": app.context, "areaConfig": app.appConfig.areasConfig["BlendShape"], "scene": app.scene, "values": this.values},
            DOM: [
                {tagType: "panel", name: "ブレンドシェイプポイント", children: [
                    {tagType: "path", src: "areaConfig/activeBlendShape", updateTarget: "{areaConfig/[S]activeBlendShape}", children: [
                        {tagType: "path", src: "/activePoint", updateTarget: "{/[S]activePoint}", children: [
                            {tagType: "label", text: "x", children: [
                                {tagType: "input", value: "/co/0", type: "number"},
                            ]},
                            {tagType: "label", text: "y", children: [
                                {tagType: "input", value: "/co/1", type: "number"},
                            ]},
                            {tagType: "list", label: "重み", src: "/weights", isPrimitive: true, notUseActiveAndSelect: true,
                            liStruct: {
                                tagType: "gridBox", key: "{areaConfig/activeBlendShape/shapeKeys/{!index}/id}", axis: "c", allocation: "1fr 1fr", children: [
                                    {tagType: "dblClickInput", value: "areaConfig/activeBlendShape/shapeKeys/{!index}/name"},
                                    {tagType: "input", value: "areaConfig/activeBlendShape/activePoint/weights/[S]{!index}", type: "number", min: 0, max: 1, step: 0.0001, custom: {visual: "rangeOnly"}},
                                ]
                            }}
                        ]}
                    ]}
                ]}
            ]
        };
    }
}