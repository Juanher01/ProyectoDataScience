# classification_service.py
"""
Servicio de clasificación usando modelo Keras.
"""

import os
import numpy as np
from PIL import Image
import keras

from config import MODELS_DIR, CLASSIFICATION_MODEL_FILENAME, IMG_SIZE, CLASS_NAMES

MODEL_PATH = os.path.join(MODELS_DIR, CLASSIFICATION_MODEL_FILENAME)
print(f"[classification_service] Cargando modelo de clasificación desde: {MODEL_PATH}")
clf_model = keras.models.load_model(MODEL_PATH)
print("[classification_service] Modelo de clasificación cargado correctamente.")


def preprocess_for_classification(pil_image: Image.Image) -> np.ndarray:
    """
    Redimensiona a IMG_SIZE y deja los valores en 0-255 float32.
    Se asume que el modelo ya tiene su propia capa de preprocesamiento.
    """
    img = pil_image.resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32)
    arr = np.expand_dims(arr, axis=0)
    return arr


def classify_image(pil_image: Image.Image):
    x = preprocess_for_classification(pil_image)
    preds = clf_model.predict(x)
    class_idx = int(np.argmax(preds[0]))
    prob = float(preds[0][class_idx])
    class_name = CLASS_NAMES[class_idx]
    return class_name, prob
