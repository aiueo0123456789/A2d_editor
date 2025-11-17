import { app } from "../../../main.js";
import { BoneDeleteCommand } from "../../commands/bone/bone.js";

export class DeleteTool {
    constructor(operator) {
        this.operator = operator;
    }

    execute() {
        app.operator.execute();
    }

    init() {
        app.operator.appendCommand(new BoneDeleteCommand());
        return {complete: true};
    }
}