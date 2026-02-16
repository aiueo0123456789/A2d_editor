import { app } from "../../../main.js";
import { BArmatureAnimation } from "../../core/edit/entity/BArmatureAnimation.js";
import { BKeyframeBlock, BKeyframeBlockManager } from "../../core/edit/entity/BKeyframeBlockManager.js";
import { KeyframeBlock } from "../../core/entity/keyframeBlock.js";

export class KeyframeInsertInSelectedElementCommand {
    constructor() {
        this.editObjects = app.scene.editData.allEditObjects;
        if (this.editObjects[0] instanceof BArmatureAnimation) {
            this.isBArmatureAnimation = true;
        }
        if (this.isBArmatureAnimation) {
            this.selectedBones = this.editObjects.map(editObject => editObject.selectedBones).flat();
            this.createdKeyframes = this.selectedBones.map(bone => {
                /** @type {BKeyframeBlockManager} */
                const keyframeBlockManager = bone.keyframeBlockManager;
                const values = keyframeBlockManager.values;
                return keyframeBlockManager.keyframeBlocks.map((keyframeBlock, valueIndex) => BKeyframeBlock.createKeyframe(app.scene.frame_current, values[valueIndex]));
            });
        }
    }

    execute() {
        this.selectedBones.forEach((bone, boneIndex) => {
            /** @type {BKeyframeBlockManager} */
            const keyframeBlockManager = bone.keyframeBlockManager;
            keyframeBlockManager.keyframeBlocks.forEach((keyframeBlock, keyframeIndex) => {
                keyframeBlock.addKeyframe(this.createdKeyframes[boneIndex][keyframeIndex]);
            });
        });
        return {state: "FINISHED"};
    }

    undo() {
        this.selectedBones.forEach((bone, boneIndex) => {
            /** @type {BKeyframeBlockManager} */
            const keyframeBlockManager = bone.keyframeBlockManager;
            keyframeBlockManager.keyframeBlocks.forEach((keyframeBlock, keyframeIndex) => {
                keyframeBlock.removeKeyframe(this.createdKeyframes[boneIndex][keyframeIndex]);
            });
        });
    }
}

export class KeyframeInsertInKeyframeBlockCommand {
    constructor(/** @type {KeyframeBlock} */ keyframeBlock, frame, value) {
        this.keyframeBlock = keyframeBlock;
        this.newKey = KeyframeBlock.createKeyframe(frame, value);
    }

    execute() {
        this.keyframeBlock.addKeyframe(this.newKey);
        return {state: "FINISHED"};
    }

    undo() {
        this.keyframeBlock.removeKeyframe(this.newKey);
    }
}