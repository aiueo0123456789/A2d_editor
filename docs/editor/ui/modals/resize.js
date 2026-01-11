import { app } from "../../../main.js";
import { InputManager } from "../../app/inputManager/inputManager.js";
import { ResizeCommand } from "../../commands/transform/transform.js";
import { MathVec2 } from "../../utils/mathVec.js";

export class ResizeModal {
    constructor(/** @type {InputManager} */inputManager) {
        this.command = new ResizeCommand();
        app.operator.appendCommand(this.command);
        this.values = [
            1,1, // スケール量
            app.appConfig.areasConfig["Viewer"].proportionalMetaData.use, // useProportionalEdit
            app.appConfig.areasConfig["Viewer"].proportionalMetaData.type, // proportionalType
            app.appConfig.areasConfig["Viewer"].proportionalMetaData.size // proportionalSize
        ];
        this.command.transform([this.values[0],this.values[1]], this.values[2], this.values[3], this.values[4]);
        this.sumScale = MathVec2.create();
        MathVec2.set(this.sumScale, [1,1])
        this.startPosition = null;
    }

    mousemove(/** @type {InputManager} */inputManager) {
        if (this.startPosition == null) {
            this.startPosition = MathVec2.create();
            MathVec2.set(this.startPosition, inputManager.position)
        }
        this.sumScale[0] = MathVec2.distanceR(inputManager.position, this.command.pivotPoint) / MathVec2.distanceR(this.startPosition, this.command.pivotPoint);
        if (inputManager.position[0] < this.command.pivotPoint[0]) {
            this.sumScale[0] = -this.sumScale[0];
        }
        this.sumScale[1] = this.sumScale[0];
        // MathVec2.div(this.sumScale, MathVec2.subR(inputManager.position, this.command.pivotPoint), MathVec2.subR(this.startPosition, this.command.pivotPoint));
        if (app.input.keysDown["y"]) {
            this.values[0] = 0;
            this.values[1] = this.sumScale[1];
        } else if (app.input.keysDown["x"]) {
            this.values[0] = this.sumScale[0];
            this.values[1] = 0;
        } else {
            this.values[0] = this.sumScale[0];
            this.values[1] = this.sumScale[1];
        }
        this.command.transform([this.values[0],this.values[1]], this.values[2], this.values[3], this.values[4]);
        return "RUNNING";
    }
1
    mousedown(/** @type {InputManager} */inputManager) {
        app.operator.execute();
        return "FINISHED";
    }
}