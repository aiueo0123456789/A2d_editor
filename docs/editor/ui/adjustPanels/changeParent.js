import { useEffect } from "../../utils/ui/util.js";
import { ChangeParentCommand } from "../../commands/object/object.js";

export class AdjustPanel_ChangeParent {
    static commandInstance = ChangeParentCommand;
    constructor(/** @type {ChangeParentCommand} */ command) {
        this.command = command;
        this.values = [
            command.newParent
        ];
        this.uiModel = {
            inputObject: {"value": this.values},
            DOM: [
                {tagType: "div", class: "shelfe", children: [
                    {tagType: "title", text: "親要素の変更", class: "shelfeTitle"},
                ]}
            ]
        };

        useEffect.set({o: this.values, i: "&all"}, () => {
            this.command.undo();
            this.command.update(this.values[0]);
            this.command.execute();
        });
    }
}