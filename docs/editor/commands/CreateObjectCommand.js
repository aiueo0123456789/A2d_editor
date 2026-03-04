import { app } from "../../main.js";

// 追加のコマンド
export class CreateObjectCommand {
    constructor(data) {
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