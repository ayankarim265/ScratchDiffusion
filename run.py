#!/usr/bin/env python
"""
Convenience script to start the Stable Diffusion UI
"""

import os
import sys
import subprocess

def main():
    # Get the directory of this script
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ui_dir = os.path.join(base_dir, "ui")
    
    # Check if ui directory exists
    if not os.path.exists(ui_dir):
        print(f"Error: UI directory not found at {ui_dir}")
        return 1
    
    # Check if start.py exists
    start_script = os.path.join(ui_dir, "start.py")
    if not os.path.exists(start_script):
        print(f"Error: start.py not found at {start_script}")
        return 1
    
    # Start the UI
    print("Starting Stable Diffusion UI...")
    os.chdir(ui_dir)
    
    # Run the start script
    proc = subprocess.run([sys.executable, "start.py"])
    return proc.returncode

if __name__ == "__main__":
    sys.exit(main()) 