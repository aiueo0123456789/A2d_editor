import Camera;

struct TextUniform {
    positionX: f32,         // X
    positionY: f32,         // Y
    startX: f32,         // X
    startY: f32,         // Y
    scale: f32,             // 大きさ
    colorR: f32,            // 色R
    colorG: f32,            // 色G
    colorB: f32,            // 色B
    colorA: f32,            // 色A
    isAffectedForZoom: f32,
};

@group(0) @binding(0) var<uniform> camera: Camera;
@group(0) @binding(1) var mySampler: sampler;
@group(1) @binding(0) var<uniform> text: TextUniform;
@group(2) @binding(0) var<uniform> textTextureSize: vec2<f32>; // 横幅、縦幅

struct VertexOutput {
    @builtin(position) position: vec4<f32>, // クリッピング座標系での頂点位置
    @location(0) texCoord: vec2<f32>,
}

const pointData = array<vec2<f32>, 4>(
    vec2<f32>(0.0, 0.0), // 左下
    vec2<f32>(0.0, 1.0), // 左上
    vec2<f32>(1.0, 0.0), // 右下
    vec2<f32>(1.0, 1.0), // 右上
);

// バーテックスシェーダー
@vertex
fn vmain(
    @builtin(instance_index) instanceIndex: u32, // インスタンスのインデックス
    @builtin(vertex_index) vertexIndex: u32
    ) -> VertexOutput {
    var output: VertexOutput;

    let aspect = vec2<f32>(textTextureSize.x / textTextureSize.y, 1.0);

    let point = pointData[vertexIndex % 4u];
    output.position = vec4f(
        (
            (
                point * aspect * text.scale * text.isAffectedForZoom +
                aspect * text.scale * text.isAffectedForZoom * vec2<f32>(text.startX, text.startY) +
                vec2<f32>(text.positionX, text.positionY) - camera.position
            ) * camera.zoom +
            (
                point * aspect * text.scale * (1.0 - text.isAffectedForZoom) +
                aspect * text.scale * (1.0 - text.isAffectedForZoom) * vec2<f32>(text.startX, text.startY)
            )
        ) * camera.cvsSize,
        0,
        1.0
        );
    output.texCoord = point;
    output.texCoord.y = 1.0 - output.texCoord.y;
    return output;
}

@group(2) @binding(1) var textTexture: texture_2d<f32>;

struct FragmentOutput {
    @location(0) color: vec4<f32>,   // カラーバッファ (通常は0番目の出力)
};

// フラグメントシェーダー
@fragment
fn fmain(
    @location(0) texCoord: vec2<f32>,
) -> FragmentOutput {
    var output: FragmentOutput;
    let color = textureSample(textTexture, mySampler, texCoord);
    output.color = color * vec4<f32>(text.colorR, text.colorG, text.colorB, text.colorA);;
    return output;
}