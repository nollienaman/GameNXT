from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import os
import shutil
import zipfile

app = Flask(__name__)
CORS(app)

SEGMIND_API_KEY = "your_segmind_api_key"
REMOVE_BG_KEY = "your_removebg_api_key"

SEGMIND_IMAGE_URL = "https://api.segmind.com/v1/gpt-image-1"
SEGMIND_CODE_URL = "https://api.segmind.com/v1/deepseek-chat"

DEFAULTS_DIR = "defaults"
TEMPLATES_DIR = "templates"
OUTPUT_DIR = "generated_game"

@app.after_request
def add_no_cache_headers(response):
    response.headers['Cache-Control'] = 'no-store'
    return response

def ensure_image_exists(name, fallback):
    path = os.path.join(OUTPUT_DIR, f"{name}.png")
    fallback_path = os.path.join(DEFAULTS_DIR, fallback)
    if not os.path.exists(path) and os.path.exists(fallback_path):
        shutil.copy(fallback_path, path)

def get_view_prompt(game_type):
    return {
        "Flappy Bird": "side view, flying left to right",
        "Speed Runner": "side view, running left to right",
        "Match 3": "front facing, standing pose",
        "Whack-a-Mole": "front facing, idle pose",
        "Crossy Road": "top down view"
    }.get(game_type, "side view")

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    prompt = data.get("prompt", "")
    transparent = data.get("transparent", False)
    img_type = data.get("type", "char")
    game_type = data.get("gameType", "Flappy Bird")

    filename = f"{img_type}.png"
    filepath = os.path.join(OUTPUT_DIR, filename)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    view = get_view_prompt(game_type)
    full_prompt = f"{prompt}, {view}, pixel character, 16-bit sprite, retro video game style, plain background"

    try:
        headers = {
            "x-api-key": SEGMIND_API_KEY,
            "Content-Type": "application/json"
        }
        payload = { "prompt": full_prompt }
        res = requests.post(SEGMIND_IMAGE_URL, headers=headers, json=payload)
        if res.status_code != 200:
            raise Exception(f"Segmind image error: {res.text}")

        image_url = res.json().get("output_url")
        if not image_url:
            raise Exception("Image URL not returned")

        image_data = requests.get(image_url).content

        if transparent and REMOVE_BG_KEY != "your_removebg_api_key":
            bg_res = requests.post(
                "https://api.remove.bg/v1.0/removebg",
                headers={"X-Api-Key": REMOVE_BG_KEY},
                files={"image_file": ("image.png", image_data, "image/png")},
                data={"size": "auto"}
            )
            image_data = bg_res.content if bg_res.status_code == 200 else image_data

        with open(filepath, "wb") as f:
            f.write(image_data)

        return jsonify({ "image_url": f"http://127.0.0.1:5000/{OUTPUT_DIR}/{filename}" })

    except Exception as e:
        fallback_map = {
            "char": "bleep.jpg",
            "bg": "dbg.jpg",
            "obs": "do.png"
        }
        fallback_file = fallback_map.get(img_type)
        fallback_path = os.path.join(DEFAULTS_DIR, fallback_file)
        if os.path.exists(fallback_path):
            shutil.copy(fallback_path, filepath)
            return jsonify({
                "image_url": f"http://127.0.0.1:5000/{OUTPUT_DIR}/{filename}",
                "used_default": True
            })
        return jsonify({"error": "Image generation failed", "details": str(e)}), 500

@app.route('/generate-code', methods=['POST'])
def generate_code():
    data = request.get_json()
    logic = data.get("logic", "")
    difficulty = data.get("difficulty", "50")
    game_type = data.get("gameType", "Flappy Bird")

    ensure_image_exists("char", "bleep.jpg")
    ensure_image_exists("bg", "dbg.jpg")
    ensure_image_exists("obs", "do.png")

    template_file = f"{game_type.lower().replace(' ', '')}_base.js"
    template_path = os.path.join(TEMPLATES_DIR, template_file)
    html_template_path = os.path.join(TEMPLATES_DIR, "game_template.html")

    if not os.path.exists(template_path) or not os.path.exists(html_template_path):
        return jsonify({"success": False, "details": "Template not found"}), 500

    with open(template_path, "r", encoding="utf-8") as f:
        base_code = f.read()

    prompt = (
        f"You are a JavaScript game developer. Modify the following game base code for a {game_type} game.\n"
        f"Add this logic: {logic}\n"
        f"Set difficulty: {difficulty}/100\n"
        f"Keep structure unchanged, only modify where needed.\n\n"
        f"Base Code:\n{base_code}"
    )

    try:
        headers = {
            "x-api-key": SEGMIND_API_KEY,
            "Content-Type": "application/json"
        }
        payload = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": "You are a helpful JavaScript game developer."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        }

        res = requests.post(SEGMIND_CODE_URL, headers=headers, json=payload)
        result = res.json()
        output = result.get("choices", [{}])[0].get("message", {}).get("content", "")

        os.makedirs(OUTPUT_DIR, exist_ok=True)

        if not output.strip() or "function" not in output:
            shutil.copy(template_path, os.path.join(OUTPUT_DIR, "game.js"))
            shutil.copy(html_template_path, os.path.join(OUTPUT_DIR, "game.html"))
            return jsonify({"success": True, "used_base": True})

        with open(os.path.join(OUTPUT_DIR, "game.js"), "w", encoding="utf-8") as f:
            f.write(output)

        shutil.copy(html_template_path, os.path.join(OUTPUT_DIR, "game.html"))
        return jsonify({"success": True})

    except Exception as e:
        return jsonify({"success": False, "details": str(e)}), 500

@app.route('/download-zip')
def download_zip():
    zip_path = "generated_game.zip"
    with zipfile.ZipFile(zip_path, "w") as zipf:
        for fname in ["game.html", "game.js", "char.png", "bg.png", "obs.png"]:
            path = os.path.join(OUTPUT_DIR, fname)
            if os.path.exists(path):
                zipf.write(path, fname)
    return send_file(zip_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)