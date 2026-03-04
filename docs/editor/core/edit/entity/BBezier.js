import { app } from "../../../../main.js";
import { bezierRender, circleRender, dottedLineRender, rectRender } from "../../../ui/area/areas/Viewer/Viewer.js";
import { roundUp } from "../../../utils/utility.js";
import { GPU } from "../../../utils/webGPU.js";
import { BezierModifier } from "../../entity/BezierModifier.js";

class Vert {
    constructor(data) {
        this.co = [...data.co];
        this.weightBlock = data.weightBlock ? [...data.weightBlock] : [0,0,0,0, 1,0,0,0];
        this.selected = false;
    }

    setCo(co) {
        this.co = [...co];
    }
}

class AnchorPoint {
    constructor(data) {
        this.point = new Vert(data.point);
        this.leftControlHandle = new Vert(data.leftControlHandle);
        this.rightControlHandle = new Vert(data.rightControlHandle);
    }

    get vertices() {
        return [this.point, this.leftControlHandle, this.rightControlHandle];
    }
}

export class BBezier {
    static createAnchorPoint(point, leftControlHandle, rightControlHandle) {
        return new AnchorPoint({point: {co: point}, leftControlHandle: {co: leftControlHandle}, rightControlHandle: {co: rightControlHandle}});
    }
    constructor() {
        /** @type {BezierModifier} */
        this.object = null;
        /** @type {AnchorPoint[]} */
        this.anchorPoints = [];
    }

    // object.id
    get id() {
        return this.object.id;
    }

    get vertices() {
        return this.anchorPoints.map(anchorPoint => anchorPoint.vertices).flat();
    }

    // 頂点の表示状況をbool[]でかえす
    get verticesSelectData() {
        return this.vertices.map(vertex => vertex.selected);
    }

    // 頂点(object)から頂点indexを返す
    getVertexIndexByVertex(vertex) {
        return this.vertices.indexOf(vertex);
    }

    // メッシュの頂点indexを返す
    getMeshLoop(mesh) {
        return mesh.vertices.map(vertex => this.getVertexIndexByVertex(vertex));
    }

    // 辺の頂点indexを返す
    geVerticesIndexInEdge(edge) {
        return edge.vertices.map(vertex => this.getVertexIndexByVertex(vertex));
    }

    // 選択情報のクリア
    selectedClear() {
        this.vertices.forEach(vertex => {
            vertex.selected = false;
            GPU.writeBuffer(this.vertexSelectedBuffer, GPU.createBitData([0], ["u32"]), this.getVertexIndexByVertex(vertex) * 4);
        });
    }

    // 頂点選択
    selectVertices(/** @type {Array} */ indexs) {
        indexs.forEach(index => {
            this.vertices[index].selected = true;
            GPU.writeBuffer(this.vertexSelectedBuffer, GPU.createBitData([1], ["u32"]), index * 4);
        });
    }

    append(newAnchorPoint) {
        this.anchorPoints.push(newAnchorPoint);
    }

    get selectedVertices() {
        return this.vertices.filter(vert => vert.selected);
    }

    get pointsNum() {
        return this.anchorPoints.length;
    }
    get verticesNum() {
        return this.vertices.length;
    }

    updateGPUData() {
        this.verticesBuffer = GPU.createStorageBuffer(roundUp(this.vertices.length * 2 * 4, 2 * 4), this.vertices.map(vertex => vertex.co).flat(), ["f32", "f32"]);
        this.vertexSelectedBuffer = GPU.createStorageBuffer(roundUp(this.vertices.length * 4, 4), this.vertices.map(vertex => vertex.selected ? 1 : 0), ["u32"]);
        this.renderingGroup = GPU.createGroup(GPU.getGroupLayout("Vsr_Vsr"), [this.verticesBuffer, this.vertexSelectedBuffer]);
    }

    async fromBezier(object) {
        const bezierModifierData = app.scene.runtimeData.bezierModifierData;
        this.object = object;
        const [coordinates,weightBlocks] = await Promise.all([
            bezierModifierData.baseVertices.getObjectData(object),
            bezierModifierData.weightBlocks.getObjectData(object),
        ]);
        for (let i = 0; i < coordinates.length; i ++) {
            this.anchorPoints.push(new AnchorPoint({point: {co: coordinates[i].slice(0,2), weightBlock: weightBlocks[i].slice(0, 8)}, leftControlHandle: {co: coordinates[i].slice(2,4), weightBlock: weightBlocks[i].slice(8, 16)}, rightControlHandle: {co: coordinates[i].slice(4,6), weightBlock: weightBlocks[i].slice(16, 24)}}));
        }
        this.updateGPUData();
    }

    toRutime() {
        this.object.verticesData.length = 0;
        this.object.weightBlocksData.length = 0;
        for (const vert of this.vertices) {
            this.object.verticesData.push(...vert.co);
            this.object.weightBlocksData.push(...vert.weightBlock);
        }
        console.log(this.object)
        const bezierModifierData = app.scene.runtimeData.bezierModifierData;
        bezierModifierData.update(this.object);
    }

    render(renderPass) {
        function getColorFromFlag(active, selected) {
            return active ? [1,1,1,1] : selected ? [1,0.5,0,1] : [0.2,0.2,0.2,1];
        }
        for (let i = 1; i < this.anchorPoints.length; i ++) {
            bezierRender(renderPass, this.anchorPoints[i - 1].point.co, this.anchorPoints[i - 1].rightControlHandle.co, this.anchorPoints[i].point.co, this.anchorPoints[i].leftControlHandle.co, 2, [0,0,0.7,1], 0);
        }

        for (const anchorPoint of this.anchorPoints) {
            dottedLineRender(renderPass, anchorPoint.point.co, anchorPoint.leftControlHandle.co, 2, 5, 5, [0,0,0,1], 0);
            dottedLineRender(renderPass, anchorPoint.point.co, anchorPoint.rightControlHandle.co, 2, 5, 5, [0,0,0,1], 0);
            rectRender(renderPass, anchorPoint.point.co, [6, 6], 0, getColorFromFlag(false, anchorPoint.point.selected), 0, 1, [0,0,0,1], 0);
            circleRender(renderPass, anchorPoint.leftControlHandle.co, 6, getColorFromFlag(false, anchorPoint.leftControlHandle.selected), 0, 1, [0,0,0,1], 0);
            circleRender(renderPass, anchorPoint.rightControlHandle.co, 6, getColorFromFlag(false, anchorPoint.rightControlHandle.selected), 0, 1, [0,0,0,1], 0);
        }
    }
}