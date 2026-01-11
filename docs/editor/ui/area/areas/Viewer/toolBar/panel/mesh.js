import { app } from "../../../../../../../main.js";

export class ActiveMeshPanel {
    constructor() {
        this.struct = {
            inputObject: {"context": app.context, "areasConifg": app.appConfig.areasConfig, "scene": app.scene, "values": this.values},
            DOM: [
                {tagType: "div", class: "sideBar-shelfe", children: [
                    {tagType: "panel", name: "メッシュ", children: [
                        {tagType: "path", sourceObject: "scene/editData/editObjects/{context/activeObject/id}/activeMesh", updateEventTarget: "面選択", children: [
                            {tagType: "label", text: "x", children: [
                                {tagType: "input", value: "/co/0", type: "number"},
                            ]},
                            {tagType: "label", text: "y", children: [
                                {tagType: "input", value: "/co/1", type: "number"},
                            ]}
                        ]},
                    ]}
                ]}
            ]
        };
    }
}