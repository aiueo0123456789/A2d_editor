import { app } from "../../../main.js";
import { InputManager } from "../../app/InputManager.js";
import { RotateCommand } from "../../commands/TransformCommand.js";
import { MathVec2 } from "../../utils/mathVec.js";
import { circleRender, dottedLineRender } from "../area/areas/Viewer/Viewer.js";
import { ViewerSpaceData } from "../area/areas/Viewer/ViewerSpaceData.js";

export class RotateModal {
    constructor() {
        this.command = new RotateCommand();
        app.operator.appendCommand(this.command);
        this.values = [
            0, // 回転量
            app.appConfig.areasConfig["Viewer"].proportionalMetaData.use, // useProportionalEdit
            app.appConfig.areasConfig["Viewer"].proportionalMetaData.type, // proportionalType
            app.appConfig.areasConfig["Viewer"].proportionalMetaData.size // proportionalSize
        ];
        this.command.transform([this.values[0],0], this.values[1], this.values[2], this.values[3]);
        this.mousePosition = MathVec2.create();
    }

    mousemove(/** @type {InputManager} */inputManager) {
        MathVec2.set(this.mousePosition, inputManager.position);
        this.values[0] += MathVec2.getAngularVelocity(this.command.pivotPoint, inputManager.lastPosition, inputManager.movement);
        this.command.transform([this.values[0], 0], this.values[1], this.values[2], this.values[3]);
        return "RUNNING";
    }

    mousedown(/** @type {InputManager} */inputManager) {
        app.operator.execute();
        return "FINISHED";
    }

    render(renderPass) {
        circleRender(renderPass, this.command.pivotPoint, 2, [1,0,0,1], 0, 0);
        dottedLineRender(renderPass, this.command.pivotPoint, this.mousePosition, 2, 10, 10, [0,0,0,1],0);
        /** @type {ViewerSpaceData} */
        const viewerSpaceData = app.appConfig.areasConfig["Viewer"];
        if (viewerSpaceData.proportionalMetaData.use) {
            circleRender(renderPass, this.mousePosition, viewerSpaceData.proportionalMetaData.size, [1,0,0,0.1], 1, 1, [1,0,0,1], 0);
        }
    }
}