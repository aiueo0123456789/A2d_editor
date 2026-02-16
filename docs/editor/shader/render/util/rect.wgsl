import Camera;


struct AffectedForZoom {
    size: f32,
    stroke: f32,
}

struct RectUniform {
    position: vec2<f32>,    // x, y
    halfSize: vec2<f32>,        // 大きさ (px)
    radius: f32,            // 角の丸さ (px)
    strokeWidth: f32,       // 縁の太さ (px)
    isAffectedForZoom: AffectedForZoom,
    color: vec4<f32>,       // 色
    strokeColor: vec4<f32>, // 縁の色
};

@group(0) @binding(0) var<uniform> camera: Camera;
@group(0) @binding(1) var mySampler: sampler;
@group(1) @binding(0) var<uniform> rect: RectUniform;

struct VertexOutput {
    @builtin(position) position: vec4<f32>, // クリッピング座標系での頂点位置
    @location(0) texCoord: vec2<f32>,
}

const pointData = array<vec2<f32>, 4>(
    vec2<f32>(-1.0, -1.0), // 左下
    vec2<f32>(-1.0,  1.0), // 左上
    vec2<f32>( 1.0, -1.0), // 右下
    vec2<f32>( 1.0,  1.0), // 右上
);

// バーテックスシェーダー
@vertex
fn vmain(
    @builtin(instance_index) instanceIndex: u32, // インスタンスのインデックス
    @builtin(vertex_index) vertexIndex: u32
    ) -> VertexOutput {
    var output: VertexOutput;

    let point = pointData[vertexIndex % 4u];
    output.position = vec4f(
        (
            (
                point * rect.halfSize * rect.isAffectedForZoom.size +
                point * rect.strokeWidth * rect.isAffectedForZoom.stroke +
                rect.position - camera.position
            ) * camera.zoom +
            (
                point * rect.halfSize * (1.0 - rect.isAffectedForZoom.size) +
                point * rect.strokeWidth * (1.0 - rect.isAffectedForZoom.stroke)
            )
        ) * camera.cvsSize,
        0,
        1.0
        );
    output.texCoord = (point * rect.halfSize * rect.isAffectedForZoom.size + point * rect.strokeWidth * rect.isAffectedForZoom.stroke) * camera.zoom + (point * rect.halfSize * (1.0 - rect.isAffectedForZoom.size) + point * rect.strokeWidth * (1.0 - rect.isAffectedForZoom.stroke));
    return output;
}

struct FragmentOutput {
    @location(0) color: vec4<f32>,   // カラーバッファ (通常は0番目の出力)
};

// フラグメントシェーダー
@fragment
fn fmain(
    @location(0) texCoord: vec2<f32>,
) -> FragmentOutput {
    var output: FragmentOutput;
    // 左上原点想定
    let fixSize = (rect.halfSize * rect.isAffectedForZoom.size * camera.zoom) + (rect.halfSize * (1.0 - rect.isAffectedForZoom.size));
    let fixRadius = (rect.radius * rect.isAffectedForZoom.size * camera.zoom) + (rect.radius * (1.0 - rect.isAffectedForZoom.size));
    let q = abs(texCoord) - (fixSize - vec2(fixRadius));
    let outsideDist = length(max(q, vec2(0.0)));
    let insideDist = min(max(q.x, q.y), 0.0);
    let dist = outsideDist + insideDist - fixRadius;
    if (dist <= 0.0) {
        let fixStrokeWidth = (rect.strokeWidth * rect.isAffectedForZoom.stroke * camera.zoom) + (rect.strokeWidth * (1.0 - rect.isAffectedForZoom.stroke));
        if (dist >= -fixStrokeWidth) {
            output.color = rect.strokeColor;
        } else {
            output.color = rect.color;
        }
    } else {
        discard;
    }
    return output;
}