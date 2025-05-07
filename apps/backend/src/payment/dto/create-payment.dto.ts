import { z } from 'zod';

export const CreatePaymentSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  method: z.enum(['cartao', 'pix', 'boleto']),
  cardNumber: z.string().optional(),
  cvv: z.string().optional(),
  expiry: z.string().optional(),
});

export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
