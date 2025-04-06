"""
Bridge script to run your original demo.py script and make the generated images available to the UI.

Usage:
    python bridge.py --prompt "your prompt here"
"""

import argparse
import os
import subprocess
import sys
import time
import shutil
from datetime import datetime

def main():
    parser = argparse.ArgumentParser(description="Run Stable Diffusion with the provided parameters")
    parser.add_argument("--prompt", type=str, default="man on moon with bike riding image in 4k resolution and high quality",
                        help="Prompt for image generation")
    parser.add_argument("--negative_prompt", type=str, default="", help="Negative prompt")
    parser.add_argument("--strength", type=float, default=0.9, help="Strength parameter")
    parser.add_argument("--cfg_scale", type=float, default=8.0, help="CFG scale")
    parser.add_argument("--steps", type=int, default=50, help="Number of inference steps")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--sampler", type=str, default="ddpm", help="Sampler name")
    
    args = parser.parse_args()
    
    # Path to the original demo.py
    demo_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sd", "demo.py")
    
    if not os.path.exists(demo_path):
        print(f"Error: Could not find demo.py at {demo_path}")
        return 1
    
    # Build the command to run demo.py with the provided parameters
    # Since we can't modify demo.py, we'll need to manually update the parameters in there
    
    print(f"Running Stable Diffusion with the following parameters:")
    print(f"  Prompt: {args.prompt}")
    print(f"  Negative Prompt: {args.negative_prompt}")
    print(f"  Strength: {args.strength}")
    print(f"  CFG Scale: {args.cfg_scale}")
    print(f"  Steps: {args.steps}")
    print(f"  Seed: {args.seed}")
    print(f"  Sampler: {args.sampler}")
    
    # Create a temporary version of demo.py with our parameters
    temp_demo_path = os.path.join(os.path.dirname(demo_path), "temp_demo.py")
    
    with open(demo_path, 'r') as f:
        demo_content = f.read()
    
    # Replace the parameters in the demo file
    demo_content = demo_content.replace('prompt = "man on moon with bike riding image in 4k resolution and high quality"', 
                                        f'prompt = "{args.prompt}"')
    demo_content = demo_content.replace('uncond_prompt = ""', 
                                        f'uncond_prompt = "{args.negative_prompt}"')
    demo_content = demo_content.replace('strength = 0.9', 
                                        f'strength = {args.strength}')
    demo_content = demo_content.replace('cfg_scale = 8', 
                                        f'cfg_scale = {args.cfg_scale}')
    demo_content = demo_content.replace('num_inference_steps = 50', 
                                        f'num_inference_steps = {args.steps}')
    demo_content = demo_content.replace('seed = 42', 
                                        f'seed = {args.seed}')
    demo_content = demo_content.replace('sampler = "ddpm"', 
                                        f'sampler = "{args.sampler}"')
    
    with open(temp_demo_path, 'w') as f:
        f.write(demo_content)
    
    try:
        # Run the modified demo.py
        result = subprocess.run([sys.executable, temp_demo_path], 
                                capture_output=True, 
                                text=True)
        
        if result.returncode != 0:
            print("Error running Stable Diffusion:")
            print(result.stderr)
            return 1
        
        print("Image generated successfully!")
        print(result.stdout)
        
        # Find the generated image
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "images")
        ui_output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "images")
        
        # Create UI images directory if it doesn't exist
        os.makedirs(ui_output_dir, exist_ok=True)
        
        # Copy the most recent image to the UI directory
        if os.path.exists(output_dir):
            image_files = [f for f in os.listdir(output_dir) if f.endswith('.png') or f.endswith('.jpg')]
            if image_files:
                image_files.sort(key=lambda x: os.path.getmtime(os.path.join(output_dir, x)), reverse=True)
                most_recent_image = image_files[0]
                source_path = os.path.join(output_dir, most_recent_image)
                ui_image_path = os.path.join(ui_output_dir, f"generated_{timestamp}.png")
                shutil.copy2(source_path, ui_image_path)
                print(f"Image copied to UI directory: {ui_image_path}")
        
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_demo_path):
            os.remove(temp_demo_path)
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 