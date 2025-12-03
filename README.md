# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/7797be73-2014-4e14-89d4-3cf0b1268174

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7797be73-2014-4e14-89d4-3cf0b1268174) and start prompting.

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

## Notes about new features added

- Reviews: a review system was added (star rating + text). See `src/hooks/useReviews.ts` and `src/components/ReviewSection.tsx`. Reviews are stored in the `reviews` table in Supabase; the hook updates product `rating` and `reviews` counts after mutations.
- Orders: an admin `Orders` management UI was added at `/kirtanuk/orders` (`src/pages/admin/AdminOrders.tsx`). Admins can create orders with multiple items and change order status.
- SMTP / Email: a placeholder client notifier `src/lib/notify.ts` was added which POSTs to `/api/notify-order`. Implement a serverless edge function (or backend route) that reads `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM_EMAIL` from environment and sends order status emails when called.

If you'd like, I can scaffold the edge function code (Node/TS) and add deployment instructions for your hosting provider.

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

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7797be73-2014-4e14-89d4-3cf0b1268174) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
