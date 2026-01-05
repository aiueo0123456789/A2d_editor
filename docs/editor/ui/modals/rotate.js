import { app } from "../../../main.js";
import { InputManager } from "../../app/inputManager/inputManager.js";
import { RotateCommand } from "../../commands/transform/transform.js";
import { MathVec2 } from "../../utils/mathVec.js";

export class RotateModal {
    constructor(/** @type {InputManager} */inputManager) {
        this.command = new RotateCommand();
        app.operator.appendCommand(this.command);
        this.values = [
            0, // 回転量
            app.appConfig.areasConfig["Viewer"].proportionalMetaData.use, // useProportionalEdit
            app.appConfig.areasConfig["Viewer"].proportionalMetaData.type, // proportionalType
            app.appConfig.areasConfig["Viewer"].proportionalMetaData.size // proportionalSize
        ];
        this.command.transform([this.values[0],0], this.values[1], this.values[2], this.values[3]);
    }

    mousemove(/** @type {InputManager} */inputManager) {
        this.values[0] += MathVec2.getAngularVelocity(this.command.pivotPoint, inputManager.lastPosition, inputManager.movement);
        this.command.transform([this.values[0], 0], this.values[1], this.values[2], this.values[3]);
        return "RUNNING";
    }

    mousedown(/** @type {InputManager} */inputManager) {
        app.operator.execute();
        return "FINISHED";
    }
}