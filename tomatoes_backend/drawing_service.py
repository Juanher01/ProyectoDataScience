from PIL import Image, ImageDraw, ImageFont
import base64
import io

# Colores por clase (para el TEXTO de la etiqueta)
CLASS_COLORS = {
    "Ripe":    (34, 197, 94),   # verde vivo
    "Unripe":  (250, 204, 21),  # amarillo
    "Old":     (249, 115, 22),  # naranja
    "Damaged": (248, 113, 113), # rojo
    "Default": (59, 130, 246),  # azul
}

# Colores por INSTANCIA (caja/polígono de cada tomate)
INSTANCE_COLORS = [
    (129, 140, 248),  # violeta
    (96, 165, 250),   # azul
    (52, 211, 153),   # verde
    (251, 191, 36),   # amarillo
    (248, 113, 113),  # rojo
    (244, 114, 182),  # rosa
    (56, 189, 248),   # celeste
    (34, 197, 94),    # verde intenso
]


def annotate_image(pil_img: Image.Image, tomatoes: list, predictions: list = None) -> Image.Image:
    """
    Dibuja:
    - caja y polígono de cada tomate con un color ÚNICO por instancia
    - texto: "Tomate #N - Clase (prob)" con color por clase
    """
    img = pil_img.copy()
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype("arial.ttf", 18)
    except Exception:
        font = ImageFont.load_default()

    for idx, tomato in enumerate(tomatoes):
        cls = tomato["class"]
        prob = tomato["prob"]
        bbox = tomato["bbox"]

        instance_color = INSTANCE_COLORS[idx % len(INSTANCE_COLORS)]
        class_color = CLASS_COLORS.get(cls, CLASS_COLORS["Default"])

        x = bbox["x"]
        y = bbox["y"]
        w = bbox["width"]
        h = bbox["height"]

        left = int(x - w / 2)
        top = int(y - h / 2)
        right = int(x + w / 2)
        bottom = int(y + h / 2)

        # Rectángulo grueso
        draw.rectangle([left, top, right, bottom], outline=instance_color, width=4)

        # Texto (solo prob de CLASIFICACIÓN)
        text = f"Tomate #{idx + 1} - {cls} ({prob:.2f})"
        text_pos = (left, max(top - 24, 0))
        draw.text(text_pos, text, fill=class_color, font=font)

        # Polígono de segmentación más grueso
        if predictions is not None and idx < len(predictions):
            points = predictions[idx].get("points", [])
            if points:
                xy = [(float(p["x"]), float(p["y"])) for p in points]
                # dibujar como línea cerrada con width alto
                draw.line(xy + [xy[0]], fill=instance_color, width=4)

    return img


def pil_to_base64(img: Image.Image) -> str:
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{encoded}"
