# Nextshop

Nextshop is an inventory and transaction management application built with React, TypeScript, and Material UI. It utilizes Supabase for its backend database and authentication services.

## Features

- Inventory management
- Transaction tracking
- Image storage and management
- User authentication
- Material Design UI

## Getting Started

### Prerequisites

- Node.js (v18.18.0 or higher)
- npm (v8.0.0 or higher)
- A Supabase account and project

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Hazenbox/Nextshop.git
   cd Nextshop
   ```

2. Use the correct Node.js version:
   ```
   # If you have nvm installed
   nvm use
   ```

3. Install dependencies:
   ```
   npm install
   # If you encounter dependency issues, use:
   npm run reinstall
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the Supabase URL and anon key with your own values from your Supabase project

5. Start the development server:
   ```
   npm run dev
   ```

### Development Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production version
- `npm run lint` - Check for linting errors
- `npm run lint:fix` - Automatically fix linting errors
- `npm run format` - Format code with Prettier
- `npm run clean` - Remove node_modules and dist directories
- `npm run reinstall` - Clean and reinstall dependencies
- `npm run deploy` - Deploy to GitHub Pages

## Development Workflow

### GitHub Codespaces / Dev Containers

This project supports GitHub Codespaces and VS Code Dev Containers for consistent development environments:

1. In GitHub, click the "Code" button and select "Open with Codespaces"
2. In VS Code, install the Dev Containers extension, press F1 and select "Dev Containers: Open Folder in Container"

The container includes:
- Node.js 18.18.0
- npm
- Git LFS
- VS Code extensions for ESLint, Prettier, and GitHub integration

### CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

- Every push to the `main` branch triggers a build and test workflow
- If tests pass, the application is automatically deployed to GitHub Pages
- Pull requests are also built and tested before merging

### Development Mode

For local development without Supabase integration:

1. Set `DEV_MODE=true` in your `.env` file
2. This enables simulated authentication and database operations
3. You can work on UI and functionality without actual API calls

### Working with Branches

1. Create feature branches for new work:
   ```
   git checkout -b feature/your-feature-name
   ```

2. Keep your branch up to date:
   ```
   git pull origin main
   ```

3. Submit pull requests to the `develop` branch for review before merging to `main`

## Contribution Guidelines

### Code Style

- Follow the ESLint and Prettier configurations
- Run `npm run lint` and `npm run format` before committing
- Use TypeScript for type safety

### Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes and test locally
3. Ensure all CI checks pass
4. Submit a PR to merge into `develop`
5. Request review from maintainers

### Commit Messages

Follow the conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `chore:` for maintenance tasks
- `refactor:` for code refactoring
- `test:` for adding tests

## Supabase Setup

### Database Schema

Nextshop uses the following tables in Supabase:

1. **profiles** - User profile information
2. **categories** - Product categories
3. **inventory_items** - Inventory items or products
4. **item_media** - Images and videos for inventory items
5. **transactions** - Financial transactions (income/expense)
6. **transaction_items** - Links transactions to inventory items

### Setting Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL script located in `supabase/migrations/setup_tables.sql` in the SQL Editor of your Supabase project
3. Enable email authentication in Authentication → Settings
4. Create a storage bucket called 'inventory-images' (this is done automatically by the SQL script)
5. Update your `.env` file with your Supabase project URL and anon key

## Authentication Implementation

The Nextshop application has been successfully integrated with Supabase for authentication and user management. The implementation includes:

### Features Implemented

1. **Email Authentication**
   - Traditional email/password authentication
   - Magic link authentication (passwordless login)
   - Password recovery flow

2. **User Profile Management**
   - User profile creation during signup
   - Profile editing in the Settings page
   - Business information management

3. **Security**
   - Secure token-based authentication
   - Password reset capabilities
   - Protected routes with authentication guards

### Authentication Flow

Nextshop uses Supabase Auth for user authentication:

1. Users can sign up with email/password
2. Users can sign in with magic link email authentication (passwordless)
3. After signup, users are directed to complete their business profile
4. RLS (Row Level Security) policies ensure users can only access their own data

### Magic Link Authentication

Nextshop supports passwordless authentication through magic links:

1. User enters their email address
2. A one-time login link is sent to their email
3. User clicks the link and is automatically authenticated
4. The callback handler routes the user to the dashboard

To enable magic link authentication in your Supabase project:

1. Go to Authentication → Email Templates
2. Customize the "Magic Link" email template
3. Update your `.env` file with the `VITE_SITE_URL` variable pointing to your application URL
4. Ensure Email Auth is enabled in Authentication → Providers → Email

### Configuration

The authentication system uses the following environment variables:

```
# Supabase configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Site URL for magic link redirects
VITE_SITE_URL=http://localhost:5173
```

### Components Created

1. **Authentication Pages**
   - Login page with tabs for password and magic link authentication
   - Signup page with a two-step form for collecting user information
   - Forgot Password page for password recovery
   - Reset Password page for setting a new password
   - Auth Callback handler for processing authentication redirects

2. **User Management**
   - User Profile component in the Settings page
   - Profile editing interface for business information

### Next Steps

- Implement social authentication (Google, GitHub, etc.)
- Add multi-factor authentication
- Set up email verification flows
- Implement role-based access control

## Development

### Directory Structure

- `/src`

## Database Setup

Nextshop uses Supabase as its database backend. To set up your database:

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Navigate to the SQL Editor in your Supabase dashboard
3. Run the initial migration script:
   - Open and run the `/supabase/migrations/setup_tables.sql` file
   - This will create all necessary tables with proper Row Level Security (RLS) policies

### Database Schema

The application uses the following tables:

1. **profiles** - Store user profile information
   - Links to auth.users via user id
   - Stores business details, contact info, and preferences

2. **categories** - Product categories
   - Each user has their own set of categories
   - Used for organizing inventory items

3. **inventory_items** - Product inventory
   - Core table for tracking all inventory
   - Includes prices, quantities, and status

4. **item_media** - Images/media for products
   - Links to inventory_items
   - Stores URLs and storage paths

5. **transactions** - Financial transactions
   - Records sales, purchases, and other financial activities
   - Includes type, amount, date, and payment information

6. **transaction_items** - Links products to transactions
   - Records which items were part of each transaction
   - Tracks quantity and price per transaction

### Row Level Security

All tables are protected with Row Level Security policies ensuring:

- Users can only access their own data
- Authentication is required for all operations
- Proper authorization checks are implemented for all resources

## API Usage

The application primarily uses Supabase's JavaScript client to interact with the database. Here are some key API operations:

### Authentication API

```typescript
// Sign up with email/password
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password'
})

// Sign in with email/password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password'
})

// Sign in with magic link
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com'
})

// Sign out
const { error } = await supabase.auth.signOut()
```

### User Profile API

```typescript
// Create/update user profile
const { data, error } = await supabase
  .from('profiles')
  .upsert({
    id: user.id,
    business_name: 'My Business',
    phone: '123-456-7890',
    currency: 'USD'
  })

// Get user profile
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
```

### Inventory API

```typescript
// Create inventory item
const { data, error } = await supabase
  .from('inventory_items')
  .insert({
    name: 'Product Name',
    description: 'Product description',
    price: 19.99,
    cost_price: 9.99,
    quantity: 100,
    category: 'Electronics',
    status: 'available',
    user_id: user.id
  })

// Get inventory items
const { data, error } = await supabase
  .from('inventory_items')
  .select('*')
  .eq('user_id', user.id)
```

For more detailed API documentation, see the [API Reference](./docs/api-reference.md).

## Documentation

Detailed documentation is available to help you get started and make the most of Nextshop:

- [Getting Started Guide](./docs/getting-started.md) - Step-by-step instructions for installation and setup
- [API Reference](./docs/api-reference.md) - Complete API documentation for database interactions
- [Component Reference](./docs/components.md) - Overview of available UI components and their usage

## Troubleshooting

### Node.js Version Issues

If you encounter errors about Node.js version compatibility:
1. Install the required Node.js version (18.18.0 or higher)
2. Run `npm run reinstall` to clean and reinstall dependencies

### Build Errors

For Rollup or other build errors:
1. Try `npm run clean` to remove build artifacts
2. Run `npm run reinstall` to reinstall dependencies with legacy peer deps
3. Check for missing or conflicting packages in the error logs

### ESLint Errors

1. Run `npm run lint:fix` to automatically fix most linting issues
2. For persistent errors, check the ESLint configuration and rules

## License

This project is licensed under the MIT License - see the LICENSE file for details.