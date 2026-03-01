import Camera;

struct BezierUniform {
    pointAX: f32,         // AX
    pointAY: f32,         // AY
    pointBX: f32,         // BX
    pointBY: f32,         // BY
    pointCX: f32,         // CX
    pointCY: f32,         // CY
    pointDX: f32,         // DX
    pointDY: f32,         // DY
    width: f32,           // 線の横幅
    colorR: f32,            // 色R
    colorG: f32,            // 色G
    colorB: f32,            // 色B
    colorA: f32,            // 色A
    isAffectedForZoomWidth: f32,
};

@group(0) @binding(0) var<uniform> camera: Camera;
@group(0) @binding(1) var mySampler: sampler;
@group(1) @binding(0) var<uniform> bezier: BezierUniform;

struct VertexOutput {
    @builtin(position) position: vec4<f32>, // クリッピング座標系での頂点位置
    @location(0) texCoord: vec2<f32>,
}

// ベクトルのノルムの二乗
fn norm_squared(a: vec2<f32>) -> f32 {
    return dot(a, a);
}

// ベジェ曲線上の点を計算
fn completion(t: f32, bz: array<vec2<f32>, 4>) -> vec2<f32> {
    let t_ = 1.0 - t;
    return bz[0] * (t_ * t_ * t_) +
           bz[1] * (3 * t_ * t_ * t) +
           bz[2] * (3 * t_ * t * t) +
           bz[3] * (t * t * t);
}

// ベジェ曲線の分割
fn split_bezier(bz: array<vec2<f32>, 4>) -> array<array<vec2<f32>, 4>, 2> {
    let center = completion(0.5, bz);
    return array<array<vec2<f32>, 4>, 2>(
        array<vec2<f32>, 4>(
            bz[0],
            (bz[0] + bz[1]) / 2.0,
            (bz[0] + bz[1] * 2.0 + bz[2]) / 4.0,
            center
        ),
        array<vec2<f32>, 4>(
            center,
            (bz[1] + bz[2] * 2.0 + bz[3]) / 4.0,
            (bz[2] + bz[3]) / 2.0,
            bz[3]
        )
    );
}

// 線分と点の二乗距離を計算
fn diff2_to_line(line: array<vec2<f32>, 2>, p: vec2<f32>) -> f32 {
    let ps = line[0] - p;
    let d = line[1] - line[0];
    let n2 = norm_squared(d);
    let tt = -dot(d, ps);
    if (tt < 0.0) {
        return norm_squared(ps);
    } else if (tt > n2) {
        return norm_squared(line[1] - p);
    }
    let f1 = d.x * ps.y - d.y * ps.x;
    return f1 * f1 / n2;
}

// ベジェ曲線ポリゴンと点の最短距離（二乗）
fn diff2_to_polygon(bz: array<vec2<f32>, 4>, p: vec2<f32>) -> f32 {
    return min(
        diff2_to_line(array<vec2<f32>, 2>(bz[0], bz[1]), p),
        min(
            diff2_to_line(array<vec2<f32>, 2>(bz[1], bz[2]), p),
            min(
                diff2_to_line(array<vec2<f32>, 2>(bz[2], bz[3]), p),
                diff2_to_line(array<vec2<f32>, 2>(bz[3], bz[0]), p)
            )
        )
    );
}

// ベジェ曲線近接点の計算
fn neighbor_bezier(
    bz: array<vec2<f32>, 4>,
    p: vec2<f32>,
    t0: f32,
    t1: f32
) -> f32 {
    var currentBz = bz;
    var tStart = t0;
    var tEnd = t1;
    var result = 0.0;

    // 最大ループ回数を設定
    let maxIterations = 20;
    var iteration = 0;

    loop {
        iteration ++;

        // 長さが十分短い場合は終了
        let n2 = norm_squared(currentBz[3] - currentBz[0]);
        if (n2 < 0.001 || iteration >= maxIterations) {
            let t = (tStart + tEnd) * 0.5;
            let pointOnCurve = completion(t, currentBz);
            let distanceSquared = norm_squared(pointOnCurve - p);
            result = sqrt(distanceSquared);
            break;
        }

        // ベジェ曲線を分割
        let splitbz = split_bezier(currentBz);
        let d0 = diff2_to_polygon(splitbz[0], p);
        let d1 = diff2_to_polygon(splitbz[1], p);
        let tCenter = (tStart + tEnd) * 0.5;

        // 距離が短い方を選択して処理を続行
        if (d0 < d1) {
            currentBz = splitbz[0];
            tEnd = tCenter;
        } else {
            currentBz = splitbz[1];
            tStart = tCenter;
        }
    }

    return result;
}

// バーテックスシェーダー
@vertex
fn vmain(
    @builtin(instance_index) instanceIndex: u32, // インスタンスのインデックス
    @builtin(vertex_index) vertexIndex: u32
    ) -> VertexOutput {
    var output: VertexOutput;

    var point = vec2<f32>(0.0);
    var dir = vec2<f32>(0.0);
    let fixWidth = bezier.width * bezier.isAffectedForZoomWidth + (bezier.width / camera.zoom) * (1.0 - bezier.isAffectedForZoomWidth);
    let pointA = vec2<f32>(bezier.pointAX, bezier.pointAY);
    let pointB = vec2<f32>(bezier.pointBX, bezier.pointBY);
    let pointC = vec2<f32>(bezier.pointCX, bezier.pointCY);
    let pointD = vec2<f32>(bezier.pointDX, bezier.pointDY);
    let min = min(pointA, min(pointB, min(pointC, pointD))) - fixWidth;
    let max = max(pointA, max(pointB, max(pointC, pointD))) + fixWidth;
    if (vertexIndex == 0u) {
        point = min;
    } else if (vertexIndex == 1u) {
        point = vec2<f32>(min.x, max.y);
    } else if (vertexIndex == 2u) {
        point = vec2<f32>(max.x, min.y);
    } else {
        point = max;
    }
    output.position = vec4f(
        (point - camera.position) * camera.zoom * camera.cvsSize,
        0,
        1.0
        );
    output.texCoord = point;
    return output;
}

struct FragmentOutput {
    @location(0) color: vec4<f32>,   // カラーバッファ (通常は0番目の出力)
};


// フラグメントシェーダー
@fragment
fn fmain(
    @location(0) texCoord: vec2<f32>,
) -> FragmentOutput {

    var output: FragmentOutput;
    let pointA = vec2<f32>(bezier.pointAX, bezier.pointAY); // pointA
    let pointB = vec2<f32>(bezier.pointBX, bezier.pointBY); // controllerA
    let pointC = vec2<f32>(bezier.pointCX, bezier.pointCY); // pointB
    let pointD = vec2<f32>(bezier.pointDX, bezier.pointDY); // controllerB

    let dist = neighbor_bezier(array<vec2<f32>, 4>(
        pointA,
        pointB,
        pointD,
        pointC,
    ), texCoord, 0, 1);

    let fixWidth = bezier.width * bezier.isAffectedForZoomWidth + (bezier.width / camera.zoom) * (1.0 - bezier.isAffectedForZoomWidth);

    if (dist < fixWidth) {
        output.color = vec4<f32>(bezier.colorR,bezier.colorG,bezier.colorB,bezier.colorA);
    } else {
        discard ;
    }

    return output;
}