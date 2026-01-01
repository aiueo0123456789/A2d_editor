import Camera;
import GraphicMeshAllocation;
import RenderingMetaData;

struct TexCoordOffset {
    offset: vec2<f32>,
    scaleOffset: vec2<f32>
}

@group(0) @binding(0) var<uniform> camera: Camera;
@group(1) @binding(0) var<storage, read> verticesPosition: array<vec2<f32>>;
@group(1) @binding(1) var<storage, read> verticesTexCoord: array<vec2<f32>>;
@group(1) @binding(2) var<storage, read> texCoordOffsets: array<TexCoordOffset>;
@group(1) @binding(3) var<storage, read> renderingMetaDatas: array<RenderingMetaData>;
@group(2) @binding(0) var<uniform> graphicMeshAllocations: GraphicMeshAllocation;

struct VertexOutput {
    @builtin(position) position: vec4<f32>, // クリッピング座標系での頂点位置
    @location(0) texCoord: vec2<f32>,
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
    let texCoordOffset = texCoordOffsets[graphicMeshAllocations.myIndex];
    output.texCoord = verticesTexCoord[fixIndex] * texCoordOffset.scaleOffset + texCoordOffset.offset;
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
    @location(0) texCoord: vec2<f32>,
) -> FragmentOutput {
    var output: FragmentOutput;
    if (texCoord.x < 0.0 || texCoord.x > 1.0 || texCoord.y < 0.0 || texCoord.y > 1.0) {
        discard ;
    }

    let alpha = textureSample(textureAtlas, mySampler, texCoord).a;
    output.color = vec4<f32>(1.0,0.0,0.0,alpha);
    return output;
}