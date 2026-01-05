import { useEffect } from "../../utils/ui/util.js";
import { TranslateCommand } from "../../commands/transform/transform.js";

export class AdjustPanel_Translate {
    static commandInstance = TranslateCommand;
    constructor(/** @type {TranslateCommand} */ command) {
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
                    {tagType: "title", text: "translate", class: "shelfeTitle"},
                    {tagType: "input", label: "x", value: "values/0", type: "number", min: -1000, max: 1000, useCommand: false},
                    {tagType: "input", label: "y", value: "values/1", type: "number", min: -1000, max: 1000, useCommand: false},
                    {tagType: "input", label: "プロポーショナル編集", type: "checkbox", checked: "values/2", look: {check: "check", uncheck: "uncheck"}, useCommand: false},
                    {tagType: "select", label: "種類", value: "values/3", sourceObject: ["リニア", "逆二乗", "一定"], options: {initValue: {path: "values/3"}}, useCommand: false},
                    {tagType: "input", label: "半径", value: "values/4", type: "number", min: 0, max: 10000, useCommand: false, custom: {visual: "range"}},
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