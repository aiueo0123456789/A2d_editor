import { BlendShape } from "../../core/entity/BlendShape.js";
import { Command } from "../../operators/CommandOperator.js";
import { MathVec2 } from "../../utils/mathVec.js";
import { changeParameter } from "../../utils/utility.js";

export class ChangeBlendShapeValueCommand extends Command {
    constructor(target, newValue = [0,0]) {
        super();
        /** @type { BlendShape } */
        this.target = target;
        this.originalValues = [...this.target.value];
        this.newValue = MathVec2.maxR(MathVec2.minR(newValue, this.target.max), this.target.min);
    }

    update(newValue) {
        this.newValue = MathVec2.maxR(MathVec2.minR(newValue, this.target.max), this.target.min);
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