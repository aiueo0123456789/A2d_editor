import BezierModifierAllocation;


@group(0) @binding(0) var<storage, read_write> rendering: array<vec2<f32>>; // 出力
@group(0) @binding(1) var<storage, read> base: array<vec2<f32>>; // 元
@group(0) @binding(2) var<storage, read> shapes: array<vec2<f32>>; // アニメーション
@group(0) @binding(3) var<storage, read> weights: array<f32>; // 重み
@group(0) @binding(4) var<storage, read> bezierModifierAllocations: array<BezierModifierAllocation>; // 配分

// ベジェのポイントに対しての頂点の数
const VERTEXLEVEL = 3u;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let objectIndex = global_id.x;
    let vertexIndex = global_id.y;
    if (arrayLength(&bezierModifierAllocations) <= objectIndex) { // オブジェクト数を超えているか
        return ;
    }
    if (bezierModifierAllocations[objectIndex].pointsNum * VERTEXLEVEL <= vertexIndex) { // 頂点数を超えているか
        return ;
    }

    let shapesBufferStartIndex = bezierModifierAllocations[objectIndex].shapesOffset * VERTEXLEVEL + vertexIndex;
    var diff = vec2<f32>(0.0);
    for (var shapeKeyIndex = 0u; shapeKeyIndex < bezierModifierAllocations[objectIndex].shapeKeysNum; shapeKeyIndex ++) {
        let shapeIndex = shapesBufferStartIndex + shapeKeyIndex * bezierModifierAllocations[objectIndex].pointsNum * VERTEXLEVEL;
        let weightIndex = bezierModifierAllocations[objectIndex].shapeKeyWeightsOffset + shapeKeyIndex;
        diff += shapes[shapeIndex] * weights[weightIndex];
    }
    let fixVertexIndex = bezierModifierAllocations[objectIndex].pointsOffset * VERTEXLEVEL + vertexIndex;
    rendering[fixVertexIndex] = base[fixVertexIndex] + diff;
}