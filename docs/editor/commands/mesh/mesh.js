
import { app } from "../../../main.js";
import { BMesh } from "../../core/edit/objects/BMesh.js";
import { MathVec2 } from "../../utils/mathVec.js";
import { createEdgeFromTexture, createMeshByCBT, cutSilhouetteOutTriangle } from "../../utils/objects/graphicMesh/createMesh/createMesh.js";
import { indexOfSplice, insertToArray, pushToArray } from "../../utils/utility.js";

export class DeleteVerticesCommand {
    constructor() {
        this.editObjects = app.scene.editData.allEditObjects;
        this.deleteVertexIndexs = {};
        this.deleteVertices = {};
        this.deleteMeshIndexs = {};
        this.deleteMeshes = {};
        this.deleteEdgeIndexs = {};
        this.deleteEdges = {};
        this.deleteautoEdgeIndexs = {};
        this.deleteautoEdges = {};
    }

    execute() {
        for (const editObject of this.editObjects) {
            // 面の削除対象
            this.deleteMeshes[editObject.id] = editObject.meshes.filter(mesh => mesh.hasSelectedVertexInMesh);
            this.deleteMeshIndexs[editObject.id] = this.deleteMeshes[editObject.id].map(mesh => editObject.meshes.indexOf(mesh));
            editObject.meshes = editObject.meshes.filter(mesh => !this.deleteMeshes[editObject.id].includes(mesh));
            // 辺の削除対象
            this.deleteEdges[editObject.id] = editObject.manualEdges.filter(edge => edge.hasSelectedVertexInEdge);
            this.deleteEdgeIndexs[editObject.id] = this.deleteEdges[editObject.id].map(edge => editObject.manualEdges.indexOf(edge));
            editObject.manualEdges = editObject.manualEdges.filter(edge => !this.deleteEdges[editObject.id].includes(edge));
            // シルエット辺の削除対象
            this.deleteautoEdges[editObject.id] = editObject.autoEdges.filter(autoEdge => autoEdge.hasSelectedVertexInEdge);
            this.deleteautoEdgeIndexs[editObject.id] = this.deleteautoEdges[editObject.id].map(autoEdge => editObject.autoEdges.indexOf(autoEdge));
            editObject.autoEdges = editObject.autoEdges.filter(autoEdge => !this.deleteautoEdges[editObject.id].includes(autoEdge));
            // 頂点の削除
            this.deleteVertices[editObject.id] = editObject.vertices.filter(vert => vert.selected);
            this.deleteVertexIndexs[editObject.id] = this.deleteVertices[editObject.id].map(vert => editObject.vertices.indexOf(vert));
            editObject.vertices = editObject.vertices.filter(vert => !this.deleteVertices[editObject.id].includes(vert));
            editObject.updateGPUData();
        }
        return {consumed: true};
    }

    redo() {
        for (const editObject of this.editObjects) {
            // 面の削除対象
            editObject.meshes = editObject.meshes.filter(mesh => !this.deleteMeshes[editObject.id].includes(mesh));
            // 辺の削除対象
            editObject.manualEdges = editObject.manualEdges.filter(edge => !this.deleteEdges[editObject.id].includes(edge));
            // シルエット辺の削除対象
            editObject.autoEdges = editObject.autoEdges.filter(autoEdge => !this.deleteautoEdges[editObject.id].includes(autoEdge));
            // 頂点の削除
            editObject.vertices = editObject.vertices.filter(vert => !this.deleteVertices[editObject.id].includes(vert));
            editObject.updateGPUData();
        }
    }

    undo() {
        for (const editObject of this.editObjects) {
            // 頂点を戻す
            for (let i = 0; i < this.deleteVertexIndexs[editObject.id].length; i ++) {
                editObject.vertices.splice(this.deleteVertexIndexs[editObject.id][i], 0, this.deleteVertices[editObject.id][i]);
            }
            // シルエット辺を戻す
            for (let i = 0; i < this.deleteautoEdgeIndexs[editObject.id].length; i ++) {
                editObject.autoEdges.splice(this.deleteautoEdgeIndexs[editObject.id][i], 0, this.deleteautoEdges[editObject.id][i]);
            }
            // 辺を戻す
            for (let i = 0; i < this.deleteEdgeIndexs[editObject.id].length; i ++) {
                editObject.manualEdges.splice(this.deleteEdgeIndexs[editObject.id][i], 0, this.deleteEdges[editObject.id][i]);
            }
            // 面を戻す
            for (let i = 0; i < this.deleteMeshIndexs[editObject.id].length; i ++) {
                editObject.meshes.splice(this.deleteMeshIndexs[editObject.id][i], 0, this.deleteMeshes[editObject.id][i]);
            }
            editObject.updateGPUData();
        }
    }
}

export class CreateMeshCommand {
    constructor() {
        this.bmeshs = app.scene.editData.allEditObjects.filter(editObject => editObject instanceof BMesh);
        this.originalMeshs = {};
        this.imageBoundingBoxs = {};
        for (const bmesh of this.bmeshs) {
            this.originalMeshs[bmesh.id] = {
                meshes: bmesh.meshes.map(mesh => [bmesh.getVertexIndexByVertex(mesh.vertices[0]), bmesh.getVertexIndexByVertex(mesh.vertices[1]), bmesh.getVertexIndexByVertex(mesh.vertices[2])]),
                manualEdges: bmesh.manualEdges.map(edge => [bmesh.getVertexIndexByVertex(edge.vertices[0]), bmesh.getVertexIndexByVertex(edge.vertices[1])]),
                autoEdges: bmesh.autoEdges.map(vertex => bmesh.getVertexIndexByVertex(vertex)),
                vertices: bmesh.vertices.map(vertex => {return {co: [...vertex.co], texCoord: [...vertex.texCoord]}}),
            };
            this.imageBoundingBoxs[bmesh.id] = bmesh.imageBoundingBox;
        }
        this.pixelDensity = 1;
        this.scale = 10;
    }

    async execute() {
        for (const bmesh of this.bmeshs) {
            const result = await createEdgeFromTexture(bmesh.texture.texture, this.pixelDensity, this.scale, 5, "bottomLeft");
            const meshData = cutSilhouetteOutTriangle(result.vertices.map(vertex => vertex.co), createMeshByCBT(result.vertices.map(vertex => vertex.co), result.edges), result.edges); // メッシュの作成とシルエットの外の三角形を削除
            bmesh.setMeshData({meshes: meshData, manualEdges: [], vertices: result.vertices.map(vertex => {return {co: MathVec2.addR(vertex.co, this.imageBoundingBoxs[bmesh.id].min), texCoord: vertex.texCoord}}), manualEdges: [], autoEdges: result.edges});
        }
        return {consumed: true};
    }

    async update(pixelDensity, scale) {
        this.pixelDensity = pixelDensity;
        this.scale = scale;
        for (const bmesh of this.bmeshs) {
            const result = await createEdgeFromTexture(bmesh.texture.texture, this.pixelDensity, this.scale, 5, "bottomLeft");
            const meshData = cutSilhouetteOutTriangle(result.vertices.map(vertex => vertex.co), createMeshByCBT(result.vertices.map(vertex => vertex.co), result.edges), result.edges); // メッシュの作成とシルエットの外の三角形を削除
            bmesh.setMeshData({meshes: meshData, manualEdges: [], vertices: result.vertices.map(vertex => {return {co: MathVec2.addR(vertex.co, this.imageBoundingBoxs[bmesh.id].min), texCoord: vertex.texCoord}}), manualEdges: [], autoEdges: result.edges});
        }
    }

    undo() {
        for (const bmesh of this.bmeshs) {
            bmesh.setMeshData(this.originalMeshs[bmesh.id]);
        }
    }
}

export class AppendVertexCommand {
    constructor(possition) {
        this.bmeshs = app.scene.editData.allEditObjects.filter(editObject => editObject instanceof BMesh);
        this.createDatasInEditObject = {};
        for (const bmesh of this.bmeshs) {
            this.createDatasInEditObject[bmesh.id] = BMesh.createVertex(possition, MathVec2.divR(MathVec2.subR(possition, bmesh.imageBoundingBox.min), MathVec2.subR(bmesh.imageBoundingBox.max, bmesh.imageBoundingBox.min)));
        }
    }

    execute() {
        this.bmeshs.forEach(bmesh => {
            pushToArray(bmesh.vertices, this.createDatasInEditObject[bmesh.id])
            bmesh.updateGPUData();
        });
        return {consumed: true};
    }

    undo() {
        this.bmeshs.forEach(bmesh => {
            indexOfSplice(bmesh.vertices, this.createDatasInEditObject[bmesh.id])
            bmesh.updateGPUData();
        });
    }
}

export class AppendEdgeCommand {
    constructor() {
        this.bmeshs = app.scene.editData.allEditObjects.filter(editObject => editObject instanceof BMesh);
        this.createDatasInEditObject = {};
        for (const bmesh of this.bmeshs) {
            if (bmesh.selectedVertices.length == 2) { // 頂点二つで辺一つ
                this.createDatasInEditObject[bmesh.id] = BMesh.createEdge(...bmesh.selectedVertices); // 選択している頂点をつなぐ
            }
        }
    }

    execute() {
        this.bmeshs.forEach(bmesh => {
            pushToArray(bmesh.manualEdges, this.createDatasInEditObject[bmesh.id]);
            const verticesCoordinates = bmesh.vertices.map(vertex => vertex.co);
            const meshData = cutSilhouetteOutTriangle(verticesCoordinates, createMeshByCBT(verticesCoordinates, bmesh.manualEdges.concat(bmesh.autoEdges).map(edge => bmesh.getVerticesIndexInEdge(edge))), bmesh.autoEdges.map(edge => bmesh.getVerticesIndexInEdge(edge))); // メッシュの作成とシルエットの外の三角形を削除
            bmesh.setMeshData({meshes: meshData});
            bmesh.updateGPUData();
        });
        return {consumed: true};
    }

    undo() {
        this.bmeshs.forEach(bmesh => {
            indexOfSplice(bmesh.manualEdges, this.createDatasInEditObject[bmesh.id])
            bmesh.updateGPUData();
        });
    }
}

export class DeleteEdgeCommand {
    constructor() {
        this.bmeshs = app.scene.editData.allEditObjects.filter(editObject => editObject instanceof BMesh);
        this.deleteDatasInEditObject = {};
        this.deleteDatasInEditObjectMeta = {};
        for (const bmesh of this.bmeshs) {
            this.deleteDatasInEditObject[bmesh.id] = bmesh.selectedEdges; // 選択している辺を取得
        }
    }

    execute() {
        this.bmeshs.forEach(bmesh => {
            this.deleteDatasInEditObjectMeta[bmesh.id] = [];
            // indexの正確さのため逆順にして削除
            [...this.deleteDatasInEditObject[bmesh.id]].reverse().forEach((edge) => {
                this.deleteDatasInEditObjectMeta[bmesh.id].push(indexOfSplice(bmesh.manualEdges, edge));
            })
            const verticesCoordinates = bmesh.vertices.map(vertex => vertex.co);
            const meshData = cutSilhouetteOutTriangle(verticesCoordinates, createMeshByCBT(verticesCoordinates, bmesh.manualEdges.concat(bmesh.autoEdges).map(edge => bmesh.getVerticesIndexInEdge(edge))), bmesh.autoEdges.map(edge => bmesh.getVerticesIndexInEdge(edge))); // メッシュの作成とシルエットの外の三角形を削除
            bmesh.setMeshData({meshes: meshData});
            bmesh.updateGPUData();
        });
        return {consumed: true};
    }

    undo() {
        this.bmeshs.forEach(bmesh => {
            this.deleteDatasInEditObject[bmesh.id].reverse().forEach((edge, index) => {
                insertToArray(bmesh.manualEdges, this.deleteDatasInEditObjectMeta[bmesh.id][index], edge);
            })
            bmesh.updateGPUData();
        });
    }
}