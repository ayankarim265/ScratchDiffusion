from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from PIL import Image, ImageDraw, ImageFont
import io
import os
import sys
import numpy as np
from datetime import datetime
import random
import torch

# Get absolute path to the sd directory
sd_path = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "sd"))
sys.path.insert(0, sd_path)

# Import SD modules directly
try:
    # Try with sd prefix first
    from sd import model_loader
    from sd import pipeline
except ImportError:
    # Fall back to direct import
    import model_loader
    import pipeline
from transformers import CLIPTokenizer

app = Flask(__name__)
CORS(app)

# Define device
DEVICE = "cpu"
ALLOW_CUDA = True
ALLOW_MPS = True

if torch.cuda.is_available() and ALLOW_CUDA:
    DEVICE = "cuda"
elif (hasattr(torch, 'has_mps') or hasattr(torch.backends, 'mps')) and ALLOW_MPS:
    if torch.backends.mps.is_available():
        DEVICE = "mps"
print(f"Using device: {DEVICE}")

# Initialize models
try:
    print("Loading models...")
    tokenizer = CLIPTokenizer(
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data/vocab.json"), 
        merges_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data/merges.txt")
    )
    model_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data/v1-5-pruned-emaonly.ckpt")
    models = model_loader.preload_models_from_standard_weights(model_file, DEVICE)
    print("Models loaded successfully!")
    SD_AVAILABLE = True
except Exception as e:
    print(f"Failed to load models: {e}")
    print("Will use placeholder images instead.")
    SD_AVAILABLE = False
    models = None
    tokenizer = None

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.json
        prompt = data.get('prompt', '')
        uncond_prompt = data.get('uncond_prompt', '')
        strength = float(data.get('strength', 0.9))
        do_cfg = bool(data.get('do_cfg', True))
        cfg_scale = float(data.get('cfg_scale', 8))
        sampler_name = data.get('sampler_name', 'ddpm')
        n_inference_steps = int(data.get('n_inference_steps', 50))
        seed = int(data.get('seed', 42))
        
        # Get source image for image-to-image if provided
        source_image_data = data.get('source_image', None)
        input_image = None
        
        if source_image_data and source_image_data.startswith('data:image'):
            # Extract the base64 data from the data URL
            source_image_data = source_image_data.split(',', 1)[1]
            # Decode base64 to binary
            binary_data = base64.b64decode(source_image_data)
            # Create PIL Image from binary data
            input_image = Image.open(io.BytesIO(binary_data))
        
        if seed == -1:  # Random seed if -1 is provided
            seed = random.randint(0, 999999)
        
        # Use real SD model if available, otherwise create placeholder
        if SD_AVAILABLE and models is not None and tokenizer is not None:
            return generate_with_sd(prompt, uncond_prompt, input_image, strength, do_cfg, cfg_scale, sampler_name, n_inference_steps, seed)
        else:
            return create_placeholder_image(prompt, uncond_prompt, strength, do_cfg, cfg_scale, sampler_name, n_inference_steps, seed)

    except Exception as e:
        print(f"Error in generate route: {e}")
        return jsonify({'error': str(e)}), 500

def generate_with_sd(prompt, uncond_prompt, input_image, strength, do_cfg, cfg_scale, sampler_name, n_inference_steps, seed):
    """Generate an image using the Stable Diffusion model"""
    try:
        # Generate the image using the pipeline
        output_image = pipeline.generate(
            prompt=prompt,
            uncond_prompt=uncond_prompt,
            input_image=input_image,
            strength=strength,
            do_cfg=do_cfg,
            cfg_scale=cfg_scale,
            sampler_name=sampler_name,
            n_inference_steps=n_inference_steps,
            seed=seed,
            models=models,
            device=DEVICE,
            idle_device="cpu",
            tokenizer=tokenizer,
        )
        
        # Convert the output numpy array to a PIL Image
        pil_image = Image.fromarray(output_image)
        
        # Save the image to a file (optional)
        output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "images")
        os.makedirs(output_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Add img2img indicator to filename if input_image was provided
        img_type = "img2img" if input_image else "txt2img"
        image_filename = f"sd_{img_type}_{timestamp}_{seed}.png"
        
        image_path = os.path.join(output_dir, image_filename)
        pil_image.save(image_path)
        
        # Convert PIL Image to base64
        buffered = io.BytesIO()
        pil_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return jsonify({
            'image': f'data:image/png;base64,{img_str}',
            'seed': seed,
            'prompt': prompt,
            'path': image_path,
            'type': img_type
        })
    except Exception as e:
        print(f"Error generating with SD: {e}")
        # Fall back to placeholder if SD generation fails
        return create_placeholder_image(prompt, uncond_prompt, strength, do_cfg, cfg_scale, sampler_name, n_inference_steps, seed)

def create_placeholder_image(prompt, uncond_prompt, strength, do_cfg, cfg_scale, sampler_name, n_inference_steps, seed):
    """Create a placeholder image when the model is not available"""
    random.seed(seed)
    width, height = 512, 512
    
    # Create a gradient based on the seed and prompt
    r = random.randint(0, 255)
    g = random.randint(0, 255)
    b = random.randint(0, 255)
    
    image = Image.new('RGB', (width, height), (r, g, b))
    pixels = image.load()
    
    for i in range(width):
        for j in range(height):
            # Create a gradient effect
            r_val = (r + i // 2) % 255
            g_val = (g + j // 2) % 255
            b_val = (b + (i + j) // 4) % 255
            pixels[i, j] = (r_val, g_val, b_val)
    
    # Add prompt as text to the image
    draw = ImageDraw.Draw(image)
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
        
    # Wrap text to fit the image
    text = prompt
    lines = []
    line = ""
    for word in text.split():
        if len(line + word) < 40:
            line += word + " "
        else:
            lines.append(line)
            line = word + " "
    if line:
        lines.append(line)
        
    y_position = 20
    for line in lines:
        draw.text((20, y_position), line, fill=(255, 255, 255), font=font)
        y_position += 30
        
    # Additional parameters shown
    draw.text((20, height - 120), f"Sampler: {sampler_name}", fill=(255, 255, 255), font=font)
    draw.text((20, height - 90), f"Steps: {n_inference_steps}", fill=(255, 255, 255), font=font)
    draw.text((20, height - 60), f"CFG Scale: {cfg_scale if do_cfg else 'Disabled'}", fill=(255, 255, 255), font=font)
    draw.text((20, height - 30), f"Seed: {seed}", fill=(255, 255, 255), font=font)
    
    # Convert PIL Image to base64
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return jsonify({
        'image': f'data:image/png;base64,{img_str}',
        'seed': seed,
        'prompt': prompt,
        'note': 'This is a placeholder image. The Stable Diffusion model could not be loaded.'
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'message': 'Stable Diffusion UI backend is running',
        'sd_available': SD_AVAILABLE
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 