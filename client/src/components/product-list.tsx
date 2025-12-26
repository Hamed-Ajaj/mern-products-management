import type { Product } from "@/types/product";
import ProductCard from "./product-card";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowDownUp } from "lucide-react";

const ProductList = () => {

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<string>()
  const [search, setSearch] = useState<string>()
  useEffect(() => {

    const fetchProducts = async () => {
      setLoading(true)
      const res = await fetch("http://localhost:4000/api/products")
      const data = await res.json()
      setProducts(data.products)
      setLoading(false)
    }

    fetchProducts()

  }, [])

  if (loading) {
    return <div>loading</div>
  }

  return (

    <main className="container mx-auto py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />

        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="created_at">Newest</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
            title="Toggle sort order"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product}
            onDelete={(id) =>
              setProducts((prev) => prev.filter((p) => p.id !== id))
            }
          />
        ))}
      </div>
    </main>
  )
}

export default ProductList;
