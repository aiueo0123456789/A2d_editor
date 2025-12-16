import Camera;
import ArmatureAllocation;
import BoneVertices;

struct VisualSettings {
    vertexSize: f32,
    boneSize: f32,
    boneSectionRatio: f32,
}

@group(0) @binding(0) var<uniform> camera: Camera;
@group(1) @binding(0) var<uniform> visualSetting: VisualSettings;
@group(2) @binding(0) var<storage, read> verticesPosition: array<BoneVertices>;
@group(2) @binding(1) var<storage, read> boneColors: array<vec4<f32>>;
@group(3) @binding(0) var<uniform> armatureAllocation: ArmatureAllocation; // 配分情報

struct VertexOutput {
    @builtin(position) position: vec4<f32>, // クリッピング座標系での頂点位置
}

fn worldPosToClipPos(position: vec2<f32>) -> vec4<f32> {
    return vec4f((position - camera.position) * camera.zoom * camera.cvsSize, 0, 1.0);
}

// バーテックスシェーダー
@vertex
fn vmain(
    @builtin(instance_index) instanceIndex: u32, // インスタンスのインデックス
    @builtin(vertex_index) vertexIndex: u32
    ) -> VertexOutput {
    // 頂点データを取得
    let index = instanceIndex + armatureAllocation.bonesOffset;
    let position1 = verticesPosition[index].h;
    let position2 = verticesPosition[index].t;
    let sub = position2 - position1;
    let normal = normalize(vec2<f32>(-sub.y, sub.x)); // 仮の法線
    var offset = vec2<f32>(0.0);
    let sectionPosition = mix(position1, position2, visualSetting.boneSectionRatio);

    let vIndex = vertexIndex;

    let k = (normal * visualSetting.boneSize * length(sub));
    if (vIndex == 0u) {
        offset = sectionPosition - k;
    } else if (vIndex == 1u) {
        offset = sectionPosition + k;
    } else if (vIndex == 2u) {
        offset = position2;
    } else if (vIndex == 3u) {
        offset = sectionPosition - k;
    } else if (vIndex == 4u) {
        offset = sectionPosition + k;
    } else if (vIndex == 5u) {
        offset = position1;
    }

    var output: VertexOutput;
    output.position = worldPosToClipPos(offset);
    return output;
}

@group(3) @binding(1) var<uniform> objectColor: f32;

struct FragmentOutput {
    @location(0) color: vec4<f32>,   // カラーバッファ (通常は0番目の出力)
};

@fragment
fn fmain(
) -> FragmentOutput {
    var output: FragmentOutput;
    output.color = vec4<f32>(objectColor,0.0,0.0,1.0);
    // output.color = vec4<f32>(0,1,0,1);
    return output;
}