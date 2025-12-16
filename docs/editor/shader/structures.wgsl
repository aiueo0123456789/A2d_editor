// カメラ
struct Camera {
    position: vec2<f32>,
    cvsSize: vec2<f32>,
    zoom: f32,
    padding: f32,
}

// グラフィックメッシュ
struct GraphicMeshAllocation {
    myIndex: u32, // 自分のindex
    parentType: u32, // 親のタイプ
    parentIndex: u32, // 親のindex
    verticesOffset: u32, // 頂点オフセット
    meshesOffset: u32, // 面オフセット
    shapesOffset: u32, // シェイプキーオフセット
    shapeKeyWeightsOffset: u32, // シェイプキーの重みオフセット
    verticesNum: u32, // 頂点数
    meshesNum: u32, // 面数
    shapeKeysNum: u32, // シェイプキー数
}

// グラフィックメッシュの表示メタデータ
struct RenderingMetaData {
    alpha: f32,
    maskType: f32,
}

// ベジェモディファイア
struct BezierModifierAllocation {
    myIndex: u32, // 自分のindex
    parentType: u32, // 親のタイプ
    parentIndex: u32, // 親のindex
    pointsOffset: u32, // ポイントオフセット
    shapesOffset: u32, // シェイプキーオフセット
    shapeKeyWeightsOffset: u32, // シェイプキーの重みオフセット
    pointsNum: u32, // ポイント数
    shapeKeysNum: u32, // シェイプキー数
}

// アーマチュア
struct ArmatureAllocation {
    myIndex: u32, // 自分のindex
    bonesOffset: u32, // ポイントオフセット
    bonesNum: u32, // ボーン数
    dummy0: u32,
}

// ボーンの頂点
struct BoneVertices {
    h: vec2<f32>,
    t: vec2<f32>,
}