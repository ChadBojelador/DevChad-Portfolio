"""Embed local knowledge JSON files and upsert them into Supabase.

Usage: python scripts/ingest_portfolio.py
Required environment: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
"""
import hashlib
import json
import os
from pathlib import Path

import httpx
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
KNOWLEDGE_DIR = ROOT / 'knowledge'
load_dotenv(ROOT / '.env')
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta'
GEMINI_KEY = os.environ['GEMINI_API_KEY']
SUPABASE_URL = os.environ['SUPABASE_URL'].rstrip('/')
SUPABASE_KEY = os.environ['SUPABASE_SERVICE_ROLE_KEY']
EMBEDDING_MODEL = os.getenv('GEMINI_EMBEDDING_MODEL', 'gemini-embedding-001')
EMBEDDING_DIMENSIONS = int(os.getenv('GEMINI_EMBEDDING_DIMENSIONS', '1536'))


def split_content(content, size=1300, overlap=180):
    """Split only unusually long records; source records remain meaningful chunks by default."""
    if len(content) <= size:
        return [content]
    chunks, start = [], 0
    while start < len(content):
        end = min(len(content), start + size)
        if end < len(content):
            boundary = content.rfind(' ', start, end)
            end = boundary if boundary > start + 400 else end
        chunks.append(content[start:end].strip())
        start = end - overlap
    return chunks


def load_documents():
    documents = []
    for path in sorted(KNOWLEDGE_DIR.glob('*.json')):
        loaded = json.loads(path.read_text(encoding='utf-8'))
        documents.extend(loaded if isinstance(loaded, list) else loaded.get('documents', []))
    return documents


def normalize_embedding(values):
    if len(values) != EMBEDDING_DIMENSIONS:
        raise ValueError(f'Gemini returned an embedding with {len(values)} dimensions; expected {EMBEDDING_DIMENSIONS}.')
    magnitude = sum(value * value for value in values) ** 0.5
    if not magnitude:
        raise ValueError('Gemini returned an empty embedding.')
    return [value / magnitude for value in values]


def create_embedding(client, text, title):
    response = client.post(
        f'{GEMINI_API_URL}/models/{EMBEDDING_MODEL}:embedContent',
        headers={'x-goog-api-key': GEMINI_KEY, 'Content-Type': 'application/json'},
        json={
            'model': f'models/{EMBEDDING_MODEL}',
            'content': {'parts': [{'text': text}]},
            'taskType': 'RETRIEVAL_DOCUMENT',
            'title': title,
            'outputDimensionality': EMBEDDING_DIMENSIONS,
        },
    )
    response.raise_for_status()
    return normalize_embedding(response.json()['embedding']['values'])


def main():
    documents = load_documents()
    rows = []
    for document in documents:
        for chunk_index, content in enumerate(split_content(document['content'])):
            # Stable keys make reruns idempotent and update a changed source record in place.
            identity = f"{document['type']}:{document.get('slug', document['title'])}:{chunk_index}"
            rows.append({
                'source_key': hashlib.sha256(identity.encode()).hexdigest(),
                'type': document['type'],
                'title': document['title'],
                'content': content,
                'metadata': document.get('metadata', {}),
            })

    supabase_headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}', 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates'}
    with httpx.Client(timeout=60) as client:
        for start in range(0, len(rows), 32):
            batch = rows[start:start + 32]
            for row in batch:
                vector = create_embedding(client, row['content'], row['title'])
                row['embedding'] = '[' + ','.join(map(str, vector)) + ']'
            upload = client.post(f'{SUPABASE_URL}/rest/v1/portfolio_knowledge?on_conflict=source_key', headers=supabase_headers, json=batch)
            upload.raise_for_status()
            print(f'Upserted {min(start + len(batch), len(rows))}/{len(rows)} chunks')


if __name__ == '__main__':
    main()
