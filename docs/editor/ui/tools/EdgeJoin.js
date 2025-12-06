import { app } from "../../../main.js";
import { AppendEdgeCommand } from "../../commands/mesh/mesh.js";

// 制作途中
export class EdgeJoinTool {
    constructor(/** @type {ModalOperator} */operator) {
        this.operator = operator;
        this.command = new AppendEdgeCommand();
        this.modal = {
            inputObject: {},
            DOM: []
        };
        this.activateKey = "j";
    }

    execute() {
        app.operator.appendCommand(this.command);
        app.operator.execute();
    }

    async init() {
        return {complete: true};
    }
}