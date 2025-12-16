import Camera;
import GraphicMeshAllocation;
import RenderingMetaData;

struct UVOffset {
    offset: vec2<f32>,
    scaleOffset: vec2<f32>
}

@group(0) @binding(0) var<uniform> camera: Camera;
@group(1) @binding(0) var<storage, read> verticesPosition: array<vec2<f32>>;
@group(1) @binding(1) var<storage, read> verticesUV: array<vec2<f32>>;
@group(1) @binding(2) var<storage, read> uvOffsets: array<UVOffset>;
@group(1) @binding(3) var<storage, read> renderingMetaDatas: array<RenderingMetaData>;
@group(2) @binding(0) var<uniform> graphicMeshAllocations: GraphicMeshAllocation;

struct VertexOutput {
    @builtin(position) position: vec4<f32>, // クリッピング座標系での頂点位置
    @location(0) uv: vec2<f32>,
}

// バーテックスシェーダー
@vertex
fn vmain(
    // @builtin(vertex_index) vertexIndex: u32,
    @location(0) index: u32,
    ) -> VertexOutput {
    var output: VertexOutput;
    let fixIndex = graphicMeshAllocations.verticesOffset + index;
    output.position = vec4f((verticesPosition[fixIndex] - camera.position) * camera.zoom * camera.cvsSize, 0.0, 1.0);
    let uvOffset = uvOffsets[graphicMeshAllocations.myIndex];
    output.uv = verticesUV[fixIndex] * uvOffset.scaleOffset + uvOffset.offset;
    return output;
}

@group(0) @binding(1) var mySampler: sampler;
@group(1) @binding(4) var textureAtlas: texture_2d<f32>;

struct FragmentOutput {
    @location(0) color: vec4<f32>,   // カラーバッファ (通常は0番目の出力)
};

// フラグメントシェーダー
@fragment
fn fmain(
    @location(0) uv: vec2<f32>,
) -> FragmentOutput {
    var output: FragmentOutput;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        discard ;
    }

    let alpha = textureSample(textureAtlas, mySampler, uv).a;
    output.color = vec4<f32>(1.0,0.0,0.0,alpha);
    return output;
}