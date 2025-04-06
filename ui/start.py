"""
Start script to run both the frontend and backend services.
"""

import os
import subprocess
import sys
import time
import webbrowser
import threading

def run_command(command, cwd=None):
    """Run a command in a separate process."""
    print(f"Running: {' '.join(command)}")
    
    env = os.environ.copy()
    process = subprocess.Popen(
        command,
        cwd=cwd or os.getcwd(),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        encoding='utf-8',
        errors='replace',
        bufsize=1
    )
    
    return process

def stream_output(process, prefix):
    """Stream the output of a process with a prefix."""
    for line in process.stdout:
        print(f"{prefix}: {line.rstrip()}")

def main():
    # Get the directory of this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Start the backend
    backend_dir = os.path.join(current_dir, "backend")
    backend_cmd = [sys.executable, "app.py"]
    backend_process = run_command(backend_cmd, backend_dir)
    
    # Start reading backend output in a separate thread
    backend_thread = threading.Thread(
        target=stream_output,
        args=(backend_process, "Backend"),
        daemon=True
    )
    backend_thread.start()
    
    # Wait a bit for the backend to start
    time.sleep(2)
    
    # Start the frontend
    if os.name == 'nt':  # Windows
        frontend_cmd = ["npm.cmd", "run", "dev"]
    else:  # Linux/Mac
        frontend_cmd = ["npm", "run", "dev"]
    
    frontend_process = run_command(frontend_cmd, current_dir)
    
    # Start reading frontend output in a separate thread
    frontend_thread = threading.Thread(
        target=stream_output,
        args=(frontend_process, "Frontend"),
        daemon=True
    )
    frontend_thread.start()
    
    # Wait a bit for the frontend to start
    time.sleep(5)
    
    # Open browser
    webbrowser.open("http://localhost:5173")
    
    print("\n" + "="*80)
    print("Stable Diffusion UI is running!")
    print("Backend API: http://localhost:5000")
    print("Frontend UI: http://localhost:5173")
    print("="*80)
    print("\nPress Ctrl+C to stop...\n")
    
    try:
        # Wait for both processes to complete or for the user to interrupt
        while backend_process.poll() is None and frontend_process.poll() is None:
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        # Terminate processes
        if backend_process.poll() is None:
            backend_process.terminate()
        if frontend_process.poll() is None:
            frontend_process.terminate()
        
        # Wait for processes to terminate
        backend_process.wait()
        frontend_process.wait()
        
        print("Stable Diffusion UI stopped.")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1) 