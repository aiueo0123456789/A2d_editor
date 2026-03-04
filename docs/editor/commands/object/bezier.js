import { app } from "../../../main.js";
import { BBezier } from "../../core/edit/entity/BBezier.js";
import { Command } from "../../operators/CommandOperator.js";
import { MathVec2 } from "../../utils/mathVec.js";
import { getArrayLastValue } from "../../utils/utility.js";

export class BezierExtrudeMoveCommand extends Command {
    constructor() {
        super();
        this.error = false;
        this.editObjects = app.scene.editData.allEditObjects.filter(editObject => editObject instanceof BBezier);
        this.value = [0,0];
        if (this.editObjects.length) {
            this.isBArmature = true;
            this.createDatasInEditObject = {};
            for (const /** @type {BBezier} */ editObject of this.editObjects) {
                const datas = [];
                let lastPoint = getArrayLastValue(editObject.anchorPoints);
                const baseCo = lastPoint.point.co;
                const anchorPoint = BBezier.createAnchorPoint(baseCo, MathVec2.subR(baseCo, [50, 0]), MathVec2.addR(baseCo, [50, 0]));
                editObject.append(anchorPoint);
                this.createDatasInEditObject[editObject.id] = {anchorPoint: anchorPoint, baseCo: baseCo};
            }
        } else {
            this.error = true;
        }
    }

    extrudeMove(value) {
        this.value = [...value];
        this.editObjects.forEach(editObject => {
            const createAnchorPointData = this.createDatasInEditObject[editObject.id];
            MathVec2.add(createAnchorPointData.anchorPoint.point.co, createAnchorPointData.baseCo, this.value);
            MathVec2.add(createAnchorPointData.anchorPoint.leftHandle.co, MathVec2.subR(createAnchorPointData.baseCo, [50, 0]), this.value);
            MathVec2.add(createAnchorPointData.anchorPoint.rightHandle.co, MathVec2.addR(createAnchorPointData.baseCo, [50, 0]), this.value);
            editObject.updateGPUData();
        });
    }

    execute() {
        this.editObjects.forEach(editObject => {
            const createAnchorPointData = this.createDatasInEditObject[editObject.id];
            MathVec2.add(createAnchorPointData.anchorPoint.point.co, createAnchorPointData.baseCo, this.value);
            MathVec2.add(createAnchorPointData.anchorPoint.leftHandle.co, MathVec2.subR(createAnchorPointData.baseCo, [50, 0]), this.value);
            MathVec2.add(createAnchorPointData.anchorPoint.rightHandle.co, MathVec2.addR(createAnchorPointData.baseCo, [50, 0]), this.value);
            editObject.updateGPUData();
        });
        return {state: "FINISHED"};
    }

    redo() {
        this.editObjects.forEach(editObject => {
            this.createDatasInEditObject[editObject.id].forEach(data => pushToArray(editObject.bones, data.bone));
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