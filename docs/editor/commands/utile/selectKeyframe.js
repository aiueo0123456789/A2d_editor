import { app } from "../../../main.js";
import { TimelineSpaceData } from "../../ui/area/areas/Graph/area_TimelineSpaceData.js";

export class SelectKeyframesCommand {
    constructor(selectDatas,multiple) {
        this.error = false;
        this.multiple = multiple;
        /** @type {TimelineSpaceData} */
        this.timeLineSpaceData = app.appConfig.areasConfig["Timeline"];
        this.targetKeyframe = this.timeLineSpaceData.keyframes;
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
        return {consumed: this.targetKeyframe.map(keyframe => [keyframe.selectedPoint, keyframe.selectedLeftHandle, keyframe.selectedRightHandle]).filter((bools, index) => bools.map((value, boolIndex) => value !== this.originalSelectData[index][boolIndex])).length > 0};
    }

    undo() {
        this.targetKeyframe.forEach((keyframe, index) => {
            keyframe.selectedPoint = this.originalSelectData[index][0];
            keyframe.selectedLeftHandle = this.originalSelectData[index][1];
            keyframe.selectedRightHandle = this.originalSelectData[index][2];
        })
    }
}