import { app } from "../../../../../main.js";
import { CreateObjectCommand } from "../../../../commands/object/object.js";
import { changeParameter } from "../../../../utils/utility.js";

export class Area_NodeEditor {
    constructor(area) {
        this.dom = area.main;
        this.spaceData = app.appConfig.areasConfig["NodeEditor"];

        this.struct = {
            inputObject: {"spaceData": this.spaceData, "scene": app.scene},
            DOM: [
                {tagType: "gridBox", style: "width: 100%; height: 100%;", axis: "r", allocation: "auto 1fr", children: [
                    {tagType: "option", name: "情報", children: [
                        {tagType: "gridBox", axis: "c", allocation: "auto 1fr auto", children: [
                            {tagType: "label", text: "tool", children: [
                                {tagType: "select",
                                    value: (value) => {
                                        console.log("書き換え")
                                        changeParameter(this.spaceData, "sourceCode", app.scene.objects.getObjectByID(value));
                                    },
                                    sourceObject: () => {
                                        return app.scene.objects.scripts.map(script => {return {name: script.name, id: script.id}});
                                    }, options: {initValue: ""}
                                },
                            ]},
                            {tagType: "operatorButton", label: "Add", onClick: () => {
                                app.operator.appendCommand(new CreateObjectCommand({
                                    type: "Script",
                                    name: "名称未設定",
                                    text: "// wgslのシェーダーをかけます"
                                }));
                                app.operator.execute();
                            }},
                        ]}
                    ]},
                    {tagType: "path", sourceObject: "spaceData/sourceCode", updateEventTarget: {path: "spaceData/sourceCode"}, children: [
                        {tagType: "codeEditor", source: "/text"}
                    ]}
                ]}
            ],
            utility: {
                "testTest": {}
            }
        };

        this.jTag = area.jTag;
        this.jTag.create(area.main, this.struct);
    }
}