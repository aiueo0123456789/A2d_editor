import Camera;

struct AffectedForZoom {
    radius: f32,
    stroke: f32,
}

struct TriangleUniform {
    pointAX: f32,         // AX
    pointAY: f32,         // AY
    pointBX: f32,         // BX
    pointBY: f32,         // BY
    pointCX: f32,         // CX
    pointCY: f32,         // CY
    colorR: f32,            // 色R
    colorG: f32,            // 色G
    colorB: f32,            // 色B
    colorA: f32,            // 色A
    strokeWidth: f32,       // 縁の太さ (px)
    strokeColorR: f32,      // 縁の色R
    strokeColorG: f32,      // 縁の色G
    strokeColorB: f32,      // 縁の色B
    strokeColorA: f32,      // 縁の色A
    isAffectedForZoomStroke: f32,
    strokePosition: f32,
};

@group(0) @binding(0) var<uniform> camera: Camera;
@group(0) @binding(1) var mySampler: sampler;
@group(1) @binding(0) var<uniform> triangle: TriangleUniform;

struct VertexOutput {
    @builtin(position) position: vec4<f32>, // クリッピング座標系での頂点位置
    @location(0) texCoord: vec2<f32>,
}

const scaleValue: f32 = 20.0;

// バーテックスシェーダー
@vertex
fn vmain(
    @builtin(instance_index) instanceIndex: u32, // インスタンスのインデックス
    @builtin(vertex_index) vertexIndex: u32
    ) -> VertexOutput {
    var output: VertexOutput;

    var point = vec2<f32>(0.0);
    var dir = vec2<f32>(0.0);
    if (vertexIndex == 0u) {
        point = vec2<f32>(triangle.pointAX, triangle.pointAY);
        let dirA = vec2<f32>(triangle.pointBX, triangle.pointBY) - point;
        let dirB = vec2<f32>(triangle.pointCX, triangle.pointCY) - point;
        dir = normalize((normalize(dirA) + normalize(dirB)) / -2.0);
    } else if (vertexIndex == 1u) {
        point = vec2<f32>(triangle.pointBX, triangle.pointBY);
        let dirA = vec2<f32>(triangle.pointAX, triangle.pointAY) - point;
        let dirB = vec2<f32>(triangle.pointCX, triangle.pointCY) - point;
        dir = normalize((normalize(dirA) + normalize(dirB)) / -2.0);
    } else if (vertexIndex == 2u) {
        point = vec2<f32>(triangle.pointCX, triangle.pointCY);
        let dirA = vec2<f32>(triangle.pointAX, triangle.pointAY) - point;
        let dirB = vec2<f32>(triangle.pointBX, triangle.pointBY) - point;
        dir = normalize((normalize(dirA) + normalize(dirB)) / -2.0);
    }
    output.position = vec4f(
        (
            (
                point +
                dir * triangle.strokeWidth * triangle.isAffectedForZoomStroke * scaleValue -
                camera.position
            ) * camera.zoom +
            (
                dir * triangle.strokeWidth * (1.0 - triangle.isAffectedForZoomStroke) * scaleValue
            )
        ) * camera.cvsSize,
        0,
        1.0
        );
    output.texCoord = (point + dir * triangle.strokeWidth * triangle.isAffectedForZoomStroke * scaleValue) * camera.zoom + (dir * triangle.strokeWidth * (1.0 - triangle.isAffectedForZoomStroke) * scaleValue);
    return output;
}

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
    let a = vec2<f32>(triangle.pointAX, triangle.pointAY) * camera.zoom;
    let b = vec2<f32>(triangle.pointBX, triangle.pointBY) * camera.zoom;
    let c = vec2<f32>(triangle.pointCX, triangle.pointCY) * camera.zoom;

    let dist = sdTriangle(texCoord,a,b,c);

    let fixStrokeWidth = triangle.strokeWidth * triangle.isAffectedForZoomStroke * camera.zoom + triangle.strokeWidth * (1.0 - triangle.isAffectedForZoomStroke);

    if (dist < fixStrokeWidth * triangle.strokePosition) {
        output.color = vec4<f32>(triangle.colorR,triangle.colorG,triangle.colorB,triangle.colorA);
    } else if (dist < fixStrokeWidth * -triangle.strokePosition) {
        output.color = vec4<f32>(triangle.strokeColorR,triangle.strokeColorG,triangle.strokeColorB,triangle.strokeColorA);
    } else {
        discard ;
    }

    return output;
}