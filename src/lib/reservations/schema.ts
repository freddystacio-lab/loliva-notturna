import {z} from "zod";

export const reservationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  phone: z.string().trim().min(8).max(30),
  people: z.coerce.number().int().min(1).max(30),
  date: z.iso.date(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  locale: z.enum(["es", "en", "it"]),
  notes: z.string().trim().max(1000).optional(),
  privacyAccepted: z.literal(true),
});
