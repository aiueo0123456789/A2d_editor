import { app } from "../../main.js";
import { GraphicMesh } from "../core/entity/GraphicMesh.js";

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