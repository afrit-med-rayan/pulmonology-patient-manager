#!/usr/bin/env python3
"""
Pulmonology Patient Manager Launcher
Dr. S. Sahboub - Simple .exe launcher for the patient management system
"""

import os
import sys
import time
import webbrowser
import subprocess
import threading
import socket
from pathlib import Path

def find_free_port(start_port=8000, max_port=8100):
    """Find a free port to run the server on"""
    for port in range(start_port, max_port):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            continue
    return None

def check_python():
    """Check if Python is available"""
    try:
        result = subprocess.run([sys.executable, '--version'], 
                              capture_output=True, text=True, timeout=5)
        return result.returncode == 0
    except:
        return False

def start_server(port):
    """Start the HTTP server"""
    try:
        # Change to the script directory
        script_dir = Path(__file__).parent.absolute()
        os.chdir(script_dir)
        
        print(f"🚀 Starting server on port {port}...")
        print(f"📁 Serving from: {script_dir}")
        
        # Start Python HTTP server
        subprocess.run([
            sys.executable, '-m', 'http.server', str(port)
        ], check=False)
        
    except KeyboardInterrupt:
        print("\n⏹️  Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        input("Press Enter to exit...")

def open_browser(port, delay=2):
    """Open the browser after a delay"""
    time.sleep(delay)
    url = f"http://localhost:{port}/complete-patient-system.html"
    print(f"🌐 Opening browser: {url}")
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"❌ Could not open browser: {e}")
        print(f"📋 Please manually open: {url}")

def main():
    """Main launcher function"""
    print("=" * 60)
    print("🏥 SYSTÈME DE GESTION DES PATIENTS - Dr. S. Sahboub")
    print("=" * 60)
    print()
    
    # Check if Python is available
    if not check_python():
        print("❌ Python not found! Please install Python first.")
        input("Press Enter to exit...")
        return
    
    # Find a free port
    port = find_free_port()
    if not port:
        print("❌ No free ports available (8000-8100)")
        input("Press Enter to exit...")
        return
    
    # Check if the HTML file exists
    script_dir = Path(__file__).parent.absolute()
    html_file = script_dir / "complete-patient-system.html"
    
    if not html_file.exists():
        print(f"❌ Patient management system not found!")
        print(f"📁 Looking for: {html_file}")
        print("📋 Make sure this launcher is in the same folder as the HTML files.")
        input("Press Enter to exit...")
        return
    
    print(f"✅ Found patient management system")
    print(f"🌐 Server will start on: http://localhost:{port}")
    print(f"📄 Opening: complete-patient-system.html")
    print()
    print("🔄 Starting server and opening browser...")
    print("⏹️  Press Ctrl+C to stop the server")
    print()
    
    # Start browser in a separate thread
    browser_thread = threading.Thread(target=open_browser, args=(port,))
    browser_thread.daemon = True
    browser_thread.start()
    
    # Start the server (this will block)
    start_server(port)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        input("Press Enter to exit...")