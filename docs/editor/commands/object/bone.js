import { app } from "../../../main.js";
import { BArmature } from "../../core/edit/entity/BArmature.js";
import { Command } from "../../operators/CommandOperator.js";
import { MathVec2 } from "../../utils/mathVec.js";

export class BoneExtrudeMoveCommand extends Command {
    constructor() {
        super();
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
        return {state: "FINISHED"};
    }

    redo() {
        this.editObjects.forEach(editObject => {
            this.createDatasInEditObject[editObject.id].forEach(data => editObject.appendBone(data.bone));
            editObject.updateGPUData();
        });
    }

    undo() {
        this.editObjects.forEach(editObject => {
            this.createDatasInEditObject[editObject.id].forEach(data => editObject.deleteBone(data.bone));
            editObject.updateGPUData();
        });
    }
}

export class DeleteBoneCommand extends Command {
    constructor() {
        super();
        this.error = false;
        this.editObjects = app.scene.editData.allEditObjects.filter(editObject => editObject instanceof BArmature);
        if (this.editObjects.length) {
            this.isBArmature = true;
            this.deleteDatasInEditObject = {};
            for (const /** @type {BArmature} */ editObject of this.editObjects) {
                const datas = [];
                this.deleteDatasInEditObject[editObject.id] = datas;
                const bonesInBArmature = editObject.bones;
                editObject.selectedBones.forEach(bone => {
                    datas.push({bone: bone, index: bonesInBArmature.indexOf(bone)});
                });
            }
        } else {
            this.error = true;
        }
        console.log(this)
    }

    execute() {
        this.editObjects.forEach(editObject => {
            this.deleteDatasInEditObject[editObject.id].forEach(data => editObject.deleteBone(data.bone));
            editObject.updateGPUData();
        });
        return {state: "FINISHED"};
    }

    undo() {
        this.editObjects.forEach(editObject => {
            this.deleteDatasInEditObject[editObject.id].reverse().forEach(data => editObject.insertBone(data.index, data.bone));
            editObject.updateGPUData();
        });
    }
}