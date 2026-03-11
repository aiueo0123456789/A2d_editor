import { app } from "../../../../main.js";
import { circleRender, triangleRender } from "../../../ui/area/areas/Viewer/Viewer.js";
import { MathMat3x3 } from "../../../utils/mathMat.js";
import { MathVec2 } from "../../../utils/mathVec.js";
import { changeParameter, range, roundUp } from "../../../utils/utility.js";
import { GPU } from "../../../utils/webGPU.js";
import { Armature } from "../../entity/Armature.js";
import { KeyframeBlockManager } from "../../entity/KeyframeBlockManager.js";
import { BBezierWeight } from "./BBezierWeight.js";
import { BKeyframeBlockManager } from "./BKeyframeBlockManager.js";
import { BMeshWeight } from "./BMeshWeight.js";

class Bone {
    constructor(data) {
        this.name = data.name;
        /** @type {Bone} */
        this.parent = data.parent;

        this.selected = false;
        this.physics = data.physics;

        this.color = data.color;

        this.baseWorldBoneData = data.baseWorldBoneData;
        this.baseWorldMatrix = Armature.getMatrixByBoneData(this.baseWorldBoneData);
        if (this.parent) {
            this.baseLocalMatrix = Armature.getLocalMatrixByWorldMatrixs(this.baseWorldMatrix, this.parent.baseWorldMatrix);
        } else {
            this.baseLocalMatrix = Armature.getLocalMatrixByWorldMatrixs(this.baseWorldMatrix, MathMat3x3.createMatrix());
        }
        this.baseLocalBoneData = Armature.BoneDataByArray(Armature.getBoneDataByMatrix(this.baseLocalMatrix, this.baseWorldBoneData.l));
        this.animationLocalBoneData = data.animationLocalBoneData;
        /** @type {BKeyframeBlockManager} */
        this.keyframeBlockManager = data.keyframeBlockManager;
    }

    get polygon() {
        const size = 0.04;
        const ratio = 0.1;

        let position1 = this.headVertex;
        let position2 = this.tailVertex;
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

    get poseWorldBoneData() {
        return Armature.getBoneDataByMatrix(this.poseWorldMatrix, this.baseLocalBoneData.l);
    }

    get poseLocalBoneData() {
        return Armature.addBoneDataR(this.baseLocalBoneData, this.animationLocalBoneData);
    }

    get headVertex() {
        return this.poseWorldMatrix[2].slice(0,2);
    }
    get tailVertex() {
        return MathVec2.addR(this.poseWorldMatrix[2].slice(0,2), MathVec2.scaleR(this.poseWorldMatrix[0].slice(0,2), this.baseWorldBoneData.l));
    }

    get poseLocalMatrix() {
        return Armature.getMatrixByBoneData(this.poseLocalBoneData);
    }
    get poseWorldMatrix() {
        if (this.parent) {
            return MathMat3x3.multiplyMat3x3(this.poseLocalMatrix, this.parent.poseWorldMatrix);
        } else { // 親がない場合
            return MathMat3x3.multiplyMat3x3(this.poseLocalMatrix, MathMat3x3.createMatrix());
        }
    }
}

export class BArmatureAnimation {
    constructor(mode) {
        this.mode = mode;
        /** @type {Armature} */
        this.object = null;
        /** @type {Bone[]} */
        this.bones = [];

        this.activeBone = null;
    }

    get id() {
        return this.object.id;
    }

    get bonesSelectData() {
        return this.bones.map(bone => bone.selected);
    }

    get selectedBones() {
        return this.bones.filter(bone => bone.selected);
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

    selectedClear() {
        this.bones.forEach(bone => {
            bone.selected = false;
            GPU.writeBuffer(this.boneSelectedBuffer, GPU.createBitData([0], ["u32"]), this.getBoneIndex(bone) * 4);
        });
        this.activeBone = null;
        // this.updateGPUData();
    }

    selectBones(/** @type {Array} */ indexs) {
        indexs.forEach(index => {
            this.bones[index].selected = true;
            this.activeBone = this.bones[index];
            if (this.mode == "weightPaint") {
                changeParameter(app.appConfig.areasConfig["Viewer"].weightPaintMetaData, "weightBlockIndex", this.getBoneIndex(this.activeBone));
                app.scene.editData.allEditObjects.forEach(editObject => (editObject instanceof BMeshWeight || editObject instanceof BBezierWeight) && editObject.updateGPUData()); // 編集中のメッシュの表示用データを更新
            }
            GPU.writeBuffer(this.boneSelectedBuffer, GPU.createBitData([1], ["u32"]), index * 4);
        });
        // this.updateGPUData();
    }

    get verticesNum() {
        return this.vertices.length;
    }

    get bonesNum() {
        return this.bones.length;
    }

    updateGPUData() {
        // 実行データの更新
        this.object.poseData.length = 0;
        for (const bone of this.bones) {
            this.object.poseData.push(
                bone.animationLocalBoneData.x,
                bone.animationLocalBoneData.y,
                bone.animationLocalBoneData.sx,
                bone.animationLocalBoneData.sy,
                bone.animationLocalBoneData.r,
                bone.animationLocalBoneData.l,
            );
        }
    }

    get root() {
        return this.bones.filter(bone => bone.parent == null);
    }

    async fromArmature(/** @type {Armature} */ object) {
        const armatureData = app.scene.runtimeData.armatureData;
        this.object = object;
        console.log(object);
        const [coordinates, colors, physics] = await Promise.all([
            armatureData.baseVertices.getObjectData(object),
            armatureData.colors.getObjectData(object),
            armatureData.physicsData.getObjectData(object),
        ]);
        const createBones = (children, parent) => {
            for (const childData of children) {
                const boneIndex = childData.index;
                // 編集用キーフレームブロックマネージャーの作成
                const animationLocalBoneData = Armature.BoneDataByArray(object.poseData.slice(boneIndex * 6, boneIndex * 6 + 6));
                const keyframeBlockManager = new KeyframeBlockManager({
                    object: animationLocalBoneData,
                    parameters: ["x", "y", "sx", "sy", "r", "l"],
                    keyframeBlocks: object.keyframeBlockManager.keyframeBlocks.slice(boneIndex * 6, boneIndex * 6 + 6),
                });
                const bKeyframeBlockManager = new BKeyframeBlockManager();
                bKeyframeBlockManager.fromKeyframeBlockManager(keyframeBlockManager);

                const bone = new Bone({
                    name: object.boneMetaDatas[boneIndex].name,
                    parent: parent,
                    baseWorldBoneData: Armature.BoneDataByArray(Armature.getWorldBoneDataByVertices(coordinates[boneIndex].slice(0,2), coordinates[boneIndex].slice(2,4))),
                    color: colors[boneIndex],
                    physics: physics[boneIndex].slice(0, 13),
                    animationLocalBoneData: animationLocalBoneData,
                    keyframeBlockManager: bKeyframeBlockManager
                });
                this.bones[boneIndex] = bone;
                createBones(object.getBoneChildren(childData), bone);
            }
        }
        createBones(object.root, null);
        this.updateGPUData();
        console.log(await armatureData.baseBone.getObjectData(object));
        console.log(await armatureData.baseBoneMatrix.getObjectData(object));
        console.log(await armatureData.renderingBoneMatrix.getObjectData(object));
    }

    toRutime() {
        const keyframeBlocks = [];
        this.object.physicsParametersData.length = 0;
        this.object.poseData.length = 0;
        for (const bone of this.bones) {
            this.object.physicsParametersData.push(...bone.physics,
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
            this.object.poseData.push(
                bone.animationLocalBoneData.x,
                bone.animationLocalBoneData.y,
                bone.animationLocalBoneData.sx,
                bone.animationLocalBoneData.sy,
                bone.animationLocalBoneData.r,
                bone.animationLocalBoneData.l,
            );
            // keyframeBlockManagerは仮だからなかのkeyframeBlockをまとめながらキーフレームのランタイムデータを更新
            keyframeBlocks.push(...bone.keyframeBlockManager.keyframeBlocks.map(keyframeBlock => {
                keyframeBlock.toRuntime();
                return keyframeBlock.keyframeBlock;
            }));
        }
        console.log(keyframeBlocks)
        this.object.keyframeBlockManager.setKeyframeBlocks(range(0, keyframeBlocks.length), keyframeBlocks);
        const armatureData = app.scene.runtimeData.armatureData;
        armatureData.update(this.object);
    }

    gizumoRender(renderPass) {
        for (const bone of this.bones) {
            const color = this.activeBone === bone ? [1,1,1,1] : bone.selected ? [1,0.5,0,1] : bone.color;
            triangleRender(renderPass, bone.polygon[0], bone.polygon[1], bone.polygon[2], color, 0);
            triangleRender(renderPass, bone.polygon[3], bone.polygon[1], bone.polygon[2], color, 0);
        }
    }
}