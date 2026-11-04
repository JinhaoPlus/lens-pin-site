"""Rebuild localized product social cards from approved Mac store artwork (requires Pillow)."""
from pathlib import Path
import subprocess
import sys
subprocess.run([sys.executable, str(Path(__file__).with_name('create-store-artwork.py')), '--social-only', *sys.argv[1:]], check=True)
