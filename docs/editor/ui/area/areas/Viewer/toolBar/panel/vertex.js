import { app } from "../../../../../../../main.js";

export class ActiveVertexPanel {
    constructor() {
        this.struct = {
            inputObject: {"context": app.context, "areasConifg": app.appConfig.areasConfig, "scene": app.scene, "values": this.values},
            DOM: [
                {tagType: "panel", name: "頂点", children: [
                    {tagType: "path", src: "{scene/editData/editObjects/{context/activeObject/id}/activeVertex}", updateTarget: "頂点選択", children: [
                        {tagType: "label", text: "x", children: [
                            {tagType: "input", value: "{/co/0}", type: "number"},
                        ]},
                        {tagType: "label", text: "y", children: [
                            {tagType: "input", value: "{/co/1}", type: "number"},
                        ]},
                    ]},
                ]}
            ]
        };
    }
}