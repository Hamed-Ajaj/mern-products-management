import express from "express";
import cors from "cors"
import { createProductSchema, updateProductSchema } from "./schemas/products.schema";
import validate from 'express-zod-safe';
import { db } from "./db";
import { StatusCodes } from "http-status-codes";
import { Product } from "./types/product";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import z from "zod";
export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/products', async (req, res) => {

  try {
    const sql = 'SELECT * FROM products ORDER BY created_at DESC';
    const [rows] = await db.query<(Product & RowDataPacket)[]>(sql);
    res.status(StatusCodes.OK).json({ products: rows, success: true })
  }
  catch (error) {
    console.error("Error fetching products:", error)

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch products",
      success: false
    })
  }

})

app.get('/api/products/:id', validate({
  params: z.object({
    id: z.coerce.number()
  })
}), async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'SELECT * FROM products WHERE id = ?';
    const [rows] = await db.query<(Product & RowDataPacket)[]>(sql, [id]);

    if (rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Product not found",
        success: false,
      })
    }
    res.json({ product: rows[0], success: true })
  }
  catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch product",
      success: false
    })
  }
})

app.post('/api/products', validate({ body: createProductSchema }), async (req, res) => {
  const { name, description, price, image_url } = req.body;
  try {
    const sql = 'INSERT INTO products (name, description, price, image_url) VALUES (?, ?, ?, ?)';
    const result = await db.query(sql, [name, description, price, image_url]);
    res.status(StatusCodes.CREATED).json({ message: "product created succesfully", success: true })
  }
  catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to create product",
      success: false
    })
  }
});

app.put(
  "/api/products/:id",
  validate({
    body: updateProductSchema,
    params: z.object({ id: z.coerce.number() }),
  }),
  async (req, res) => {
    try {
      const { name, description, price, image_url } = req.body
      const { id } = req.params

      const sql =
        "UPDATE products SET name = ?, description = ?, price = ?, image_url = ? WHERE id = ?"

      const [result] = await db.query<ResultSetHeader>(sql, [
        name,
        description,
        price,
        image_url,
        id,
      ])

      if (result.affectedRows === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "Product not found",
          success: false,
        })
      }

      return res.sendStatus(StatusCodes.NO_CONTENT)
    } catch (error) {
      console.error("Update product error:", error)

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Failed to update product",
        success: false,
      })
    }
  }
)

app.delete('/api/products/:id', validate({ params: z.object({ id: z.coerce.number() }) }), async (req, res) => {
  const { id } = req.params
  try {
    const sql = 'DELETE FROM products WHERE id = ?';
    const [result] = await db.query<ResultSetHeader>(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Product not found",
        success: false,
      })
    }

    res.status(StatusCodes.OK).json({ message: "product deleted", success: true })
  }
  catch {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to Delete product",
      success: false
    })
  }
})
