import { app } from "../../../main.js";
import { BArmature } from "../../core/edit/objects/BArmature.js";
import { BBezier } from "../../core/edit/objects/BBezier.js";
import { BBezierShapeKey } from "../../core/edit/objects/BBezierShapeKey.js";
import { BMesh } from "../../core/edit/objects/BMesh.js";
import { BMeshShapeKey } from "../../core/edit/objects/BMeshShapeKey.js";
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
        return {consumed: hasDiff};
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