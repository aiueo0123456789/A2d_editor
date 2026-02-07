import { app } from "../../../main.js";
import { InputManager } from "../../app/inputManager/inputManager.js";
import { ChangeParentCommand } from "../../commands/object/object.js";

export class ChangeParentModal {
    constructor(/** @type {InputManager} */inputManager) {
        this.command = new ChangeParentCommand(app.context.selectedObjects, null);
        app.operator.appendCommand(this.command);
        this.hoverObject = null;
    }

    async mousemove(/** @type {InputManager} */inputManager) {
        this.hoverObject = (await app.activeArea.uiModel.getObjectRayCast(inputManager.position, {types: ["Armature", "BezierModifier"]}))[0];
        return "RUNNING";
    }

    async mousedown(/** @type {InputManager} */inputManager) {
        this.command.update((await app.activeArea.uiModel.getObjectRayCast(inputManager.position, {types: ["Armature", "BezierModifier"]}))[0]);
        app.operator.execute();
        return "FINISHED";
    }
}