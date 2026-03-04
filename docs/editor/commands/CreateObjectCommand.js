import { app } from "../../main.js";
import { Command } from "../operators/CommandOperator.js";

// 追加のコマンド
export class CreateObjectCommand extends Command {
    constructor(data) {
        super();
        this.object = app.scene.objects.createObject(data);
    }

    execute() {
        app.scene.objects.appendObject(this.object);
        return {state: "FINISHED"};
    }

    undo() {
        app.scene.objects.remove(this.object);
    }
}