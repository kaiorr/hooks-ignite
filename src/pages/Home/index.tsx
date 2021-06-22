import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    const newSumAmount = {...sumAmount};
    newSumAmount[product.id]= product.amount;

    return newSumAmount;
  }, {} as CartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      const response = await api.get<Product[]>('products')

      const data = response.data.map((item) => ({
        ...item,
        priceFormatted: formatPrice(item.price)
      }))
      setProducts(data);
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    addProduct(id)
  }

  return (
    <ProductList>
      {products.map((item) =>
          <li key={item.id}>
          <img src="https://rocketseat-cdn.s3-sa-east-1.amazonaws.com/modulo-redux/tenis1.jpg" alt="Tênis de Caminhada LevConfortável" />
          <strong> {item.title} </strong>
          <span> {item.priceFormatted} </span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProduct(item.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[item.id] || 0}
            </div>
            <span>ADICIONAR AO CARRINHO</span>
          </button>
          </li>
      )}
    </ProductList>
  );
};

export default Home;
