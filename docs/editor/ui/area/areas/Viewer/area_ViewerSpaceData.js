import { GPU } from "../../../../utils/webGPU.js";

export class ViewerSpaceData {
    constructor() {
        this.mode = "オブジェクト";
        this.modes = {
            "": ["オブジェクト"],
            "GraphicMesh": ["オブジェクト","メッシュ編集","頂点メーション編集"],
            "Armature": ["オブジェクト","ボーン編集", "ボーンアニメーション編集"],
            "BezierModifier": ["オブジェクト","ベジェ編集", "頂点アニメーション編集"],
        };
        this.tools = ["select", "move", "resize", "rotate", "remove", "append"];
        this.useTool = "select";
        this.smooth = false;

        this.proportionalMetaData = {
            use: false,
            type: "リニア",
            size: 100,
        }

        this.weightPaintMetaData = {
            weightBlockIndex: 0,
            bezierType: 0,
            weightValue: 1,
            decayType: "ミックス",
            decaySize: 50,
        }

        this.selectabilityAndVisbility = {
            graphicMesh: {
                visible: true,
                select: true,
            },
            armature: {
                visible: true,
                select: true,
            },
            bezierModifier: {
                visible: true,
                select: true,
            }
        };

        this.overlays = {
            guides: {
                grid: true,
            }
        };

        this.visualSettings = {
            mesh: {
                vertexSize: 10,
                edgeSize: 2,
            },
            bone: {
                vertexSize: 0.05,
                boneSize: 0.05,
                boneSectionRatio: 0.1,
            },
            bezier: {
                vertexSize: 10,
                curveSize: 3,
            }
        };
        this.GPUDataForVisualSettings = {
            mesh: {
                buffer: GPU.createUniformBuffer(4 * 2, [this.visualSettings.mesh.vertexSize, this.visualSettings.mesh.manualEdgesize], ["f32"]),
                group: null,
            },
            bone: {
                buffer: GPU.createUniformBuffer(4 * 3, [this.visualSettings.bone.vertexSize, this.visualSettings.bone.boneSize, this.visualSettings.bone.boneSectionRatio], ["f32"]),
                group: null,
            },
            bezier: {
                buffer: GPU.createUniformBuffer(4 * 2, [this.visualSettings.bezier.vertexSize, this.visualSettings.bezier.curveSize], ["f32"]),
                group: null,
            }
        };

        this.GPUDataForVisualSettings.bone.group = GPU.createGroup(GPU.getGroupLayout("VFu"), [this.GPUDataForVisualSettings.bone.buffer]);
        this.GPUDataForVisualSettings.mesh.group = GPU.createGroup(GPU.getGroupLayout("VFu"), [this.GPUDataForVisualSettings.mesh.buffer]);
        this.GPUDataForVisualSettings.bezier.group = GPU.createGroup(GPU.getGroupLayout("VFu"), [this.GPUDataForVisualSettings.bezier.buffer]);

        this.areas = [];

        this.weightBezierType = 0;
    }
}