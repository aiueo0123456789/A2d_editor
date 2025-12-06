import { app } from "../../../main.js";
import { AppendVertexCommand } from "../../commands/mesh/mesh.js";

// 制作途中
export class AppendVertexTool {
    constructor(/** @type {ModalOperator} */operator) {
        this.operator = operator;
        this.modal = {
            inputObject: {},
            DOM: []
        };
        this.activateKey = "v";
    }

    execute() {
        app.operator.appendCommand(this.command);
        app.operator.execute();
    }

    async init(input) {
        this.command = new AppendVertexCommand(input.position);
        return {complete: true};
    }
}