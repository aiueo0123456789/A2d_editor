import { app } from "../../../main.js";
import { InputManager } from "../../app/inputManager/inputManager.js";
import { TranslateCommand } from "../../commands/transform/transform.js";

export class TranslateModal {
    constructor(/** @type {InputManager} */inputManager) {
        this.command = new TranslateCommand();
        app.operator.appendCommand(this.command);
        this.values = [
            0,0, // スライド量
            app.appConfig.areasConfig["Viewer"].proportionalMetaData.use, // useProportionalEdit
            app.appConfig.areasConfig["Viewer"].proportionalMetaData.type, // proportionalType
            app.appConfig.areasConfig["Viewer"].proportionalMetaData.size // proportionalSize
        ];
        this.command.transform([this.values[0],this.values[1]], this.values[2], this.values[3], this.values[4]);
        this.sumMovement = [0,0];
    }

    mousemove(/** @type {InputManager} */inputManager) {
        this.sumMovement[0] += inputManager.movement[0];
        this.sumMovement[1] += inputManager.movement[1];
        if (app.input.keysDown["y"]) {
            this.values[0] = 0;
            this.values[1] = this.sumMovement[1];
        } else if (app.input.keysDown["x"]) {
            this.values[0] = this.sumMovement[0];
            this.values[1] = 0;
        } else {
            this.values[0] = this.sumMovement[0];
            this.values[1] = this.sumMovement[1];
        }
        this.command.transform([this.values[0],this.values[1]], this.values[2], this.values[3], this.values[4]);
        return "RUNNING";
    }

    mousedown(/** @type {InputManager} */inputManager) {
        app.operator.execute();
        return "FINISHED";
    }
}