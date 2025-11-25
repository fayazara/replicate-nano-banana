# YouTube Thumbnail Generator

A simple app to generate YouTube thumbnails using the `google/nano-banana-pro` model.

## Tech Stack

- **Framework**: Nuxt 4
- **Deployment**: Cloudflare Workers
- **AI Provider**: Replicate (`google/nano-banana-pro`)
- **Architecture**: Webhook-based async processing

## Setup

1.  Clone the repository.
2.  Install dependencies:

    ```bash
    pnpm install
    ```

3.  Create a `.env` file and add your Replicate API token:

    ```bash
    REPLICATE_API_TOKEN=your_token_here
    WEBHOOK_HOST=https://your-domain.com 
    ```


5.  Start the development server:

    ```bash
    pnpm dev
    ```

6.  Open `http://localhost:3000` in your browser.

## How It Works

1. User submits image and title → Frontend calls `/api/generate`
2. Server creates a Replicate prediction with webhook URL → Returns prediction ID immediately
3. Frontend polls `/api/status/[id]` every 5 seconds
4. Replicate sends webhook to `/api/webhooks` when generation completes
5. Frontend receives completion status and displays the generated thumbnail

## API Endpoints

- `POST /api/generate` - Creates a new prediction and returns prediction ID
- `POST /api/webhooks` - Receives webhook notifications from Replicate
- `GET /api/status/[id]` - Checks the status of a prediction by ID

## Deployment

The app is configured for Cloudflare Workers deployment. Make sure to:

1. Set environment variables in Cloudflare dashboard or via `wrangler secret put`
2. Configure `WEBHOOK_HOST` for your production domain
3. Build and deploy using Wrangler or Cloudflare Pages
