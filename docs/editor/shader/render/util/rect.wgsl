import Camera;


struct AffectedForZoom {
    size: f32,
    stroke: f32,
}

struct RectUniform {
    positionX: f32,         // X
    positionY: f32,         // Y
    halfSizeX: f32,         // 大きさX (px)
    halfSizeY: f32,         // 大きさY (px)
    radius: f32,            // 角の丸さ (px)
    colorR: f32,            // 色R
    colorG: f32,            // 色G
    colorB: f32,            // 色B
    colorA: f32,            // 色A
    isAffectedForZoomSize: f32,
    strokeWidth: f32,       // 縁の太さ (px)
    strokeColorR: f32,      // 縁の色R
    strokeColorG: f32,      // 縁の色G
    strokeColorB: f32,      // 縁の色B
    strokeColorA: f32,      // 縁の色A
    isAffectedForZoomStroke: f32,
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
                point * vec2<f32>(rect.halfSizeX, rect.halfSizeY) * rect.isAffectedForZoomSize +
                point * rect.strokeWidth * rect.isAffectedForZoomStroke +
                vec2<f32>(rect.positionX, rect.positionY) - camera.position
            ) * camera.zoom +
            (
                point * vec2<f32>(rect.halfSizeX, rect.halfSizeY) * (1.0 - rect.isAffectedForZoomSize) +
                point * rect.strokeWidth * (1.0 - rect.isAffectedForZoomStroke)
            )
        ) * camera.cvsSize,
        0,
        1.0
        );
    output.texCoord = (point * vec2<f32>(rect.halfSizeX, rect.halfSizeY) * rect.isAffectedForZoomSize + point * rect.strokeWidth * rect.isAffectedForZoomStroke) * camera.zoom + (point * vec2<f32>(rect.halfSizeX, rect.halfSizeY) * (1.0 - rect.isAffectedForZoomSize) + point * rect.strokeWidth * (1.0 - rect.isAffectedForZoomStroke));
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
    let fixSize = (vec2<f32>(rect.halfSizeX, rect.halfSizeY) * rect.isAffectedForZoomSize * camera.zoom) + (vec2<f32>(rect.halfSizeX, rect.halfSizeY) * (1.0 - rect.isAffectedForZoomSize));
    let fixRadius = (rect.radius * rect.isAffectedForZoomSize * camera.zoom) + (rect.radius * (1.0 - rect.isAffectedForZoomSize));
    let q = abs(texCoord) - (fixSize - vec2(fixRadius));
    let outsideDist = length(max(q, vec2(0.0)));
    let insideDist = min(max(q.x, q.y), 0.0);
    let dist = outsideDist + insideDist - fixRadius;
    if (dist <= 0.0) {
        let fixStrokeWidth = (rect.strokeWidth * rect.isAffectedForZoomStroke * camera.zoom) + (rect.strokeWidth * (1.0 - rect.isAffectedForZoomStroke));
        if (dist >= -fixStrokeWidth) {
            output.color = vec4<f32>(rect.strokeColorR, rect.strokeColorG, rect.strokeColorB, rect.strokeColorA);
        } else {
            output.color = vec4<f32>(rect.colorR, rect.colorG, rect.colorB, rect.colorA);
        }
    } else {
        discard;
    }
    return output;
}