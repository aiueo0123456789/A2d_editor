import { BlendShape } from "../../core/entity/blendShape.js";
import { changeParameter } from "../../utils/utility.js";

export class ChangeBlendShapeValueCommand {
    constructor(target, newValue = [0,0]) {
        /** @type { BlendShape } */
        this.target = target;
        this.originalValues = [...this.target.value];
        this.newValue = newValue;
    }

    update(newValue) {
        this.newValue = newValue;
        changeParameter(this.target, "value", this.newValue);
    }

    execute() {
        changeParameter(this.target, "value", this.newValue);
        return {state: "FINISHED"};
    }

    undo() {
        changeParameter(this.target, "value", this.originalValues);
    }
}