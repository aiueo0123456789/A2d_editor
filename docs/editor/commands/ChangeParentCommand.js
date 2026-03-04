// 親要素の変更
export class ChangeParentCommand {
    constructor(targets, newParent) {
        this.targets = [...targets];
        this.originalParent = targets.map(target => target.parent);
        this.newParent = newParent;
    }

    update(newParent) {
        this.newParent = newParent;
        this.targets.forEach((target) => {
            target.changeParent(this.newParent);
        })
    }

    execute() {
        this.targets.forEach((target) => {
            target.changeParent(this.newParent);
        })
        return {state: "FINISHED"};
    }

    undo() {
        this.targets.forEach((target, index) => {
            target.changeParent(this.originalParent[index]);
        })
    }
}