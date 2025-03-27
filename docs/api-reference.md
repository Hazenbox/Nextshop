# Nextshop API Reference

This document provides detailed information about the available API endpoints in the Nextshop application.

## Table of Contents

1. [Authentication](#authentication)
2. [User Profiles](#user-profiles)
3. [Categories](#categories)
4. [Inventory Items](#inventory-items)
5. [Media](#media)
6. [Transactions](#transactions)
7. [Error Handling](#error-handling)

## Authentication

Nextshop uses Supabase Auth for authentication. All API requests requiring authentication should include the user's JWT token in the Authorization header.

### Sign Up

Register a new user account.

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password'
})
```

**Response**

```json
{
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "created_at": "2023-01-01T00:00:00.000Z"
    },
    "session": {
      "access_token": "jwt-token",
      "refresh_token": "refresh-token",
      "expires_at": 1672531200
    }
  },
  "error": null
}
```

### Sign In with Password

Sign in with email and password.

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password'
})
```

**Response**

```json
{
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "created_at": "2023-01-01T00:00:00.000Z"
    },
    "session": {
      "access_token": "jwt-token",
      "refresh_token": "refresh-token",
      "expires_at": 1672531200
    }
  },
  "error": null
}
```

### Sign In with Magic Link

Send a passwordless login link to the user's email.

```typescript
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com'
})
```

**Response**

```json
{
  "data": {
    "message": "Magic link email sent"
  },
  "error": null
}
```

### Sign Out

Log out the current user.

```typescript
const { error } = await supabase.auth.signOut()
```

### Reset Password

Send a password reset email.

```typescript
const { data, error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com'
)
```

**Response**

```json
{
  "data": {
    "message": "Password reset email sent"
  },
  "error": null
}
```

### Update Password

Update the user's password. Can be used after password reset.

```typescript
const { data, error } = await supabase.auth.updateUser({
  password: 'new-secure-password'
})
```

## User Profiles

Manage user profile information.

### Create or Update Profile

Create a new profile or update an existing one.

```typescript
const { data, error } = await supabase
  .from('profiles')
  .upsert({
    id: user.id,
    email: user.email,
    business_name: 'My Business',
    phone: '123-456-7890',
    address: '123 Main St, City, State',
    currency: 'USD'
  })
```

### Get Profile

Get the current user's profile.

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
```

## Categories

Manage product categories.

### Create Category

Create a new category.

```typescript
const { data, error } = await supabase
  .from('categories')
  .insert({
    name: 'Electronics',
    user_id: user.id
  })
```

### List Categories

Get all categories for the current user.

```typescript
const { data, error } = await supabase
  .from('categories')
  .select('*')
  .eq('user_id', user.id)
  .order('name', { ascending: true })
```

### Update Category

Update an existing category.

```typescript
const { data, error } = await supabase
  .from('categories')
  .update({ name: 'Updated Category' })
  .eq('id', categoryId)
```

### Delete Category

Delete a category.

```typescript
const { error } = await supabase
  .from('categories')
  .delete()
  .eq('id', categoryId)
```

## Inventory Items

Manage inventory items.

### Create Item

Add a new inventory item.

```typescript
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
```

### List Items

Get all inventory items for the current user.

```typescript
const { data, error } = await supabase
  .from('inventory_items')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
```

### Filter Items

Filter inventory items by category, status, or other criteria.

```typescript
const { data, error } = await supabase
  .from('inventory_items')
  .select('*')
  .eq('user_id', user.id)
  .eq('category', 'Electronics')
  .eq('status', 'available')
  .gt('quantity', 0)
```

### Get Item Details

Get detailed information about a specific item.

```typescript
const { data, error } = await supabase
  .from('inventory_items')
  .select(`
    *,
    item_media:item_to_media(
      media:media_id(*)
    )
  `)
  .eq('id', itemId)
  .single()
```

### Update Item

Update an existing inventory item.

```typescript
const { data, error } = await supabase
  .from('inventory_items')
  .update({
    name: 'Updated Product Name',
    price: 24.99,
    quantity: 75
  })
  .eq('id', itemId)
```

### Delete Item

Delete an inventory item.

```typescript
const { error } = await supabase
  .from('inventory_items')
  .delete()
  .eq('id', itemId)
```

## Media

Manage media files for inventory items.

### Upload Media

Upload media files to Supabase Storage.

```typescript
const { data, error } = await supabase
  .storage
  .from('inventory-images')
  .upload(`${user.id}/${itemId}/${fileName}`, file)
```

### Create Media Record

Create a database record for the uploaded media.

```typescript
const { data, error } = await supabase
  .from('item_media')
  .insert({
    item_id: itemId,
    type: 'image',
    url: mediaUrl,
    storage_path: storagePath
  })
```

### Link Media to Item

Link the media to an inventory item using the join table.

```typescript
const { data, error } = await supabase
  .from('item_to_media')
  .insert({
    item_id: itemId,
    media_id: mediaId
  })
```

### Get Item Media

Get all media associated with an item.

```typescript
const { data, error } = await supabase
  .from('item_media')
  .select('*')
  .eq('item_id', itemId)
```

### Delete Media

Delete media from storage and the database.

```typescript
// Delete from storage
const { error: storageError } = await supabase
  .storage
  .from('inventory-images')
  .remove([storagePath])

// Delete from database
const { error: dbError } = await supabase
  .from('item_media')
  .delete()
  .eq('id', mediaId)
```

## Transactions

Manage financial transactions.

### Create Transaction

Create a new transaction.

```typescript
const { data, error } = await supabase
  .from('transactions')
  .insert({
    type: 'income',
    amount: 99.95,
    date: new Date(),
    payment_mode: 'credit_card',
    reference: 'INV-001',
    notes: 'Sale of electronics',
    user_id: user.id
  })
```

### Add Transaction Items

Add items to a transaction.

```typescript
const { data, error } = await supabase
  .from('transaction_items')
  .insert({
    transaction_id: transactionId,
    item_id: itemId,
    quantity: 1,
    price: 19.99
  })
```

### List Transactions

Get all transactions for the current user.

```typescript
const { data, error } = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', user.id)
  .order('date', { ascending: false })
```

### Get Transaction Details

Get detailed information about a transaction including its items.

```typescript
const { data, error } = await supabase
  .from('transactions')
  .select(`
    *,
    transaction_items:transaction_items(
      *,
      item:item_id(
        id, name, description
      )
    )
  `)
  .eq('id', transactionId)
  .single()
```

### Update Transaction

Update an existing transaction.

```typescript
const { data, error } = await supabase
  .from('transactions')
  .update({
    amount: 129.95,
    payment_mode: 'cash',
    notes: 'Updated notes'
  })
  .eq('id', transactionId)
```

### Delete Transaction

Delete a transaction and its associated items.

```typescript
const { error } = await supabase
  .from('transactions')
  .delete()
  .eq('id', transactionId)
```

## Error Handling

All API responses include an `error` field that will be `null` if the request was successful, or contain error details if not.

### Error Structure

```json
{
  "data": null,
  "error": {
    "message": "Error message",
    "code": "error_code"
  }
}
```

### Common Error Codes

- `auth/invalid-email`: Invalid email format
- `auth/invalid-credentials`: Incorrect password
- `auth/user-not-found`: User doesn't exist
- `permission-error`: User doesn't have permission to perform the action
- `database-error`: Database query error
- `storage-error`: Error uploading or accessing files 