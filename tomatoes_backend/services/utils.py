# utils.py
"""
Funciones auxiliares para trabajar con imágenes:
- convertir bytes a PIL
- guardar imagen original
- recortar un tomate según predicción de Roboflow
- guardar imagen anotada
"""

from PIL import Image
import io
import os
import uuid

from config import UPLOAD_DIR, ANNOTATED_DIR


def bytes_to_pil_image(file_bytes: bytes) -> Image.Image:
    """
    Convierte bytes en una imagen PIL y la devuelve en modo RGB.
    """
    image = Image.open(io.BytesIO(file_bytes))
    return image.convert("RGB")


def save_image(pil_image: Image.Image, original_filename: str) -> str:
    """
    Guarda la imagen original en UPLOAD_DIR con un nombre único basado en UUID.
    Retorna la ruta completa.
    """
    _, ext = os.path.splitext(original_filename)
    if not ext:
        ext = ".jpg"
    unique_name = f"{uuid.uuid4().hex}{ext.lower()}"
    save_path = os.path.join(UPLOAD_DIR, unique_name)
    pil_image.save(save_path)
    return save_path


def crop_tomato_from_prediction(pil_image: Image.Image, prediction: dict) -> Image.Image:
    """
    Recorta un tomate de la imagen original usando la info de una predicción de Roboflow.

    Roboflow entrega:
      - x, y: centro del bbox (en píxeles)
      - width, height: ancho y alto del bbox
    """
    cx = float(prediction.get("x", 0))
    cy = float(prediction.get("y", 0))
    w = float(prediction.get("width", 0))
    h = float(prediction.get("height", 0))

    left = int(cx - w / 2)
    top = int(cy - h / 2)
    right = int(cx + w / 2)
    bottom = int(cy + h / 2)

    left = max(left, 0)
    top = max(top, 0)
    right = min(right, pil_image.width)
    bottom = min(bottom, pil_image.height)

    if right <= left or bottom <= top:
        # fallback raro: devolvemos la imagen completa
        return pil_image

    return pil_image.crop((left, top, right, bottom))


def save_annotated_image(pil_image: Image.Image, base_filename: str) -> (str, str):
    """
    Guarda la imagen anotada (con cajas/polígonos) en ANNOTATED_DIR.
    Usa el nombre base de la imagen original para generar uno nuevo.

    Retorna (ruta_completa, nombre_archivo).
    """
    name, ext = os.path.splitext(base_filename)
    if not ext:
        ext = ".jpg"
    annotated_name = f"{name}_annotated{ext.lower()}"
    annotated_path = os.path.join(ANNOTATED_DIR, annotated_name)
    pil_image.save(annotated_path)
    return annotated_path, annotated_name
