import os
import secrets
import subprocess
import sys
from pathlib import Path

import uvicorn

if not os.environ.get("SECRET_KEY"):
    secret_file = Path("/run/secrets/secret_key")
    secret_file.parent.mkdir(parents=True, exist_ok=True)
    if not secret_file.exists():
        secret_file.write_text(secrets.token_hex(32), encoding="utf-8")
        secret_file.chmod(0o600)
    os.environ["SECRET_KEY"] = secret_file.read_text(encoding="utf-8").strip()

subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)
uvicorn.run("app.main:app", host="0.0.0.0", port=8000)
