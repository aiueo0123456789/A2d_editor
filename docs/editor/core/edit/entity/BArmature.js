import { app } from "../../../../main.js";
import { circleRender, dottedLineRender, triangleRender } from "../../../ui/area/areas/Viewer/Viewer.js";
import { MathVec2 } from "../../../utils/mathVec.js";
import { createArrayN, createArrayNAndFill, roundUp } from "../../../utils/utility.js";
import { GPU } from "../../../utils/webGPU.js";
import { Armature } from "../../entity/Armature.js";
import { BKeyframeBlockManager } from "./BKeyframeBlockManager.js";

class Vert {
    constructor(data) {
        this.co = [...data.co];
        this.typeIndex = data.typeIndex;
        this.selected = false;
    }

    setCo(co) {
        this.co = [...co];
    }
}

class Bone {
    constructor(data) {
        this.name = data.name;
        /** @type {Bone} */
        this.parent = data.parent;
        this.headVertex = new Vert(data.headVertex);
        this.tailVertex = new Vert(data.tailVertex);

        this.physics = data.physics;

        this.color = data.color;

        this.keyframeBlocks = data.keyframeBlocks ? data.keyframeBlocks : createArrayN(6).map(() => app.scene.objects.createAndAppendObject({type: "KeyframeBlock"}));
    }

    get polygon() {
        const size = 0.04;
        const ratio = 0.1;

        let position1 = this.headVertex.co;
        let position2 = this.tailVertex.co;
        let sub = MathVec2.subR(position2, position1);
        let normal = MathVec2.normalizeR([-sub[1], sub[0]]); // 仮の法線
        let sectionPosition = MathVec2.mixR(position1, position2, ratio);

        let k = MathVec2.scaleR(normal, size * MathVec2.lengthR(sub));
        const result = [];
        result.push(position1);
        result.push(MathVec2.subR(sectionPosition, k));
        result.push(MathVec2.addR(sectionPosition, k));
        result.push(position2);
        return result;
    }

    get selected() {
        return this.headVertex.selected && this.tailVertex.selected;
    }

    get depth() {
        if (this.parent) return this.parent.depth + 1;
        else return 0;
    }
}

export class BArmature {
    static createBone(head, tail, parent = null) {
        return new Bone({name: "名称未設定", parent: parent, headVertex: {co: head}, tailVertex: {co: tail}, color: [0,0,0,1], physics: createArrayNAndFill(13, 0)});
    }

    constructor() {
        /** @type {Armature} */
        this.object = null;
        /** @type {Bone[]} */
        this.bones = [];
        this.activeBone = null;
    }

    deleteBone(bone) {
        if (this.bones.includes(bone)) {
            const deleteIndex = this.bones.indexOf(bone);
            this.bones.splice(deleteIndex, 1);
            return deleteIndex;
        } else {
            return false;
        }
    }

    appendBone(bone) {
        if (bone instanceof Bone && !this.bones.includes(bone)) {
            this.bones.push(bone);
            return true;
        } else {
            return false;
        }
    }

    insertBone(index, bone) {
        if (bone instanceof Bone && !this.bones.includes(bone)) {
            this.bones.splice(index, 0, bone);
            return true;
        } else {
            return false;
        }
    }

    get id() {
        return this.object.id;
    }

    // 頂点の参照からボーンを見つける
    getBoneByVertex(vertex) {
        return this.bones.filter(bone => bone.headVertex === vertex || bone.tailVertex === vertex)[0];
    }

    get verticesSelectData() {
        return this.vertices.map(vertex => vertex.selected);
    }

    get bonesSelectData() {
        return this.bones.map(bone => bone.selected);
    }

    get vertices() {
        return this.bones.map(bone => [bone.headVertex, bone.tailVertex]).flat();
    }

    getBoneIndex(bone) {
        return this.bones.indexOf(bone);
    }

    getBoneChildren(parent) {
        return this.bones.filter(bone => bone.parent == parent);
    }

    getVertexIndexByVertex(vertex) {
        return this.vertices.indexOf(vertex);
    }

    selectedClear() {
        this.vertices.forEach(vertex => {
            vertex.selected = false;
            GPU.writeBuffer(this.vertexSelectedBuffer, GPU.createBitData([0], ["u32"]), this.getVertexIndexByVertex(vertex) * 4);
        });
        this.activeBone = null;
        // this.updateGPUData();
    }

    selectVertices(/** @type {Array} */ indexs) {
        indexs.forEach(index => {
            this.vertices[index].selected = true;
            GPU.writeBuffer(this.vertexSelectedBuffer, GPU.createBitData([1], ["u32"]), index * 4);
        });
        // this.updateGPUData();
    }

    selectBones(/** @type {Array} */ indexs) {
        indexs.forEach(index => {
            this.activeBone = this.bones[index];
            this.selectVertices([index * 2, index * 2 + 1]); // ヘッドとテールを選択
        });
        // this.updateGPUData();
    }

    get selectedVertices() {
        return this.vertices.filter(vert => vert.selected);
    }

    get selectedBones() {
        return this.bones.filter(bone => bone.selected);
    }

    get verticesNum() {
        return this.vertices.length;
    }

    get bonesNum() {
        return this.bones.length;
    }

    updateGPUData() {
        this.verticesBuffer = GPU.createStorageBuffer(roundUp(this.vertices.length * 2 * 4, 2 * 4), this.vertices.map(vertex => vertex.co).flat(), ["f32", "f32"]);
        // this.relatedBuffer = GPU.createStorageBuffer(roundUp(this.vertices.length * 2 * 4, 2 * 4), this.vertices.map(vertex => vertex.co).flat(), ["f32", "f32"]);
        this.vertexSelectedBuffer = GPU.createStorageBuffer(roundUp(this.vertices.length * 4, 4), this.vertices.map(vertex => vertex.selected ? 1 : 0), ["u32"]);
        this.boneColorsBuffer = GPU.createStorageBuffer(roundUp(this.bones.length * 4 * 4, 4 * 4), this.bones.map(bone => bone.color).flat(), ["f32", "f32", "f32", "f32"]);
        this.r = GPU.createStorageBuffer(roundUp(this.bones.length * 4, 4), this.bones.map(bone => 1), ["u32"]);
        this.renderingGroup = GPU.createGroup(GPU.getGroupLayout("Vsr_VFsr_Vsr_Vsr"), [this.verticesBuffer, this.boneColorsBuffer, this.vertexSelectedBuffer, this.r]);
    }

    get root() {
        return this.bones.filter(bone => bone.parent == null);
    }

    async fromArmature(/** @type {Armature} */object) {
        console.log(object)
        const armatureData = app.scene.runtimeData.armatureData;
        this.object = object;
        const [coordinates, colors, physics] = await Promise.all([
            armatureData.baseVertices.getObjectData(object),
            armatureData.colors.getObjectData(object),
            armatureData.physicsData.getObjectData(object),
        ]);
        const createBones = (children, parent) => {
            for (const childData of children) {
                const boneIndex = childData.index;
                const bone = new Bone({name: object.boneMetaDatas[boneIndex].name, parent: parent, headVertex: {co: coordinates[boneIndex].slice(0,2)}, tailVertex: {co: coordinates[boneIndex].slice(2,4)}, color: colors[boneIndex], physics: physics[boneIndex].slice(0, 13), keyframeBlocks: object.keyframeBlockManager.keyframeBlocks.slice(boneIndex * 6, boneIndex * 6 + 6)});
                this.bones[boneIndex] = bone;
                createBones(object.getBoneChildren(childData), bone);
            }
        }
        createBones(object.root, null);
        this.updateGPUData();
    }

    toRutime() {
        this.object.boneMetaDatas.length = 0;
        this.object.verticesData.length = 0;
        this.object.allPhysics.length = 0;
        this.object.allBone.length = 0;
        this.object.allBoneWorldMatrix.length = 0;
        this.object.allColors.length = 0;
        this.object.root.length = 0;
        this.object.animationsData.length = 0;
        const keyframeBlocks = [];
        for (const bone of this.bones) {
            const parent = bone.parent;
            this.object.boneMetaDatas.push(Armature.createBoneMetaData(bone.name, this.getBoneIndex(bone), this.getBoneIndex(parent), bone.depth, false));
            const boneData = Armature.getLocalBoneDataByVertices(bone.headVertex.co, bone.tailVertex.co, parent?.headVertex?.co, parent?.tailVertex?.co);
            this.object.verticesData.push(...bone.headVertex.co);
            this.object.verticesData.push(...bone.tailVertex.co);
            this.object.allPhysics.push(...bone.physics,
                0, 1, 0,

                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0, 0,
                0,
                0,
                0,
                0,
            );
            this.object.allBone.push(...boneData.bone);
            this.object.allBoneWorldMatrix.push(...boneData.worldMatrix.flat());
            this.object.allColors.push(...bone.color);
            this.object.animationsData.push(0,0,0,0,0,0); // x y sx sy r l
            keyframeBlocks.push(...bone.keyframeBlocks);
        }
        this.object.keyframeBlockManager.setKeyframeBlocks(createArrayN(this.object.animationsData.length), keyframeBlocks);
        const armatureData = app.scene.runtimeData.armatureData;
        armatureData.update(this.object);
    }

    render(renderPass) {
        for (const bone of this.bones) {
            const color = this.activeBone === bone ? [1,1,1,1] : bone.selected ? [1,0.5,0,1] : bone.color;
            const hcolor = this.activeBone === bone ? [1,1,1,1] : bone.headVertex.selected ? [1,0.5,0,1] : bone.color;
            const tcolor = this.activeBone === bone ? [1,1,1,1] : bone.tailVertex.selected ? [1,0.5,0,1] : bone.color;
            triangleRender(renderPass, bone.polygon[0], bone.polygon[1], bone.polygon[2], color, 0);
            triangleRender(renderPass, bone.polygon[3], bone.polygon[1], bone.polygon[2], color, 0);
            circleRender(renderPass, bone.headVertex.co, 4, hcolor, 1, 0);
            circleRender(renderPass, bone.tailVertex.co, 4, tcolor, 1, 0);
            if (bone.parent) {
                dottedLineRender(renderPass, bone.parent.headVertex.co, bone.headVertex.co, 1, 5, 5, [1,0,0,1], 1);
            }
        }
    }
}