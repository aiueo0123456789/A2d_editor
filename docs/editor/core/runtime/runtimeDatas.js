import { Application } from "../../app/app.js";
import { ArmatureData } from "./entity/armatureData.js";
import { BezierModifierData } from "./entity/bezierModifierData.js";
import { GraphicMeshData } from "./entity/graphicMeshData.js";
import { ParticleData } from "./entity/particle.js";

export class RuntimeDatas {
    constructor(/** @type {Application} */ app) {
        /** @type {Application} */
        this.app = app;
        this.graphicMeshData = new GraphicMeshData(app);
        this.armatureData = new ArmatureData(app);
        this.bezierModifierData = new BezierModifierData(app);
        this.particle = new ParticleData(app);
    }

    getByID(object) {
        console.log("呼び出された")
        let index = 0;
        if (object.type == "BezierModifier") {
            index = this.bezierModifierData.order.indexOf(object);
        }
        return index;
    }

    append(runtimeData, object) {
        runtimeData.append(object);
    }

    delete(runtimeData, object) {
        runtimeData.delete(object);
    }
}