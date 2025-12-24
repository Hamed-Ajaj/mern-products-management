import z from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be positive"),
  description: z.string().optional(),
  image_url: z.string().optional()
});

export const updateProductSchema = createProductSchema.partial().refine(data => Object.keys(data).length > 0, {
  message: "At least one field is required",
})
