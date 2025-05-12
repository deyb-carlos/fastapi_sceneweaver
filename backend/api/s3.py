import boto3
import os
from uuid import uuid4
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name="ap-southeast-2"
)

BUCKET_NAME = "sceneweaver" 

def upload_image_to_s3(image_bytes: bytes, filename: str, folder: str = "images"):
    key = f"{folder}/{uuid4().hex}_{filename}"
    s3.upload_fileobj(BytesIO(image_bytes), BUCKET_NAME, key, ExtraArgs={"ContentType": "image/jpeg"})
    return f"https://{BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/{key}"
