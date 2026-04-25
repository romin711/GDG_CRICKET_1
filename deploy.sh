#!/bin/bash
set -e

echo "Deploying SeniorMind AI Backend to Google Cloud Run..."

# Set project ID if known, or rely on current config config
# You should be logged in via gcloud init or gcloud auth login first

cd backend

# Build and Push using Google Cloud Build
echo "Submitting backend build to Cloud Build..."
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/seniormind-backend --gcs-source-staging-dir=gs://gdg0cricket-build-staging-1777137916/source

echo "Deploying backend to Cloud Run..."
gcloud run deploy seniormind-backend \
  --image gcr.io/$(gcloud config get-value project)/seniormind-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_MODEL=gemini-2.0-flash \
  --port 3001

export BACKEND_URL=$(gcloud run services describe seniormind-backend --platform managed --region us-central1 --format 'value(status.url)')
echo "Backend deployed at: $BACKEND_URL"

echo "Deploying SeniorMind AI Frontend to Google Cloud Run..."
cd ../frontend

echo "Submitting frontend build to Cloud Build..."
# We use Cloud Build and pass the API URL as a build arg so the React app builds it into static HTML
gcloud builds submit --config cloudbuild.yaml --substitutions=_REACT_APP_API_BASE_URL=$BACKEND_URL --gcs-source-staging-dir=gs://gdg0cricket-build-staging-1777137916/source

echo "Deploying frontend to Cloud Run..."
gcloud run deploy seniormind-frontend \
  --image gcr.io/$(gcloud config get-value project)/seniormind-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080

export FRONTEND_URL=$(gcloud run services describe seniormind-frontend --platform managed --region us-central1 --format 'value(status.url)')
echo "Frontend deployed at: $FRONTEND_URL"

echo "Deployment complete! Access your app at $FRONTEND_URL"
