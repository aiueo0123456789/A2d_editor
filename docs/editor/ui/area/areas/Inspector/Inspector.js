import { app } from "../../../../../main.js";
import { AppendBlendShapePointCommand, AppendShapeKeyInBlendShapeCommand, CreateShapeKeyCommand, DeleteShapeKeyCommand, DeleteShapeKeyInBlendShapeCommand } from "../../../../commands/mesh/shapeKey.js";
import { ChangeParentCommand } from "../../../../commands/object/object.js";
import { ChangeParameterCommand } from "../../../../commands/utile/utile.js";
import { BMeshShapeKey } from "../../../../core/edit/entity/BMeshShapeKey.js";
import { changeParameter } from "../../../../utils/utility.js";

export class Area_Inspector {
    constructor(area) {
        this.dom = area.main;

        this.struct = {
            inputObject: {"context": app.context,"scene": app.scene},
            DOM: [
                {tagType: "html", type: "div", class: "ui_container_0", children: [
                    {tagType: "path", sourceObject: "context/activeObject", updateEventTarget: {path: "context/%activeObject"}, children: [
                        {tagType: "panel", name: "基本情報", children: [
                            {tagType: "if", formula: {source: "/type", conditions: "==", value: "GraphicMesh"},
                                true: [
                                    {tagType: "label", text: "name", children: [
                                        {tagType: "input", value: "/name", type: "text"},
                                    ]},
                                    {tagType: "label", text: "parent", children: [
                                        {tagType: "select",
                                            value: (value) => {
                                                app.operator.appendCommand(new ChangeParentCommand([app.context.activeObject], app.scene.objects.getObjectByID(value)));
                                                app.operator.execute();
                                            },
                                            sourceObject: () => {
                                                return app.scene.objects.getObjectsFromeTypes(["BezierModifier", "Armature"]).map(object => {return {name: object.name, id: object.id}});
                                            },
                                            options: {initValue: {path: "context/activeObject/parent/name"}}
                                        },
                                    ]},
                                    {tagType: "label", text: "zIndex", children: [
                                        {tagType: "input", value: "/zIndex", type: "number", min: 0, max: 1000, step: 1},
                                    ]},
                                    {tagType: "label", text: "verticesNum", children: [
                                        {tagType: "input", value: "/verticesNum", type: "number", custom: {collision: false, visual: "1"}},
                                    ]},
                                    {tagType: "label", text: "editRock", children: [
                                        {tagType: "input", type: "checkbox", checked: "/editRock", look: {check: "rock", uncheck: "unrock"}},
                                    ]},
                                    {tagType: "label", text: "texutre", children: [
                                        {tagType: "select",
                                            value: (value) => {
                                                app.operator.appendCommand(new ChangeParameterCommand(app.context.activeObject, "texture", app.scene.objects.getObjectByID(value), (o,p,v) => {o.changeTexture(v)}));
                                                app.operator.execute();
                                            },
                                            sourceObject: () => {
                                                return app.scene.objects.textures.map(texture => {return {name: texture.name, id: texture.id}});
                                            },
                                            options: {initValue: {path: "context/activeObject/texture/name"}}
                                        },
                                    ]},
                                    {tagType: "label", text: "texupreviewtre", children: [
                                        {tagType: "path", sourceObject: "/texture", updateEventTarget: {path: "/%texture"}, children: [
                                            {tagType: "texture", sourceTexture: "/texture"},
                                        ]},
                                    ]},
                                    {tagType: "label", text: "mask", children: [
                                        {tagType: "select",
                                            value: (value) => {
                                                app.context.activeObject.changeClippingMask(app.scene.objects.getObjectByID(value));
                                            },
                                            sourceObject: () => {
                                                return app.scene.objects.maskTextures.map(texture => {return {name: texture.name, id: texture.id}});
                                            },
                                            options: {initValue: {path: "context/activeObject/clippingMask/name"}}
                                        },
                                    ]},
                                    {tagType: "label", text: "renderingTarget", children: [
                                        {tagType: "select",
                                            value: (value) => {
                                                app.context.activeObject.changeRenderingTarget(app.scene.objects.getObjectByID(value));
                                            },
                                            sourceObject: () => {
                                                return [{name: "", id: null}].concat(app.scene.objects.maskTextures.map(texture => {return {name: texture.name, id: texture.id}}));
                                            },
                                            options: {initValue: {path: "context/activeObject/renderingTarget/name"}}
                                        },
                                    ]},
                                    {tagType: "label", text: "autoWeight", children: [
                                        {tagType: "input", type: "checkbox", checked:  "/autoWeight", look: {check: "check", uncheck: "uncheck"}},
                                    ]},
                                    {tagType: "label", text: "visible", children: [
                                        {tagType: "input", type: "checkbox", checked:  "/visible", look: {check: "display", uncheck: "hide"}},
                                    ]}
                                ],
                                false: [
                                    {tagType: "if", formula: {source: "/type", conditions: "==", value: "BezierModifier"},
                                        true: [
                                            {tagType: "label", text: "name", children: [
                                                {tagType: "input", value: "/name", type: "text"},
                                            ]},
                                            {tagType: "label", text: "parent", children: [
                                                {tagType: "select",
                                                    value: (value) => {
                                                        app.operator.appendCommand(new ChangeParentCommand([app.context.activeObject], app.scene.objects.getObjectByID(value)));
                                                        app.operator.execute();
                                                    },
                                                    sourceObject: () => {
                                                        return app.scene.objects.getObjectsFromeTypes(["BezierModifier", "Armature"]).map(object => {return {name: object.name, id: object.id}});
                                                    },
                                                    options: {initValue: {path: "context/activeObject/parent/name"}}
                                                },
                                            ]},
                                            {tagType: "label", text: "pointsNum", children: [
                                                {tagType: "input", value: "/pointsNum", type: "number", custom: {collision: false, visual: "1"}},
                                            ]},
                                            {tagType: "label", text: "autoWeight", children: [
                                                {tagType: "input", type: "checkbox", checked:  "/autoWeight", look: {check: "check", uncheck: "uncheck"}},
                                            ]},
                                            {tagType: "label", text: "visible", children: [
                                                {tagType: "input", type: "checkbox", checked:  "/visible", look: {check: "display", uncheck: "hide"}},
                                            ]}
                                        ],
                                        false: [
                                            {tagType: "if", formula: {source: "/type", conditions: "==", value: "Armature"},
                                                true: [
                                                    {tagType: "label", text: "name", children: [
                                                        {tagType: "input", value: "/name", type: "text"},
                                                    ]},
                                                    {tagType: "label", text: "bonesNum", children: [
                                                        {tagType: "input", value: "/bonesNum", type: "number", custom: {collision: false, visual: "1"}},
                                                    ]},
                                                    {tagType: "label", text: "visible", children: [
                                                        {tagType: "input", type: "checkbox", checked:  "/visible", look: {check: "display", uncheck: "hide"}},
                                                    ]}
                                                ],
                                                false: [
                                                    {tagType: "if", formula: {source: "/type", conditions: "==", value: "BlendShape"},
                                                        true: [
                                                            {tagType: "label", text: "name", children: [
                                                                {tagType: "input", value: "/name", type: "text"},
                                                            ]},
                                                            {tagType: "label", text: "minX", children: [
                                                                {tagType: "input", value: "/min/0", type: "number"},
                                                            ]},
                                                            {tagType: "label", text: "minY", children: [
                                                                {tagType: "input", value: "/min/1", type: "number"},
                                                            ]},
                                                            {tagType: "label", text: "maxX", children: [
                                                                {tagType: "input", value: "/max/0", type: "number"},
                                                            ]},
                                                            {tagType: "label", text: "maxY", children: [
                                                                {tagType: "input", value: "/max/1", type: "number"},
                                                            ]},
                                                            {tagType: "label", text: "valueX", children: [
                                                                {tagType: "input", value: "/value/0", type: "number"},
                                                                {tagType: "hasKeyframeCheck", src: "/keyframeBlockManager/keyframeBlocks/0", value: "/value/0"},
                                                            ]},
                                                            {tagType: "label", text: "valueY", children: [
                                                                {tagType: "input", value: "/value/1", type: "number"},
                                                                {tagType: "hasKeyframeCheck", src: "/keyframeBlockManager/keyframeBlocks/1", value: "/value/1"},
                                                            ]},
                                                            {tagType: "operatorButton", label: "Add", onClick: (object) => {
                                                                app.operator.appendCommand(new AppendBlendShapePointCommand(object.normal));
                                                                app.operator.execute();
                                                            }},
                                                            {tagType: "dualListbox", available: "scene/objects/shapeKeys", selected: "/shapeKeys",
                                                                onAppend: (shapeKey) => {
                                                                    app.operator.appendCommand(new AppendShapeKeyInBlendShapeCommand(app.context.activeObject, shapeKey));
                                                                    app.operator.execute();
                                                                },
                                                                onDelete: (shapeKey) => {
                                                                    app.operator.appendCommand(new DeleteShapeKeyInBlendShapeCommand(app.context.activeObject, shapeKey));
                                                                    app.operator.execute();
                                                                }
                                                                , liStruct: [
                                                                {tagType: "gridBox", axis: "c", allocation: "1fr", children: [
                                                                    {tagType: "dblClickInput", value: "/name"},
                                                                ]},
                                                            ]}
                                                        ],
                                                        false: [
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]},
                        {tagType: "panel", name: "シェイプキー", children: [
                            {tagType: "list", label: "シェイプキー", onAppend: () => {
                                // app.operator.appendCommand(new CreateShapeKeyCommand("名称未設定"));
                                // app.operator.execute();
                            }, onDelete: (shapeKeys) => {
                                // app.operator.appendCommand(new DeleteShapeKeyCommand(shapeKeys));
                                // app.operator.execute();
                            }, onActive: (object) => {
                                // /** @type {BMeshShapeKey} */
                                // const bms = app.scene.editData.getEditObjectByObject(app.context.activeObject);
                                // changeParameter(bms, "activeShapeKey", object);
                                // bms.updateGPUData();
                            }, src: "/shapeKeyMetaDatas", type: "min",
                            liStruct: {
                                tagType: "gridBox", id: {path: "/shapeKeyMetaDatas/{!index}/name"}, axis: "c", allocation: "1fr", children: [
                                    {tagType: "dblClickInput", value: "/name"},
                                ]
                            }}
                        ]},
                    ], errorChildren: [
                        {tagType: "panel", name: "基本情報", children: []}
                    ]},
                    {tagType: "path", sourceObject: "scene/editData/editObjects/{context/activeObject/id}", updateEventTarget: "changeEditMode", children: [
                        {
                            tagType: "if", formula: {source: "/constructor/name", conditions: "==", value: "BMeshShapeKey"},
                            true: [
                                {tagType: "panel", name: "シェイプキー", children: [
                                    {tagType: "list", label: "シェイプキー", onAppend: () => {
                                        app.operator.appendCommand(new CreateShapeKeyCommand("名称未設定"));
                                        app.operator.execute();
                                    }, onDelete: (shapeKeys) => {
                                        app.operator.appendCommand(new DeleteShapeKeyCommand(shapeKeys));
                                        app.operator.execute();
                                    }, onActive: (object) => {
                                        /** @type {BMeshShapeKey} */
                                        const bms = app.scene.editData.getEditObjectByObject(app.context.activeObject);
                                        changeParameter(bms, "activeShapeKey", object);
                                        bms.updateGPUData();
                                    }, src: "/shapeKeys", type: "min",
                                    liStruct: {
                                        tagType: "gridBox", id: {path: "/shapeKeyMetaDatas/{!index}/name"}, axis: "c", allocation: "1fr", children: [
                                            {tagType: "dblClickInput", value: "/name"},
                                        ]
                                    }}
                                ]},
                            ],
                            false: [
                                {
                                    tagType: "if", formula: {source: "/constructor/name", conditions: "==", value: "BBezierShapeKey"},
                                    true: [
                                        {tagType: "panel", name: "シェイプキー", children: [
                                            {tagType: "list", label: "シェイプキー", onAppend: () => {
                                                app.operator.appendCommand(new CreateShapeKeyCommand("名称未設定"));
                                                app.operator.execute();
                                            }, onDelete: (shapeKeys) => {
                                                app.operator.appendCommand(new DeleteShapeKeyCommand(shapeKeys));
                                                app.operator.execute();
                                            }, onActive: (object) => {
                                                /** @type {BMeshShapeKey} */
                                                const bms = app.scene.editData.getEditObjectByObject(app.context.activeObject);
                                                changeParameter(bms, "activeShapeKey", object);
                                                bms.updateGPUData();
                                            }, src: "/shapeKeys", type: "min",
                                            liStruct: {
                                                tagType: "gridBox", id: {path: "/shapeKeyMetaDatas/{!index}/name"}, axis: "c", allocation: "1fr", children: [
                                                    {tagType: "dblClickInput", value: "/name"},
                                                ]
                                            }}
                                        ]},
                                    ],
                                    false: [
                                    ]
                                }
                            ]
                        }
                    ]},
                ]}
            ],
            utility: {
                "testTest": {}
            }
        };

        this.jTag = area.jTag;
        this.jTag.create(area.main, this.struct);
    }
}