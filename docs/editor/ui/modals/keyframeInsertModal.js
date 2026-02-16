import { app } from "../../../main.js";
import { InputManager } from "../../app/inputManager/inputManager.js";
import { KeyframeInsertInKeyframeBlockCommand, KeyframeInsertInSelectedElementCommand } from "../../commands/animation/keyframeInsert.js";

export class KeyframeInsertModal {
    constructor(/** @type {InputManager} */inputManager) {
        this.command = new KeyframeInsertInSelectedElementCommand();
        app.operator.appendCommand(this.command);
    }

    init() {
        app.operator.execute();
        return "FINISHED";
    }
}