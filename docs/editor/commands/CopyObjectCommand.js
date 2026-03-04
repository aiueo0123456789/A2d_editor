import { app } from "../../main.js";

// 追加のコマンド
export class CopyObjectCommand {
    constructor(sourceObject) {
        this.sourceObject = sourceObject;
        this.newObject = null;
    }

    async execute() {
        this.newObject = app.scene.objects.createObject(await this.sourceObject.getSaveData());
        app.scene.objects.appendObject(this.newObject);
        return {state: "FINISHED"};
    }

    redo() {
        app.scene.objects.appendObject(this.newObject);
    }

    undo() {
        app.scene.objects.remove(this.newObject);
    }
}