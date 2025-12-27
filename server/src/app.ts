import express from "express";
import cors from "cors"
import multer from "multer"
import { createProductSchema, querySchema, updateProductSchema } from "./schemas/products.schema";
import validate from 'express-zod-safe';
import { db } from "./db";
import { StatusCodes } from "http-status-codes";
import { Product } from "./types/product";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import z from "zod";
export const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static("uploads"))

const upload = multer({
  dest: "uploads/",
})

app.get('/api/products', validate({ query: querySchema }), async (req, res) => {

  const { search, order, sort } = req.query;

  try {
    let sql = "SELECT * FROM products"
    const params: any[] = []

    if (search) {
      sql += " WHERE name LIKE ? OR description LIKE ?"
      params.push(`%${search}%`, `%${search}%`)
    }

    if (sort === "price") {
      sql += ` ORDER BY price ${order}`
    } else {
      sql += ` ORDER BY created_at ${order}`
    }

    const [rows] = await db.query<(Product & RowDataPacket)[]>(
      sql,
      params
    )

    res.status(StatusCodes.OK).json({
      products: rows,
      success: true,
    })
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

app.post('/api/products',
  upload.single("image"),
  validate({ body: createProductSchema }), async (req, res) => {

    const { name, description, price } = req.body;

    if (req.file && !req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Invalid file type" })
    }

    let image_url: string | null = null
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`
    }

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
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description, price } = req.body
      const { id } = req.params

      if (req.file && !req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Invalid file type" })
      }

      const [rows] = await db.query<any[]>(
        "SELECT image_url FROM products WHERE id = ?",
        [id]
      )

      if (rows.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "Product not found",
          success: false,
        })
      }

      // by default it's the old image, if the use change it it will be updated
      let image_url = rows[0].image_url

      if (req.file) {
        image_url = `/uploads/${req.file.filename}`
      }

      const [result] = await db.query<ResultSetHeader>(
        `
        UPDATE products
        SET name = ?, description = ?, price = ?, image_url = ?
        WHERE id = ?
        `,
        [name, description, price, image_url, id]
      )

      return res.sendStatus(StatusCodes.NO_CONTENT)
    } catch (error) {
      console.error("Update product error:", error)

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error,
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
