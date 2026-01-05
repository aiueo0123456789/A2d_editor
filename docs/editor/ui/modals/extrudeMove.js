import { app } from "../../../main.js";
import { InputManager } from "../../app/inputManager/inputManager.js";
import { BoneExtrudeMoveCommand } from "../../commands/bone/bone.js";

export class ExtrudeMoveModal {
    constructor(/** @type {InputManager} */inputManager) {
        this.command = new BoneExtrudeMoveCommand();
        app.operator.appendCommand(this.command);
        this.values = [
            0,0, // スライド量
        ];
        this.command.extrudeMove([this.values[0],this.values[1]]);
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
        this.command.extrudeMove([this.values[0],this.values[1]]);
        return "RUNNING";
    }

    mousedown(/** @type {InputManager} */inputManager) {
        app.operator.execute();
        return "FINISHED";
    }
}