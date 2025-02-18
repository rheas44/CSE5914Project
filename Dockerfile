# Use an official Python base image
FROM python:3.11.9-slim

# Install curl
RUN apt-get update && apt-get install -y curl

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Copy dependencies and install
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /app/

# Set entrypoint
#ENTRYPOINT ["/app/wait-for-elasticsearch.sh"]

# Default command
CMD ["python", "server.py", "runserver", "0.0.0.0:8000"]
