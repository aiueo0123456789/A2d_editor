import { app } from "../../main.js";
import { AdjustPanel_ChangeParent } from "../ui/adjustPanels/changeParent.js";
import { AdjustPanel_ExtrudeMove } from "../ui/adjustPanels/ExtrudeMove.js";
import { AdjustPanel_Resize } from "../ui/adjustPanels/resize.js";
import { AdjustPanel_Rotate } from "../ui/adjustPanels/rotate.js";
import { AdjustPanel_Translate } from "../ui/adjustPanels/Translate.js";
import { JTag } from "../utils/JTag/JTag.js";

const adjustPanels = [
    AdjustPanel_Translate,
    AdjustPanel_Resize,
    AdjustPanel_Rotate,
    AdjustPanel_ChangeParent,
    AdjustPanel_ExtrudeMove,
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