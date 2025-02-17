FROM python:3.12.9 AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
WORKDIR /app

RUN python -m venv .venv
COPY requirements.txt ./
RUN .venv/bin/pip install -r requirements.txt

FROM python:3.12.9-slim
WORKDIR /app
COPY --from=builder /app/.venv .venv/
COPY . .

# Add this line to ensure Python can find your modules
ENV PYTHONPATH=/app

# Update the CMD to point to the correct location of your main.py
CMD ["/app/.venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]