import { app } from "../../main.js";

// 削除コマンド
export class DeleteObjectCommand {
    constructor(objects) {
        this.objects = [...objects];
    }

    execute() {
        for (const object of this.objects) {
            app.scene.objects.removeObject(object);
        }
        return {state: "FINISHED"};
    }

    undo() {
        for (const object of this.objects) {
            app.scene.objects.appendObject(object);
        }
    }
}