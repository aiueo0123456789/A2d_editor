function clamp(min,max,value) {
    if (value > max) {
        return max;
    }
    if (value < min) {
        return min;
    }
    return value;
}

export class ResizerForDOM {
    constructor(target, axis, min = 0, max = 10000) {
        /** @type {HTMLElement} */
        this.target = target;
        this.target.style.position = "relative";
        this.axis = axis;
        this.min = min;
        this.max = max;

        this.resizer = document.createElement("div");
        this.resizer.className = `resizer-${axis}`;
        this.target.append(this.resizer);

        if (axis == "r") {
            this.resizer.addEventListener("mousedown", (e) => {
                e.stopPropagation();
                this.isResizing = true;
                // マウス座標を記録
                const startWidth = this.target.offsetWidth;
                const startX = e.clientX;
                const onMouseMove = (e) => {
                    // サイズを計算して適用
                    const newWidth = clamp(this.min, this.max, startWidth + (e.clientX - startX));
                    this.target.style.width = `${newWidth}px`;
                };
                const onMouseUp = () => {
                    this.isResizing = false;
                    // イベントリスナーの解除
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                };
                // マウスイベントのリスナーを追加
                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            });
        } else if (axis == "l") {
            this.resizer.addEventListener("mousedown", (e) => {
                e.stopPropagation();
                this.isResizing = true;
                // マウス座標を記録
                const startWidth = this.target.offsetWidth;
                const startX = e.clientX;
                const onMouseMove = (e) => {
                    // サイズを計算して適用
                    const newWidth = clamp(this.min, this.max, startWidth + (startX - e.clientX));
                    this.target.style.width = `${newWidth}px`;
                };
                const onMouseUp = () => {
                    this.isResizing = false;
                    // イベントリスナーの解除
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                };
                // マウスイベントのリスナーを追加
                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            });
        } else {
            this.resizer.addEventListener("mousedown", (e) => {
                e.stopPropagation();
                this.isResizing = true;
                // マウス座標を記録
                const startHeight = this.target.offsetHeight;
                const startY = e.clientY;
                const onMouseMove = (e) => {
                    // サイズを計算して適用
                    const newHeight = clamp(this.min, this.max, startHeight + (e.clientY - startY));

                    this.target.style.height = `${newHeight}px`;
                };
                const onMouseUp = () => {
                    this.isResizing = false;
                    // イベントリスナーの解除
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                };
                // マウスイベントのリスナーを追加
                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            });
        }
    }
}