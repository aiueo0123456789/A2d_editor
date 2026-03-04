import { app } from "../../main.js";
import { Command } from "../operators/CommandOperator.js";

// 削除コマンド
export class DeleteObjectCommand extends Command {
    constructor(objects) {
        super();
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