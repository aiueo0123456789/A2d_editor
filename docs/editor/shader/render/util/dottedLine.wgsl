import Camera;

struct DottedLineUniform {
    startX: f32,            // X
    startY: f32,            // Y
    endX: f32,              // X
    endY: f32,              // Y
    width: f32,             // 太さ
    size: f32,              // 塗りつぶす範囲
    gap: f32,               // 隙間
    colorR: f32,            // 色R
    colorG: f32,            // 色G
    colorB: f32,            // 色B
    colorA: f32,            // 色A
    isAffectedForZoomWidth: f32,
};

@group(0) @binding(0) var<uniform> camera: Camera;
@group(0) @binding(1) var mySampler: sampler;
@group(1) @binding(0) var<uniform> dottedLine: DottedLineUniform;

struct VertexOutput {
    @builtin(position) position: vec4<f32>, // クリッピング座標系での頂点位置
    @location(0) y: f32,
}

// バーテックスシェーダー
@vertex
fn vmain(
    @builtin(instance_index) instanceIndex: u32, // インスタンスのインデックス
    @builtin(vertex_index) vertexIndex: u32
) -> VertexOutput {
    var output: VertexOutput;

    let position1 = vec2<f32>(dottedLine.startX, dottedLine.startY);
    let position2 = vec2<f32>(dottedLine.endX, dottedLine.endY);
    let sub = position2 - position1;
    let normal = normalize(vec2<f32>(-sub.y, sub.x)); // 仮の法線
    var offset = vec2<f32>(0.0);

    let k = (normal * dottedLine.width) / ((camera.zoom * (1.0 - dottedLine.isAffectedForZoomWidth)) + dottedLine.isAffectedForZoomWidth);

    if (vertexIndex % 4u == 0u) {
        offset = position1 - k;
        output.y = 0;
    } else if (vertexIndex % 4u == 1u) {
        offset = position1 + k;
        output.y = 0;
    } else if (vertexIndex % 4u == 2u) {
        offset = position2 - k;
        output.y = length(sub);
    } else {
        offset = position2 + k;
        output.y = length(sub);
    }

    output.position = vec4f(
        (offset - camera.position) * camera.zoom * camera.cvsSize,
        0,
        1.0
        );
    return output;
}

struct FragmentOutput {
    @location(0) color: vec4<f32>,   // カラーバッファ (通常は0番目の出力)
};

// フラグメントシェーダー
@fragment
fn fmain(
    @location(0) y: f32,
) -> FragmentOutput {
    var output: FragmentOutput;
    // 左上原点想定
    let fixGap = dottedLine.gap * (dottedLine.isAffectedForZoomWidth) + (dottedLine.gap / camera.zoom) * (1.0 - dottedLine.isAffectedForZoomWidth);
    let fixSize = dottedLine.size * (dottedLine.isAffectedForZoomWidth) + (dottedLine.size / camera.zoom) * (1.0 - dottedLine.isAffectedForZoomWidth);
    let sectionSize = fixGap + fixSize;
    let offset = y % sectionSize;
    if (offset < fixSize) {
        output.color = vec4<f32>(dottedLine.colorR, dottedLine.colorG, dottedLine.colorB, dottedLine.colorA);
    } else {
        discard;
    }
    return output;
}