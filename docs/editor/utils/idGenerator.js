const usedIDs = new Map();
export function createID() {
    while (true) {
        var S="abcdefghijklmnopqrsttexCoordwxyzABCDEFGHIJKLMNOPQRSTTexCoordWXYZ0123456789";
        var N=16;
        const strings = Array.from(Array(N)).map(()=>S[Math.floor(Math.random()*S.length)]).join('');
        if (!usedIDs.has(strings)) {
            usedIDs.set(strings, true);
            return strings;
        }
    }
}

export function setID(id) {
    if (!usedIDs.has(id)) {
        usedIDs.set(id, true);
    }
    return id;
}