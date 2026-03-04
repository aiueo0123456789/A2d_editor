import { ChangeParentCommand } from "../../commands/ChangeParentCommand.js";
import { useEffect } from "../../utils/ui/util.js";

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
                {tagType: "panel", name: "ChangeParentCommand", style: "width: fit-content;", children: [

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