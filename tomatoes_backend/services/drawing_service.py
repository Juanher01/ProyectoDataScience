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
      sobre una etiqueta resaltada semi-transparente
    """
    # Convertimos a RGBA para poder dibujar fondos semi-transparentes
    img = pil_img.convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")

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

        # Rectángulo grueso alrededor del tomate
        draw.rectangle([left, top, right, bottom], outline=instance_color, width=4)

        # Texto (solo prob de CLASIFICACIÓN)
        text = f"Tomate #{idx + 1} - {cls} ({prob:.2f})"
        # Posición superior de la etiqueta
        text_pos = (left, max(top - 24, 0))

        # --- NUEVO: fondo resaltado detrás del texto ---
        # Calculamos el tamaño del texto para dibujar un rectángulo
        try:
            # Pillow moderno
            text_bbox = draw.textbbox(text_pos, text, font=font)
        except AttributeError:
            # Fallback si no existe textbbox (versiones viejas)
            text_width, text_height = draw.textsize(text, font=font)
            text_bbox = (
                text_pos[0],
                text_pos[1],
                text_pos[0] + text_width,
                text_pos[1] + text_height,
            )

        pad = 4  # padding alrededor del texto
        bg_box = (
            text_bbox[0] - pad,
            text_bbox[1] - pad,
            text_bbox[2] + pad,
            text_bbox[3] + pad,
        )

        # Fondo semi-transparente (negro con algo de transparencia)
        draw.rectangle(bg_box, fill=(0, 0, 0, 160))

        # Ahora dibujamos el texto encima del fondo
        draw.text(text_pos, text, fill=class_color + (255,), font=font)

        # Polígono de segmentación más grueso
        if predictions is not None and idx < len(predictions):
            points = predictions[idx].get("points", [])
            if points:
                xy = [(float(p["x"]), float(p["y"])) for p in points]
                # dibujar como línea cerrada con width alto
                draw.line(xy + [xy[0]], fill=instance_color + (255,), width=4)

    # Devolvemos como RGB (para guardar en JPEG sin canal alfa)
    return img.convert("RGB")


def pil_to_base64(img: Image.Image) -> str:
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{encoded}"
