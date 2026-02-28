import { app } from "../../../main.js";
import { InputManager } from "../../app/InputManager.js";
import { KeyframeInsertInKeyframeBlockCommand, KeyframeInsertInSelectedElementCommand } from "../../commands/animation/keyframeInsert.js";

export class KeyframeInsertModal {
    constructor() {
        this.command = new KeyframeInsertInSelectedElementCommand();
        app.operator.appendCommand(this.command);
    }

    init() {
        app.operator.execute();
        return "FINISHED";
    }
}