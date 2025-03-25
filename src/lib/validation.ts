import { z } from 'zod';

export const itemSchema = z.object({
  id: z.string().optional(),
  board_id: z.string(),
  product_id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  image_ids: z.array(z.string()),
  category: z.string().optional(),
  label: z.string().optional(),
  sale_status: z.enum(['available', 'pending', 'sold']),
  purchase_price: z.number().min(0),
  listed_price: z.number().min(0),
  sold_at: z.number().min(0).optional(),
  delivery_charges: z.number().min(0),
  sale_type: z.enum(['online', 'offline']),
  paid_to: z.string().optional(),
  customer_name: z.string().optional(),
  customer_email: z.string().email().optional(),
  customer_phone: z.string().optional(),
  customer_address: z.string().optional(),
});

export type ItemInput = z.infer<typeof itemSchema>;

export function validateItem(data: unknown): ItemInput {
  return itemSchema.parse(data);
}