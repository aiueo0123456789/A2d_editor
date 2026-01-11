import { useEffect } from "../../utils/ui/util.js";
import { ResizeCommand } from "../../commands/transform/transform.js";

export class AdjustPanel_Resize {
    static commandInstance = ResizeCommand;
    constructor(/** @type {ResizeCommand} */ command) {
        this.command = command;
        this.values = [
            command.value[0],
            command.value[1],
            command.useProportional,
            command.proportionalType,
            command.proportionalSize,
        ];
        this.uiModel = {
            inputObject: {"values": this.values},
            DOM: [
                {tagType: "div", class: "shelfe", children: [
                    {tagType: "title", text: "resize", class: "shelfeTitle"},
                    {tagType: "label", text: "x", children: [
                        {tagType: "input", value: "values/0", type: "number", min: -1000, max: 1000, useCommand: false},
                    ]},
                    {tagType: "label", text: "y", children: [
                        {tagType: "input", value: "values/1", type: "number", min: -1000, max: 1000, useCommand: false},
                    ]},
                    {tagType: "label", text: "useProportional", children: [
                        {tagType: "input", type: "checkbox", checked: "values/2", look: {check: "check", uncheck: "uncheck"}, useCommand: false},
                    ]},
                    {tagType: "label", text: "proportionalType", children: [
                        {tagType: "select", value: "values/3", sourceObject: ["リニア", "逆二乗", "一定"], options: {initValue: {path: "values/3"}}, useCommand: false},
                    ]},
                    {tagType: "label", text: "proportionalSize", children: [
                        {tagType: "input", value: "values/4", type: "number", min: 0, max: 10000, useCommand: false, custom: {visual: "range"}},
                    ]}
                ]}
            ]
        };

        useEffect.set({o: this.values, i: "&all"}, () => {
            this.command.undo();
            this.command.transform([this.values[0],this.values[1]], this.values[2], this.values[3], this.values[4]);
            this.command.execute();
        });
    }
}