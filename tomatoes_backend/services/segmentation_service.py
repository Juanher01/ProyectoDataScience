# segmentation_service.py
"""
Servicio de segmentación usando Roboflow vía HTTP.
"""

import requests

from config import ROBOFLOW_API_KEY, ROBOFLOW_MODEL_ID

ROBOFLOW_DETECT_URL = f"https://detect.roboflow.com/{ROBOFLOW_MODEL_ID}"
print(f"[segmentation_service] Usando endpoint de Roboflow: {ROBOFLOW_DETECT_URL}")


def segment_image(image_path: str) -> dict:
    print(f"[segmentation_service] Enviando imagen a Roboflow: {image_path}")

    with open(image_path, "rb") as f:
        resp = requests.post(
            ROBOFLOW_DETECT_URL,
            params={"api_key": ROBOFLOW_API_KEY},
            files={"file": f},
            timeout=60,
        )

    print(f"[segmentation_service] Respuesta HTTP de Roboflow: {resp.status_code}")
    resp.raise_for_status()

    result = resp.json()
    print(f"[segmentation_service] Número de predicciones: {len(result.get('predictions', []))}")
    return result
