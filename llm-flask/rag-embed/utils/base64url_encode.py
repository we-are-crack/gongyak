import base64


def encode_to_base64url(input: str):
    return base64.urlsafe_b64encode(input.encode("utf-8")).decode("utf-8").rstrip("=")
