import { app } from "../../../main.js";
import { useEffect } from "../../utils/ui/util.js";
import { changeParameter } from "../../utils/utility.js";

export class SetActiveObjectsCommand {
    constructor(object) {
        this.object = object;
        this.originalObject = app.context.activeObject;
    }

    execute() {
        changeParameter(app.context, "activeObject", this.object);
        if (this.object) {
            this.object.selected = true;
        }
        useEffect.update({o: "アクティブオブジェクト"});
        return {state: "FINISHED"};
    }

    undo() {
        changeParameter(app.context, "activeObject", this.originalObject);
        if (this.object) {
            this.object.selected = false;
        }
        useEffect.update({o: "アクティブオブジェクト"});
    }
}

export class SelectObjectsCommand {
    constructor(object,multiple) {
        this.multiple = multiple;
        this.targetObject = object;
        this.originalSelectData = app.context.selectedObjects; // selectedObjectsはゲッターだから[...app.context.selectedObjects]じゃなくていい
    }

    execute() {
        if (!this.multiple) { // 選択をリセット
            this.originalSelectData.forEach((object) => {
                object.selected = false;
            })
        }
        if (this.targetObject) {
            this.targetObject.selected = true;
        }
        useEffect.update({o: "オブジェクト選択"});
        return {state: "FINISHED"};
    }

    undo() {
        if (this.targetObject) {
            this.targetObject.selected = false;
        }
        this.originalSelectData.forEach((object) => {
            object.selected = true;
        })
        useEffect.update({o: "オブジェクト選択"});
    }
}