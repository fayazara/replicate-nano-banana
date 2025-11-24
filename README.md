# YouTube Thumbnail Generator

A simple app to generate YouTube thumbnails using the `google/nano-banana-pro` model.

## Tech Stack

- **Framework**: Nuxt
- **Deployment**: Cloudflare Workers
- **AI Provider**: Replicate (`google/nano-banana-pro`)

## Setup

1.  Clone the repository.
2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Create a `.env` file and add your Replicate API token:

    ```bash
    REPLICATE_API_TOKEN=your_token_here
    ```

4.  Start the development server:

    ```bash
    npm run dev
    ```

5.  Open `http://localhost:3000` in your browser.
