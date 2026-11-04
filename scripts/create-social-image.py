"""Rebuild the social card from the approved v3 brand artwork (requires Pillow)."""
from pathlib import Path
import subprocess
import sys
subprocess.run([sys.executable, str(Path(__file__).with_name('create-store-artwork.py')), '--social-only', *sys.argv[1:]], check=True)
