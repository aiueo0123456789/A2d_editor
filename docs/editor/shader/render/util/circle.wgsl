import Camera;

struct AffectedForZoom {
    radius: f32,
    stroke: f32,
}

struct CircleUniform {
    positionX: f32,         // X
    positionY: f32,         // Y
    radius: f32,            // 角の丸さ (px)
    colorR: f32,            // 色R
    colorG: f32,            // 色G
    colorB: f32,            // 色B
    colorA: f32,            // 色A
    isAffectedForZoomRadius: f32,
    strokeWidth: f32,       // 縁の太さ (px)
    strokeColorR: f32,      // 縁の色R
    strokeColorG: f32,      // 縁の色G
    strokeColorB: f32,      // 縁の色B
    strokeColorA: f32,      // 縁の色A
    isAffectedForZoomStroke: f32,
};

@group(0) @binding(0) var<uniform> camera: Camera;
@group(0) @binding(1) var mySampler: sampler;
@group(1) @binding(0) var<uniform> circle: CircleUniform;

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
                point * circle.radius * circle.isAffectedForZoomRadius +
                point * circle.strokeWidth * circle.isAffectedForZoomStroke +
                vec2<f32>(circle.positionX, circle.positionY) - camera.position
            ) * camera.zoom +
            (
                point * circle.radius * (1.0 - circle.isAffectedForZoomRadius) +
                point * circle.strokeWidth * (1.0 - circle.isAffectedForZoomStroke)
            )
        ) * camera.cvsSize,
        0,
        1.0
        );
    output.texCoord = (point * circle.radius * circle.isAffectedForZoomRadius + point * circle.strokeWidth * circle.isAffectedForZoomStroke) * camera.zoom + (point * circle.radius * (1.0 - circle.isAffectedForZoomRadius) + point * circle.strokeWidth * (1.0 - circle.isAffectedForZoomStroke));
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
    let dist = length(texCoord);
    let fixRadius = (circle.radius * circle.isAffectedForZoomRadius) * camera.zoom + (circle.radius * (1.0 - circle.isAffectedForZoomRadius));
    let fixStrokeWidth = (circle.strokeWidth * circle.isAffectedForZoomStroke) * camera.zoom + (circle.strokeWidth * (1.0 - circle.isAffectedForZoomStroke));
    let sumRadius = fixRadius + fixStrokeWidth;
    if (dist < sumRadius) {
        if (dist < fixRadius) {
            output.color = vec4<f32>(circle.colorR, circle.colorG, circle.colorB, circle.colorA);;
        } else {
            output.color = vec4<f32>(circle.strokeColorR, circle.strokeColorG, circle.strokeColorB, circle.strokeColorA);;
        }
    } else {
        discard ;
    }
    return output;
}