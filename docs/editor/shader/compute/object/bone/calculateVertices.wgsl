import ArmatureAllocation;
import BoneVertices;

struct Bone {
    position: vec2<f32>,
    scale: vec2<f32>,
    angle: f32,
    length: f32,
}

@group(0) @binding(0) var<storage, read_write> vertices: array<BoneVertices>; // 出力
@group(0) @binding(1) var<storage, read> boneMatrixs: array<f32>; // ボーンの行列
@group(0) @binding(2) var<storage, read> boneData: array<Bone>; // ボーンのデータ
@group(0) @binding(3) var<storage, read> armatureAllocations: array<ArmatureAllocation>; // 配分

fn getMatrix(index: u32) -> mat3x3<f32> {
    let fixIndex = index * 9u;
    return mat3x3<f32>(
        vec3<f32>(boneMatrixs[fixIndex], boneMatrixs[fixIndex + 1], boneMatrixs[fixIndex + 2]),
        vec3<f32>(boneMatrixs[fixIndex + 3], boneMatrixs[fixIndex + 4], boneMatrixs[fixIndex + 5]),
        vec3<f32>(boneMatrixs[fixIndex + 6], boneMatrixs[fixIndex + 7], boneMatrixs[fixIndex + 8]),
    );
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let objectIndex = global_id.x;
    let boneIndex = global_id.y;
    if (arrayLength(&armatureAllocations) <= objectIndex) {
        return;
    }
    if (armatureAllocations[objectIndex].bonesNum <= boneIndex) {
        return;
    }

    let arrayIndex = armatureAllocations[objectIndex].bonesOffset + boneIndex;

    // 頂点データを取得
    let matrix = getMatrix(arrayIndex);
    var output: BoneVertices;
    output.h = matrix[2].xy;
    output.t = matrix[2].xy + vec2<f32>(matrix[0][0], matrix[0][1]) * boneData[arrayIndex].length;
    // output.t = (matrix * vec3<f32>(0.0, boneData[arrayIndex].length, 1.0)).xy;
    vertices[arrayIndex] = output;
}