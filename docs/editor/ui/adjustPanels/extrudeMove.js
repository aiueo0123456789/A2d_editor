import { useEffect } from "../../utils/ui/util.js";
import { BoneExtrudeMoveCommand } from "../../commands/bone/bone.js";

export class AdjustPanel_ExtrudeMove {
    static commandInstance = BoneExtrudeMoveCommand;
    constructor(/** @type {BoneExtrudeMoveCommand} */ command) {
        this.command = command;
        this.values = [
            command.value[0],
            command.value[1],
        ];
        this.uiModel = {
            inputObject: {"values": this.values},
            DOM: [
                {tagType: "div", class: "shelfe", children: [
                    {tagType: "title", text: "extrudeMove", class: "shelfeTitle"},
                    {tagType: "label", text: "x", children: [
                        {tagType: "input", value: "values/0", type: "number", min: -1000, max: 1000, useCommand: false},
                    ]},
                    {tagType: "label", text: "y", children: [
                        {tagType: "input", value: "values/1", type: "number", min: -1000, max: 1000, useCommand: false},
                    ]},
                ]}
            ]
        };

        useEffect.set({o: this.values, i: "&all"}, () => {
            this.command.undo();
            this.command.extrudeMove([this.values[0],this.values[1]]);
            this.command.execute();
        });
    }
}