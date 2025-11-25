
import { app } from "../../../main.js";
import { BMesh } from "../../core/edit/objects/BMesh.js";
import { MathVec2 } from "../../utils/mathVec.js";
import { createEdgeFromTexture, createMeshByCBT, cutSilhouetteOutTriangle } from "../../utils/objects/graphicMesh/createMesh/createMesh.js";

export class DeleteVerticesCommand {
    constructor() {
        this.editObjects = app.scene.editData.allEditObjects;
        this.deleteVertexIndexs = {};
        this.deleteVertices = {};
        this.deleteMeshIndexs = {};
        this.deleteMeshes = {};
        this.deleteEdgeIndexs = {};
        this.deleteEdges = {};
        this.deletesilhouetteEdgeIndexs = {};
        this.deletesilhouetteEdges = {};
    }

    execute() {
        for (const editObject of this.editObjects) {
            // 面の削除対象
            this.deleteMeshes[editObject.id] = editObject.meshes.filter(mesh => mesh.hasSelectedVertexInMesh);
            this.deleteMeshIndexs[editObject.id] = this.deleteMeshes[editObject.id].map(mesh => editObject.meshes.indexOf(mesh));
            editObject.meshes = editObject.meshes.filter(mesh => !this.deleteMeshes[editObject.id].includes(mesh));
            // 辺の削除対象
            this.deleteEdges[editObject.id] = editObject.edges.filter(edge => edge.hasSelectedVertexInEdge);
            this.deleteEdgeIndexs[editObject.id] = this.deleteEdges[editObject.id].map(edge => editObject.edges.indexOf(edge));
            editObject.edges = editObject.edges.filter(edge => !this.deleteEdges[editObject.id].includes(edge));
            // シルエット辺の削除対象
            this.deletesilhouetteEdges[editObject.id] = editObject.silhouetteEdges.filter(silhouetteEdge => silhouetteEdge.hasSelectedVertexInEdge);
            this.deletesilhouetteEdgeIndexs[editObject.id] = this.deletesilhouetteEdges[editObject.id].map(silhouetteEdge => editObject.silhouetteEdges.indexOf(silhouetteEdge));
            editObject.silhouetteEdges = editObject.silhouetteEdges.filter(silhouetteEdge => !this.deletesilhouetteEdges[editObject.id].includes(silhouetteEdge));
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
            editObject.edges = editObject.edges.filter(edge => !this.deleteEdges[editObject.id].includes(edge));
            // シルエット辺の削除対象
            editObject.silhouetteEdges = editObject.silhouetteEdges.filter(silhouetteEdge => !this.deletesilhouetteEdges[editObject.id].includes(silhouetteEdge));
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
            for (let i = 0; i < this.deletesilhouetteEdgeIndexs[editObject.id].length; i ++) {
                editObject.silhouetteEdges.splice(this.deletesilhouetteEdgeIndexs[editObject.id][i], 0, this.deletesilhouetteEdges[editObject.id][i]);
            }
            // 辺を戻す
            for (let i = 0; i < this.deleteEdgeIndexs[editObject.id].length; i ++) {
                editObject.edges.splice(this.deleteEdgeIndexs[editObject.id][i], 0, this.deleteEdges[editObject.id][i]);
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
                meshes: bmesh.meshes.map(vertex => bmesh.getVertexIndexByVertex(vertex)),
                edges: bmesh.edges.map(vertex => bmesh.getVertexIndexByVertex(vertex)),
                silhouetteEdges: bmesh.silhouetteEdges.map(vertex => bmesh.getVertexIndexByVertex(vertex)),
                vertices: bmesh.vertices.map(vertex => {return {co: [...vertex.co], uv: [...vertex.uv]}}),
            };
            this.imageBoundingBoxs[bmesh.id] = bmesh.imageBoundingBox;
        }
        this.pixelDensity = 1;
        this.scale = 10;
        console.log(this)
    }

    async execute() {
        for (const bmesh of this.bmeshs) {
            const result = await createEdgeFromTexture(bmesh.texture.texture, this.pixelDensity, this.scale, 5, "bottomLeft");
            const meshData = cutSilhouetteOutTriangle(result.vertices.map(vertex => vertex.co), createMeshByCBT(result.vertices.map(vertex => vertex.co), result.edges), result.edges); // メッシュの作成とシルエットの外の三角形を削除
            bmesh.setMeshData({meshes: meshData, vertices: result.vertices.map(vertex => {return {co: MathVec2.addR(vertex.co, this.imageBoundingBoxs[bmesh.id].min), uv: vertex.uv}}), edges: [], silhouetteEdges: result.edges});
        }
        return {consumed: true};
    }

    async update(pixelDensity, scale) {
        this.pixelDensity = pixelDensity;
        this.scale = scale;
        for (const bmesh of this.bmeshs) {
            const result = await createEdgeFromTexture(bmesh.texture.texture, this.pixelDensity, this.scale, 5, "bottomLeft");
            const meshData = cutSilhouetteOutTriangle(result.vertices.map(vertex => vertex.co), createMeshByCBT(result.vertices.map(vertex => vertex.co), result.edges), result.edges); // メッシュの作成とシルエットの外の三角形を削除
            bmesh.setMeshData({meshes: meshData, vertices: result.vertices.map(vertex => {return {co: MathVec2.addR(vertex.co, this.imageBoundingBoxs[bmesh.id].min), uv: vertex.uv}}), edges: [], silhouetteEdges: result.edges});
        }
    }

    undo() {
        for (const bmesh of this.bmeshs) {
            bmesh.setMeshData(this.originalMeshs[bmesh.id]);
        }
    }
}