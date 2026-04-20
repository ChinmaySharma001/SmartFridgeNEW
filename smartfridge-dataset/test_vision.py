from google.cloud import vision
import io

client = vision.ImageAnnotatorClient()

with io.open("synthetic/imgs/synthetic_0000.jpg", "rb") as f:
    content = f.read()

image = vision.Image(content=content)
response = client.text_detection(image=image)

if response.text_annotations:
    print("OCR Output:\n", response.text_annotations[0].description)
else:
    print("No text found")
    print("Google Vision OCR Completed!")
    