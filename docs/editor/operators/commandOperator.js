import { createID } from "../utils/idGenerator.js";
import { useEffect } from "../utils/ui/util.js";
import { isFunction } from "../utils/utility.js";

// undoとredoを実行
class CommandStack {
    constructor(/** @type {Operator} */ operator) {
        this.operator = operator;
        this.history = [];
        this.redoStack = [];
    }

    undo() {
        if (this.operator.commands.length) {
            console.log("スタックの解消", [...this.operator.commands])
            this.operator.execute();
        }
        if (this.history.length > 0) {
            const commands = this.history.pop();
            for (const command of commands) {
                console.log("undo",command);
                command.undo();
            }
            this.redoStack.push(commands);
            useEffect.update({o: this.history});
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            const commands = this.redoStack.pop();
            for (const command of commands.reverse()) {
                console.log("redo",command);
                if (isFunction(command.redo)) {
                    command.redo();
                } else {
                    command.execute();
                }
            }
            this.history.push(commands);
            useEffect.update({o: this.history});
        }
    }
}

// コマンド関係の管理
export class Operator {
    constructor(app) {
        this.app = app;
        this.stack = new CommandStack(this);
        this.commands = [];
        this.errorLog = [];
    }

    appendCommand(command) {
        console.log(command)
        if (command.error) {
            console.error("コマンドの初期化でエラーが出た可能性があります");
            return false;
        } else {
            command.id = createID();
            this.commands.push(command);
            return true;
        }
    }

    appendErrorLog(log) {
        this.errorLog.push({text: log});
        useEffect.update({o: this.errorLog});
    }

    async execute() {
        let noError = true;
        const commandsToStack = [];
        while (this.commands.length != 0) {
            const command = this.commands.shift();
            const result = await command.execute();
            if (result.error) {
                this.errorLog.push(result.error);
                console.error("コマンド実行時のエラー", result, command)
                noError = false;
            } else if (result.consumed) {
                commandsToStack.push(command);
            } else {
                console.warn("差分が検出できなかった可能性があります", result, command)
                noError = false;
            }
        }
        if (commandsToStack.length) {
            this.stack.history.push(commandsToStack);
            this.stack.redoStack.length = 0; // 新しい操作をしたらRedoはリセット
        }
        return noError;
    }
}

// export const operator = new Operator();