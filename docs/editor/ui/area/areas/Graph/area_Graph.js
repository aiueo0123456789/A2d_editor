import { app } from "../../../../../main.js";
import { InputManager } from "../../../../app/inputManager/inputManager.js";
import { SelectKeyframesCommand } from "../../../../commands/utile/selectKeyframe.js";
import { ToolPanelOperator } from "../../../../operators/toolPanelOperator.js";
import { MathVec2 } from "../../../../utils/mathVec.js";
import { resizeObserver } from "../../../../utils/ui/resizeObserver.js";
import { createID, useEffect } from "../../../../utils/ui/util.js";
import { calculateLocalMousePosition, changeParameter, errorCut, isPointInEllipse } from "../../../../utils/utility.js";
import { KeyDelete } from "../../../tools/KeyDelete.js";
import { KeyframeResize } from "../../../tools/KeyframeResize.js";
import { KeyframeRotate } from "../../../tools/KeyframeRotate.js";
import { KeyframeTranslateInGraph } from "../../../tools/KeyframeTranslate.js";

const targetValueToColor = {
    "x": "rgb(0, 0, 255)",
    "y": "rgb(0, 255, 0)",
    "sx": "rgb(255, 255, 0)",
    "sy": "rgb(0, 255, 255)",
    "r": "rgb(255, 0, 0)",
    "l": "rgb(247, 104, 237)",
    "0": "rgb(0, 0, 255)",
    "1": "rgb(0, 255, 0)",
}

export class Area_Timeline {
    constructor(area) {
        this.dom = area.main;
        this.spaceData = app.appConfig.areasConfig["Timeline"];

        this.camera = [0,0];
        // this.zoom = [1,1];
        this.zoom = [5,5];

        this.selectedOnly = false;

        this.spaceData.mode = "select";
        this.spaceData.mode = "move";

        this.frameBarDrag = false;

        this.struct = {
            inputObject: {"colorData": targetValueToColor, "context": app.context, "spaceData": this.spaceData, "areasConifg": app.appConfig.areasConfig, "scene": app.scene},
            DOM: [
                {tagType: "gridBox", style: "width: 100%; height: 100%;", axis: "r", allocation: "auto 1fr", children: [
                    {tagType: "option",style: "height: 25px;", name: "情報", children: [
                        {tagType: "gridBox", style: "width: 100%; height: 100%;", axis: "c", allocation: "1fr auto 1fr", children: [
                            {tagType: "gridBox", style: "width: 100%; height: 100%;", axis: "c", allocation: "auto auto 1fr", children: [
                                {tagType: "padding", size: "10px"},
                                {tagType: "menu", title: "選択", struct: [
                                    {label: "すべて選択", children: [], onClick: () => {app.context.selectAll()}},
                                    {label: "属性選択", children: [], onClick: () => {app.context.selectByAttribute()}},
                                ]},
                                {tagType: "padding", size: "10px"},
                            ]},
                            {tagType: "box", class: "boxs", children: [
                                {tagType: "button", icon: "reverseSkip", onClick: () => {
                                    changeParameter(app.scene, "frame_current", app.scene.frame_start);
                                }},
                                {tagType: "input", name: "isPlaying", type: "checkbox", checked: "scene/isReversePlaying", look: {check: "stop", uncheck: "reverse"}, useCommand: false},
                                {tagType: "input", name: "isPlaying", type: "checkbox", checked: "scene/isPlaying", look: {check: "stop", uncheck: "playing"}, useCommand: false},
                                {tagType: "button", icon: "skip", onClick: () => {
                                    changeParameter(app.scene, "frame_current", app.scene.frame_end);
                                }},
                            ]},
                            {tagType: "gridBox", style: "width: 100%; height: 100%;", axis: "c", allocation: "1fr auto auto auto", children: [
                                {tagType: "padding", size: "10px"},
                                {tagType: "input", label: "現在", name: "frame_current", value: "scene/frame_current", type: "number", max: 500, min: -500},
                                {tagType: "input", label: "開始", name: "frame_start", value: "scene/frame_start", type: "number", max: 500, min: -500},
                                {tagType: "input", label: "終了", name: "frame_end", value: "scene/frame_end", type: "number", max: 500, min: -500},
                            ]}
                        ]},
                    ]},
                    {tagType: "grid", axis: "c", child1: [
                        {tagType: "outliner", name: "outliner", id: "overview",
                            updateEventTarget: "選択物",
                            options: {
                                arrange: false,
                                clickEventFn: (event, object) => {
                                    // app.context.setSelectedObject(object, app.input.keysDown["Ctrl"]);
                                    // app.context.setActiveObject(object);
                                    event.stopPropagation();
                                }, rangeonSelectFn: (event, array, startIndex, endIndex) => {
                                    // let minIndex = Math.min(startIndex, endIndex);
                                    // let maxIndex = Math.max(startIndex, endIndex);
                                    // for (let i = minIndex; i < maxIndex; i ++) {
                                    //     app.context.setSelectedObject(array[i], true);
                                    // }
                                    // app.context.setActiveObject(array[endIndex]);
                                },
                                activeSource: {object: "context", parameter: "activeObject"}, selectSource: {object: "context/selectedObjects"}
                            },
                            withObject: "spaceData/outlineData",
                            updateEventTarget: ["頂点選択","ボーン選択","オブジェクト選択"],
                            loopTarget: {
                                parameter: "type",
                                loopTargets: {
                                    // "キーフレームブロックマネージャー": ["blocks"],
                                    others: ["/children"],
                                }
                            },
                            structures: [
                                {tagType: "if", formula: {source: "/type", conditions: "==", value: "キーフレームブロック"},
                                    true: [
                                        {tagType: "gridBox", id: {path: "/pathID"}, axis: "c", style: "marginTop: 1px; marginBottom: 1px", allocation: "10px auto auto 1fr", children: [
                                            {tagType: "html", tag: "div", children: [
                                                {tagType: "color", src: "colorData/{/parameter}"},
                                            ]},
                                            {tagType: "icon", src: {path: "/type"}},
                                            {tagType: "input", type: "checkbox", checked: "/object/visible", look: {check: "display", uncheck: "hide"}},
                                            {tagType: "dblClickInput", value: "/parameter"},
                                        ]}
                                    ],
                                    false: [
                                        {tagType: "gridBox", id: {path: "/id"}, axis: "c", allocation: "auto 1fr", children: [
                                            {tagType: "icon", src: {path: "/type"}},
                                            {tagType: "dblClickInput", value: "/name"},
                                        ]}
                                    ]
                                }
                            ]
                        },
                    ],child2: [
                        {tagType: "box", id: "canvasContainer", style: "width: 100%; height: 100%; position: relative;", children: [
                            {tagType: "html", tag: "canvas", id: "timelineCanvasForGrid", style: "width: 100%; height: 100%; position: absolute; backgroundColor: var(--sub3Color);"},
                        ]},
                    ]}
                ]}
            ],
            utility: {
                "testTest": {}
            }
        };

        this.jTag = area.jTag;
        this.jTag.create(area.main, this.struct, {padding: false});

        this.toolPanelOperator = new ToolPanelOperator(this.jTag.getDOMFromID("canvasContainer").element, {"g": KeyframeTranslateInGraph, "r": KeyframeRotate, "s": KeyframeResize, "x": KeyDelete});

        /** @type {OutlinerTag} */
        this.overview = this.jTag.getDOMFromID("overview");
        this.canvas = this.jTag.getDOMFromID("timelineCanvasForGrid");
        this.canvasRect = this.canvas.getBoundingClientRect();
        this.context = this.canvas.getContext("2d");//2次元描画

        this.canvasSize = [this.canvas.width,this.canvas.height];

        this.inputs = {click: [0,0], position: [0,0], movement: [0,0], clickPosition: [0,0], lastPosition: [0,0]};

        this.pixelDensity = 5;

        resizeObserver.push(this.canvas, () => {
            this.canvasRect = this.canvas.getBoundingClientRect();
            this.canvas.width = this.canvasRect.width * this.pixelDensity;
            this.canvas.height = this.canvasRect.height * this.pixelDensity;
            this.canvasSize = [this.canvas.width,this.canvas.height];
        });

        this.groupID = createID();
    }

    update() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 直線表示関数
        const line = (p1,p2,thick,color) => {
            this.context.beginPath();            // 新しいパスを作成
            this.context.lineWidth = thick;      // 線の太さ
            this.context.strokeStyle = color;    // 線の色
            this.context.moveTo(...p1);          // 線の開始座標
            this.context.lineTo(...p2);          // 線の終了座標
            this.context.stroke();               // 輪郭を描画
        }

        const text = (p, string, size, color, align = 'left', baseline = 'alphabetic') => {
            // フォントスタイルを設定
            this.context.font = `${size}px Arial`;

            // 文字の色を設定
            this.context.fillStyle = color;
            // 配置を指定
            this.context.textAlign = align;       // 'left', 'center', 'right', 'start', 'end'
            this.context.textBaseline = baseline; // 'top', 'middle', 'bottom', 'alphabetic', 'hanging'

            // キャンバス上に文字を描画（x=50, y=50）
            this.context.fillText(string, ...p);
        }

        const gridRender = (gap, offset, width, color, string = false) => {
            const leftDown = this.canvasToWorld([0,this.canvasSize[1]]);
            const decimalOffset = MathVec2.modR(MathVec2.subR([0,0],leftDown), gap);
            for (let x = 0; x < this.canvas.width / this.zoom[0]; x += gap[0]) {
                const wx = this.worldToCanvas([x + leftDown[0] + decimalOffset[0] + offset[0],0])[0];
                line([wx, this.canvas.height], [wx,0], width, color);
            }
            for (let y = 0; y < this.canvas.height / this.zoom[1]; y += gap[1]) {
                const wy = this.worldToCanvas([0,y + leftDown[1] + decimalOffset[1] + offset[1]])[1];
                line([this.canvas.width, wy], [0, wy], width, color);
            }
            if (string) {
                for (let y = 0; y < this.canvas.height / this.zoom[1]; y += gap[1]) {
                    const wy = this.worldToCanvas([0, y + leftDown[1] + decimalOffset[1]])[1];
                    line([0, wy], [40, wy], 10, "rgb(255,255,255)");
                    text([50, wy], `${errorCut(y + leftDown[1] + decimalOffset[1])}`, 70, "rgb(255, 255, 255)", "left", "middle");
                }
                for (let x = 0; x < this.canvas.width / this.zoom[0]; x += gap[0]) {
                    const wx = this.worldToCanvas([x + leftDown[0] + decimalOffset[0], 0])[0];
                    line([wx, 0], [wx, 40], 10, "rgb(255,255,255)");
                    text([wx, 50], `${errorCut(x + leftDown[0] + decimalOffset[0])}`, 70, "rgb(255, 255, 255)", "center", "top");
                }
            }
        }

        function getGridStep(zoom) {
            const baseSteps = [1, 2, 3];
            const invZoom = 1 / zoom;
            const logZoom = Math.log10(invZoom);
            const power = Math.floor(logZoom);
            const base = Math.pow(10, power);

            const fraction = logZoom - power;
            let index = 0;
            if (fraction >= Math.log10(5)) {
                index = 2;
            } else if (fraction >= Math.log10(2)) {
                index = 1;
            } else {
                index = 0;
            }

            return (base * baseSteps[index]) * 20;
        }

        const gap = [getGridStep(this.zoom[0]),getGridStep(this.zoom[1])];
        const bigGap = MathVec2.scaleR(gap, 5);

        gridRender(gap, [0,0], 4, "rgb(72, 72, 72)");
        gridRender(bigGap, [0,0], 5, "rgb(18, 18, 18)", true);

        if (true) {
            const wx = this.worldToCanvas([app.scene.frame_current,0]);
            line([wx[0], this.canvas.height],[wx[0], 0],5,"rgb(185, 185, 185)");
        }

        const circle = (p, radius, color) => {
            this.context.fillStyle = color;
            this.context.beginPath();
            this.context.arc(...p, radius, 0, Math.PI * 2);
            this.context.fill();
        }

        const circleStroke = (p, radius, color, lineWidth) => {
            this.context.strokeStyle = color;
            this.context.lineWidth = lineWidth;
            this.context.beginPath();
            this.context.arc(...p, radius, 0, Math.PI * 2);
            // object.context.fill();
            this.context.stroke();
        }
        this.spaceData.outlineKefyframeData.forEach((keyframeBlockData, index) => {
            const keyframeBlock = keyframeBlockData.object;
            if (!keyframeBlock.visible) return ;
            const getColor = (b) => {
                return b ? "rgb(255, 174, 0)" : targetValueToColor[keyframeBlockData.parameter];
            }
            this.context.strokeStyle = targetValueToColor[keyframeBlockData.parameter];
            this.context.lineWidth = 10;
            const keys = keyframeBlock.keys;
            let lastData = keys[0];
            for (const keyData of keys.slice(1)) {
                // ベジェ曲線を描く
                this.context.beginPath();
                this.context.moveTo(...this.worldToCanvas(lastData.point));
                this.context.bezierCurveTo(
                    ...this.worldToCanvas(lastData.rightHandle),
                    ...this.worldToCanvas(keyData.leftHandle),
                    ...this.worldToCanvas(keyData.point)
                );
                this.context.strokeStyle = this.strokeStyle;
                this.context.stroke();
                lastData = keyData;
            }
            for (const keyData of keys) {
                // 制御点と線
                line(this.worldToCanvas(keyData.point),this.worldToCanvas(keyData.leftHandle),10, getColor(keyData.selectedPoint && keyData.selectedLeftHandle));
                line(this.worldToCanvas(keyData.point),this.worldToCanvas(keyData.rightHandle),10, getColor(keyData.selectedPoint && keyData.selectedRightHandle));
                circle(this.worldToCanvas(keyData.point), 20, getColor(keyData.selectedPoint));
                circleStroke(this.worldToCanvas(keyData.leftHandle), 15, getColor(keyData.selectedLeftHandle), 7);
                circleStroke(this.worldToCanvas(keyData.rightHandle), 15, getColor(keyData.selectedRightHandle), 7);
            }
        })
        circle(this.worldToCanvas(this.inputs.position), 20, "rgb(255, 0, 0)");
    }

    clipToCanvas(p) {
        return MathVec2.mulR([p[0] / 2 + 0.5, 1 - (p[1] / 2 + 0.5)], this.canvasSize); // -1 ~ 1を0 ~ 1にしてyを0 ~ 1から1 ~ 0にしてcanvasSizeをかける
    }

    worldToCamera(p) {
        return MathVec2.mulR(MathVec2.subR(p, this.camera), MathVec2.scaleR(this.zoom, this.pixelDensity)); // (p - camera) * (zoom * pixelDensity)
    }

    cameraToWorld(p) {
        return MathVec2.addR(MathVec2.divR(p, MathVec2.scaleR(this.zoom,this.pixelDensity)), this.camera); // p / (zoom * pixelDensity) + camera
    }

    worldToClip(p) {
        return MathVec2.divR(this.worldToCamera(p), MathVec2.reverseScaleR(this.canvasSize, 2)); // worldToCamera(p) / (canvasSize / 2)
    }

    clipToWorld(p) {
        return this.cameraToWorld(MathVec2.mulR(p, MathVec2.reverseScaleR(this.canvasSize, 2))); // cameraToWorld(y * (canvasSize / 2)) = p
    }

    canvasToClip(p) {
        const a = MathVec2.divR(p,this.canvasSize);
        a[1] = 1 - a[1];
        return MathVec2.subR(MathVec2.scaleR(a, 2), [1,1]); // canvasで割ってyを1 ~ 0から 0 ~ 1にして-1 ~ 1
    }

    canvasToWorld(p) {
        return this.clipToWorld(this.canvasToClip(p));
    }

    worldToCanvas(p) {
        return this.clipToCanvas(this.worldToClip(p));
    }

    async keyInput(/** @type {InputManager} */inputManager) {
        let consumed = await this.toolPanelOperator.keyInput(inputManager); // モーダルオペレータがアクションをおこしたら処理を停止
        if (consumed) return ;
        if (inputManager.consumeKeys(["a"])) {
            for (const key of this.spaceData.getAllKeyframe) {
                key.pointSelected = true;
            }
        }
    }

    async mousedown(inputManager) {
        const mouseLocalPoint = calculateLocalMousePosition(this.canvas, inputManager.position, this.pixelDensity);
        const world = this.canvasToWorld(mouseLocalPoint);
        this.inputs.position = world;
        let consumed = await this.toolPanelOperator.mousedown(this.inputs); // モーダルオペレータがアクションをおこしたら処理を停止
        if (consumed) return ;
        if (true) { // 最短のキーフレーム
            let selectKeyframes = [];
            let minDist = 15 * 5;
            for (const keyframeBlockData of this.spaceData.outlineKefyframeData) {
                const keyframeBlock = keyframeBlockData.object;
                if (keyframeBlock.visible) {
                    for (const keyframe of keyframeBlock.keys) {
                        const pointDist = MathVec2.distanceR(this.worldToCanvas(keyframe.point), mouseLocalPoint);
                        if (pointDist < minDist) {
                            minDist = pointDist;
                            selectKeyframes.length = 0;
                            selectKeyframes.push({keyframe: keyframe, point: true});
                        }
                        const leftDist = MathVec2.distanceR(this.worldToCanvas(keyframe.leftHandle), mouseLocalPoint);
                        if (leftDist < minDist) {
                            minDist = leftDist;
                            selectKeyframes.length = 0;
                            selectKeyframes.push({keyframe: keyframe, left: true});
                        }
                        const rightDist = MathVec2.distanceR(this.worldToCanvas(keyframe.rightHandle), mouseLocalPoint);
                        if (rightDist < minDist) {
                            minDist = rightDist;
                            selectKeyframes.length = 0;
                            selectKeyframes.push({keyframe: keyframe, right: true});
                        }
                    }
                }
            }
            if (app.operator.appendCommand(new SelectKeyframesCommand(selectKeyframes, !inputManager.keysDown["Shift"]))) {
                if (app.operator.execute()) return ;
            }
        }
        if (Math.abs(world[0] - app.scene.frame_current) < 1) {
            this.frameBarDrag = true;
            return ;
        }
    }
    async mousemove(inputManager) {
        const local = MathVec2.scaleR(calculateLocalMousePosition(this.canvas, inputManager.position), this.pixelDensity);
        const world = this.canvasToWorld(local);
        this.inputs.lastPosition = [...this.inputs.position];
        MathVec2.sub(this.inputs.movement, world, this.inputs.position);
        this.inputs.position = world;

        if (this.frameBarDrag) {
            app.scene.frame_current += this.inputs.movement[0];
            useEffect.update({o: "タイムライン-canvas", g: this.groupID});
            document.body.style.cursor = "col-resize";
            return ;
        }

        let consumed = await this.toolPanelOperator.mousemove(this.inputs); // モーダルオペレータがアクションをおこしたら処理を停止
        useEffect.update({o: "タイムライン-canvas", g: this.groupID});
        if (consumed) return ;
    }
    mouseup(inputManager) {
        if (this.frameBarDrag) {
            this.frameBarDrag = false;
            document.body.style.cursor = "default";
        }
    }

    wheel(inputManager) {
        if (app.input.keysDown["Alt"]) {
            this.zoom[0] -= inputManager.wheelDelta[0] / 25;
            this.zoom[1] += inputManager.wheelDelta[1] / 25;
            this.zoom[0] = Math.max(0.1,this.zoom[0]);
            this.zoom[1] = Math.max(0.1,this.zoom[1]);
        } else {
            this.camera[0] += inputManager.wheelDelta[0] / this.zoom[0];
            this.camera[1] -= inputManager.wheelDelta[1] / this.zoom[1];
        }
        useEffect.update({o: "タイムライン-canvas", g: this.groupID});
    }
}