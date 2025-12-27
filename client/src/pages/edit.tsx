import { toast } from 'sonner'
import { CreateProductForm } from "@/components/product-form";
import type { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditPage = () => {

  const navigate = useNavigate()
  const { id } = useParams()
  const [product, setProduct] = useState<Product>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      const res = await fetch(`http://localhost:4000/api/products/${id}`)
      const data = await res.json();
      setProduct(data.product)
      setLoading(false)
    }
    fetchProduct()
  }, [])

  if (loading) {
    return <div className="text-muted-foreground">Loading product...</div>
  }

  if (!product) {
    return <div>Product not found</div>
  }

  const editProduct = async (value: {
    name: string
    description?: string
    price?: number
    image?: File
  }) => {
    const formData = new FormData()

    formData.append("name", value.name)
    if (value.description) {
      formData.append("description", value.description)
    }

    formData.append("price", String(value.price))

    if (value.image) {
      formData.append("image", value.image)
    }

    try {
      const res = await fetch(
        `http://localhost:4000/api/products/${product.id}`,
        {
          method: "PUT",
          body: formData,
        }
      )

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to update product")
      }

      toast.success("Product updated successfully")
      navigate("/")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unknown error"
      )
    }
  }
  return (
    <main className="min-w-full min-h-screen mx-auto flex justify-center items-center">
      <CreateProductForm product={product} handleSubmit={editProduct} />
    </main>
  )

}

export default EditPage;
