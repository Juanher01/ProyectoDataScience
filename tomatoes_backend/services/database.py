# database.py
"""
Manejo de MongoDB:
- conexión
- guardar registro de cada imagen analizada
- obtener historial para el frontend
"""

from pymongo import MongoClient
import datetime

from config import MONGO_URI, MONGO_DB_NAME, MONGO_COLLECTION_NAME


print(f"[database] Conectando a MongoDB en {MONGO_URI} ...")
mongo_client = MongoClient(MONGO_URI)
db = mongo_client[MONGO_DB_NAME]
images_collection = db[MONGO_COLLECTION_NAME]
print("[database] Conexión a MongoDB establecida.")


def save_image_record(
    filename_original: str,
    filename_saved: str,
    path: str,
    annotated_filename: str,
    annotated_path: str,
    tomato_count: int,
    tomatoes: list,
    segmentation_raw: dict,
) -> str:
    """
    Guarda la info de una imagen analizada.
    display_name: "Registro N" (para mostrar en el historial)
    """
    total = images_collection.count_documents({})
    display_name = f"Registro {total + 1}"

    doc = {
        "filename_original": filename_original,
        "filename_saved": filename_saved,
        "path": path,
        "annotated_filename": annotated_filename,
        "annotated_path": annotated_path,
        "uploaded_at": datetime.datetime.utcnow(),
        "tomato_count": tomato_count,
        "tomatoes": tomatoes,
        "segmentation_raw": segmentation_raw,
        "display_name": display_name,
    }

    result = images_collection.insert_one(doc)
    return str(result.inserted_id)




def get_last_images(limit: int = 50) -> list:
    """
    Devuelve los últimos 'limit' documentos ordenados por fecha,
    convirtiendo _id a string y eliminando 'segmentation_raw' para que
    la respuesta sea más liviana.
    """
    docs = []
    cursor = images_collection.find().sort("uploaded_at", -1).limit(limit)
    for d in cursor:
        d["_id"] = str(d["_id"])
        d.pop("segmentation_raw", None)  # no enviar el JSON gigante al front
        docs.append(d)
    return docs
