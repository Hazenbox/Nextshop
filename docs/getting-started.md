# Getting Started with Nextshop

This guide will help you get Nextshop up and running quickly. Follow these steps to set up your development environment, configure your database, and start using the application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Configuration](#environment-configuration)
4. [Supabase Setup](#supabase-setup)
5. [Running the Application](#running-the-application)
6. [First-Time Setup](#first-time-setup)
7. [Next Steps](#next-steps)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16.x or later)
- npm (v8.x or later) or yarn (v1.22.x or later)
- Git
- A Supabase account (free tier is sufficient)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/nextshop.git
cd nextshop
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

## Environment Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Open the `.env` file and update the following variables:

```
# Supabase configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application configuration
VITE_APP_NAME=Nextshop
VITE_APP_DESCRIPTION=Inventory and transaction management app
VITE_DEFAULT_CURRENCY=USD

# Storage configuration
VITE_STORAGE_BUCKET=inventory-images

# Site URL for magic link redirects
VITE_SITE_URL=http://localhost:5173
```

You'll get the Supabase URL and anon key from your Supabase project settings after setup.

## Supabase Setup

1. Create a new Supabase project:
   - Go to [supabase.com](https://supabase.com) and sign in
   - Click "New project"
   - Enter a name for your project
   - Set a secure database password
   - Choose a region close to your users
   - Click "Create new project"

2. Set up the database schema:
   - In your Supabase dashboard, go to the SQL Editor
   - Open the `/supabase/migrations/setup_tables.sql` file from your local repository
   - Copy the entire contents into the SQL Editor
   - Click "Run" to execute the SQL and create all necessary tables

3. Configure authentication:
   - Go to Authentication → Settings
   - Under "Site URL", enter your local development URL (e.g., `http://localhost:5173`)
   - Under "Email Templates", customize the invitation, confirmation, and magic link emails
   - Go to Authentication → Providers
   - Enable Email provider and set "Confirm email" to "No verification"
   - For production, you'll want to enable email verification

4. Create a storage bucket:
   - Go to Storage
   - Create a new bucket named "inventory-images"
   - Set the privacy to "Public"

5. Get your API credentials:
   - Go to Project Settings → API
   - Copy the URL and anon key
   - Paste them into your `.env` file

## Running the Application

1. Start the development server:

```bash
npm run dev
# or
yarn dev
```

2. Open your browser and navigate to `http://localhost:5173`

You should see the Nextshop login page.

## First-Time Setup

1. Create an account:
   - Click "Sign up" on the login page
   - Enter your email and a secure password
   - Complete the business profile setup

2. Explore the dashboard:
   - After signing in, you'll see the main dashboard
   - The sidebar navigation allows you to access different parts of the app
   - Start by adding some inventory categories and items

3. Set up your profile:
   - Click on your user avatar in the top-right corner
   - Select "Settings"
   - Update your business information and preferences

## Understanding the Application Structure

### Core Sections

1. **Dashboard** - Overview of your business metrics and recent activity
2. **Inventory** - Manage your products, categories, and stock levels
3. **Transactions** - Record sales, purchases, and other financial activities
4. **Reports** - View financial reports and export data
5. **Settings** - Configure your profile and application preferences

### Key Features

1. **Inventory Management**:
   - Create categories to organize items
   - Add inventory items with details and images
   - Track stock levels and pricing information
   - Set alerts for low stock

2. **Transaction Tracking**:
   - Record sales and purchases
   - Link transactions to inventory items
   - Track payment methods and references
   - View transaction history

3. **User Management**:
   - Secure authentication with email/password or magic links
   - User profile customization
   - Business information management

## Next Steps

After completing the initial setup, you might want to:

1. **Customize Your Categories**:
   - Create categories that match your business inventory
   - Use descriptive names for easy filtering

2. **Import Existing Inventory**:
   - Use the bulk import feature to add your existing inventory
   - Make sure to include accurate counts and pricing

3. **Set Up Recurring Reports**:
   - Configure weekly or monthly reports
   - Set up email notifications for important events

4. **Explore the API**:
   - Check out the [API Reference](./api-reference.md) to understand how to interact with the backend
   - Learn how to integrate with other systems

5. **Learn About Components**:
   - See the [Component Reference](./components.md) to understand the building blocks of the application
   - Useful for developers who want to extend the application

## Troubleshooting

### Common Issues

1. **Database Connection Problems**:
   - Check that your Supabase URL and anon key are correct in the `.env` file
   - Ensure your IP is not blocked by Supabase

2. **Authentication Issues**:
   - Verify that Site URL is correctly set in Supabase Authentication settings
   - Check if the email provider is enabled

3. **Storage Problems**:
   - Confirm the storage bucket exists and is public
   - Check that RLS policies are correctly set up

### Getting Help

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/your-username/nextshop/issues) for similar problems and solutions
2. Join our [Discord community](https://discord.gg/nextshop) for real-time help
3. Contact support at support@nextshop.com

## Contributing

We welcome contributions to Nextshop! Please see our [Contributing Guide](./CONTRIBUTING.md) for more information on how to get involved. 