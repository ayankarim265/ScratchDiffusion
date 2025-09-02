# ScratchDiffusion UI

A simple web interface for Stable Diffusion image generation.

## Features

- Text-to-image generation
- Image-to-image transformation (convert photos to Ghibli style)
- Control over generation parameters (CFG scale, sampler, steps, etc.)
- Random seed generation
- Easily view and download generated images

## Requirements

- Python 3.8 or later
- Node.js 14 or later
- NPM 6 or later

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/stable-diffusion-ui.git
cd stable-diffusion-ui
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
pip install -r ui/requirements.txt
pip install -r ui/backend/requirements.txt
```

3. Install frontend dependencies:
```bash
cd ui
npm install
```

4. Download the Stable Diffusion model checkpoint:
   - Place the `v1-5-pruned-emaonly.ckpt` file in the `data/` directory
   - Also place the required `vocab.json` and `merges.txt` files in the `data/` directory

## Usage

1. Start the application:
```bash
cd ui
python start.py
```



## Generating Images

### Text-to-Image
1. Enter your prompt describing what you want to generate
2. Optionally, enter a negative prompt for things to avoid
3. Adjust generation parameters:
   - **Strength**: Controls the denoising strength (0.0-1.0)
   - **CFG Scale**: Controls how closely the image follows your prompt (1-20)
   - **Sampler**: The sampling algorithm to use (DDPM, DDIM, etc.)
   - **Steps**: Number of denoising steps (more = better quality but slower)
   - **Seed**: Random seed for reproducible results
4. Click "Generate Image" and wait for the result

### Image-to-Image (Style Transfer)
1. Upload a source image using the "Source Image" section
2. Enter a prompt describing the desired style (e.g., "Studio Ghibli style")
3. Adjust the Transformation Strength (0.75 recommended for style transfer)
   - Higher values retain less of the original image
   - Lower values keep more of the original image's structure
4. Click "Transform Image" and wait for the result

## Project Structure

- `ui/`: Frontend application (React)
  - `src/`: React source code
  - `backend/`: Flask API server
- `sd/`: Stable Diffusion implementation
- `data/`: Model weights and configuration files
- `images/`: Generated images are saved here

## Notes

This UI is a simple interface for the Stable Diffusion implementation. For more advanced features, consider using other Stable Diffusion UIs like Automatic1111 or ComfyUI.

## License

[MIT License](LICENSE) # Ai-project
