# config.py
"""
Configura constantes del proyecto: rutas, claves, tamaños de imagen, etc.
"""

import os

# ----------------- RUTAS BÁSICAS -----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Carpeta donde se guardan los modelos de clasificación (.keras)
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Carpeta donde se guardan las imágenes subidas
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Carpeta donde se guardan las imágenes anotadas (cajas + polígonos)
ANNOTATED_DIR = os.path.join(UPLOAD_DIR, "annotated")
os.makedirs(ANNOTATED_DIR, exist_ok=True)

# ----------------- CLASIFICACIÓN -----------------
CLASSIFICATION_MODEL_FILENAME = "efficientnetb7_final.keras"
IMG_SIZE = (256, 256)  # tamaño usado al entrenar
CLASS_NAMES = ["Damaged", "Old", "Ripe", "Unripe"]  # AJUSTA al orden real

# ----------------- MONGODB -----------------
MONGO_URI = "mongodb://localhost:27017"
MONGO_DB_NAME = "tomatoes_db"
MONGO_COLLECTION_NAME = "images"

# ----------------- ROBOFLOW -----------------
ROBOFLOW_API_KEY = "2QHbV3g6VyPCv3RYAiYi"
ROBOFLOW_MODEL_ID = "tomatoes-segmentation-2-jxjaj/1"
