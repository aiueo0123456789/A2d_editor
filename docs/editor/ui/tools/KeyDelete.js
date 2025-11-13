import { app } from "../../../main.js";

export class KeyDelete {
    constructor(/** @type {InputManager} */inputManager) {
        this.activateKey = "x";
    }

    init() {
        return {complete: true};
    }

    execute() {
    }
}