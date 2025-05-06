import { z } from 'zod';

export const CreatePaymentSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  method: z.enum(['pix', 'boleto', 'cartao']),
});

export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
