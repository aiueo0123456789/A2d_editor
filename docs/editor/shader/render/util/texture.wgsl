import Camera;

struct AffectedForZoom {
    radius: f32,
    stroke: f32,
}

struct TriangleUniform {
    pointAX: f32,         // AX
    pointAY: f32,         // AY
    texCoordAX: f32,      // AX
    texCoordAY: f32,      // AY
    pointBX: f32,         // BX
    pointBY: f32,         // BY
    texCoordBX: f32,      // BX
    texCoordBY: f32,      // BY
    pointCX: f32,         // CX
    pointCY: f32,         // CY
    texCoordCX: f32,      // CX
    texCoordCY: f32,      // CY
};

@group(0) @binding(0) var<uniform> camera: Camera;
@group(0) @binding(1) var mySampler: sampler;
@group(1) @binding(0) var<uniform> triangle: TriangleUniform;

struct VertexOutput {
    @builtin(position) position: vec4<f32>, // クリッピング座標系での頂点位置
    @location(0) texCoord: vec2<f32>,
}

// バーテックスシェーダー
@vertex
fn vmain(
    @builtin(instance_index) instanceIndex: u32, // インスタンスのインデックス
    @builtin(vertex_index) vertexIndex: u32
    ) -> VertexOutput {
    var output: VertexOutput;

    var point = vec2<f32>(0.0);
    var texCoord = vec2<f32>(0.0);
    if (vertexIndex == 0u) {
        point = vec2<f32>(triangle.pointAX, triangle.pointAY);
        texCoord = vec2<f32>(triangle.texCoordAX, triangle.texCoordAY);
    } else if (vertexIndex == 1u) {
        point = vec2<f32>(triangle.pointBX, triangle.pointBY);
        texCoord = vec2<f32>(triangle.texCoordBX, triangle.texCoordBY);
    } else if (vertexIndex == 2u) {
        point = vec2<f32>(triangle.pointCX, triangle.pointCY);
        texCoord = vec2<f32>(triangle.texCoordCX, triangle.texCoordCY);
    }
    output.position = vec4f(
        (point - camera.position) * camera.zoom * camera.cvsSize,
        0,
        1.0
        );
    output.texCoord = texCoord;
    return output;
}

@group(1) @binding(1) var myTexture: texture_2d<f32>;

struct FragmentOutput {
    @location(0) color: vec4<f32>,   // カラーバッファ (通常は0番目の出力)
};

fn sdTriangle(p: vec2<f32>, a: vec2<f32>, b: vec2<f32>, c: vec2<f32>) -> f32 {
    let e0 = b - a;
    let e1 = c - b;
    let e2 = a - c;
    let v0 = p - a;
    let v1 = p - b;
    let v2 = p - c;
    let pq0 = v0 - e0 * clamp(dot(v0,e0)/dot(e0,e0),0.0,1.0);
    let pq1 = v1 - e1 * clamp(dot(v1,e1)/dot(e1,e1),0.0,1.0);
    let pq2 = v2 - e2 * clamp(dot(v2,e2)/dot(e2,e2),0.0,1.0);
    let s = sign(e0.x*e2.y - e0.y*e2.x);
    let d = min(
        min(dot(pq0,pq0), dot(pq1,pq1)),
        dot(pq2,pq2)
    );
    let inside = s*(v0.x*e0.y-v0.y*e0.x) > 0.0 && s*(v1.x*e1.y-v1.y*e1.x) > 0.0 && s*(v2.x*e2.y-v2.y*e2.x) > 0.0;
    if (inside) {
        return -sqrt(d);
    }
    return sqrt(d);
}

// フラグメントシェーダー
@fragment
fn fmain(
    @location(0) texCoord: vec2<f32>,
) -> FragmentOutput {

    var output: FragmentOutput;

    let color = textureSample(myTexture, mySampler, texCoord);
    output.color =color;

    return output;
}