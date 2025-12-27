import z from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().positive("Price must be positive"),
  description: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(3),

  description: z
    .string()
    .min(20)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),

  price: z.coerce.number().positive(),
})

export const querySchema = z.object({
  search: z
    .string()
    .trim()
    .min(1)
    .optional(),

  sort: z
    .enum(["price", "newest"])
    .optional()
    .default("newest"),

  order: z
    .enum(["asc", "desc"])
    .optional()
    .default("desc"),
})
