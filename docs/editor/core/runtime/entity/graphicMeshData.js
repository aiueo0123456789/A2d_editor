import { Application } from "../../../app/app.js";
import { objectToNumber } from "../../../app/scene/scene.js";
import { UnfixedReference } from "../../../utils/objects/util.js";
import { changeParameter } from "../../../utils/utility.js";
import { GPU } from "../../../utils/webGPU.js";
import { GraphicMesh } from "../../entity/graphicMesh.js";
import { BufferManager } from "../bufferManager.js";
import { RuntimeDataBase } from "../runtimeDataBase.js";

export class GraphicMeshData extends RuntimeDataBase {
    constructor(/** @type {Application} */ app) {
        super(app, {"": "allocationOffset", "shapeKeysNum": "shapeKeyWeightsOffset", "shapeKeysNum*verticesNum": "shapeKeysOffset", "meshesNum": "meshesOffset", "verticesNum": "verticesOffset"});
        this.renderingVertices = new BufferManager(this, "renderingVertices", ["f32","f32"], "verticesNum");
        this.baseVertices = new BufferManager(this, "baseVertices", ["f32","f32"], "verticesNum");
        this.meshes = new BufferManager(this, "meshes", ["u32","u32","u32"], "meshesNum");
        this.uv = new BufferManager(this, "uv", ["f32","f32"], "verticesNum");
        this.shapeKeys = new BufferManager(this, "shapeKeys", ["f32","f32"], "shapeKeysNum * verticesNum");
        this.shapeKeyWights = new BufferManager(this, "shapeKeyWights", ["f32"], "shapeKeysNum");
        this.weightBlocks = new BufferManager(this, "weightBlocks", ["u32","u32","u32","u32","f32","f32","f32","f32"], "verticesNum");
        this.allocations = new BufferManager(this, "allocations", ["u32","u32","u32","u32","u32","u32","u32","u32","u32","u32"], "1");
        this.uvOffsets = new BufferManager(this, "uvOffset", ["f32","f32","f32","f32"], "1");
        this.renderingMetaDatas = new BufferManager(this, "renderingMetaDatas", ["f32" /* 透明度 */, "f32", /* マスクタイプ */], "1");
        this.textureAtls = null;
        this.textureAtlsView = null;
        this.renderGroup = null;
        this.renderingGizumoGroup = null;
        this.shapeKeyApplyGroup = null;

        this.write = false;

        this.offsetCreate();
    }

    getObjectDataForGPU(/** @type {GraphicMesh} */graphicMesh) {
        const map = new Map();
        map.set(this.baseVertices, graphicMesh.allVertices);
        map.set(this.uv, graphicMesh.allUVs);
        map.set(this.weightBlocks, graphicMesh.allWeightBlocks);
        map.set(this.meshes, graphicMesh.allMeshes);
        map.set(this.shapeKeys, graphicMesh.allShapeKeys);
        map.set(this.shapeKeyWights, null);
        map.set(this.uvOffsets, null);
        map.set(this.renderingVertices, graphicMesh.allVertices);
        map.set(this.renderingMetaDatas, [1, 0]);
        return map;
    }

    getAllocationData(/** @type {GraphicMesh} */graphicMesh) {
        if (!graphicMesh.parent || graphicMesh.parent instanceof UnfixedReference) return new Uint32Array([graphicMesh.runtimeOffsetData.start.allocationOffset, 0, 0, graphicMesh.runtimeOffsetData.start.verticesOffset, graphicMesh.runtimeOffsetData.start.meshesOffset, graphicMesh.runtimeOffsetData.start.shapeKeysOffset, graphicMesh.runtimeOffsetData.start.shapeKeyWeightsOffset, graphicMesh.verticesNum, graphicMesh.meshesNum, graphicMesh.shapeKeysNum]);
        else return new Uint32Array([graphicMesh.runtimeOffsetData.start.allocationOffset, objectToNumber[graphicMesh.parent.type], graphicMesh.parent.runtimeOffsetData.start.allocationOffset, graphicMesh.runtimeOffsetData.start.verticesOffset, graphicMesh.runtimeOffsetData.start.meshesOffset, graphicMesh.runtimeOffsetData.start.shapeKeysOffset, graphicMesh.runtimeOffsetData.start.shapeKeyWeightsOffset, graphicMesh.verticesNum, graphicMesh.meshesNum, graphicMesh.shapeKeysNum]);
    }

    updateAllocationData(/** @type {GraphicMesh} */graphicMesh) {
        // 頂点オフセット, アニメーションオフセット, ウェイトオフセット, 頂点数, 最大アニメーション数, 親の型, 親のインデックス, パディング
        const allocationData = this.getAllocationData(graphicMesh);
        GPU.writeBuffer(this.allocations.buffer, allocationData, graphicMesh.runtimeOffsetData.start.allocationOffset * this.allocations.structByteSize);
        GPU.writeBuffer(graphicMesh.objectDataBuffer, allocationData);
    }

    setGroup() {
        if (this.order.length) {
            const result = GPU.createTextureAtlas(this.order.map(object => object.texture.texture));
            GPU.writeBuffer(this.uvOffsets.buffer, GPU.createBitData(result.uvOffset.flat(), ["f32"]), 0);
            changeParameter(this, "textureAtls", result.texture)
            this.textureAtlsView = this.textureAtls.createView();
            this.renderGroup = GPU.createGroup(GPU.getGroupLayout("Vsr_Vsr_Vsr_Vsr_Ft"), [this.renderingVertices.buffer, this.uv.buffer, this.uvOffsets.buffer, this.renderingMetaDatas.buffer, this.textureAtlsView ? this.textureAtlsView : GPU.isNotTexture.createView()]); // 表示用
            this.shapeKeyApplyGroup = GPU.createGroup(GPU.getGroupLayout("Csrw_Csr_Csr_Csr_Csr"), [this.renderingVertices.buffer, this.baseVertices.buffer, this.shapeKeys.minimumOrMoreBuffer, this.shapeKeyWights.minimumOrMoreBuffer, this.allocations.buffer]); // アニメーション用
            this.parentApplyGroup = GPU.createGroup(GPU.getGroupLayout("Csrw_Csr_Csr"), [this.renderingVertices.buffer, this.weightBlocks.buffer, this.allocations.buffer]); // 親の変形を適応するた
        } else {
            this.renderGroup = null; // 表示用
            this.renderingGizumoGroup = null; // 表示用
            this.shapeKeyApplyGroup = null; // アニメーション用
            this.parentApplyGroup = null; // 親の変形を適応するた
        }
    }
}