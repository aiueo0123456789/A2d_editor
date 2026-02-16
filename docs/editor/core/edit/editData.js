import { Application } from "../../app/app.js";
import { Armature } from "../entity/armature.js";
import { BezierModifier } from "../entity/bezierModifier.js";
import { BlendShape } from "../entity/blendShape.js";
import { GraphicMesh } from "../entity/graphicMesh.js";
import { KeyframeBlockManager } from "../entity/keyframeBlockManager.js";
import { BArmature } from "./entity/BArmature.js";
import { BArmatureAnimation } from "./entity/BArmatureAnimation.js";
import { BBezier } from "./entity/BBezier.js";
import { BBezierShapeKey } from "./entity/BBezierShapeKey.js";
import { BBezierWeight } from "./entity/BBezierWeight.js";
import { BBlendShape } from "./entity/BBlendShape.js";
import { BKeyframeBlockManager } from "./entity/BKeyframeBlockManager.js";
import { BMesh } from "./entity/BMesh.js";
import { BMeshShapeKey } from "./entity/BMeshShapeKey.js";
import { BMeshWeight } from "./entity/BMeshWeight.js";

export class EditDatas {
    constructor(/** @type {Application} */ app) {
        /** @type {Application} */
        this.app = app;
        this.editObjects = new Map();
    }

    getEditObjectByObject(object) {
        return this.editObjects.get(object.id);
    }
    getEditObjectByObjectID(objectID) {
        return this.editObjects.get(objectID);
    }

    appendEditObject(object, editObject) {
        this.editObjects.set(object.id, editObject);
    }

    createEditObject(object, mode) {
        let b = null;
        if (object instanceof GraphicMesh) {
            if (mode == "メッシュ編集") {
                b = new BMesh();
            } else if (mode == "メッシュウェイト編集") {
                b = new BMeshWeight();
            } else if (mode == "メッシュシェイプキー編集") {
                b = new BMeshShapeKey();
            }
            b.fromMesh(object);
        } else if (object instanceof Armature) {
            if (mode == "ボーン編集") {
                b = new BArmature();
            } else if (mode == "ボーンアニメーション編集") {
                b = new BArmatureAnimation();
            } else if (mode == "メッシュウェイト編集") {
                b = new BArmatureAnimation("weightPaint");
            } else if (mode == "ベジェウェイト編集") {
                b = new BArmatureAnimation("weightPaint");
            }
            b.fromArmature(object);
        } else if (object instanceof BezierModifier) {
            if (mode == "ベジェ編集") {
                b = new BBezier();
            } else if (mode == "ベジェシェイプキー編集") {
                b = new BBezierShapeKey();
            } else if ("ベジェウェイト編集") {
                b = new BBezierWeight();
            }
            b.fromBezier(object);
        } else if (object instanceof KeyframeBlockManager) {
            b = new BKeyframeBlockManager();
            b.fromKeyframeBlockManager(object);
        } else if (object instanceof BlendShape) {
            b = new BBlendShape();
            b.fromBlendShape(object);
        }
        return b;
    }

    deleteEditObject(object) {
        if (!this.editObjects.delete(object.id)) {
            console.log(this, object);
            console.warn(`${object.id}の編集オブジェクトが削除できませんでした`);
        }
    }

    get allEditObjects() {
        return Array.from(this.editObjects.values());
    }
}