import { app } from "../../../main.js";

export class SelectKeyframesCommand {
    constructor(selectDatas,multiple) {
        this.error = false;
        this.multiple = multiple;
        this.targetKeyframe = app.scene.objects.keyframeBlocks.map(keyframeBlock => keyframeBlock.keys).flat();
        this.originalSelectData = this.targetKeyframe.map(keyframe => [keyframe.selectedPoint, keyframe.selectedLeftHandle, keyframe.selectedRightHandle]);
        /** @type {Keyframe[]} */
        this.selectDatas = selectDatas;
        console.log(this);
    }

    execute() {
        if (this.multiple) {
            this.targetKeyframe.forEach((keyframe, index) => {
                keyframe.selectedPoint = false;
                keyframe.selectedLeftHandle = false;
                keyframe.selectedRightHandle = false;
            });
        }
        this.selectDatas.forEach(selectData => {
            if (selectData.point) {
                selectData.keyframe.selectedPoint = true;
            }
            if (selectData.left) {
                selectData.keyframe.selectedLeftHandle = true;
            }
            if (selectData.right) {
                selectData.keyframe.selectedRightHandle = true;
            }
        });
        const hasDiff = this.targetKeyframe.map(keyframe => [keyframe.selectedPoint, keyframe.selectedLeftHandle, keyframe.selectedRightHandle]).filter((bools, index) => bools[0] != this.originalSelectData[index][0] || bools[1] != this.originalSelectData[index][1] || bools[2] != this.originalSelectData[index][2]).length > 0;
        return {state: hasDiff ? "FINISHED" : "CANCELLED"};
    }

    undo() {
        this.targetKeyframe.forEach((keyframe, index) => {
            keyframe.selectedPoint = this.originalSelectData[index][0];
            keyframe.selectedLeftHandle = this.originalSelectData[index][1];
            keyframe.selectedRightHandle = this.originalSelectData[index][2];
        })
    }
}