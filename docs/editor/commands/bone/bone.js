import { app } from "../../../main.js";
import { BArmature } from "../../core/edit/objects/BArmature.js";
import { MathVec2 } from "../../utils/mathVec.js";
import { indexOfSplice, insertToArray, removeDuplicates } from "../../utils/utility.js";

export class BoneExtrudeMoveCommand {
    constructor() {
        this.error = false;
        this.editObjects = app.scene.editData.allEditObjects.filter(editObject => editObject instanceof BArmature);
        this.value = [0,0];
        if (this.editObjects.length) {
            this.isBArmature = true;
            this.createDatasInEditObject = {};
            for (const /** @type {BArmature} */ editObject of this.editObjects) {
                const datas = [];
                this.createDatasInEditObject[editObject.id] = datas;
                editObject.selectedVertices.forEach(vertex => {
                    const bone = BArmature.createBone(vertex.co, vertex.co, editObject.getBoneByVertex(vertex));
                    editObject.bones.push(bone);
                    datas.push({bone: bone, baseCo: vertex.co});
                });
            }
        } else {
            this.error = true;
        }
    }

    extrudeMove(value) {
        this.value = [...value];
        this.editObjects.forEach(editObject => {
            this.createDatasInEditObject[editObject.id].forEach(data => MathVec2.add(data.bone.tailVertex.co, data.baseCo, this.value));
            editObject.updateGPUData();
        });
    }

    execute() {
        this.editObjects.forEach(editObject => {
            this.createDatasInEditObject[editObject.id].forEach(data => MathVec2.add(data.bone.tailVertex.co, data.baseCo, this.value));
            editObject.updateGPUData();
        });
        return {consumed: true};
    }

    redo() {
        this.editObjects.forEach(editObject => {
            this.createDatasInEditObject[editObject.id].forEach(data => editObject.bones.push(data.bone));
            editObject.updateGPUData();
        });
    }

    undo() {
        this.editObjects.forEach(editObject => {
            this.createDatasInEditObject[editObject.id].forEach(data => indexOfSplice(editObject.bones, data.bone));
            editObject.updateGPUData();
        });
    }
}

export class BoneDeleteCommand {
    constructor() {
        this.error = false;
        this.editObjects = app.scene.editData.allEditObjects.filter(editObject => editObject instanceof BArmature);
        if (this.editObjects.length) {
            this.isBArmature = true;
            this.deleteDatasInEditObject = {};
            for (const /** @type {BArmature} */ editObject of this.editObjects) {
                const datas = [];
                this.deleteDatasInEditObject[editObject.id] = datas;
                const editObjectInBones = editObject.selectedBones;
                editObject.selectedBones.forEach(bone => {
                    datas.push({bone: bone, index: editObjectInBones.indexOf(bone)});
                });
            }
        } else {
            this.error = true;
        }
        console.log(this)
    }

    execute() {
        this.editObjects.forEach(editObject => {
            this.deleteDatasInEditObject[editObject.id].forEach(data => indexOfSplice(editObject.bones, data.bone));
            editObject.updateGPUData();
        });
        return {consumed: true};
    }

    undo() {
        this.editObjects.forEach(editObject => {
            this.deleteDatasInEditObject[editObject.id].reverse().forEach(data => insertToArray(editObject.bones, data.index, data.bone));
            editObject.updateGPUData();
        });
    }
}