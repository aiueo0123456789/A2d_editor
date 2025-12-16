import { app } from "../../../../../main.js";
import { BArmatureAnimation } from "../../../../core/edit/objects/BArmatureAnimation.js";
import { BKeyframeBlockManager } from "../../../../core/edit/objects/BKeyframeBlockManager.js";
import { BlendShape } from "../../../../core/entity/blendShape.js";
import { Keyframe, KeyframeBlock } from "../../../../core/entity/keyframeBlock.js";
import { KeyframeBlockManager } from "../../../../core/entity/keyframeBlockManager.js";

export class TimelineSpaceData {
    constructor() {
        this.activeKey = null;
    }

    /** @type {KeyframeBlock[]} */
    get keyframeBlocks() {
        return app.scene.objects.keyframeBlocks.filter(keyframeBlock => this.outlineKefyframeData.map(object => object.object).includes(keyframeBlock));
    }

    /** @type {Keyframe[]} */
    get keyframes() {
        return this.keyframeBlocks.map(keyframeBlock => keyframeBlock.keys).flat();
    }

    get outlineData() {
        const looper = (objects, othersData = {}, result = []) => {
            for (const object of objects) {
                if (object instanceof BArmatureAnimation) {
                    object.selectedBones.forEach(bone => result.push({name: bone.name, type: "ボーン", children: looper([bone.keyframeBlockManager], {object: bone}), object: object}))
                } else if (object instanceof BKeyframeBlockManager) {
                    object.parameters.forEach((parameter, index) => result.push({parameter: parameter, type: "キーフレームブロック", pathID: `${othersData.object.id}/${object.keyframeBlocks[index].id}`, object: object.keyframeBlocks[index]}))
                } else if(object instanceof BlendShape) {
                    result.push({name: object.name, type: "ブレンドシェイプ", children: looper([object.keyframeBlockManager], {object: object}), object: object});
                } else if (object instanceof KeyframeBlockManager) {
                    object.parameters.forEach((parameter, index) => result.push({parameter: parameter, type: "キーフレームブロック", pathID: `${othersData.object.id}/${object.keyframeBlocks[index].id}`, object: object.keyframeBlocks[index]}))
                }
            }
            return result;
        }
        return looper(app.scene.editData.allEditObjects.concat(app.scene.objects.blendShapes));
    }

    get outlineKefyframeData() {
        const result = [];
        const looper = (objects) => {
            for (const object of objects) {
                if (object.type == "キーフレームブロック") result.push(object);
                else looper(object.children);
            }
        }
        looper(this.outlineData);
        return result;
    }
}