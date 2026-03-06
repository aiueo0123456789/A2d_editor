import { app } from "../../../../main.js";
import { bezierRender, circleRender, dottedLineRender, rectRender } from "../../../ui/area/areas/Viewer/Viewer.js";
import { createID } from "../../../utils/idGenerator.js";
import { MathVec2 } from "../../../utils/mathVec.js";
import { useEffect } from "../../../utils/ui/util.js";
import { pushToArray, roundUp } from "../../../utils/utility.js";
import { GPU } from "../../../utils/webGPU.js";
import { BezierModifier } from "../../entity/BezierModifier.js";

class Vert {
    constructor(data) {
        this.co = [...data.co];
        this.index = data.index;
        this.selected = false;
    }

    setCo(co) {
        this.co = [...co];
    }
}

class AnchorPoint {
    constructor(data) {
        this.point = data.point;
        this.leftHandle = data.leftHandle;
        this.rightHandle = data.rightHandle;
    }
}

class ShapeKey {
    constructor(data) {
        this.id = data.id ? data.id : createID();
        this.name = data.name;
        /** @type {ShapeKeyVert[]} */
        this.data = data.data;
        this.selected = false;
    }
}

class ShapeKeyVert {
    constructor(data) {
        /** @type {int[]} */
        this.co = [...data.co];
    }

    setCo(co) {
        this.co = [...co];
    }
}

export class BBezierShapeKey {
    constructor() {
        /** @type {BezierModifier} */
        this.object = null;
        /** @type {Vert[]} */
        this.vertices = [];
        /** @type {AnchorPoint[]} */
        this.anchorPoints = [];
        /** @type {ShapeKey[]} */
        this.shapeKeys = [];

        /** @type {ShapeKey} */
        this.activeShapeKey = null;

        /** @type {Vert} */
        this.activeVertex = null;
    }

    createShapeKey(name) {
        const data = [];
        for (const vertex of this.vertices) {
            data.push(new ShapeKeyVert({co: vertex.co}));
        }
        return new ShapeKey({name: name, data: data});
    }

    // object.id
    get id() {
        return this.object.id;
    }

    // 頂点の表示状況をbool[]でかえす
    get verticesSelectData() {
        return this.vertices.map(vertex => vertex.selected);
    }
    // 頂点(object)から頂点indexを返す
    getVertexIndexByVertex(vertex) {
        return this.vertices.indexOf(vertex);
    }

    // 選択情報のクリア
    selectedClear() {
        this.vertices.forEach(vertex => {
            vertex.selected = false;
            GPU.writeBuffer(this.vertexSelectedBuffer, GPU.createBitData([0], ["u32"]), this.getVertexIndexByVertex(vertex) * 4);
        });
        this.activeVertex = null;
    }

    // 頂点選択
    selectVertices(/** @type {Array} */ indexs) {
        indexs.forEach(index => {
            this.vertices[index].selected = true;
            this.activeVertex = this.vertices[index];
            GPU.writeBuffer(this.vertexSelectedBuffer, GPU.createBitData([1], ["u32"]), index * 4);
        });
    }

    get selectedVertices() {
        return this.vertices.filter(vert => vert.selected);
    }

    get verticesNum() {
        return this.vertices.length;
    }

    get pointsNum() {
        return this.vertices.length / 3;
    }

    updateGPUData() {
    }

    async fromBezier(/** @type {BezierModifier} */object) {
        const bezierModifierData = app.scene.runtimeData.bezierModifierData;
        this.object = object;
        const [coordinates,shapes] = await Promise.all([
            bezierModifierData.baseVertices.getObjectData(object),
            bezierModifierData.shapeKeys.getObjectData(object)
        ]);
        for (let i = 0; i < coordinates.length; i ++) {
            this.vertices.push(new Vert({co: coordinates[i].slice(0,2), index: i * 3}));
            this.vertices.push(new Vert({co: coordinates[i].slice(2,4), index: i * 3 + 1}));
            this.vertices.push(new Vert({co: coordinates[i].slice(4,6), index: i * 3 + 2}));
            this.anchorPoints.push(new AnchorPoint({point: i * 3, leftHandle: i * 3 + 1, rightHandle: i * 3 + 2}));
        }
        this.object.shapeKeyMetaDatas.forEach((shapeKeyMetaDta, shapeKeyIndex) => {
            const data = [];
            for (let vertrxIndex = 0; vertrxIndex < coordinates.length; vertrxIndex ++) {
                data.push(new ShapeKeyVert({co: MathVec2.addR(shapes[shapeKeyIndex * coordinates.length + vertrxIndex].slice(0,2), coordinates[vertrxIndex].slice(0,2))}));
                data.push(new ShapeKeyVert({co: MathVec2.addR(shapes[shapeKeyIndex * coordinates.length + vertrxIndex].slice(2,4), coordinates[vertrxIndex].slice(2,4))}));
                data.push(new ShapeKeyVert({co: MathVec2.addR(shapes[shapeKeyIndex * coordinates.length + vertrxIndex].slice(4,6), coordinates[vertrxIndex].slice(4,6))}));
            }
            pushToArray(this.shapeKeys, new ShapeKey({name: shapeKeyMetaDta.name, data: data, id: shapeKeyMetaDta.id}));
        })
        this.activeShapeKey = this.shapeKeys[0];
        this.updateGPUData();
    }

    toRutime() {
        this.object.shapeKeyWeightsData.length = 0;
        this.object.shapeKeysData.length = 0;
        this.object.shapeKeyMetaDatas.length = 0;
        this.shapeKeys.forEach((shapeKey, shapeKeyIndex) => {
            this.object.shapeKeyWeightsData.push(1);
            this.object.shapeKeysData.push(...shapeKey.data.map((vertex, vertexIndex) => MathVec2.subR(vertex.co, this.vertices[vertexIndex].co)).flat());
            this.object.shapeKeyMetaDatas.push(this.object.createShapeKeyMetaData(shapeKey.name, shapeKeyIndex, shapeKey.id));
        })
        const bezierModifierData = app.scene.runtimeData.bezierModifierData;
        bezierModifierData.update(this.object);
        useEffect.update({o: this.object.shapeKeyMetaDatas});
    }

    gizumoRender(renderPass) {
        function getColorFromFlag(active, selected) {
            return active ? [1,1,1,1] : selected ? [1,0.5,0,1] : [0.2,0.2,0.2,1];
        }
        if (this.activeShapeKey) {
            for (let i = 1; i < this.anchorPoints.length; i ++) {
                bezierRender(renderPass, this.activeShapeKey.data[this.anchorPoints[i - 1].point].co, this.activeShapeKey.data[this.anchorPoints[i - 1].rightHandle].co, this.activeShapeKey.data[this.anchorPoints[i].point].co, this.activeShapeKey.data[this.anchorPoints[i].rightHandle].co, 2, [0,0,0.7,1], 0);
            }
            for (const anchorPoint of this.anchorPoints) {
                dottedLineRender(renderPass, this.activeShapeKey.data[anchorPoint.point].co, this.activeShapeKey.data[anchorPoint.leftHandle].co, 2, 5, 5, [0,0,0,1], 0);
                dottedLineRender(renderPass, this.activeShapeKey.data[anchorPoint.point].co, this.activeShapeKey.data[anchorPoint.rightHandle].co, 2, 5, 5, [0,0,0,1], 0);
                rectRender(renderPass, this.activeShapeKey.data[anchorPoint.point].co, [6, 6], 0, getColorFromFlag(this.activeVertex?.index === anchorPoint.point, this.vertices[anchorPoint.point].selected), 0, 1, [0,0,0,1], 0);
                circleRender(renderPass, this.activeShapeKey.data[anchorPoint.leftHandle].co, 6, getColorFromFlag(this.activeVertex?.index === anchorPoint.leftHandle, this.vertices[anchorPoint.leftHandle].selected), 0, 1, [0,0,0,1], 0);
                circleRender(renderPass, this.activeShapeKey.data[anchorPoint.rightHandle].co, 6, getColorFromFlag(this.activeVertex?.index === anchorPoint.rightHandle, this.vertices[anchorPoint.rightHandle].selected), 0, 1, [0,0,0,1], 0);
            }
        } else {
            for (let i = 1; i < this.anchorPoints.length; i ++) {
                bezierRender(renderPass, this.vertices[this.anchorPoints[i - 1].point].co, this.vertices[this.anchorPoints[i - 1].rightHandle].co, this.vertices[this.anchorPoints[i].point].co, this.vertices[this.anchorPoints[i].rightHandle].co, 2, [0,0,1,1], 0);
            }
            for (const anchorPoint of this.anchorPoints) {
                dottedLineRender(renderPass, this.vertices[anchorPoint.point].co, this.vertices[anchorPoint.leftHandle].co, 2, 5, 5, [0,0,0,1], 0);
                dottedLineRender(renderPass, this.vertices[anchorPoint.point].co, this.vertices[anchorPoint.rightHandle].co, 2, 5, 5, [0,0,0,1], 0);
                rectRender(renderPass, this.vertices[anchorPoint.point].co, [6, 6], 0, getColorFromFlag(this.activeVertex?.index === anchorPoint.point, this.vertices[anchorPoint.point].selected), 0, 1, [0,0,0,1], 0);
                circleRender(renderPass, this.vertices[anchorPoint.leftHandle].co, 6, getColorFromFlag(this.activeVertex?.index === anchorPoint.leftHandle, this.vertices[anchorPoint.leftHandle].selected), 0, 1, [0,0,0,1], 0);
                circleRender(renderPass, this.vertices[anchorPoint.rightHandle].co, 6, getColorFromFlag(this.activeVertex?.index === anchorPoint.rightHandle, this.vertices[anchorPoint.rightHandle].selected), 0, 1, [0,0,0,1], 0);
            }
        }
    }
}