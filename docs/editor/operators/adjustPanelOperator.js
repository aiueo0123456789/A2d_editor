import { app } from "../../main.js";
import { AdjustPanel_ChangeParent } from "../ui/adjustPanels/ChangeParent.js";
import { AdjustPanel_BoneExtrudeMove } from "../ui/adjustPanels/BoneExtrudeMove.js";
import { AdjustPanel_Resize } from "../ui/adjustPanels/Resize.js";
import { AdjustPanel_Rotate } from "../ui/adjustPanels/Rotate.js";
import { AdjustPanel_Translate } from "../ui/adjustPanels/Translate.js";
import { JTag } from "../utils/JTag/JTag.js";
import { AdjustPanel_BezierExtrudeMove } from "../ui/adjustPanels/BezierExtrudeMove.js";

const adjustPanels = [
    AdjustPanel_Translate,
    AdjustPanel_Resize,
    AdjustPanel_Rotate,
    AdjustPanel_ChangeParent,
    AdjustPanel_BoneExtrudeMove,
    AdjustPanel_BezierExtrudeMove,
]

export class AdjustPanelOperator {
    constructor() {
        this.jTag = new JTag("AdjustPanelOperator");
    }

    show(command) {
        this.jTag.remove();
        const adjustPanel = app.activeArea.uiModel.adjustPanel;
        if (!adjustPanel) console.warn("このエリアではadjustPanelは表示できません");
        // const lastCommand = getArrayLastValue(app.operator.commands);
        let panel = null;
        for (const adjustPanel of adjustPanels) {
            if (command instanceof adjustPanel.commandInstance) panel = new adjustPanel(command);
        }
        if (panel) this.jTag.create(adjustPanel, panel.uiModel);
    }

    hide() {
        this.jTag.remove();
    }
}