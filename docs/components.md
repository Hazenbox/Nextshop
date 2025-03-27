# Nextshop Component Reference

This document provides an overview of the key components used in the Nextshop application.

## Table of Contents

1. [Authentication Components](#authentication-components)
2. [Layout Components](#layout-components)
3. [Dashboard Components](#dashboard-components)
4. [Inventory Components](#inventory-components)
5. [Transaction Components](#transaction-components)
6. [User Profile Components](#user-profile-components)
7. [Common UI Components](#common-ui-components)

## Authentication Components

### `Login.tsx`

The Login component provides user authentication with two options: traditional email/password login and passwordless magic link login.

**Props:** None

**Key features:**
- Tab-based interface for different login methods
- Form validation with Zod
- Error handling and loading states
- Remember me functionality
- Links to signup and forgot password

### `MagicLinkLogin.tsx`

A specialized login component for passwordless authentication using email magic links.

**Props:** None

**Key features:**
- Simple email input with validation
- Clear instructions for users
- Loading state while sending the magic link
- Success notification after link is sent

### `Signup.tsx`

Multi-step signup form for new user registration.

**Props:** None

**Key features:**
- Two-step registration process
- Collects email, password, and business details
- Form validation with Zod
- Automatic profile creation upon signup

### `ForgotPassword.tsx`

Allows users to request a password reset link.

**Props:** None

**Key features:**
- Simple email input with validation
- Clear instructions for users
- Success notification after reset link is sent

### `ResetPassword.tsx`

Allows users to set a new password after clicking the reset link.

**Props:** None

**Key features:**
- Password and confirm password inputs
- Strong password requirements
- Validation feedback
- Success notification after password is updated

### `ProtectedRoute.tsx`

Higher-order component that protects routes requiring authentication.

**Props:**
- `children`: React node to render if authenticated

**Key features:**
- Checks authentication status
- Redirects to login if not authenticated
- Shows loading state during auth check

## Layout Components

### `AppLayout.tsx`

The main layout wrapper for the application.

**Props:**
- `children`: React node to render within the layout

**Key features:**
- Responsive sidebar navigation
- Top app bar with user menu
- Theme toggle
- Mobile-friendly design

### `Sidebar.tsx`

Navigation sidebar with links to main application areas.

**Props:**
- `expanded`: Boolean to control sidebar expansion state
- `onToggle`: Function to toggle sidebar state

**Key features:**
- Collapsible design
- Icon and text labels for navigation items
- Active route highlighting
- User section with quick profile access

### `AppBar.tsx`

Top application bar with title, search, and user controls.

**Props:**
- `title`: String for the current page title
- `onMenuClick`: Function to toggle sidebar on mobile

**Key features:**
- Responsive design
- Search input
- Notifications dropdown
- User menu with profile and logout options

## Dashboard Components

### `DashboardPage.tsx`

Main dashboard view showing key business metrics and recent activity.

**Props:** None

**Key features:**
- Overview cards with key metrics
- Recent transactions list
- Low stock alerts
- Sales charts

### `MetricCard.tsx`

Card component for displaying a single business metric.

**Props:**
- `title`: String for the metric name
- `value`: String/Number for the metric value
- `icon`: React node for the metric icon
- `change`: Number representing percentage change
- `changeType`: String ('increase' or 'decrease')

**Key features:**
- Visual indicator for positive/negative changes
- Icon support
- Responsive design

### `SalesChart.tsx`

Chart component for visualizing sales data.

**Props:**
- `data`: Array of sales data points
- `period`: String indicating time period (day, week, month, year)

**Key features:**
- Line chart visualization
- Period switching
- Tooltips with detailed information
- Responsive layout

## Inventory Components

### `InventoryPage.tsx`

Main inventory management page showing all inventory items.

**Props:** None

**Key features:**
- Tabular view of inventory items
- Filtering and sorting options
- Search functionality
- Add/edit/delete item actions

### `InventoryItemForm.tsx`

Form for creating or editing inventory items.

**Props:**
- `item`: Optional inventory item object for editing
- `onSubmit`: Function called on form submission
- `categories`: Array of available categories

**Key features:**
- Form fields for all item properties
- Image upload with previews
- Category selection
- Validation feedback

### `InventoryItemDetail.tsx`

Detailed view of a single inventory item.

**Props:**
- `itemId`: String/UUID of the item to display

**Key features:**
- Complete item information display
- Image gallery
- Edit and delete actions
- Transaction history related to the item

## Transaction Components

### `TransactionsPage.tsx`

Main transactions management page showing all financial transactions.

**Props:** None

**Key features:**
- Tabular view of transactions
- Filtering by type, date, amount
- Search functionality
- Add/view transaction actions

### `TransactionForm.tsx`

Form for creating or editing transactions.

**Props:**
- `transaction`: Optional transaction object for editing
- `onSubmit`: Function called on form submission

**Key features:**
- Transaction type selection
- Date and amount inputs
- Payment method selection
- Item selection with quantity and price
- Dynamic calculation of totals

### `TransactionDetail.tsx`

Detailed view of a single transaction.

**Props:**
- `transactionId`: String/UUID of the transaction to display

**Key features:**
- Complete transaction information
- List of items included in the transaction
- Print/export options
- Edit and delete actions

## User Profile Components

### `UserProfile.tsx`

Component for viewing and editing user profile information.

**Props:** None

**Key features:**
- Form for business details
- Contact information editing
- Currency preference selection
- Profile picture upload

### `SettingsPage.tsx`

Page containing various application settings and user preferences.

**Props:** None

**Key features:**
- Tabbed interface for different setting categories
- Profile management
- Notification preferences
- Security settings
- Application preferences

## Common UI Components

### `DataTable.tsx`

Reusable table component for displaying data with sorting and filtering.

**Props:**
- `data`: Array of data objects
- `columns`: Array of column definitions
- `onRowClick`: Optional function for row click handling
- `actions`: Optional array of action buttons per row

**Key features:**
- Pagination
- Sorting by columns
- Row selection
- Action buttons
- Mobile responsive design

### `SearchInput.tsx`

Reusable search input component.

**Props:**
- `value`: String for the current search value
- `onChange`: Function called when search value changes
- `placeholder`: Optional string for input placeholder

**Key features:**
- Debounced input
- Clear button
- Search icon
- Auto-focus option

### `FilterDropdown.tsx`

Dropdown component for data filtering.

**Props:**
- `options`: Array of filter options
- `value`: Current selected value
- `onChange`: Function called when selection changes
- `label`: String for the dropdown label

**Key features:**
- Multi-select capability
- Clear all option
- Searchable dropdown
- Custom rendering of selected items

### `ConfirmDialog.tsx`

Dialog component for confirming user actions.

**Props:**
- `open`: Boolean to control dialog visibility
- `title`: String for dialog title
- `message`: String for dialog message
- `onConfirm`: Function called when action is confirmed
- `onCancel`: Function called when action is canceled

**Key features:**
- Customizable buttons
- Optional destructive action styling
- Keyboard shortcuts (Escape to cancel, Enter to confirm)

### `Snackbar.tsx`

Component for displaying temporary notifications.

**Props:**
- `open`: Boolean to control snackbar visibility
- `message`: String for the notification message
- `severity`: String for the type of notification (info, success, warning, error)
- `onClose`: Function called when the snackbar is closed

**Key features:**
- Auto-dismiss timer
- Different styles for different severity levels
- Close button
- Action button option 