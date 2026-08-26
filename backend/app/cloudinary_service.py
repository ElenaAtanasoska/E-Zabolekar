import cloudinary
import cloudinary.uploader
import os
from fastapi import UploadFile
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

async def upload_image_to_cloudinary(file: UploadFile):
    result = cloudinary.uploader.upload(file.file, folder="xrays")
    return result.get("secure_url")