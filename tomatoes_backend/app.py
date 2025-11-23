# app.py
"""
Aplicación Flask principal.

Endpoints:
- POST /analyze
    -> recibe una imagen
    -> segmenta con Roboflow (polígonos)
    -> recorta y clasifica cada tomate con Keras
    -> genera imagen anotada (cajas + polígonos + texto)
    -> guarda todo en Mongo
    -> devuelve JSON con info + imagen anotada en base64

- GET /history
    -> devuelve últimos registros de Mongo (para listarlos en el front)

- GET /uploads/<filename>
    -> sirve las imágenes originales

- GET /annotated/<filename>
    -> sirve las imágenes anotadas
"""

from flask import Flask, request, jsonify, send_from_directory
import os
from flask_cors import CORS  


from utils import (
    bytes_to_pil_image,
    save_image,
    crop_tomato_from_prediction,
    save_annotated_image,
)
from classification_service import classify_image
from segmentation_service import segment_image
from drawing_service import annotate_image, pil_to_base64
from database import save_image_record, get_last_images
from config import UPLOAD_DIR, ANNOTATED_DIR

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/analyze", methods=["POST"])
def analyze():
    if "image" not in request.files:
        return jsonify({"error": "No se envió el archivo 'image'"}), 400

    file = request.files["image"]
    file_bytes = file.read()

    # 1. Convertir a PIL
    pil_img = bytes_to_pil_image(file_bytes)

    # 2. Guardar imagen original en disco
    save_path = save_image(pil_img, file.filename)
    filename_saved = os.path.basename(save_path)

    # 3. Segmentación con Roboflow
    seg_result = segment_image(save_path)
    predictions = seg_result.get("predictions", [])

    # 4. Por cada predicción -> recortar y clasificar
    tomatoes = []
    for pred in predictions:
        tomato_crop = crop_tomato_from_prediction(pil_img, pred)
        tomato_class, prob = classify_image(tomato_crop)

        tomatoes.append(
            {
                "class": tomato_class,
                "prob": prob,
                "detection_confidence": float(pred.get("confidence", 0.0)),
                "bbox": {
                    "x": float(pred.get("x", 0.0)),
                    "y": float(pred.get("y", 0.0)),
                    "width": float(pred.get("width", 0.0)),
                    "height": float(pred.get("height", 0.0)),
                },
                "detection_id": pred.get("detection_id"),
            }
        )

    tomato_count = len(tomatoes)

    # 5. Imagen anotada (cajas + polígonos + texto)
    annotated_img = annotate_image(pil_img, tomatoes, predictions)
    annotated_path, annotated_filename = save_annotated_image(
        annotated_img, filename_saved
    )
    annotated_b64 = pil_to_base64(annotated_img)

    # 6. Guardar en Mongo
    db_id = save_image_record(
        filename_original=file.filename,
        filename_saved=filename_saved,
        path=save_path,
        annotated_filename=annotated_filename,
        annotated_path=annotated_path,
        tomato_count=tomato_count,
        tomatoes=tomatoes,
        segmentation_raw=seg_result,
    )

    # 7. Respuesta al cliente
    response = {
        "id": db_id,
        "filename_saved": filename_saved,
        "path": save_path,
        "annotated_filename": annotated_filename,
        "annotated_path": annotated_path,
        "tomato_count": tomato_count,
        "tomatoes": tomatoes,
        "annotated_image": annotated_b64,
    }

    return jsonify(response), 200


@app.route("/history", methods=["GET"])
def history():
    """
    Devuelve los últimos registros, para listarlos en el frontend.
    """
    docs = get_last_images(limit=50)
    return jsonify(docs), 200


@app.route("/uploads/<path:filename>", methods=["GET"])
def get_upload(filename):
    """
    Sirve una imagen original guardada en UPLOAD_DIR.
    """
    return send_from_directory(UPLOAD_DIR, filename)


@app.route("/annotated/<path:filename>", methods=["GET"])
def get_annotated(filename):
    """
    Sirve una imagen anotada guardada en ANNOTATED_DIR.
    """
    return send_from_directory(ANNOTATED_DIR, filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
