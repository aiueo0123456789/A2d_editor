import { app } from "../../../../../main.js";
import { AppendBlendShapePointCommand, AppendShapeKeyInBlendShapeCommand } from "../../../../commands/mesh/shapeKey.js";
import { CopyObjectCommand, CreateObjectCommand, DeleteObjectCommand } from "../../../../commands/object/object.js";
import { AppendParameterInParameterManager, DeleteParameterInParameterManager } from "../../../../commands/parameterManager/parameter.js";
import { BlendShape } from "../../../../core/entity/blendShape.js";
import { MathVec2 } from "../../../../utils/mathVec.js";
import { calculateLocalMousePosition, objectInit } from "../../../../utils/utility.js";

export class Area_Property {
    constructor(area) {
        this.dom = area.main;

        this.pixelDensity = 4;

        this.struct = {
            inputObject: {"scene": app.scene, "app": app},
            DOM: [
                {tagType: "html", type: "div", class: "ui_container_0", children: [
                    // {tagType: "tab", name: "アニメーション", children: [

                    // ]},
                    {tagType: "panel", name: "アニメーション", children: [
                        {tagType: "label", text: "開始", children: [
                            {tagType: "input", value: "scene/frame_start", type: "number", min: 0, max: 500, step: 1, custom: {visual: "range"}},
                        ]},
                        {tagType: "label", text: "終了", children: [
                            {tagType: "input", value: "scene/frame_end", type: "number", min: 0, max: 500, step: 1, custom: {visual: "range"}},
                        ]},
                        {tagType: "label", text: "FPS", children: [
                            {tagType: "input", value: "scene/frame_speed", type: "number", min: 0, max: 60, step: 1, custom: {visual: "range"}},
                        ]},
                    ]},
                    {tagType: "panel", name: "マスク", children: [
                        {tagType: "list", label: "マスク", onAppend: () => {
                            app.operator.appendCommand(new CreateObjectCommand({type: "MaskTexture", name: "名称未設定"}));
                            app.operator.execute();
                        }, onDelete: (masks) => {
                            app.operator.appendCommand(new DeleteObjectCommand(masks));
                            app.operator.execute();
                        }, src: "scene/objects/maskTextures", type: "min",
                        liStruct: {
                            tagType: "gridBox", id: {path: "scene/objects/maskTextures/{!index}/id"}, axis: "c", allocation: "1fr", children: [
                                {tagType: "dblClickInput", value: "/name"},
                            ]
                        }}
                    ]},
                    {tagType: "panel", name: "ParameterManager", children: [
                        {tagType: "list", onAppend: () => {
                            app.operator.appendCommand(new CreateObjectCommand({type: "ParameterManager", name: "名称未設定"}));
                            app.operator.execute();
                        }, onDelete: (parameterManagers) => {
                            app.operator.appendCommand(new DeleteObjectCommand(parameterManagers));
                            app.operator.execute();
                        }, src: "scene/objects/parameterManagers", options: {}, notUseActiveAndSelect: true,
                        liStruct: {
                            tagType: "panel", id: {path: "scene/objects/parameterManagers/{!index}/id"}, name: {path: "/name"}, children: [
                                {tagType: "gridBox", axis: "c",  allocation: "auto 1fr auto", children: [
                                    {tagType: "dblClickInput", value: "/name"},
                                    {tagType: "operatorButton", label: "copy", onClick: (object) => {
                                        console.log(object);
                                        app.operator.appendCommand(new CopyObjectCommand(object.normal));
                                        app.operator.execute();
                                    }},
                                ]},
                                {tagType: "list", onAppend: (object) => {
                                    app.operator.appendCommand(new AppendParameterInParameterManager(object.normal));
                                    app.operator.execute();
                                }, src: "/parameters", options: {}, notUseActiveAndSelect: true, type: "noScroll",
                                liStruct: {
                                    tagType: "gridBox", id: {path: "</{!index}"}, axis: "c",  allocation: "auto 1fr auto", children: [
                                        {tagType: "dblClickInput", value: "/label"},
                                        {tagType: "input", value: "/value", type: "number"},
                                        {tagType: "operatorButton", label: "delete", onClick: (object) => {
                                            app.operator.appendCommand(new DeleteParameterInParameterManager(object.special.source.normal, object.normal));
                                            app.operator.execute();
                                        }},
                                    ]
                                }}
                            ]
                        }}
                    ]},
                    {tagType: "panel", name: "カメラ", children: [
                        {tagType: "label", text: "displayRangeX", children: [
                            {tagType: "input", value: "scene/objects/renderingCamera/displayRange/0", type: "number", min: 1, max: 2048, step: 1, custom: {visual: "range"}},
                        ]},
                        {tagType: "label", text: "displayRangeY", children: [
                            {tagType: "input", value: "scene/objects/renderingCamera/displayRange/1", type: "number", min: 1, max: 2048, step: 1, custom: {visual: "range"}},
                        ]}
                    ]},
                    {tagType: "panel", name: "デバッグ", children: [
                        {tagType: "label", text: "textureAtls", children: [
                            {tagType: "path", sourceObject: "scene/runtimeData/graphicMeshData", updateEventTarget: {path: "scene/runtimeData/graphicMeshData/%textureAtls"}, children: [
                                {tagType: "texture", sourceTexture: "/textureAtls"},
                            ]},
                        ]}
                    ]},
                ]}
            ],
        };

        this.jTag = area.jTag;
        this.jTag.create(area.main, this.struct);
    }
}