import base64
import io
import json
from uuid import uuid4

import qrcode


def generate_qr_token() -> str:
    return str(uuid4())


def qr_payload(token: str) -> str:
    return json.dumps({"assetflow_token": token})


def generate_qr_code_base64(token: str) -> str:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(qr_payload(token))
    qr.make(fit=True)

    image = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def parse_qr_payload(raw_value: str) -> str | None:
    value = raw_value.strip()
    if not value:
        return None

    try:
        data = json.loads(value)
        if isinstance(data, dict) and "assetflow_token" in data:
            return str(data["assetflow_token"])
    except json.JSONDecodeError:
        pass

    return value
