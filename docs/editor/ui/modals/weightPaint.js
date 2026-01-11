import { app } from "../../../main.js";
import { InputManager } from "../../app/inputManager/inputManager.js";
import { WeightPaintCommand } from "../../commands/mesh/weightPaint.js";

export class WeightPaintModal {
    constructor(/** @type {InputManager} */inputManager) {
        this.command = new WeightPaintCommand();
        app.operator.appendCommand(this.command);
    }

    mousemove(/** @type {InputManager} */inputManager) {
        this.command.paint(inputManager.position);
        return "RUNNING";
    }

    mouseup(/** @type {InputManager} */inputManager) {
        app.operator.execute();
        return "FINISHED";
    }
}