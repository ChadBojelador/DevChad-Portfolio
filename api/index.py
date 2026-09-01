"""Vercel entrypoint for the portfolio assistant API.

Vercel automatically discovers FastAPI applications exported from
``api/index.py`` and serves their routes below ``/api``.
"""

from api.main import app

