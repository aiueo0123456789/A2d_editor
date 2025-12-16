import Camera;
import GraphicMeshAllocation;

struct UVOffset {
    offset: vec2<f32>,
    scaleOffset: vec2<f32>
}

struct VisualSettings {
    vertexSize: f32,
    edgeSize: f32,
}

@group(0) @binding(0) var<uniform> camera: Camera;
@group(1) @binding(0) var<uniform> visualSetting: VisualSettings;
@group(2) @binding(0) var<storage, read> verticesPosition: array<vec2<f32>>;
@group(2) @binding(1) var<storage, read> verticesUV: array<vec2<f32>>;
@group(2) @binding(2) var<storage, read> uvOffsets: array<UVOffset>;
@group(2) @binding(3) var<storage, read> alphas: array<f32>;
@group(3) @binding(0) var<uniform> graphicMeshAllocation: GraphicMeshAllocation;

struct VertexOutput {
    @builtin(position) position: vec4<f32>, // クリッピング座標系での頂点位置
}

// バーテックスシェーダー
@vertex
fn vmain(
    // @builtin(vertex_index) vertexIndex: u32,
    @location(0) index: u32,
) -> VertexOutput {
    var output: VertexOutput;
    let fixIndex = graphicMeshAllocation.verticesOffset + index;
    output.position = vec4f((verticesPosition[fixIndex] - camera.position) * camera.zoom * camera.cvsSize, 0.0, 1.0);
    return output;
}

@group(0) @binding(1) var mySampler: sampler;
@group(2) @binding(4) var textureAtlas: texture_2d<f32>;
@group(3) @binding(1) var<uniform> objectColor: f32;

struct FragmentOutput {
    @location(0) color: vec4<f32>,   // カラーバッファ (通常は0番目の出力)
};

// フラグメントシェーダー
@fragment
fn fmain(
) -> FragmentOutput {
    var output: FragmentOutput;
    output.color = vec4<f32>(objectColor,0.0,0.0,1.0);
    return output;
}