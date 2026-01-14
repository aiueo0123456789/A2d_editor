import { app } from "../../../main.js";
import { InputManager } from "../../app/inputManager/inputManager.js";
import { ChangeParentCommand } from "../../commands/object/object.js";

export class ChangeParentModal {
    constructor(/** @type {InputManager} */inputManager) {
        this.command = new ChangeParentCommand(app.context.selectedObjects, null);
        app.operator.appendCommand(this.command);
    }

    async mousedown(/** @type {InputManager} */inputManager) {
        const parent = await app.activeArea.uiModel.getObjectRayCast(inputManager.position, {types: ["Armature", "BezierModifier"]});
        this.command.update(parent[0]);
        app.operator.execute();
        return "FINISHED";
    }
}