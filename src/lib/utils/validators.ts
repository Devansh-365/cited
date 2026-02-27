import { z } from 'zod';
import { CATEGORIES } from './constants';

const categoryIds = CATEGORIES.map(c => c.id) as [string, ...string[]];

export const auditRequestSchema = z.object({
  brandName: z.string().min(1, 'Brand name is required').max(100, 'Brand name too long').trim(),
  websiteUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  category: z.enum(categoryIds as [string, ...string[]], {
    message: 'Please select a category',
  }),
  competitors: z.array(z.string().trim()).max(5, 'Maximum 5 competitors').optional(),
});

export const emailCaptureSchema = z.object({
  email: z.string().email('Please enter a valid email address').trim().toLowerCase(),
  auditId: z.string().uuid('Invalid audit ID'),
  brandName: z.string().optional(),
});

export type AuditRequestInput = z.infer<typeof auditRequestSchema>;
export type EmailCaptureInput = z.infer<typeof emailCaptureSchema>;
