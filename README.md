# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/095f283b-0986-4f5b-b287-0fbcd183e18c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/095f283b-0986-4f5b-b287-0fbcd183e18c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## WhatsApp Integration

This project includes a comprehensive WhatsApp integration for business communications. To enable WhatsApp features, you'll need to configure the following environment variables:

### Required Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# WhatsApp Bot API (required for sending/receiving messages)
VITE_WHATSAPP_API_BASE=https://your-whatsapp-bot-server.com
VITE_WHATSAPP_API_KEY=your_bot_api_key

# WhatsApp Importer (required for catalog import)
VITE_WHATSAPP_IMPORTER_BASE=https://your-importer-service.com
VITE_WHATSAPP_IMPORTER_KEY=your_importer_api_key
```

### Setting Up WhatsApp Bot Server

1. **Deploy a WhatsApp Bot**: Use [Baileys](https://github.com/WhiskeySockets/Baileys) or similar library to create your WhatsApp bot server
2. **API Endpoints**: Your bot server should provide:
   - `POST /send` - Send messages
   - `GET /status` - Check connection status
   - WebSocket support for real-time events
3. **Authentication**: Secure your bot API with an API key
4. **QR Code Flow**: Support QR code generation for WhatsApp Web authentication

### Security Features

- **E.164 Phone Validation**: All phone numbers are validated before API calls
- **PII Redaction**: Automatic redaction of sensitive data in logs
- **Request Timeouts**: 15s timeout for message sending, 30s for imports
- **Correlation IDs**: Request tracing for debugging
- **Idempotency**: Prevent duplicate message sends

### Testing

Run the WhatsApp integration tests:

```bash
npm run test src/test/whatsapp*
```

### Manual Testing

1. Set environment variables in `.env.local`
2. Start the development server: `npm run dev`
3. Navigate to WhatsApp settings in the dashboard
4. Verify API authentication and connection status
5. Test message sending and catalog import functionality

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/095f283b-0986-4f5b-b287-0fbcd183e18c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
