import { app } from "../../../main.js";
import { GraphicMesh } from "../../core/entity/graphicMesh.js";

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

// 親要素の変更
export class ChangeParentCommand {
    constructor(targets, newParent) {
        this.targets = [...targets];
        this.originalParent = targets.map(target => target.parent);
        this.newParent = newParent;
    }

    update(newParent) {
        this.newParent = newParent;
    }

    execute() {
        this.targets.forEach((target) => {
            target.changeParent(this.newParent);
        })
        return {state: "FINISHED"};
    }

    undo() {
        this.targets.forEach((target, index) => {
            target.changeParent(this.originalParent[index]);
        })
    }
}

// 親要素の変更
export class JoinObjectCommand {
    constructor(targetObject, sourceObjects) {
        this.targetObject = targetObject;
        this.error = false;
        this.newObject = null;
        this.sourceObjects = [...sourceObjects];
        for (const object of this.sourceObjects) {
            if (object.constructor !== targetObject.constructor) this.error = true;
        }
    }

    async execute() {
        app.scene.objects.removeObject(this.targetObject);
        for (const sourceObject of this.sourceObjects) {
            app.scene.objects.removeObject(sourceObject);
        }
        const targetData = await this.targetObject.getSaveData();
        const datas = await Promise.all(this.sourceObjects.map(sourceObject => sourceObject.getSaveData()));
        // 結合処理
        const newData = targetData;
        if (this.targetObject instanceof GraphicMesh) {
            let meshesOffset = 0;
            for (const data of datas) {
                newData.vertices.push(...data.vertices);
                newData.texCoords.push(...data.texCoords);
                newData.weightBlocks.push(...data.weightBlocks);
                newData.meshes.push(...data.meshes.map(mesh => [mesh[0] + meshesOffset, mesh[1] + meshesOffset, mesh[2] + meshesOffset]));
                meshesOffset = newData.meshes.length;
            }
        }
        console.log(newData)
        this.newObject = app.scene.objects.createObject(newData);
        app.scene.objects.appendObject(this.newObject);
        return {state: "FINISHED"};
    }

    redo() {
    }

    undo() {
    }
}