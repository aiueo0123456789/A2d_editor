import { ConvertCoordinate } from '../../../../utils/convertCoordinate.js';
import { resizeObserver } from '../../../../utils/ui/resizeObserver.js';
import { device, format, GPU } from "../../../../utils/webGPU.js";
import { calculateLocalMousePosition, chunk, distancePointToSegment, hitTestPointTriangle, isEmpty, isFunction, isPlainObject, loadFile, range } from '../../../../utils/utility.js';
import { MathVec2 } from '../../../../utils/mathVec.js';
import { Camera } from '../../../../core/entity/Camera.js';
import { InputManager } from '../../../../app/InputManager.js';
import { ViewerSpaceData } from './ViewerSpaceData.js';
import { Particle } from '../../../../core/entity/Particle.js';
import { app } from '../../../../../main.js';
import { SelectVerticesCommand } from '../../../../commands/SelectVerticesCommand.js';
import { useEffect } from '../../../../utils/ui/util.js';
import { BBezier } from '../../../../core/edit/entity/BBezier.js';
import { SelectBonesCommand } from '../../../../commands/SelectBonesCommand.js';
import { ActiveVertexPanel } from './toolBar/panel/vertex.js';
import { ActiveBonePanelFromBA, ActiveBonePanelFromBAA } from './toolBar/panel/bone.js';
import { ActiveMeshPanel } from './toolBar/panel/mesh.js';
import { ActiveEdgePanel } from './toolBar/panel/edge.js';
import { WeightPaintPanel } from './toolBar/panel/weight.js';
import { BArmatureAnimation } from '../../../../core/edit/entity/BArmatureAnimation.js';
import { BArmature } from '../../../../core/edit/entity/BArmature.js';
import { BBezierShapeKey } from '../../../../core/edit/entity/BBezierShapeKey.js';
import { BMeshShapeKey } from '../../../../core/edit/entity/BMeshShapeKey.js';
import { BMesh } from '../../../../core/edit/entity/BMesh.js';
import { SelectOnlyEdgeCommand } from '../../../../commands/SelectOnlyEdgeCommand.js';
import { ModalOperator } from '../../../../operators/ModalOperator.js';
import { TranslateModal } from '../../../modals/Translate.js';
import { SideBarOperator } from '../../../../operators/SideBarOperator.js';
import { RotateModal } from '../../../modals/Rotate.js';
import { BoneExtrudeMoveModal } from '../../../modals/BoneExtrudeMove.js';
import { ChangeParentModal } from '../../../modals/ChangeParent.js';
import { ResizeModal } from '../../../modals/Resize.js';
import { WeightPaintModal } from '../../../modals/weightPaint.js';
import { KeyframeInsertModal } from '../../../modals/KeyframeInsertModal.js';
import { ChangeBlendShapeValueCommand } from '../../../../commands/object/blendShape.js';
import { BlendShape } from '../../../../core/entity/BlendShape.js';
import { BBlendShape } from '../../../../core/edit/entity/BBlendShape.js';
import { Flag, FlagOperator } from '../../../../operators/FlagOperator.js';
import { BezierExtrudeMoveModal } from '../../../modals/BezierExtrudeMove.js';
import { JoinObjectCommand } from '../../../../commands/JoinObjectCommand.js';
import { DeleteObjectCommand } from '../../../../commands/DeleteObjectCommand.js';
import { CreateObjectCommand } from '../../../../commands/CreateObjectCommand.js';
import { CopyObjectCommand } from '../../../../commands/CopyObjectCommand.js';
import { DeleteBoneCommand } from '../../../../commands/object/bone.js';
import { Command } from '../../../../operators/CommandOperator.js';
import { ChangeEditModeCommand } from '../../../../commands/ChangeEditModeCommand.js';
import { GraphicMesh } from '../../../../core/entity/GraphicMesh.js';
import { BezierModifier } from '../../../../core/entity/BezierModifier.js';

// レイキャストよう
const boneHitTestPipeline = GPU.createComputePipeline([GPU.getGroupLayout("Csrw_Csr_Cu_Cu_Cu")], await loadFile("./editor/shader/compute/select/armature/hitTest.wgsl"));
const bezierModifierHitTestPipeline = GPU.createComputePipeline([GPU.getGroupLayout("Csrw_Csr_Cu_Cu_Cu_Cu")], await loadFile("./editor/shader/compute/select/bezierModifier/hitTest.wgsl"));
const polygonsHitTestPipeline = GPU.createComputePipeline([GPU.getGroupLayout("Csrw_Csr_Csr_Cu_Cu_Cu")], await loadFile("./editor/shader/compute/select/graphicMesh/hitTest.wgsl"));

const selectObjectOutlinePipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("VFu"), GPU.getGroupLayout("Vsr_Vsr_Vsr_Vsr_Ft"), GPU.getGroupLayout("Vu_Fu")], await loadFile("./editor/shader/render/selectObjectOutline/selectObjectOutlineMeshRenderPipeline.wgsl"), [["u"]], "2d", "t", "");
const selectObjectOutlineMixPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("Fts_Ft_Fu")], await loadFile("./editor/shader/render/selectObjectOutline/mix.wgsl"), [], "2d", "s", "");

const devMaskTexturePipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("Fts_Ft")], await loadFile("./editor/shader/render/devMaskTexture.wgsl"), [], "2d", "s", "");
const renderGridPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts")], await fetch('./editor/shader/render/grid.wgsl').then(x => x.text()), [], "2d", "s", "");
const renderPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("Vsr_Vsr_Vsr_Vsr_Ft"), GPU.getGroupLayout("Vu_Vu_Ft")], await loadFile("./editor/shader/render/main.wgsl"), [["u"]], "2d", "t", "");
const renderParticlePipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("Vsr"), GPU.getGroupLayout("Vu")], await loadFile("./editor/shader/render/particleVertex.wgsl"), [], "2d", "s", "");
const maskRenderPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("Vsr_Vsr_Vsr_Vsr_Ft"), GPU.getGroupLayout("Vu")], await loadFile("./editor/shader/render/mask.wgsl"), [["u"]], "mask", "t", "");

const BMSMainRenderPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("Vsr_Vsr_Vsr_Vsr_Vu_Ft")], await loadFile("./editor/shader/render/graphicMesh/bms/main.wgsl"), [], "2d", "t", "");

const BMWMainRenderPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("Vsr_Vsr_Vsr_Vsr_Vu_Ft")], await loadFile("./editor/shader/render/graphicMesh/bmw/main.wgsl"), [], "2d", "t", "");

const BMeshMainRenderPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("Vsr_Vsr_Vsr_Vsr_Vsr_Vsr_Vsr_Vsr_Vsr_Vu_Ft")], await loadFile("./editor/shader/render/graphicMesh/bm/main.wgsl"), [], "2d", "t", "");
const selectObjectOutlineBoneRenderPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("VFu"), GPU.getGroupLayout("Vsr_VFsr"),GPU.getGroupLayout("Vu_Fu")], await loadFile("./editor/shader/render/selectObjectOutline/selectObjectOutlineBoneRenderPipeline.wgsl"), [], "2d", "t", "");
const boneBoneRenderPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("VFu"), GPU.getGroupLayout("Vsr_VFsr"),GPU.getGroupLayout("Vu")], await loadFile("./editor/shader/render/bone/bones.wgsl"), [], "2d", "s", "");

const selectObjectOutlineBezierRenderPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("VFu"), GPU.getGroupLayout("Vsr_Vsr"), GPU.getGroupLayout("Vu_Fu")], await loadFile("./editor/shader/render/selectObjectOutline/selectObjectOutlineBezierRenderPipeline.wgsl"), [], "2d", "s", "");
const bezierModifierRenderPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("VFu"), GPU.getGroupLayout("Vsr_Vsr"),GPU.getGroupLayout("Vu")], await loadFile("./editor/shader/render/bezier/curve.wgsl"), [], "2d", "s", "");

const triangleRenderPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("VFu")], await loadFile("./editor/shader/render/util/triangle.wgsl"), [], "2d", "t", "");
const rectRenderPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("VFu")], await loadFile("./editor/shader/render/util/rect.wgsl"), [], "2d", "s", "");
const dottedLineRenderPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("VFu")], await loadFile("./editor/shader/render/util/dottedLine.wgsl"), [], "2d", "s", "");
const circleRenderPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("VFu")], await loadFile("./editor/shader/render/util/circle.wgsl"), [], "2d", "s", "");
const bezierRenderPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("VFu")], await loadFile("./editor/shader/render/util/bezier.wgsl"), [], "2d", "s", "");
const textRenderPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("VFu"), GPU.getGroupLayout("VFu_Ft")], await loadFile("./editor/shader/render/util/text.wgsl"), [], "2d", "s", "");
const textureRenderPipeline = GPU.createRenderPipelineFromOneFile([GPU.getGroupLayout("VFu_Fts"), GPU.getGroupLayout("VFu_Ft")], await loadFile("./editor/shader/render/util/texture.wgsl"), [], "2d", "t", "");

export function triangleRender(renderPass, pointA, pointB, pointC, color, strokeWidth = 0, strokeColor = [0,0,0,0], isAffectedForZoomStroke = 1, strokePosition = 0) {
    renderPass.setPipeline(triangleRenderPipeline);
    renderPass.setBindGroup(1, GPU.createGroup(GPU.getGroupLayout("VFu"), [
        GPU.createUniformBuffer((17) * 4, [
            pointA[0], pointA[1],
            pointB[0], pointB[1],
            pointC[0], pointC[1],
            ...color,
            strokeWidth,
            ...strokeColor,
            isAffectedForZoomStroke, // 0 1 影響を受けない 影響を受ける
            strokePosition, // 0 -0.5 -1 外側 中間 内側
        ], ["f32"]),
    ]));
    renderPass.draw(3, 1, 0, 0);
}
export function textureRender(renderPass, pointA, texCoordA, pointB, texCoordB, pointC, texCoordC, textureView) {
    renderPass.setPipeline(textureRenderPipeline);
    renderPass.setBindGroup(1, GPU.createGroup(GPU.getGroupLayout("VFu_Ft"), [
        GPU.createUniformBuffer((17) * 4, [
            pointA[0], pointA[1],
            texCoordA[0], texCoordA[1],
            pointB[0], pointB[1],
            texCoordB[0], texCoordB[1],
            pointC[0], pointC[1],
            texCoordC[0], texCoordC[1],
        ], ["f32"]),
        textureView
    ]));
    renderPass.draw(3, 1, 0, 0);
}
export function rectRender(renderPass, position, halfSize, radius, color, isAffectedForZoomSize = 1, strokeWidth = 0, strokeColor = [0,0,0,0], isAffectedForZoomStroke = 1) {
    renderPass.setPipeline(rectRenderPipeline);
    renderPass.setBindGroup(1, GPU.createGroup(GPU.getGroupLayout("VFu"), [
        GPU.createUniformBuffer((16) * 4, [
            position[0],position[1],
            halfSize[0],halfSize[1],
            radius,
            ...color,
            isAffectedForZoomSize,
            strokeWidth,
            ...strokeColor,
            isAffectedForZoomStroke,
        ], ["f32"]),
    ]));
    renderPass.draw(4, 1, 0, 0);
}
export function dottedLineRender(renderPass, start, end, width, size, gap, color, isAffectedForZoomWidth = 1) {
    renderPass.setPipeline(dottedLineRenderPipeline);
    renderPass.setBindGroup(1, GPU.createGroup(GPU.getGroupLayout("VFu"), [
        GPU.createUniformBuffer((16) * 4, [
            start[0],start[1],
            end[0],end[1],
            width,
            size,
            gap,
            ...color,
            isAffectedForZoomWidth,
        ], ["f32"]),
    ]));
    renderPass.draw(4, 1, 0, 0);
}
export function circleRender(renderPass, position, radius, color, isAffectedForZoomRadius = 1, strokeWidth = 0, strokeColor = [0,0,0,0], isAffectedForZoomStroke = 1) {
    renderPass.setPipeline(circleRenderPipeline);
    renderPass.setBindGroup(1, GPU.createGroup(GPU.getGroupLayout("VFu"), [
        GPU.createUniformBuffer((16) * 4, [
            position[0],position[1],
            radius,
            ...color,
            isAffectedForZoomRadius,
            strokeWidth,
            ...strokeColor,
            isAffectedForZoomStroke,
        ], ["f32"]),
    ]));
    renderPass.draw(4, 1, 0, 0);
}
export function bezierRender(renderPass, pointA, controllerA, pointB, controllerB, width, color, isAffectedForZoomWidth = 1) {
    renderPass.setPipeline(bezierRenderPipeline);
    renderPass.setBindGroup(1, GPU.createGroup(GPU.getGroupLayout("VFu"), [
        GPU.createUniformBuffer((16) * 4, [
            pointA[0],pointA[1],
            controllerA[0],controllerA[1],
            pointB[0],pointB[1],
            controllerB[0],controllerB[1],
            width,
            ...color,
            isAffectedForZoomWidth,
        ], ["f32"]),
    ]));
    renderPass.draw(4, 1, 0, 0);
}
export function textRender(renderPass, text, start, position, scale, color, isAffectedForZoomRadius = 1) {
    const textTexture = GPU.getTextTexture(text);
    renderPass.setPipeline(textRenderPipeline);
    renderPass.setBindGroup(1, GPU.createGroup(GPU.getGroupLayout("VFu"), [
        GPU.createUniformBuffer((10) * 4, [
            position[0],position[1],
            ...start,
            scale,
            ...color,
            isAffectedForZoomRadius,
        ], ["f32"]),
    ]));
    renderPass.setBindGroup(2, textTexture.group);
    renderPass.draw(4, 1, 0, 0);
}

const useingSideBarPanelInMode = {
    "メッシュ編集": {
        "頂点": ActiveVertexPanel,
        "メッシュ": ActiveMeshPanel,
        "辺": ActiveEdgePanel,
    },
    "ベジェ編集": {
        "頂点": ActiveVertexPanel,
        "辺": ActiveVertexPanel,
    },
    "ボーン編集": {
        "頂点": ActiveVertexPanel,
        "ボーン": ActiveBonePanelFromBA,
    },
    "ボーンアニメーション編集": {
        "ボーン": ActiveBonePanelFromBAA,
    },
    "メッシュウェイト編集": {
        "ウェイトペイント": WeightPaintPanel,
    }
}

export class Area_Viewer {
    constructor(area) {
        this.pixelDensity = 4;
        this.jTag = area.jTag;

        /** @type {ViewerSpaceData} */
        this.spaceData = app.appConfig.areasConfig["Viewer"];

        this.spaceData.areas.push(this);

        this.struct = {
            inputObject: {"context": app.context, "scene": app.scene, "spaceData": this.spaceData},
            DOM: [
                {tagType: "gridBox", style: "width: 100%; height: 100%;", axis: "r", allocation: "auto 1fr", children: [
                    {tagType: "gridBox", class: "minLimitClear header", axis: "c", allocation: "auto 1fr auto 1fr auto", children: [
                        {tagType: "html", tag: "div", style: "display: flex; gap: 10px; width: fit-content; height: 100%; alignItems: center;", children: [
                            {tagType: "input", type: "radio", value: "", onChange: () => {}, inputs: [{value: "1", look: {check: "check", uncheck: "uncheck"}}, {value: "2", look: {check: "check", uncheck: "uncheck"}}, {value: "3", look: {check: "check", uncheck: "uncheck"}}]},
                            {tagType: "path", src: "{context/activeObject}", updateTarget: "{context/[S]activeObject}", children: [
                                {tagType: "if", formula: {src: "{/type}", conditions: "==", value: "GraphicMesh"},
                                    true: [
                                        {tagType: "select", value: (value) => {app.context.setModeForSelected(value)}, sourceObject: ["オブジェクト", "メッシュ編集", "メッシュウェイト編集", "メッシュシェイプキー編集"], options: {initValue: "オブジェクト"}},
                                    ], false: [
                                        {tagType: "if", formula: {src: "{/type}", conditions: "==", value: "Armature"},
                                            true: [
                                                {tagType: "select", value: (value) => {app.context.setModeForSelected(value)}, sourceObject: ["オブジェクト", "ボーン編集", "ボーンアニメーション編集"], options: {initValue: "オブジェクト"}},
                                            ], false: [
                                                {tagType: "if", formula: {src: "{/type}", conditions: "==", value: "BezierModifier"},
                                                    true: [
                                                        {tagType: "select", value: (value) => {app.context.setModeForSelected(value)}, sourceObject: ["オブジェクト", "ベジェ編集", "ベジェウェイト編集", "ベジェシェイプキー編集"], options: {initValue: "オブジェクト"}},
                                                    ], false: [
                                                        {tagType: "if", formula: {src: "{/type}", conditions: "==", value: "BlendShape"},
                                                            true: [
                                                                {tagType: "select", value: (value) => {app.context.setModeForSelected(value)}, sourceObject: ["オブジェクト", "ブレンドシェイプ編集"], options: {initValue: "オブジェクト"}},
                                                            ], false: [
                                                                {tagType: "select", value: (value) => {app.context.setModeForSelected(value)}, sourceObject: ["オブジェクト"], options: {initValue: "オブジェクト"}},
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ],
                                }
                            ], errorChildren: [
                                {tagType: "select", sourceObject: ["オブジェクト"], options: {initValue: "オブジェクト"}},
                            ]},
                            {tagType: "menu", title: "ビュー", struct: [
                                {label: "カメラ", children: [
                                    {label: "すべてを表示", children: []},
                                ]},
                            ]},
                            {tagType: "menu", title: "選択", struct: [
                                {label: "すべて選択", children: [], onClick: () => {app.context.selectAll()}},
                                {label: "属性選択", children: [], onClick: () => {app.context.selectByAttribute()}},
                                {label: "選択解除", children: []},
                                {label: "反転", children: []},
                                {label: "ランダム選択", children: []},
                            ]},
                            {tagType: "menu", title: "追加", struct: [
                                {label: "メッシュ", children: [
                                    {label: "板"},
                                    {label: "サークル"},
                                ]},
                                {label: "ベジェ", children: [
                                    {label: "板"},
                                    {label: "サークル"},
                                ]},
                            ]},
                        ]},
                        {tagType: "padding", size: "10px"},
                        {tagType: "path", src: "context", updateTarget: "{context/[S]currentMode}", children: [
                            {tagType: "if", formula: {src: "{/currentMode}", conditions: "==", value: "メッシュウェイト編集"},
                            true: [
                                {tagType: "popoverMenu", label: "weightPaintMetaData", children: [
                                    {tagType: "label", text: "weight", children: [
                                        {tagType: "input", value: "{spaceData/weightPaintMetaData/weightValue}", type: "number", min: 0, max: 1, step: 0.01},
                                    ]},
                                    {tagType: "label", text: "decaySize", children: [
                                        {tagType: "input", value: "{spaceData/weightPaintMetaData/decaySize}", type: "number", min: 0, max: 1000, step: 0.01},
                                    ]},
                                    {tagType: "label", text: "decayType", children: [
                                        {tagType: "select", value: "{spaceData/weightPaintMetaData/decayType}", sourceObject: ["ミックス","最大","最小"], options: {initValue: "{spaceData/weightPaintMetaData/decayType}"}},
                                    ]},
                                    {tagType: "label", text: "bezierType", children: [
                                        {tagType: "select", value: "{spaceData/weightPaintMetaData/bezierType}", sourceObject: [0,1], options: {initValue: "0"}},
                                    ]},
                                ]},
                            ], false: [
                                {tagType: "popoverMenu", label: "proportionalMetaData", children: [
                                    {tagType: "label", text: "use", attributes: ["after"], children: [
                                        {tagType: "input", type: "checkbox", checked: "{spaceData/proportionalMetaData/use}", look: {check: "check", uncheck: "uncheck"}},
                                    ]},
                                    {tagType: "label", text: "type", attributes: ["after"], children: [
                                        {tagType: "select", value: "{spaceData/proportionalMetaData/type}", sourceObject: ["リニア", "逆二乗", "一定"], options: {initValue: "{spaceData/proportionalMetaData/type}"}},
                                    ]},
                                    {tagType: "label", text: "size", attributes: ["after"], children: [
                                        {tagType: "input", value: "{spaceData/proportionalMetaData/size}", type: "number", min: 0, max: 10000},
                                    ]},
                                ]},
                            ]},
                            {tagType: "padding", size: "10px"},
                            {tagType: "html", tag: "div", style: "display: flex; gap: 10px; width: fit-content; height: 100%; alignItems: center;", children: [
                                {tagType: "popoverMenu", icon: "setting", children: [
                                    {tagType: "label", text: "graphicMesh", children: [
                                        {tagType: "input", type: "checkbox", checked: "{spaceData/selectabilityAndVisbility/graphicMesh/visible}", look: {check: "display", uncheck: "hide"}},
                                        {tagType: "input", type: "checkbox", checked: "{spaceData/selectabilityAndVisbility/graphicMesh/select}", look: {check: "selected", uncheck: "notSelected"}},
                                    ]},
                                    {tagType: "label", text: "armature", children: [
                                        {tagType: "input", type: "checkbox", checked: "{spaceData/selectabilityAndVisbility/armature/visible}", look: {check: "display", uncheck: "hide"}},
                                        {tagType: "input", type: "checkbox", checked: "{spaceData/selectabilityAndVisbility/armature/select}", look: {check: "selected", uncheck: "notSelected"}},
                                    ]},
                                    {tagType: "label", text: "bezierModifier", children: [
                                        {tagType: "input", type: "checkbox", checked: "{spaceData/selectabilityAndVisbility/bezierModifier/visible}", look: {check: "display", uncheck: "hide"}},
                                        {tagType: "input", type: "checkbox", checked: "{spaceData/selectabilityAndVisbility/bezierModifier/select}", look: {check: "selected", uncheck: "notSelected"}},
                                    ]},
                                ]},
                                {tagType: "popoverMenu", icon: "overlay", children: [
                                    {tagType: "label", text: "Guides", attributes: ["top"], children: [
                                        {tagType: "label", text: "Grid", attributes: ["after"], children: [
                                            {tagType: "input", type: "checkbox", checked: "{spaceData/overlays/guides/grid}", look: {check: "display", uncheck: "hide"}},
                                        ]},
                                    ]},
                                    {tagType: "label", text: "Guides", attributes: ["top"], children: [
                                        {tagType: "label", text: "Grid", attributes: ["after"], children: [
                                            {tagType: "input", type: "checkbox", checked: "{spaceData/overlays/guides/grid}", look: {check: "display", uncheck: "hide"}},
                                        ]},
                                    ]},
                                ]},
                            ]}
                        ]},
                    ]},
                    {tagType: "box", key: "canvasContainer", style: "width: 100%; height: 100%; position: relative;", children: [
                        {tagType: "html", tag: "canvas", key: "renderingCanvas", style: "width: 100%; height: 100%; position: absolute;"},
                        {tagType: "html", tag: "div", key: "adjustPanel", style: "width: 100%; height: 100%; position: absolute; pointerEvents: none; display: flex; alignItems: flex-end; padding: 5px;"},
                    ], contextmenu: () => {
                        if (app.context.currentMode == "オブジェクト") {
                            return [
                                {label: "オブジェクトを追加", children: [
                                    {label: "GraphicMesh", children: [
                                        {label: "normal", eventFn: () => {
                                            const command = new CreateObjectCommand(app.options.getPrimitiveData("GraphicMesh", "normal"));
                                            app.operator.appendCommand(command);
                                            app.operator.execute();
                                        }},
                                    ]},
                                    {label: "BezierModifier", children: [
                                        {label: "normal", eventFn: () => {
                                            const command = new CreateObjectCommand(app.options.getPrimitiveData("BezierModifier", "normal"));
                                            app.operator.appendCommand(command);
                                            app.operator.execute();
                                        }},
                                    ]},
                                    {label: "Armature", children: [
                                        {label: "normal", eventFn: () => {
                                            app.operator.appendCommand(new CreateObjectCommand(app.options.getPrimitiveData("Armature", "normal")));
                                            app.operator.execute();
                                        }},
                                        {label: "body", eventFn: () => {
                                            const command = new CreateObjectCommand(app.options.getPrimitiveData("Armature", "body"));
                                            app.operator.appendCommand(command);
                                            app.operator.execute();
                                        }},
                                    ]},
                                    {label: "BlendShape", children: [
                                        {label: "normal", eventFn: () => {
                                            app.operator.appendCommand(new CreateObjectCommand(app.options.getPrimitiveData("BlendShape", "normal")));
                                            app.operator.execute();
                                        }},
                                    ]},
                                ]},
                                {label: "メッシュの生成", eventFn: () => {
                                }},
                                {label: "削除", children: [
                                    {label: "選択物", eventFn: () => {
                                        const command = new DeleteObjectCommand(app.context.selectedObjects);
                                        app.operator.appendCommand(command);
                                        app.operator.execute();
                                    }},
                                ]},
                                {label: "複製", eventFn: () => {
                                    app.operator.appendCommand(new CopyObjectCommand(app.context.activeObject));
                                    app.operator.execute();
                                }}
                            ];
                        } else if (app.context.currentMode == "メッシュ編集") {
                            return [
                                {label: "全て選択", eventFn: () => {
                                    app.operator.appendCommand(new SelectVerticesCommand(this.getVerticesAll(), false));
                                    app.operator.execute();
                                }},
                            ];
                        }
                    }},
                ]}
            ]
        }

        this.jTag.create(area.main, this.struct);

        this.sideBarOperator = new SideBarOperator(this.jTag.getDOMFromID("canvasContainer").element, {});
        this.adjustPanel = this.jTag.getDOMFromID("adjustPanel").element; // これがadjustPanelが作られるタグ
        this.modalOperator = new ModalOperator();

        this.flagOperator = new FlagOperator();
        this.flagOperator.setFlag(new Flag(
            "test",
            () => {
                // console.log("TestFlag call start");
            },
            () => {
                // console.log("TestFlag call update");
            },
            () => {
                // console.log("TestFlag call finish");
            },
            {}
        ));

        this.canvas = this.jTag.getDOMFromID("renderingCanvas").element;
        this.canvasRect = this.canvas.getBoundingClientRect();

        this.camera = new Camera();
        this.renderer = new Renderer(this.canvas, this.camera, this);
        this.convertCoordinate = new ConvertCoordinate(this.canvas,this.camera);

        // this.mouseState = {client: [0,0], click: false, rightClick: false, hold: false, holdFrameCount: 0, clickPosition: [0,0], clickPositionForGPU:[0,0], position: [0,0], lastPosition: [0,0], positionForGPU: [0,0], lastPositionForGPU: [0,0], movementForGPU: [0,0]};
        this.inputs = {click: [0,0], position: [0,0], movement: [0,0], clickPosition: [0,0], lastPosition: [0,0], keysDown: {}, keysPush: {}};

        this.canvas.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });

        resizeObserver.push(area.main, () => {
            // 要素の新しいサイズを取得
            this.canvasRect = this.canvas.getBoundingClientRect();
            this.canvas.width = this.canvasRect.width * this.pixelDensity;
            this.canvas.height = this.canvasRect.height * this.pixelDensity;
            this.renderer.resizeCVS();
        });

        const modeChangeEvent = () => {
            this.sideBarOperator.changeShelfes(useingSideBarPanelInMode[app.context.currentMode]);
        }
        useEffect.set({o: app.context, i: "currentMode"}, modeChangeEvent);
        modeChangeEvent();
    }

    async update() {
        this.flagOperator.update();
        this.renderer.rendering();
    }

    async getObjectRayCast(point, depth = true, types = "all") {
        const optionBuffer = GPU.createUniformBuffer(4, [0], ["u32"]);
        const pointBuffer = GPU.createUniformBuffer(2 * 4, [...point], ["f32"]);
        const targetObjects = [...app.scene.objects.blendShapes];
        if (this.spaceData.selectabilityAndVisbility.armature.select && this.spaceData.selectabilityAndVisbility.armature.visible) targetObjects.push(...app.scene.objects.armatures);
        if (this.spaceData.selectabilityAndVisbility.bezierModifier.select && this.spaceData.selectabilityAndVisbility.bezierModifier.visible) targetObjects.push(...app.scene.objects.bezierModifiers);
        if (this.spaceData.selectabilityAndVisbility.graphicMesh.select && this.spaceData.selectabilityAndVisbility.graphicMesh.visible) targetObjects.push(...app.scene.objects.graphicMeshs);
        const promises = targetObjects.map(async (object) => {
                if (types == "all" || types.includes(object.type)) {
                    if (object.type === "BlendShape") {
                        console.log(object, point)
                        const sub = MathVec2.subR(object.position, point);
                        if (Math.abs(sub[0]) < object.halfSize[0] * object.scale && Math.abs(sub[1]) < object.halfSize[1] * object.scale) {
                            return object;
                        } else {
                            return null;
                        }
                    } else {
                        const resultBuffer = GPU.createStorageBuffer(4, [0], ["u32"]);
                        let hitTestGroup;
                        if (object.type === "GraphicMesh") {
                            hitTestGroup = GPU.createGroup(
                                GPU.getGroupLayout("Csrw_Csr_Csr_Cu_Cu_Cu"),
                                [
                                    resultBuffer,
                                    app.scene.runtimeData.graphicMeshData.renderingVertices.buffer,
                                    app.scene.runtimeData.graphicMeshData.meshes.buffer,
                                    object.objectDataBuffer,
                                    optionBuffer,
                                    pointBuffer
                                ]
                            );
                            GPU.runComputeShader(polygonsHitTestPipeline, [hitTestGroup], Math.ceil(object.meshesNum / 64));
                        } else if (object.type === "Armature") {
                            hitTestGroup = GPU.createGroup(
                                GPU.getGroupLayout("Csrw_Csr_Cu_Cu_Cu"),
                                [
                                    resultBuffer,
                                    app.scene.runtimeData.armatureData.renderingVertices.buffer,
                                    object.objectDataBuffer,
                                    optionBuffer,
                                    pointBuffer
                                ]
                            );
                            GPU.runComputeShader(boneHitTestPipeline, [hitTestGroup], Math.ceil(object.bonesNum / 64));
                        } else if (object.type === "BezierModifier") {
                            hitTestGroup = GPU.createGroup(
                                GPU.getGroupLayout("Csrw_Csr_Cu_Cu_Cu_Cu"),
                                [
                                    resultBuffer,
                                    app.scene.runtimeData.bezierModifierData.renderingVertices.buffer,
                                    object.objectDataBuffer,
                                    this.camera.cameraDataBuffer,
                                    optionBuffer,
                                    pointBuffer
                                ]
                            );
                            GPU.runComputeShader(bezierModifierHitTestPipeline, [hitTestGroup], Math.ceil(object.verticesNum / 64));
                        }
                        if ((await GPU.getU32BufferData(resultBuffer, 4))[0] === 1) {
                            return object;
                        } else {
                            return null;
                        }
                    }
                }
                return null;
            });
        const allResults = await Promise.all(promises);
        const result = [];
        for (const obj of allResults) {
            if (obj) result.push(obj);
        }
        if (depth) {
            result.sort((a, b) => {
                const az = a.zIndex;
                const bz = b.zIndex;

                // どちらかがzIndexを持たない場合
                if (az === undefined && bz !== undefined) return -1; // aを先に
                if (az !== undefined && bz === undefined) return 1;  // bを先に

                // 両方zIndexを持たないなら順序を変えない
                if (az === undefined && bz === undefined) return 0;

                // どちらも存在するなら数値で降順ソート
                return bz - az;
            });
        }
        return result;
    }

    getBonesRayCast(point) {
        let selectIndex = -1;
        let selectBoneIncludesObjectID = -1;
        const editObjects = app.scene.editData.allEditObjects.filter(editData => editData instanceof BArmatureAnimation || editData instanceof BArmature);
        editObjects.forEach(editObject => {
            const objectID = editObject.id;
            const bonesPolygons = editObject.bones.map(bone => bone.polygon);
            bonesPolygons.forEach((polygons, polygonsIndex) => {
                if (hitTestPointTriangle(polygons[0], polygons[1], polygons[2], point) || hitTestPointTriangle(polygons[3], polygons[1], polygons[2], point)) {
                    selectIndex = polygonsIndex;
                    selectBoneIncludesObjectID = objectID;
                }
            })
        })
        const result = {};
        if (selectBoneIncludesObjectID != -1 && selectIndex != -1) {
            result[selectBoneIncludesObjectID] = [selectIndex];
        }
        return result;
    }

    getVerticesAll() {
        const editObjects = app.scene.editData.allEditObjects.filter(editData => editData instanceof BMesh || editData instanceof BMeshShapeKey || editData instanceof BBezier || editData instanceof BBezierShapeKey || editData instanceof BArmature);
        const result = {};
        editObjects.forEach(editObject => {
            result[editObject.id] = range(0, editObject.verticesNum);
        })
        return result;
    }

    getVerticesRayCast(point) {
        const editObjects = app.scene.editData.allEditObjects.filter(editData => editData instanceof BMesh || editData instanceof BMeshShapeKey || editData instanceof BBezier || editData instanceof BBezierShapeKey || editData instanceof BArmature);
        let minDis = Infinity;
        let selectIndexs = [];
        let selectVertexIncludesObjectIDs = [];
        editObjects.forEach(editObject => {
            const objectID = editObject.id;
            let verticesCoordinates;
            if (editObject instanceof BMeshShapeKey || editObject instanceof BBezierShapeKey) verticesCoordinates = editObject.activeShapeKey.data.map(vertex => vertex.co);
            else verticesCoordinates = editObject.vertices.map(vertex => vertex.co);
            if (editObject instanceof BArmature) {
                for (const boneVertices of chunk(verticesCoordinates, 2)) {
                    const lenght = MathVec2.distanceR(boneVertices[0], boneVertices[1]);
                    for (const vertex of boneVertices) {
                        const dist = MathVec2.distanceR(vertex, point);
                        if (dist < lenght * 0.05) {
                            if (dist <= minDis) {
                                if (dist < minDis) { // ==じゃないなら配列の長さをリセット
                                    selectIndexs.length = 0;
                                    selectVertexIncludesObjectIDs.length = 0;
                                }
                                minDis = dist;
                                selectIndexs.push(verticesCoordinates.indexOf(vertex));
                                selectVertexIncludesObjectIDs.push(objectID);
                            }
                        }
                    }
                }
            } else {
                for (const vertex of verticesCoordinates) {
                    const dist = MathVec2.distanceR(vertex, point);
                    if (dist <= minDis) {
                        if (dist < minDis) { // ==じゃないなら配列の長さをリセット
                            selectIndexs.length = 0;
                            selectVertexIncludesObjectIDs.length = 0;
                        }
                        minDis = dist;
                        selectIndexs.push(verticesCoordinates.indexOf(vertex));
                        selectVertexIncludesObjectIDs.push(objectID);
                    }
                }
            }
        })
        const result = {};
        if (selectVertexIncludesObjectIDs.length > 0 && selectIndexs.length > 0) {
            let index = Math.floor(Math.random() * selectVertexIncludesObjectIDs.length); // 同じ位置に複数あった場合どれを選択するか使うか
            result[selectVertexIncludesObjectIDs[index]] = [selectIndexs[index]];
        }
        return result;
    }

    getEdgesRayCast(point) {
        const editObjects = app.scene.editData.allEditObjects.filter(editData => editData instanceof BMesh);
        // let minDis = this.spaceData.visualSettings.mesh.manualEdgesize;
        let minDis = Infinity;
        let selectIndexs = [];
        let selectEdgeIncludesObjectIDs = [];
        editObjects.forEach(editObject => {
            const objectID = editObject.id;
            const edgesVerticesCoordinates = editObject.edges.map(edge => edge.vertices.map(vertex => vertex.co));
            for (const vertices of edgesVerticesCoordinates) {
                const dist = distancePointToSegment(vertices[0], vertices[1], point);
                if (dist <= minDis) {
                    if (dist < minDis) { // ==じゃないなら配列の長さをリセット
                        selectIndexs.length = 0;
                        selectEdgeIncludesObjectIDs.length = 0;
                    }
                    minDis = dist;
                    selectIndexs.push(edgesVerticesCoordinates.indexOf(vertices));
                    selectEdgeIncludesObjectIDs.push(objectID);
                }
            }
        })
        const result = {};
        if (selectEdgeIncludesObjectIDs.length > 0 && selectIndexs.length > 0) {
            let index = Math.floor(Math.random() * selectEdgeIncludesObjectIDs.length); // 同じ位置に複数あった場合どれを選択するか使うか
            result[selectEdgeIncludesObjectIDs[index]] = [selectIndexs[index]];
        }
        return result;
    }

    getPointsRayCast(ray) {
        const blendShapes = app.scene.editData.allEditObjects.filter(editData => editData instanceof BBlendShape);
        let minDis = Infinity;
        let selectIndexs = [];
        let selectPointIncludesObjectIDs = [];
        for (const blendShape of blendShapes) {
            for (const point of blendShape.points) {
                const dist = MathVec2.distanceR(MathVec2.addR(blendShape.position, MathVec2.scaleR(point.co, blendShape.scale)), ray);
                if (dist <= minDis) {
                    if (dist < minDis) { // ==じゃないなら配列の長さをリセット
                        selectIndexs.length = 0;
                        selectPointIncludesObjectIDs.length = 0;
                    }
                    minDis = dist;
                    selectIndexs.push(blendShape.points.indexOf(point));
                    selectPointIncludesObjectIDs.push(blendShape.id);
                }
            }
        }
        const result = {};
        if (selectPointIncludesObjectIDs.length > 0 && selectIndexs.length > 0) {
            let index = Math.floor(Math.random() * selectPointIncludesObjectIDs.length); // 同じ位置に複数あった場合どれを選択するか使うか
            result[selectPointIncludesObjectIDs[index]] = [selectIndexs[index]];
        }

        return result;
    }

    getShortcuts() {
        const context = app.context;
        if (context.activeObject) {
            if (context.currentMode == "オブジェクト") {
                if (app.input.consumeKeys(["g"])) return TranslateModal;
                if (app.input.consumeKeys(["s"])) return ResizeModal;
                if (app.input.consumeKeys(["p"])) return ChangeParentModal;
                if (app.input.consumeKeys(["Tab"])) {
                    if (context.activeObject instanceof GraphicMesh) return {command: ChangeEditModeCommand, parameter: ["メッシュ編集"]};
                    else if (context.activeObject instanceof BezierModifier) return {command: ChangeEditModeCommand, parameter: ["ベジェ編集"]};
                    else if (context.activeObject instanceof BArmature) return {command: ChangeEditModeCommand, parameter: ["ボーン編集"]};
                }
            }
            if (context.currentMode == "メッシュ編集") {
                if (app.input.consumeKeys(["g"])) return TranslateModal;
                if (app.input.consumeKeys(["s"])) return ResizeModal;
                if (app.input.consumeKeys(["r"])) return RotateModal;
                if (app.input.consumeKeys(["Tab"])) return {command: ChangeEditModeCommand, parameter: ["オブジェクト"]};
            }
            if (context.currentMode == "メッシュウェイト編集") {
                if (app.input.click) return WeightPaintModal;
                if (app.input.consumeKeys(["Tab"])) return {command: ChangeEditModeCommand, parameter: ["オブジェクト"]};
            }
            if (context.currentMode == "メッシュシェイプキー編集") {
                if (app.input.consumeKeys(["g"])) return TranslateModal;
                if (app.input.consumeKeys(["s"])) return ResizeModal;
                if (app.input.consumeKeys(["r"])) return RotateModal;
                if (app.input.consumeKeys(["Tab"])) return {command: ChangeEditModeCommand, parameter: ["オブジェクト"]};
            }
            if (context.currentMode == "ボーン編集") {
                if (app.input.consumeKeys(["g"])) return TranslateModal;
                if (app.input.consumeKeys(["s"])) return ResizeModal;
                if (app.input.consumeKeys(["r"])) return RotateModal;
                if (app.input.consumeKeys(["e"])) return BoneExtrudeMoveModal;
                if (app.input.consumeKeys(["x"])) return DeleteBoneCommand;
                if (app.input.consumeKeys(["Tab"])) return {command: ChangeEditModeCommand, parameter: ["オブジェクト"]};
            }
            if (context.currentMode == "ボーンアニメーション編集") {
                if (app.input.consumeKeys(["g"])) return TranslateModal;
                if (app.input.consumeKeys(["s"])) return ResizeModal;
                if (app.input.consumeKeys(["r"])) return RotateModal;
                if (app.input.consumeKeys(["i"])) return KeyframeInsertModal;
                if (app.input.consumeKeys(["Tab"])) return {command: ChangeEditModeCommand, parameter: ["オブジェクト"]};
            }
            if (context.currentMode == "ベジェ編集") {
                if (app.input.consumeKeys(["g"])) return TranslateModal;
                if (app.input.consumeKeys(["s"])) return ResizeModal;
                if (app.input.consumeKeys(["r"])) return RotateModal;
                if (app.input.consumeKeys(["e"])) return BezierExtrudeMoveModal;
                if (app.input.consumeKeys(["Tab"])) return {command: ChangeEditModeCommand, parameter: ["オブジェクト"]};
            }
            if (context.currentMode == "ベジェシェイプキー編集") {
                if (app.input.consumeKeys(["g"])) return TranslateModal;
                if (app.input.consumeKeys(["s"])) return ResizeModal;
                if (app.input.consumeKeys(["r"])) return RotateModal;
                if (app.input.consumeKeys(["Tab"])) return {command: ChangeEditModeCommand, parameter: ["オブジェクト"]};
            }
        }
        return null;
    }

    shortcuts() {
        const resultShortcuts = this.getShortcuts();
        if (resultShortcuts) {
            if (resultShortcuts.command?.prototype instanceof Command) {
                app.operator.appendCommand(new resultShortcuts.command(resultShortcuts.parameter));
                app.operator.execute();
            } else if (resultShortcuts.prototype instanceof Command) {
                app.operator.appendCommand(new resultShortcuts());
                app.operator.execute();
            } else {
                this.modalOperator.start(resultShortcuts);
            }
            return true;
        }
        return false;
    }

    async keyInput(/** @type {InputManager} */ inputManager) {
        this.inputs.keysDown = inputManager.keysDown;
        this.inputs.keysPush = inputManager.keysPush;
        if (await this.modalOperator.keyInput(this.inputs)) return ;
        if (this.shortcuts()) return ;
    }

    async mousedown(/** @type {InputManager} */ inputManager) {
        const local = this.convertCoordinate.screenPosFromGPUPos(MathVec2.flipY(calculateLocalMousePosition(this.canvas, inputManager.position), this.canvas.offsetHeight)); // canvasないのlocal座標へ
        this.inputs.click = true;
        this.inputs.clickPosition = local;
        this.inputs.position = local;

        if (await this.modalOperator.mousedown(this.inputs)) return ;
        if (this.shortcuts()) return ;

        const context = app.context;
        if (context.currentMode == "オブジェクト") {
            const types = ["BlendShape"];
            if (this.spaceData.selectabilityAndVisbility.graphicMesh.select) types.push("GraphicMesh");
            if (this.spaceData.selectabilityAndVisbility.armature.select) types.push("Armature");
            if (this.spaceData.selectabilityAndVisbility.bezierModifier.select) types.push("BezierModifier");
            const objects = await this.getObjectRayCast([...this.inputs.clickPosition], true, types);
            const frontObject = objects.length ? objects[0] : null;
            context.setSelectedObject(frontObject, inputManager.keysDown["Shift"]);
            context.setActiveObject(frontObject);
        } else if (context.currentMode == "メッシュ編集") {
            if (inputManager.keysDown["2"]) {
                app.operator.appendCommand(new SelectOnlyEdgeCommand(this.getEdgesRayCast(this.inputs.position), !inputManager.keysDown["Shift"]));
            } else {
                app.operator.appendCommand(new SelectVerticesCommand(this.getVerticesRayCast(this.inputs.position), !inputManager.keysDown["Shift"]));
            }
            app.operator.execute();
        } else if (context.currentMode == "ボーン編集") {
            // 頂点選択
            if (isEmpty(this.getVerticesRayCast(this.inputs.position))) {
                app.operator.appendCommand(new SelectBonesCommand(this.getBonesRayCast(this.inputs.position), !inputManager.keysDown["Shift"]));
            } else {
                app.operator.appendCommand(new SelectVerticesCommand(this.getVerticesRayCast(this.inputs.position), !inputManager.keysDown["Shift"]));
            }
            app.operator.execute();
        } else if (context.currentMode == "ベジェ編集") {
            app.operator.appendCommand(new SelectVerticesCommand(this.getVerticesRayCast(this.inputs.position), !inputManager.keysDown["Shift"]));
            app.operator.execute();
        } else if (context.currentMode == "メッシュシェイプキー編集") {
            app.operator.appendCommand(new SelectVerticesCommand(this.getVerticesRayCast(this.inputs.position), !inputManager.keysDown["Shift"]));
            app.operator.execute();
        } else if (context.currentMode == "ベジェシェイプキー編集") {
            app.operator.appendCommand(new SelectVerticesCommand(this.getVerticesRayCast(this.inputs.position), !inputManager.keysDown["Shift"]));
            app.operator.execute();
        } else if (context.currentMode == "ボーンアニメーション編集") {
            app.operator.appendCommand(new SelectBonesCommand(this.getBonesRayCast(this.inputs.position), !inputManager.keysDown["Shift"]));
            app.operator.execute();
        } else if (context.currentMode == "メッシュウェイト編集") {
            if (inputManager.consumeKeys(["Shift"])) {
                app.operator.appendCommand(new SelectBonesCommand(this.getBonesRayCast(this.inputs.position), false));
                app.operator.execute();
            }
        } else if (context.currentMode == "ベジェウェイト編集") {
            if (inputManager.consumeKeys(["Shift"])) {
                app.operator.appendCommand(new SelectBonesCommand(this.getBonesRayCast(this.inputs.position), false));
                app.operator.execute();
            }
        } else if (context.currentMode == "ブレンドシェイプ編集") {
            const activeObject = app.context.activeObject;
            if (activeObject instanceof BlendShape) {
                console.log(this.getPointsRayCast(this.inputs.position));
                if (this.getPointsRayCast(this.inputs.position)) {
                } else {
                }
                this.testCommand = new ChangeBlendShapeValueCommand(activeObject, MathVec2.reverseScaleR(MathVec2.subR(this.inputs.position, activeObject.position), activeObject.scale));
            }
        }
    }
    async mousemove(inputManager) {
        this.inputs.lastPosition = [...this.inputs.position];
        const local = this.convertCoordinate.screenPosFromGPUPos(MathVec2.flipY(calculateLocalMousePosition(this.canvas, inputManager.position), this.canvas.offsetHeight)); // canvasないのlocal座標へ
        MathVec2.sub(this.inputs.movement, local, this.inputs.position);
        this.inputs.position = local;

        if (await this.modalOperator.mousemove(this.inputs)) return ;
        if (this.shortcuts()) return ;

        const context = app.context;
        if (context.currentMode == "ブレンドシェイプ編集") {
            const activeObject = app.context.activeObject;
            if (activeObject instanceof BlendShape) {
                if (this.testCommand) this.testCommand.update(MathVec2.reverseScaleR(MathVec2.subR(this.inputs.position, activeObject.position), activeObject.scale));
            }
        }
    }
    async mouseup(inputManager) {
        if (await this.modalOperator.mouseup(this.inputs)) return ;
        if (this.shortcuts()) return ;

        const context = app.context;
        if (context.currentMode == "ブレンドシェイプ編集") {
            const activeObject = app.context.activeObject;
            if (activeObject instanceof BlendShape) {
                app.operator.appendCommand(this.testCommand);
                app.operator.execute();
                this.testCommand = null;
            }
        }
    }

    async wheel(inputManager) {
        if (await this.modalOperator.wheel(this.inputs)) return ;
        if (this.shortcuts()) return ;
        if (app.input.keysDown["Alt"]) {
            this.camera.zoom += inputManager.wheelDelta[1] / 200;
            this.camera.zoom = Math.max(Math.min(this.camera.zoom,this.camera.zoomMax),this.camera.zoomMin);
        } else {
            this.camera.position = MathVec2.addR(this.camera.position, MathVec2.scaleR([inputManager.wheelDelta[0], -inputManager.wheelDelta[1]], 1 / this.camera.zoom));
        }
        this.camera.updateBuffer();
    }
}

export class Renderer {
    constructor(canvas, camera, /** @type {Area_Viewer} */ viewer) {
        console.log("レンダリングターゲット", canvas)
        this.canvas = canvas;
        this.context = canvas.getContext('webgpu');
        this.context.configure({
            device: device,
            format: format,
            // alphaMode: 'premultiplied',
            // size: [this.canvas.width, this.canvas.height]
        });
        this.camera = camera;
        this.viewer = viewer;

        this.canvasAspectBuffer = GPU.createUniformBuffer(2 * 4, undefined, ["f32"]);
        this.resizeCVS();
        // レンダリングに使う汎用group
        this.staticGroup = GPU.createGroup(GPU.getGroupLayout("VFu_Fts"), [
            camera.cameraDataBuffer,
            GPU.sampler
        ]);
    }

    resizeCVS() {
        // this.context.configure({
        //     device: device,
        //     format: format,
        //     // alphaMode: 'premultiplied',
        //     size: [this.canvas.width, this.canvas.height]
        // });
        // GPU.writeBuffer(this.canvasAspectBuffer, new Float32Array([1 / this.canvas.width, 1 /  this.canvas.height]));v

        this.selectObjectMaskTexture = GPU.createTexture2D([this.canvas.width, this.canvas.height], format);
        this.selectObjectMaskTextureView = this.selectObjectMaskTexture.createView();

        this.camera.updateCanvasSize([this.canvas.offsetWidth, this.canvas.offsetHeight]);
    }

    rendering() {
        const view = this.context.getCurrentTexture().createView();
        if (!view) {
            console.warn("レンダリング対象が取得できません");
            return ;
        }
        const commandEncoder = device.createCommandEncoder();
        if (app.context.currentMode == "オブジェクト") {
            if (true) { // 選択オブジェクトのアウトライン検出
                const selectObjectOutlineRenderPass = commandEncoder.beginRenderPass({
                    colorAttachments: [
                        {
                            view: this.selectObjectMaskTextureView,
                            clearValue: { r: 0, g: 0, b: 0, a: 0 },
                            loadOp: 'clear',
                            storeOp: 'store',
                        },
                    ],
                });
                // オブジェクト表示
                selectObjectOutlineRenderPass.setBindGroup(0, this.staticGroup);
                const selectedObjects = app.context.selectedObjects;
                app.scene.allRenderingOrder.forEach((object, index) => {
                    if (object.type == "BlendShape") {
                        let color = [0,0,0,1];
                        if (object == app.context.activeObject) {
                            color = [1 / 255, 0, 0, 1];
                        } else if (selectedObjects.includes(object)) {
                            color = [0, (1 + index) / 255, 0, 1];
                        } else if (this.viewer.modalOperator.nowModal?.hoverObject == object) {
                            color = [0, 0, (1 + index) / 255, 1];
                        } else {
                            return ;
                        }
                        rectRender(selectObjectOutlineRenderPass, MathVec2.addR(object.position, [0, 10]), MathVec2.addR(MathVec2.scaleR(object.halfSize, object.scale), [10,20]), 5, [0.2,0.2,0.2,1], 1, 2, [0.05,0.05,0.05,1], 0);
                    } else {
                        if (object == app.context.activeObject) {
                            selectObjectOutlineRenderPass.setBindGroup(3, GPU.createGroup(GPU.getGroupLayout("Vu_Fu"), [object.objectDataBuffer, GPU.createUniformBuffer(4 * 4, [1 / 255, 0, 0, 1], ["f32"])]));
                        } else if (selectedObjects.includes(object)) {
                            selectObjectOutlineRenderPass.setBindGroup(3, GPU.createGroup(GPU.getGroupLayout("Vu_Fu"), [object.objectDataBuffer, GPU.createUniformBuffer(4 * 4, [0, (1 + index) / 255, 0, 1], ["f32"])]));
                        } else if (this.viewer.modalOperator.nowModal?.hoverObject == object) {
                            selectObjectOutlineRenderPass.setBindGroup(3, GPU.createGroup(GPU.getGroupLayout("Vu_Fu"), [object.objectDataBuffer, GPU.createUniformBuffer(4 * 4, [0, 0, (1 + index) / 255, 1], ["f32"])]));
                        } else {
                            return ;
                        }
                        if (object.type == "GraphicMesh") {
                            selectObjectOutlineRenderPass.setBindGroup(1, this.viewer.spaceData.GPUDataForVisualSettings.mesh.group);
                            selectObjectOutlineRenderPass.setBindGroup(2, app.scene.runtimeData.graphicMeshData.renderGroup);
                            selectObjectOutlineRenderPass.setVertexBuffer(0, app.scene.runtimeData.graphicMeshData.meshes.buffer, object.runtimeOffsetData.start.meshesOffset * app.scene.runtimeData.graphicMeshData.meshes.structByteSize, object.meshesNum * app.scene.runtimeData.graphicMeshData.meshes.structByteSize);
                            selectObjectOutlineRenderPass.setPipeline(selectObjectOutlinePipeline);
                            selectObjectOutlineRenderPass.draw(object.meshesNum * 3, 1, 0, 0);
                        } else if (object.type == "Armature") {
                            selectObjectOutlineRenderPass.setBindGroup(1, this.viewer.spaceData.GPUDataForVisualSettings.bone.group);
                            selectObjectOutlineRenderPass.setBindGroup(2, app.scene.runtimeData.armatureData.renderingGizumoGroup);
                            selectObjectOutlineRenderPass.setPipeline(selectObjectOutlineBoneRenderPipeline);
                            selectObjectOutlineRenderPass.draw(3 * 2, object.bonesNum, 0, 0);
                        } else if (object.type == "BezierModifier") {
                            selectObjectOutlineRenderPass.setBindGroup(1, this.viewer.spaceData.GPUDataForVisualSettings.bezier.group);
                            selectObjectOutlineRenderPass.setBindGroup(2, app.scene.runtimeData.bezierModifierData.renderingGizumoGroup);
                            selectObjectOutlineRenderPass.setPipeline(selectObjectOutlineBezierRenderPipeline);
                            selectObjectOutlineRenderPass.draw(2 * 50, object.pointsNum - 1, 0, 0);
                        }
                    }
                })
                // 処理の終了と送信
                selectObjectOutlineRenderPass.end();
            }
        }
        for (const maskTexture of app.scene.objects.maskTextures) {
            if (maskTexture.renderingObjects.length > 0 && maskTexture.name != "base") {
                const maskRenderPass = commandEncoder.beginRenderPass({
                    colorAttachments: [
                        {
                            view: maskTexture.view,
                            clearValue: { r: 0, g: 0, b: 0, a: 0 },
                            loadOp: 'clear',
                            storeOp: 'store',
                        },
                    ],
                });
                // オブジェクト表示
                maskRenderPass.setPipeline(maskRenderPipeline);
                maskRenderPass.setBindGroup(0, this.staticGroup);
                maskRenderPass.setBindGroup(1, app.scene.runtimeData.graphicMeshData.renderGroup);
                for (const graphicMesh of maskTexture.renderingObjects) {
                    maskRenderPass.setBindGroup(2, graphicMesh.objectDataGroup);
                    maskRenderPass.setVertexBuffer(0, app.scene.runtimeData.graphicMeshData.meshes.buffer, graphicMesh.runtimeOffsetData.start.meshesOffset * app.scene.runtimeData.graphicMeshData.meshes.structByteSize, graphicMesh.meshesNum * app.scene.runtimeData.graphicMeshData.meshes.structByteSize);
                    maskRenderPass.draw(graphicMesh.meshesNum * 3, 1, 0, 0);
                }
                // 処理の終了と送信
                maskRenderPass.end();
            }
        }
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: view,
                    clearValue: app.scene.world.color,
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        });
        renderPass.setBindGroup(0, this.staticGroup);
        // グリッド
        if (this.viewer.spaceData.overlays.guides.grid) {
            renderPass.setPipeline(renderGridPipeline);
            renderPass.draw(4, 1, 0, 0);
        }
        // メイン表示
        if (app.scene.objects.graphicMeshs.length) {
            renderPass.setPipeline(renderPipeline);
            renderPass.setBindGroup(1, app.scene.runtimeData.graphicMeshData.renderGroup);
            for (const graphicMesh of app.scene.renderingOrder) {
                if (graphicMesh.mode == "オブジェクト" && graphicMesh.visible) {
                    renderPass.setBindGroup(2, graphicMesh.renderGroup);
                    renderPass.setVertexBuffer(0, app.scene.runtimeData.graphicMeshData.meshes.buffer, graphicMesh.runtimeOffsetData.start.meshesOffset * app.scene.runtimeData.graphicMeshData.meshes.structByteSize, graphicMesh.meshesNum * app.scene.runtimeData.graphicMeshData.meshes.structByteSize);
                    renderPass.draw(graphicMesh.meshesNum * 3, 1, 0, 0);
                } else {
                    const bm = app.scene.editData.getEditObjectByObject(graphicMesh);
                    bm.render(renderPass);

                    renderPass.setPipeline(renderPipeline);
                    renderPass.setBindGroup(1, app.scene.runtimeData.graphicMeshData.renderGroup);
                }
            }
        }
        if (app.scene.objects.particles.length) {
            renderPass.setPipeline(renderParticlePipeline);
            renderPass.setBindGroup(1, app.scene.runtimeData.particle.renderingGroup);
            for (const /** @type {Particle} */ particle of app.scene.objects.particles) {
                renderPass.setBindGroup(2, particle.objectDataGroup);
                renderPass.draw(4, particle.particlesNum, 0, 0);
            }
        }
        // エディット表示
        if (app.scene.objects.graphicMeshs.length) {
            if (this.viewer.spaceData.selectabilityAndVisbility.graphicMesh.visible) {
                renderPass.setBindGroup(1, this.viewer.spaceData.GPUDataForVisualSettings.mesh.group);
                for (const graphicMesh of app.scene.renderingOrder) {
                    if (graphicMesh.visible) {
                        if (graphicMesh.mode == "オブジェクト") {
                        } else {
                            const b = app.scene.editData.getEditObjectByObject(graphicMesh);
                            b.gizumoRender(renderPass);
                        }
                    }
                }
            }
        }
        if (this.viewer.spaceData.selectabilityAndVisbility.armature.visible && app.scene.objects.armatures.length) {
            renderPass.setBindGroup(1, this.viewer.spaceData.GPUDataForVisualSettings.bone.group);
            renderPass.setBindGroup(2, app.scene.runtimeData.armatureData.renderingGizumoGroup);
            renderPass.setPipeline(boneBoneRenderPipeline);
            for (const armature of app.scene.objects.armatures) {
                if (armature.visible) {
                    if (armature.mode == "オブジェクト") {
                        renderPass.setBindGroup(3, armature.objectDataGroup);
                        renderPass.draw(4, armature.bonesNum, 0, 0);
                    } else {
                        const b = app.scene.editData.getEditObjectByObject(armature);
                        b.gizumoRender(renderPass);

                        renderPass.setBindGroup(2, app.scene.runtimeData.armatureData.renderingGizumoGroup);
                        renderPass.setPipeline(boneBoneRenderPipeline);
                    }
                }
            }
        }
        if (this.viewer.spaceData.selectabilityAndVisbility.bezierModifier.visible && app.scene.objects.bezierModifiers.length) {
            renderPass.setBindGroup(1, this.viewer.spaceData.GPUDataForVisualSettings.bezier.group);
            renderPass.setBindGroup(2, app.scene.runtimeData.bezierModifierData.renderingGizumoGroup);
            renderPass.setPipeline(bezierModifierRenderPipeline);
            for (const bezierModifier of app.scene.objects.bezierModifiers) {
                if (bezierModifier.visible) {
                    if (bezierModifier.mode == "オブジェクト") {
                        // console.log(bezierModifier);
                        renderPass.setBindGroup(3, bezierModifier.objectDataGroup);
                        renderPass.draw(2 * 50, bezierModifier.pointsNum - 1, 0, 0);
                    } else {
                        const b = app.scene.editData.getEditObjectByObject(bezierModifier);
                        b.gizumoRender(renderPass);

                        renderPass.setBindGroup(2, app.scene.runtimeData.bezierModifierData.renderingGizumoGroup);
                        renderPass.setPipeline(bezierModifierRenderPipeline);
                    }
                }
            }
        }
        if (app.scene.objects.blendShapes.length) {
            for (const blendShape of app.scene.objects.blendShapes) {
                let containerTop = blendShape.position[1] + blendShape.halfSize[1] * blendShape.scale;
                let containerBottom = blendShape.position[1] - blendShape.halfSize[1] * blendShape.scale;
                let containerRight = blendShape.position[0] + blendShape.halfSize[0] * blendShape.scale;
                let containerLeft = blendShape.position[0] - blendShape.halfSize[0] * blendShape.scale;
                if (true) {
                    // 外枠
                    rectRender(renderPass, MathVec2.addR(blendShape.position, [0, 10]), MathVec2.addR(MathVec2.scaleR(blendShape.halfSize, blendShape.scale), [10,20]), 5, [0.2,0.2,0.2,1], 1, 2, [0.05,0.05,0.05,1], 0);
                    // 右上の最小化ボタン
                    rectRender(renderPass, MathVec2.addR([containerRight, containerTop], [-5, 15]), [5,1], 0, [1,1,1,1], 1);
                    // キャンバス
                    rectRender(renderPass, blendShape.position, MathVec2.scaleR(blendShape.halfSize, blendShape.scale), 0, [1,1,1,1], 1, 2, [0.05,0.05,0.05,1], 0);
                    for (const point of blendShape.points) {
                        circleRender(renderPass, MathVec2.addR(blendShape.position, MathVec2.scaleR(point.co, blendShape.scale)), 5, [1,0.5,0,1], 1, 0, [0,0,0,1], 0);
                    }
                    if (blendShape.value) {
                        circleRender(renderPass, MathVec2.addR(blendShape.position, MathVec2.scaleR(blendShape.value, blendShape.scale)), 5, [1,0,0,1], 1, 0, [0,0,0,1], 0);
                    }
                    // 文字
                    textRender(renderPass, blendShape.name, [0, 0], MathVec2.set(MathVec2.create(), [containerLeft, containerTop]), 10, [1,1,1,1], 1);
                }
            }
        }
        // if (true && app.scene.objects.maskTextures.length > 1) {
        //     renderPass.setBindGroup(0, GPU.createGroup(GPU.getGroupLayout("Fts_Ft"), [GPU.sampler, app.scene.objects.maskTextures[1].view]));
        //     renderPass.setPipeline(devMaskTexturePipeline);
        //     renderPass.draw(4, 1, 0, 0);
        // }
        // if (true && app.scene.objects.maskTextures.length > 1) {
        //     renderPass.setBindGroup(0, GPU.createGroup(GPU.getGroupLayout("Fts_Ft"), [GPU.sampler, this.selectObjectMaskTextureView]));
        //     renderPass.setPipeline(devMaskTexturePipeline);
        //     renderPass.draw(4, 1, 0, 0);
        // }
        // if (true) { // マウスのポインター
        //     if (["ベジェウェイト編集", "メッシュウェイト編集"].includes(app.context.currentMode)) {
        //         renderPass.setBindGroup(1, GPU.createGroup(GPU.getGroupLayout("VFu"), [
        //             GPU.createUniformBuffer((2 + 1 + 1 + 2 + 4 + 4 + 2) * 4, [
        //                 ...this.viewer.inputs.position,
        //                 this.viewer.spaceData.weightPaintMetaData.decaySize,
        //                 1,0,0,0.1,
        //                 1,
        //                 2,
        //                 0.7,0.2,0.2,1,
        //                 0,
        //             ], ["f32"]),
        //         ]));
        //         renderPass.setPipeline(circleRenderPipeline);
        //         renderPass.draw(4, 1, 0, 0);
        //     } else if (["ベジェ編集", "メッシュ編集", "ボーン編集"].includes(app.context.currentMode) && this.viewer.spaceData.proportionalMetaData.use) {
        //         renderPass.setBindGroup(1, GPU.createGroup(GPU.getGroupLayout("VFu"), [
        //             GPU.createUniformBuffer((2 + 1 + 1 + 2 + 4 + 4 + 2) * 4, [
        //                 ...this.viewer.inputs.position,
        //                 this.viewer.spaceData.proportionalMetaData.size,
        //                 1,0,0,0.1,
        //                 1,
        //                 2,
        //                 0.7,0.2,0.2,1,
        //                 0,
        //             ], ["f32"]),
        //         ]));
        //         renderPass.setPipeline(circleRenderPipeline);
        //         renderPass.draw(4, 1, 0, 0);
        //     }
        // }
        if (app.context.currentMode == "オブジェクト") {
            renderPass.setBindGroup(0, GPU.createGroup(GPU.getGroupLayout("Fts_Ft_Fu"), [GPU.sampler, this.selectObjectMaskTextureView, GPU.createUniformBuffer(4 * 4, [1, 0.4, 0.2, 1], ["f32", "f32", "f32", "f32"])]));
            renderPass.setPipeline(selectObjectOutlineMixPipeline);
            renderPass.draw(4, 1, 0, 0);
        }
        if (isFunction(this.viewer.modalOperator.nowModal?.render)) {
            this.viewer.modalOperator.nowModal.gizumoRender(renderPass);
        }
        // if (app.scene.runtimeData.graphicMeshData.textureAtls) {
        //     renderPass.setBindGroup(0, GPU.createGroup(GPU.getGroupLayout("Fts_Ft"), [GPU.sampler, app.scene.runtimeData.graphicMeshData.textureAtls.createView()]));
        //     renderPass.setPipeline(devMaskTexturePipeline);
        //     renderPass.draw(4, 1, 0, 0);
        // }
        // 処理の終了と送信
        renderPass.end();
        device.queue.submit([commandEncoder.finish()]);
    }
}