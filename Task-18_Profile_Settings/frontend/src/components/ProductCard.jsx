import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function getStockInfo(stock) {
  if (stock === 0)  return { label: 'Out of Stock', cls: 'out-stock' }
  if (stock < 5)    return { label: `Only ${stock} left!`, cls: 'low-stock' }
  return { label: 'In Stock', cls: 'in-stock' }
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const stock         = getStockInfo(product.stock)

  function handleAdd(e) {
    e.preventDefault()
    if (product.stock === 0) return
    addToCart(product, 1)
  }

  return (
    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
      <div className="product-card">
        <img
          className="product-card-img"
          src={product.image_url || 'https://picsum.photos/400/300'}
          alt={product.name}
          loading="lazy"
        />
        <div className="product-card-body">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="cat-pill">{product.category_name}</span>
            <span className={`stock-badge ${stock.cls}`}>{stock.label}</span>
          </div>
          <p className="product-card-name">{product.name}</p>
          <p className="product-card-price">₹{Number(product.price).toLocaleString('en-IN')}</p>
        </div>
        <div className="product-card-footer">
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleAdd}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}
