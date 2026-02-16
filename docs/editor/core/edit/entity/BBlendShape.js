import { MathVec2 } from "../../../utils/mathVec.js";
import { cdt } from "../../../utils/objects/graphicMesh/createMesh/cdt.js";
import { copyToArray, createArrayN, createArrayNAndFill, hitTestPointTriangle, IsString, lerpTriangle } from "../../../utils/utility.js";
import { BlendShape } from "../../entity/blendShape.js";
import { BKeyframeBlockManager } from "./BKeyframeBlockManager.js";

class Point {
    constructor(data) {
        this.co = data.co;
        /** @type {Number[]} */
        this.weights = data.weights;
    }

    fromPoint(/** @type {Point} */ object) {
        this.co = object.co;
        this.weights = object.weights;
        return this;
    }
}

export class BBlendShape {
    createPoint(co, weights = undefined) {
        return new Point({co: co, weights: weights ? weights : this.shapeKeys.map(shapeKey => 0)});
    }
    constructor(data) {
        /** @type {BlendShape} */
        this.blendShape = null;
        /** @type {ShapeKeyMetaData[]} */
        this.shapeKeys = []
        this.dimension = 0;
        this.value = [];
        /** @type {Point[]} */
        this.points = [];
        this.max = [-0, -0];
        this.min = [0, 0];
        this.weights = [];
        this.triangles = []; // ドロネーで自動生成
        /** @type {BKeyframeBlockManager} */
        this.keyframeBlockManager = null;
        // エディターデータ
        this.activePoint = null;

        // view表示用
        this.positoin = MathVec2.create();
        this.scale = 10;
    }

    get id() {
        return this.blendShape.id;
    }

    get size() {
        return MathVec2.subR(this.max, this.min);
    }

    get halfSize() {
        return MathVec2.reverseScaleR(this.size, 2);
    }

    updateTriangle() {
        copyToArray(this.triangles, cdt(this.points.map(point => point.co), []).meshes.map(indexs => indexs.map(index => this.points[index])));
    }

    update() {
        // valueを点とした時それを内包する三角形を探しその三角形で重みを補完する
        for (const triangle of this.triangles) {
            if (hitTestPointTriangle(triangle[0].co,triangle[1].co,triangle[2].co,this.value)) {
                copyToArray(
                    this.weights,
                    lerpTriangle(
                        triangle[0].co,triangle[1].co,triangle[2].co,
                        triangle[0].weights,triangle[1].weights,triangle[2].weights,
                        this.value
                    )
                );
                break ;
            }
        }
        for (let i = 0; i < this.shapeKeys.length; i ++) {
            const object = this.shapeKeys[i].object;
            object.allShapeKeyWeights[this.shapeKeys[i].index] = this.weights[i];
        }
    }

    fromBlendShape(/** @type {BlendShape} */ object) {
        this.blendShape = object;
        this.dimension = object.dimension;
        this.points = object.points.map(point => (new Point()).fromPoint(point));
        this.triangles = [...object.triangles];
        this.max = [...object.max];
        this.min = [...object.min];
        this.positoin = MathVec2.copy(object.positoin);
        this.shapeKeys = [...object.shapeKeys];
        console.log(object, this)
        return this;
    }

    toRutime() {
    }
}