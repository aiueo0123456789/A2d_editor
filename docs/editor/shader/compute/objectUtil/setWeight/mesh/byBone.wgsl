import GraphicMeshAllocation;
import ArmatureAllocation;
import BoneVertices;

import WeightBlock;

@group(0) @binding(0) var<storage, read_write> weightBlocks: array<WeightBlock>; // indexと重みのデータ
@group(0) @binding(1) var<storage, read> baseVertices: array<vec2<f32>>;
@group(0) @binding(2) var<uniform> graphicMeshAllocation: GraphicMeshAllocation; // 配分
@group(0) @binding(3) var<storage, read> boneVertices: array<BoneVertices>;
@group(0) @binding(4) var<uniform> armatureAllocation: ArmatureAllocation; // 配分

fn pointToLineDistance(point: vec2<f32>, lineStart: vec2<f32>, lineEnd: vec2<f32>) -> f32 {
    // 線分が点の場合
    if (all(lineStart == lineEnd)) {
        return distance(point, lineStart);
    }

    let lineDir = lineEnd - lineStart;
    let pointDir = point - lineStart;
    let t = dot(pointDir, lineDir) / dot(lineDir, lineDir);

    // 点が線分の外側にある場合
    if (t < 0.0) {
        return distance(point, lineStart);
    } else if (t > 1.0) {
        return distance(point, lineEnd);
    }

    // 点が線分の内側にある場合
    let projection = lineStart + t * lineDir;
    return distance(point, projection);
}

fn calculateWeight(position: vec2<f32>) -> WeightBlock {
    let falloff = 1.1; // 数字を大きくすると近距離重視になる
    // 一番近いボーン二つを見つける
    var output: WeightBlock;
    var fIndex = 0u;
    var fWeight = 0.0;
    var tIndex = 0u;
    var tWeight = 0.0;
    for (var boneIndex = armatureAllocation.bonesOffset; boneIndex < armatureAllocation.bonesOffset + armatureAllocation.bonesNum; boneIndex ++) {
        let bone = boneVertices[boneIndex];
        let dist = pointToLineDistance(position, bone.h, bone.t);
        let weight = exp(-falloff * dist);

        if (fWeight <= weight) {
            // 1位を2位に降格
            tIndex = fIndex;
            tWeight = fWeight;
            // 1位に自分を代入
            fIndex = boneIndex - armatureAllocation.bonesOffset;
            fWeight = weight;
        } else if (tWeight <= weight) {
            // 2位に自分を代入
            tIndex = boneIndex - armatureAllocation.bonesOffset;
            tWeight = weight;
        }
    }
    let sumWeight = fWeight + tWeight;
    output.indexs = vec4<u32>(fIndex, tIndex, 0u, 0u);
    output.weights = vec4<f32>(fWeight / sumWeight, tWeight / sumWeight, 0.0, 0.0);
    return output;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    if (graphicMeshAllocation.verticesNum <= global_id.x) {
        return;
    }
    let verticesIndex = global_id.x + graphicMeshAllocation.verticesOffset;

    weightBlocks[verticesIndex] = calculateWeight(baseVertices[verticesIndex]);
}