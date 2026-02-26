import { isFunction } from "../utils/utility.js";

export class Flag {
    constructor(flag, start, update, finish, object = {}) {
        this.flag = flag;
        this.start = start;
        this.update = update;
        this.finish = finish;
        this.object = object;
        this.enabled = false;
    }
}

export class FlagOperator {
    constructor() {
        /** @type { Map<String, Flag> } */
        this.flags = new Map();
    }

    setFlag(/** @type { Flag } */ flag) {
        if (!this.flags.has(flag.flag)) this.flags.set(flag.flag, flag);
        else console.warn(`フラグ: ${flag} の型が違います`);
    }

    removeFlag(/** @type { Flag } */ flag) {
        return this.flags.delete(flag);
    }

    enableFlag(flag) {
        if (this.flags.has(flag)) {
            const o = this.flags.get(flag);
            if (isFunction(o.start)) o.start(o.object);
            o.enabled = true;
        }
    }

    disableFlag(flag) {
        if (this.flags.has(flag)) {
            const o = this.flags.get(flag);
            if (isFunction(o.finish)) o.finish(o.object);
            o.enabled = false;
        }
    }

    update() {
        for (const o of this.flags.values()) {
            if (isFunction(o.update)) o.update(o.object);
        }
    }
}