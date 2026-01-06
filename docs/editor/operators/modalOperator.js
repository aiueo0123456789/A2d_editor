import { InputManager } from "../app/inputManager/inputManager.js";
import { isFunction } from "../utils/utility.js";

/**
 * modalの戻り値で終了などを管理する
 * RUNNING: 継続
 * FINISHED: 完了
 * CANCELLED: 破棄
 */
export class ModalOperator {
    constructor() {
        this.nowModal = null;
    }

    finish() {
        this.nowModal = null;
    }

    util(modalResult) {
        if (modalResult == "RUNNING") ;
        else if (modalResult == "FINISHED") this.finish();
        else if (modalResult == "CANCELLED") {
            this.finish();
            console.warn("モーダルが破棄されました")
        }
    }

    start(modalInstance) {
        this.nowModal = new modalInstance();
    }

    async keyInput(/** @type {InputManager} */inputManager) {
        if (!this.nowModal) return false;
        if (isFunction(this.nowModal.keyInput)) this.util(await this.nowModal.keyInput(inputManager));
        return true;
    }

    async mousemove(/** @type {InputManager} */inputManager) {
        if (!this.nowModal) return false;
        if (isFunction(this.nowModal.mousemove)) this.util(await this.nowModal.mousemove(inputManager));
        return true;
    }

    async mousedown(/** @type {InputManager} */inputManager) {
        if (!this.nowModal) return false;
        if (isFunction(this.nowModal.mousedown)) this.util(await this.nowModal.mousedown(inputManager));
        return true;
    }

    async mouseup(/** @type {InputManager} */inputManager) {
        if (!this.nowModal) return false;
        if (isFunction(this.nowModal.mouseup)) this.util(await this.nowModal.mouseup(inputManager));
        return true;
    }

    async wheel(/** @type {InputManager} */inputManager) {
        if (!this.nowModal) return false;
        if (isFunction(this.nowModal.wheel)) this.util(await this.nowModal.wheel(inputManager));
        return true;
    }
}