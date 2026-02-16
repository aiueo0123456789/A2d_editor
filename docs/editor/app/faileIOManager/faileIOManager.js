import { Application } from "../app.js";
import { changeParameter, isFunction } from "../../utils/utility.js";
import { GPU } from "../../utils/webGPU.js";
import { useEffect } from "../../utils/ui/util.js";
const { ZipWriter, BlobWriter, BlobReader, TextReader, ZipReader, TextWriter } = zip;

// 入力を受け取って指示を出す
export class FaileIOManager {
    constructor(/** @type {Application} */app) {
        this.app = app;
    }

    // ロード
    async loadFile(files, dataType) {
        useEffect.stop();
        this.app.updateStop("load");
        this.app.scene.reset();
        const loadingModalID = this.app.ui.createLodingModal("ロード");
        this.app.ui.updateLoadingModal(loadingModalID,0,"読み込み開始");
        console.log(files)
        if (dataType == "psd") {
            let jsonData = null;
            const texturesMap = {};
            for (const file of files) {
                if (file.name.toLowerCase().endsWith(".json")) {
                    const txt = await file.text();
                    jsonData = JSON.parse(txt);
                } else if (file.name.toLowerCase().endsWith(".png")) {
                    const imageBitmap = await createImageBitmap(file);
                    texturesMap[file.name.replace(".png", "")] = await GPU.createTextureFromImageBitmap(imageBitmap);
                }
            }

            for (const texture of jsonData.scene.objects.textures) {
                texture.texture = texturesMap[texture.id];
            }

            this.app.ui.updateLoadingModal(loadingModalID,50, "テクスチャの読み込み完了");
            console.log(jsonData)
            const objectTypes = ["maskTextures", "textures", "graphicMeshs"];
            for (const objectType of objectTypes) {
                for (const objectData of jsonData.scene.objects[objectType]) {
                    this.app.scene.objects.createAndAppendObject(objectData);
                }
                this.app.ui.updateLoadingModal(loadingModalID,50 + (40 * (objectTypes.indexOf(objectType) / objectTypes.length)), `${objectType}のデータをセット`);
            }
            this.app.ui.updateLoadingModal(loadingModalID,90, "オブジェクトのセット完了");
            for (const layerData of jsonData.scene.layers) {
                this.app.scene.layers.createAndAppendLayer(layerData);
            }
            // オブジェクト同士の参照を解決
            for (const object of this.app.scene.objects.allObject) {
                if (isFunction(object.resolvePhase)) object.resolvePhase();
            }
            this.app.ui.updateLoadingModal(loadingModalID,95, "オブジェクト同士の参照を解決");
        } else {
            changeParameter(this.app.appConfig, "projectName", files.name.split(".")[0]);
            const zipReader = new ZipReader(new BlobReader(files));
            const entries = await zipReader.getEntries();

            let jsonData = null;
            const texturesMap = {};

            for (const entry of entries) {
                if (entry.filename === "data.json") {
                    // JSONを読み込む
                    const text = await entry.getData(new TextWriter());
                    jsonData = JSON.parse(text);
                } else if (entry.filename.startsWith("textures/")) {
                    // テクスチャ読み込み
                    const blob = await entry.getData(new BlobWriter("image/png"));
                    const id = entry.filename.replace("textures/", "").replace(".png", "");
                    texturesMap[id] = await GPU.blobToTexture(blob);
                }
            }

            await zipReader.close();

            for (const texture of jsonData.scene.objects.textures) {
                texture.texture = texturesMap[texture.id];
            }

            console.log(jsonData)
            const objectTypes = ["maskTextures", "textures", "scripts", "particles", "bezierModifiers", "armatures", "graphicMeshs", "blendShapes", "keyframeBlocks", "parameterManagers"];
            for (const objectType of objectTypes) {
                for (const objectData of jsonData.scene.objects[objectType]) {
                    this.app.scene.objects.createAndAppendObject(objectData);
                }
                this.app.ui.updateLoadingModal(loadingModalID,50 + (40 * (objectTypes.indexOf(objectType) / objectTypes.length)), `${objectType}のデータをセット`);
            }
            this.app.ui.updateLoadingModal(loadingModalID,90, "オブジェクトのセット完了");
            // オブジェクト同士の参照を解決
            for (const object of this.app.scene.objects.allObject) {
                if (isFunction(object.resolvePhase)) object.resolvePhase();
            }
            this.app.ui.updateLoadingModal(loadingModalID,95, "オブジェクト同士の参照を解決");
            // ヒエラルキーを構築
            changeParameter(this.app.scene, "frame_speed", jsonData.scene.frame_speed);
            changeParameter(this.app.scene, "frame_start", jsonData.scene.frame_start);
            changeParameter(this.app.scene, "frame_end", jsonData.scene.frame_end);
        }
        this.app.ui.updateLoadingModal(loadingModalID, 100, "完了");
        this.app.ui.removeLodingModal(loadingModalID);
        this.app.updateStopCancel("load");
        useEffect.play();
        useEffect.allUpdate();
    }

    // セーブ
    async save() {
        // ZIP writer
        this.app.updateStop("save");
        const data = await this.app.scene.getSaveData();
        const blobWriter = new BlobWriter("application/zip");
        const zipWriter = new ZipWriter(blobWriter, {
            level: 0, // 圧縮なし（STORE）
        });

        // JSONファイルを追加
        await zipWriter.add("data.json", new TextReader(JSON.stringify(data)));

        // テクスチャファイルを追加
        for (const texture of data.scene.objects.textures) {
            // tex.id: filename, tex.blob: Blob形式の画像
            await zipWriter.add(`textures/${texture.id}.png`, new BlobReader(texture.texture));
            texture.texture = "";
        }

        // ZIP Blob を生成
        const zipBlob = await zipWriter.close();

        // Download
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${this.app.appConfig.projectName}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        this.app.updateStopCancel("save");
    }
}