# Stable Diffusion UI

A modern web interface for Stable Diffusion image generation.

## Project Structure

```
ui/
├── src/              # Frontend React application
├── backend/          # Flask backend server
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8 or higher
- Stable Diffusion model files in the parent directory

## Setup

1. Install frontend dependencies:
```bash
cd ui
npm install
```

2. Install backend dependencies:
```bash
cd backend
pip install flask flask-cors Pillow
```

## Running the Application

### Quick Start

We've created a simple script that starts both the frontend and backend services with a single command:

```bash
cd ui
python start.py
```

This will:
1. Start the backend server
2. Start the frontend development server
3. Open your browser to the UI

Press Ctrl+C to stop both services.

### Option 1: Using the Placeholder UI

This option provides a simple UI that generates placeholder images instead of using the actual Stable Diffusion model.

1. Start the backend server:
```bash
cd ui/backend
python app.py
```

2. In a new terminal, start the frontend development server:
```bash
cd ui
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173` or whatever URL is shown in the terminal.

### Option 2: Using the Original Stable Diffusion Model (Recommended)

Since there are import issues with the Stable Diffusion model, we recommend using your original `demo.py` script for image generation, and just using our UI for visualization.

1. Generate images using your existing `demo.py` script:
```bash
cd sd
python demo.py
```

2. Use our UI to visualize and explore the generated images from the `images` folder.

### Option 3: Using the Bridge Script

We've created a bridge script that modifies and runs your original `demo.py` file with the parameters you specify, then makes the generated images available to the UI.

1. Start the frontend development server:
```bash
cd ui
npm run dev
```

2. Use the bridge script to generate images:
```bash
cd ui
python bridge.py --prompt "your prompt here" --negative_prompt "things to avoid" --steps 50 --seed 42
```

Available parameters:
- `--prompt`: Text prompt for image generation
- `--negative_prompt`: Negative prompt (things to avoid)
- `--strength`: Strength parameter (0.0-1.0)
- `--cfg_scale`: CFG scale (1-20)
- `--steps`: Number of inference steps
- `--seed`: Random seed
- `--sampler`: Sampler name (e.g., "ddpm", "ddim")

## Troubleshooting

If you encounter import errors with the CLIP module when trying to integrate our UI with your existing Stable Diffusion model, there might be a module name conflict. In this case:

1. Use the placeholder UI for demonstration purposes
2. Continue using your original `demo.py` for actual image generation

## Features

- Text-to-image generation interface
- Adjustable parameters:
  - Prompt and negative prompt
  - Strength
  - CFG Scale
  - Number of inference steps
  - Seed
  - Sampler selection
- Modern, responsive UI
- Error handling and loading states

## Notes

- The backend server runs on port 5000 by default
- The frontend development server runs on port 5173
- Make sure the Stable Diffusion model files are in the correct location
- GPU acceleration is disabled by default but can be enabled by modifying the `ALLOW_CUDA` flag in `backend/app.py`
