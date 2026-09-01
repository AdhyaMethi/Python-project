import os
import uuid
import fitz  # PyMuPDF
from pptx import Presentation
from PIL import Image, ImageDraw, ImageFont
from flask import Flask, render_template, request, jsonify, url_for
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hand_gesture_presentation_secret_key_2026'
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static', 'uploads')
app.config['SLIDES_FOLDER'] = os.path.join(app.root_path, 'static', 'slides')
app.config['DEMO_FOLDER'] = os.path.join(app.config['SLIDES_FOLDER'], 'demo')
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # 32 MB limit

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['SLIDES_FOLDER'], exist_ok=True)
os.makedirs(app.config['DEMO_FOLDER'], exist_ok=True)

# Global Active Presentation State
active_presentation = {
    "id": "demo",
    "title": "Gesture Control Demo Presentation",
    "filename": "demo_slides",
    "slides": [],
    "current_index": 0,
    "total_slides": 0
}

def generate_demo_slides():
    """Generates modern 1920x1080 presentation slides for out-of-the-box demo."""
    demo_dir = app.config['DEMO_FOLDER']
    demo_slides_data = [
        {
            "title": "Gesture-Controlled Presentations",
            "subtitle": "Control Slides & Pointer using AI MediaPipe Hand Tracking",
            "bullets": [
                "✨ Touchless Slide Navigation with Natural Hand Gestures",
                "🎯 Real-time Virtual Laser Pointer Overlay",
                "📄 Out-of-the-box Support for PDF & PPTX Files",
                "🚀 Powered by Flask, MediaPipe Hands & PyMuPDF"
            ],
            "footer": "Slide 1 / 5 • Flask Hand Gesture App"
        },
        {
            "title": "Hand Gestures Cheatsheet",
            "subtitle": "Simple Intuitive Gestures for Presenting",
            "bullets": [
                "👉 Swipe / Point Right -> Advance to Next Slide",
                "👈 Swipe / Point Left -> Return to Previous Slide",
                "☝ Point Index Finger -> Activate Virtual Laser Pointer",
                "🖐 Open Palm -> Pause / Neutral Hold",
                "⌨️ Keyboard Fallback: Left / Right Arrows & Spacebar"
            ],
            "footer": "Slide 2 / 5 • Gesture Controls Guide"
        },
        {
            "title": "Key Features & Architecture",
            "subtitle": "High Performance In-Browser Detection & Backend Processing",
            "bullets": [
                "⚡ Sub-30ms MediaPipe JS Hand Tracking on Client Canvas",
                "🖼️ Sub-second Vector PDF Rendering via PyMuPDF",
                "🎨 Native PPTX Slide Processing via python-pptx & Pillow",
                "🌌 Sleek Glassmorphism Dark Theme UI"
            ],
            "footer": "Slide 3 / 5 • Features & Tech Stack"
        },
        {
            "title": "How Virtual Laser Pointer Works",
            "subtitle": "Sub-pixel Finger Coordinate Mapping to Slide Viewport",
            "bullets": [
                "1. MediaPipe detects index finger tip landmark (#8)",
                "2. X and Y coordinates normalized (0.0 to 1.0) are calculated",
                "3. Horizontal axis inverted to align with mirrored webcam",
                "4. Glowing laser dot renders dynamically over presentation canvas"
            ],
            "footer": "Slide 4 / 5 • Laser Tracking Specs"
        },
        {
            "title": "Ready to Present!",
            "subtitle": "Upload your own presentation or practice with this deck",
            "bullets": [
                "📁 Click 'Upload Presentation' in top bar to load .pdf or .pptx",
                "📹 Click 'Start Camera' to enable MediaPipe Hand Engine",
                "🖥️ Press 'Fullscreen' or 'F' for full presentation mode",
                "🎉 Thank you for testing GesturePresenter AI!"
            ],
            "footer": "Slide 5 / 5 • End of Presentation"
        }
    ]

    generated_urls = []
    width, height = 1280, 720

    for idx, slide_data in enumerate(demo_slides_data, 1):
        filename = f"demo_slide_{idx}.png"
        filepath = os.path.join(demo_dir, filename)
        rel_url = f"/static/slides/demo/{filename}"
        generated_urls.append(rel_url)

        # Draw slide image with PIL
        img = Image.new("RGB", (width, height), "#0b0f19")
        draw = ImageDraw.Draw(img)

        # Gradient background effect
        for y in range(height):
            r = int(11 + (y / height) * 12)
            g = int(15 + (y / height) * 20)
            b = int(25 + (y / height) * 45)
            draw.line([(0, y), (width, y)], fill=(r, g, b))

        # Top Accent Header Line
        draw.rectangle([(0, 0), (width, 8)], fill="#6366f1")
        draw.rectangle([(0, 8), (400, 12)], fill="#06b6d4")

        # Fonts (Fallback to default if custom font unavailable)
        try:
            title_font = ImageFont.truetype("arial.ttf", 44)
            sub_font = ImageFont.truetype("arial.ttf", 24)
            bullet_font = ImageFont.truetype("arial.ttf", 26)
            footer_font = ImageFont.truetype("arial.ttf", 18)
        except Exception:
            title_font = ImageFont.load_default()
            sub_font = ImageFont.load_default()
            bullet_font = ImageFont.load_default()
            footer_font = ImageFont.load_default()

        # Title Card Background Box
        draw.rectangle([(60, 50), (1220, 180)], fill=(19, 27, 46, 200), outline=(255, 255, 255, 30))
        draw.text((90, 70), slide_data["title"], fill="#ffffff", font=title_font)
        draw.text((90, 130), slide_data["subtitle"], fill="#a5b4fc", font=sub_font)

        # Bullet Points Box
        draw.rectangle([(60, 210), (1220, 640)], fill=(15, 23, 42, 180), outline=(99, 102, 241, 60))
        
        y_pos = 250
        for bullet in slide_data["bullets"]:
            # Bullet dot indicator
            draw.ellipse([(90, y_pos + 8), (102, y_pos + 20)], fill="#6366f1", outline="#06b6d4")
            draw.text((120, y_pos), bullet, fill="#f8fafc", font=bullet_font)
            y_pos += 85

        # Footer Bar
        draw.text((90, 665), slide_data["footer"], fill="#94a3b8", font=footer_font)
        draw.text((1020, 665), "GesturePresenter AI", fill="#6366f1", font=footer_font)

        img.save(filepath, "PNG")

    return generated_urls

# Initialize Demo Slides
demo_urls = generate_demo_slides()
active_presentation["slides"] = demo_urls
active_presentation["total_slides"] = len(demo_urls)

def process_pdf(pdf_path, presentation_id):
    """Converts PDF document pages into slide images using PyMuPDF."""
    out_dir = os.path.join(app.config['SLIDES_FOLDER'], presentation_id)
    os.makedirs(out_dir, exist_ok=True)

    doc = fitz.open(pdf_path)
    slide_urls = []

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        # Render high quality pixmap (150 DPI)
        pix = page.get_pixmap(dpi=150)
        filename = f"slide_{page_num + 1}.png"
        filepath = os.path.join(out_dir, filename)
        pix.save(filepath)
        slide_urls.append(f"/static/slides/{presentation_id}/{filename}")

    doc.close()
    return slide_urls

def process_pptx(pptx_path, presentation_id):
    """Parses PPTX presentation content and generates rendered slide images."""
    out_dir = os.path.join(app.config['SLIDES_FOLDER'], presentation_id)
    os.makedirs(out_dir, exist_ok=True)

    prs = Presentation(pptx_path)
    slide_urls = []
    width, height = 1280, 720

    try:
        title_font = ImageFont.truetype("arial.ttf", 40)
        text_font = ImageFont.truetype("arial.ttf", 24)
        footer_font = ImageFont.truetype("arial.ttf", 18)
    except Exception:
        title_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
        footer_font = ImageFont.load_default()

    for idx, slide in enumerate(prs.slides, 1):
        filename = f"slide_{idx}.png"
        filepath = os.path.join(out_dir, filename)

        # Extract title and body text from PowerPoint shapes
        slide_title = f"Slide {idx}"
        slide_texts = []

        for shape in slide.shapes:
            if not shape.has_text_frame:
                continue
            for paragraph in shape.text_frame.paragraphs:
                text = paragraph.text.strip()
                if text:
                    if shape == slide.shapes[0] and idx == 1:
                        slide_title = text
                    elif hasattr(shape, "is_placeholder") and shape.is_placeholder and "Title" in str(shape.placeholder_format.type):
                        slide_title = text
                    else:
                        slide_texts.append(text)

        # Draw rendered slide image
        img = Image.new("RGB", (width, height), "#0b0f19")
        draw = ImageDraw.Draw(img)

        # Background gradient
        for y in range(height):
            r = int(15 + (y / height) * 15)
            g = int(23 + (y / height) * 25)
            b = int(42 + (y / height) * 40)
            draw.line([(0, y), (width, y)], fill=(r, g, b))

        # Top border highlight
        draw.rectangle([(0, 0), (width, 8)], fill="#6366f1")

        # Header Box
        draw.rectangle([(50, 40), (1230, 150)], fill=(19, 27, 46, 220), outline=(99, 102, 241, 100))
        draw.text((80, 65), slide_title[:55], fill="#ffffff", font=title_font)

        # Content Card
        draw.rectangle([(50, 180), (1230, 650)], fill=(15, 23, 42, 180), outline=(255, 255, 255, 30))

        y_offset = 220
        if slide_texts:
            for text_line in slide_texts[:8]:
                draw.ellipse([(80, y_offset + 6), (92, y_offset + 18)], fill="#06b6d4")
                draw.text((110, y_offset), text_line[:80], fill="#f8fafc", font=text_font)
                y_offset += 52
        else:
            draw.text((110, 300), "PowerPoint Slide Content", fill="#94a3b8", font=text_font)

        draw.text((80, 670), f"Slide {idx} of {len(prs.slides)}", fill="#94a3b8", font=footer_font)
        draw.text((1050, 670), "GesturePresenter AI", fill="#6366f1", font=footer_font)

        img.save(filepath, "PNG")
        slide_urls.append(f"/static/slides/{presentation_id}/{filename}")

    return slide_urls

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/slides', methods=['GET'])
def get_slides():
    """Returns the active presentation state and slide list."""
    return jsonify({
        "status": "success",
        "presentation": active_presentation
    })

@app.route('/api/navigate', methods=['POST'])
def navigate_slide():
    """Navigates slide index based on action ('next', 'prev', 'goto')."""
    data = request.json or {}
    action = data.get('action')
    target_idx = data.get('index', None)

    total = active_presentation["total_slides"]
    current = active_presentation["current_index"]

    if action == 'next':
        if current < total - 1:
            active_presentation["current_index"] += 1
    elif action == 'prev':
        if current > 0:
            active_presentation["current_index"] -= 1
    elif action == 'goto' and target_idx is not None:
        if 0 <= target_idx < total:
            active_presentation["current_index"] = target_idx

    return jsonify({
        "status": "success",
        "presentation": active_presentation
    })

@app.route('/api/upload', methods=['POST'])
def upload_presentation():
    """Uploads PDF or PPTX file, converts pages/slides to PNGs, and sets active presentation."""
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400

    filename = secure_filename(file.filename)
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ['.pdf', '.pptx', '.ppt']:
        return jsonify({"status": "error", "message": "Unsupported file format. Please upload PDF or PPTX."}), 400

    presentation_id = str(uuid.uuid4())[:8]
    saved_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{presentation_id}_{filename}")
    file.save(saved_path)

    try:
        if ext == '.pdf':
            slides = process_pdf(saved_path, presentation_id)
        else:
            slides = process_pptx(saved_path, presentation_id)

        if not slides:
            return jsonify({"status": "error", "message": "Could not extract slides from file."}), 400

        active_presentation["id"] = presentation_id
        active_presentation["title"] = os.path.splitext(filename)[0].replace('_', ' ').title()
        active_presentation["filename"] = filename
        active_presentation["slides"] = slides
        active_presentation["current_index"] = 0
        active_presentation["total_slides"] = len(slides)

        return jsonify({
            "status": "success",
            "message": f"Successfully processed {len(slides)} slides!",
            "presentation": active_presentation
        })
    except Exception as e:
        print(f"Error processing upload: {e}")
        return jsonify({"status": "error", "message": f"Failed to process file: {str(e)}"}), 500

@app.route('/api/reset_demo', methods=['POST'])
def reset_demo():
    """Resets presentation to out-of-the-box demo slides."""
    active_presentation["id"] = "demo"
    active_presentation["title"] = "Gesture Control Demo Presentation"
    active_presentation["filename"] = "demo_slides"
    active_presentation["slides"] = demo_urls
    active_presentation["current_index"] = 0
    active_presentation["total_slides"] = len(demo_urls)

    return jsonify({
        "status": "success",
        "message": "Reset to default demo presentation.",
        "presentation": active_presentation
    })

if __name__ == '__main__':
    print("Starting Flask Hand Gesture Presentation App on http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
