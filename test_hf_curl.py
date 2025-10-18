import requests

# This script is to test the Hugging Face API for image generation using a specific prompt.
HUGGINGFACE_TOKEN = "Your_HuggingFace_API_Token_Here"  # Replace with your actual Hugging Face API token
MODEL_URL = "https://api-inference.huggingface.co/stabilityai/stable-diffusion-2-1" #You can put the model you want to test here

prompt = "A pixel art girl, 16bit style, in a retro game world, with vibrant colors and simple shapes, no shadows or reflections, designed for a 2D platformer game"

headers = {
    "Authorization": f"Bearer {HUGGINGFACE_TOKEN}",
    "Content-Type": "application/json"
}

response = requests.post(
    MODEL_URL,
    headers=headers,
    json={"inputs": prompt}
)

content_type = response.headers.get("Content-Type", "")
if response.status_code == 200 and "image" in content_type:
    with open("test_output.png", "wb") as f:
        f.write(response.content)
    print("✅ Image saved as test_output.png")
else:
    print("❌ Hugging Face error:", response.status_code)
    print("📦 Response text:", response.text)
