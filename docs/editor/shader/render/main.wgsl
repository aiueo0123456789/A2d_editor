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
@group(2) @binding(1) var<uniform> zIndex: f32;

struct VertexOutput {
    @builtin(position) position: vec4<f32>, // クリッピング座標系での頂点位置
    @location(0) texCoord: vec2<f32>,
    @location(1) texCoordForMask: vec2<f32>,
    @location(2) alpha: f32,
    @location(3) maskType: f32,
}

// バーテックスシェーダー
@vertex
fn vmain(
    // @builtin(vertex_index) vertexIndex: u32,
    @location(0) index: u32,
) -> VertexOutput {
    var output: VertexOutput;
    let fixIndex = graphicMeshAllocations.verticesOffset + index;
    output.position = vec4f((verticesPosition[fixIndex] - camera.position) * camera.zoom * camera.cvsSize, zIndex, 1.0);
    let texCoordOffset = texCoordOffsets[graphicMeshAllocations.myIndex];
    output.texCoord = verticesTexCoord[fixIndex] * texCoordOffset.scaleOffset + texCoordOffset.offset;
    output.texCoordForMask = (output.position.xy * 0.5 + 0.5); // マスクはカメラに映る範囲しか表示しないので画面内のtexCoordを求める
    output.texCoordForMask.y = 1.0 - output.texCoordForMask.y;
    output.alpha = renderingMetaDatas[graphicMeshAllocations.myIndex].alpha;
    output.maskType = renderingMetaDatas[graphicMeshAllocations.myIndex].maskType;
    return output;
}

@group(0) @binding(1) var mySampler: sampler;
@group(1) @binding(4) var textureAtlas: texture_2d<f32>;
@group(2) @binding(2) var maskTexture: texture_2d<f32>;

struct FragmentOutput {
    @location(0) color: vec4<f32>,   // カラーバッファ (通常は0番目の出力)
};

// フラグメントシェーダー
@fragment
fn fmain(
    @location(0) texCoord: vec2<f32>,
    @location(1) texCoordForMask: vec2<f32>,
    @location(2) alpha: f32,
    @location(3) maskType: f32,
) -> FragmentOutput {
    var output: FragmentOutput;
    if (texCoord.x < 0.0 || texCoord.x > 1.0 || texCoord.y < 0.0 || texCoord.y > 1.0) {
        discard ;
    }
    var maskValue = textureSample(maskTexture, mySampler, texCoordForMask).r;
    maskValue = select(1.0 - maskValue, maskValue, maskType < 0.5);
    let c = textureSample(textureAtlas, mySampler, texCoord);
    output.color = c;
    output.color.a *= maskValue;
    output.color.a *= alpha;
    // output.color = vec4<f32>(maskValue,0.0,0.0,1.0);
    if (output.color.a == 0.0) {
        discard ;
    }
    return output;
}