import { app } from "../../../main.js";
import { createID } from "../../utils/idGenerator.js";
import { UnfixedReference } from "../../utils/objects/util.js";
import { copyToArray } from "../../utils/utility.js";
import { KeyframeBlock } from "./keyframeBlock.js";

export class KeyframeBlockManager {
    constructor(data = {object: null, parameters: null, keyframeBlocks: null}) {
        this.type = "キーフレームブロックマネージャー";
        this.id = data.id ? data.id : createID();
        this.object = data.object;
        /** @type {string[]} */
        this.parameters = data.parameters;
        /** @type {KeyframeBlock[]} */
        this.keyframeBlocks = [];
        if (data.keyframeBlocks) {
            this.keyframeBlocks = data.keyframeBlocks.map(keyframeBlock => {
                if (keyframeBlock instanceof KeyframeBlock) return keyframeBlock;
                else return app.scene.objects.getObjectByID(keyframeBlock);
            });
        } else {
            for (let i = 0; i < this.parameters.length; i ++) {
                this.keyframeBlocks.push(app.scene.objects.createAndAppendObject({type: "KeyframeBlock"}));
            }
        }
    }

    resolvePhase() {
        this.keyframeBlocks.forEach((keyframeBlock, index) => {
            if (keyframeBlock instanceof UnfixedReference) this.keyframeBlocks[index] = keyframeBlock.getObject();
        })
    }

    setKeyframeBlocks(parameters, keyframeBlocks) {
        copyToArray(this.parameters, parameters);
        copyToArray(this.keyframeBlocks, keyframeBlocks);
    }

    update() {
        this.parameters.forEach((parameter, index) => {
            this.object[parameter] = this.keyframeBlocks[index].value;
        })
    }

    getSaveData() {
        return {
            type: this.type,
            id: this.id,
            parameters: this.parameters,
            keyframeBlocks: this.keyframeBlocks.map(keyframeBlock => keyframeBlock.id)
        };
    }
}