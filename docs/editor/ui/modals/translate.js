import { app } from "../../../main.js";
import { InputManager } from "../../app/InputManager.js";
import { TranslateCommand } from "../../commands/TransformCommand.js";
import { MathVec2 } from "../../utils/mathVec.js";
import { circleRender, dottedLineRender, rectRender, triangleRender } from "../area/areas/Viewer/Viewer.js";
import { ViewerSpaceData } from "../area/areas/Viewer/ViewerSpaceData.js";

export class TranslateModal {
    constructor() {
        this.command = new TranslateCommand();
        app.operator.appendCommand(this.command);
        this.values = [
            0,0, // スライド量
            app.appConfig.areasConfig["Viewer"].proportionalMetaData.use, // useProportionalEdit
            app.appConfig.areasConfig["Viewer"].proportionalMetaData.type, // proportionalType
            app.appConfig.areasConfig["Viewer"].proportionalMetaData.size // proportionalSize
        ];
        this.command.transform([this.values[0],this.values[1]], this.values[2], this.values[3], this.values[4]);
        this.sumMovement = MathVec2.create();
        this.mousePosition = MathVec2.create();
    }

    mousemove(/** @type {InputManager} */inputManager) {
        MathVec2.set(this.mousePosition, inputManager.position);
        MathVec2.add(this.sumMovement, this.sumMovement, inputManager.movement);
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

    render(renderPass) {
        // triangleRender(renderPass, );
        circleRender(renderPass, this.command.pivotPoint, 2, [1,0,0,1], 0, 0);
        /** @type {ViewerSpaceData} */
        const viewerSpaceData = app.appConfig.areasConfig["Viewer"];
        if (viewerSpaceData.proportionalMetaData.use) {
            circleRender(renderPass, this.mousePosition, viewerSpaceData.proportionalMetaData.size, [1,0,0,0.1], 1, 1, [1,0,0,1], 0);
        }
    }
}