import { app } from "../../../main.js";
import { BArmature } from "../../core/edit/entity/BArmature.js";
import { BBezier } from "../../core/edit/entity/BBezier.js";
import { BBezierShapeKey } from "../../core/edit/entity/BBezierShapeKey.js";
import { BMesh } from "../../core/edit/entity/BMesh.js";
import { BMeshShapeKey } from "../../core/edit/entity/BMeshShapeKey.js";
import { useEffect } from "../../utils/ui/util.js";

export class SelectVerticesCommand {
    constructor(selectData,multiple) {
        this.multiple = multiple;
        this.editObjects = app.scene.editData.allEditObjects.filter(editData => editData instanceof BMesh || editData instanceof BMeshShapeKey || editData instanceof BBezier || editData instanceof BBezierShapeKey || editData instanceof BArmature); // オブジェクトモードに移行する場合は前のモードで使っていた編集用オブジェクトを保持
        this.originalSelectData = {};
        this.editObjects.forEach(editObject => {
            const objectID = editObject.id;
            this.originalSelectData[objectID] = editObject.verticesSelectData;
        })
        this.selectData = selectData;
    }

    execute() {
        this.editObjects.forEach(editObject => {
            const objectID = editObject.id;
            if (this.multiple) {
                editObject.selectedClear();
            }
            if (this.selectData[objectID]) {
                editObject.selectVertices(this.selectData[objectID]);
            }
        })
        let hasDiff = false;
        this.editObjects.forEach(editObject => {
            const objectID = editObject.id;
            if (this.originalSelectData[objectID].filter((b, index) => editObject.verticesSelectData[index] !== b).length != 0) {
                hasDiff = true;
            }
        })
        useEffect.update({o: "頂点選択"});
        return {state: hasDiff ? "FINISHED" : "CANCELLED"};
    }

    undo() {
        this.editObjects.forEach(editObject => {
            const objectID = editObject.id;
            editObject.selectedClear();
            const originalIndexs = [];
            this.originalSelectData[objectID].forEach((bool, index) => {
                if (bool) {
                    originalIndexs.push(index);
                }
            })
            editObject.selectVertices(originalIndexs);
            useEffect.update({o: "頂点選択"});
        })
    }
}