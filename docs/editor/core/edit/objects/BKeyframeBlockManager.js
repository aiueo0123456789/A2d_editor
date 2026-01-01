export class BKeyframeBlockManager {
    constructor(data) {
        this.type = "キーフレームブロックマネージャー";
        this.id = data.id ? data.id : createID();
        this.object = data.object;
        /** @type {Array} */
        this.parameters = data.parameters;
        /** @type {KeyframeBlock[]} */
        this.keyframeBlocks = data.keyframeBlocks.map(keyframeBlock => keyframeBlock);
    }

    get values() {
        return this.parameters.map(parameter => this.object[parameter]);
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
        };
    }
}