import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const existingProduct = cart.find(product => product?.id === productId)
      if (existingProduct) {
        const stock = await api.get(`stock/${productId}`)
        const stockAmount = stock.data.amount

        if (stockAmount <= existingProduct.amount) {
          toast.error('Quantidade solicitada fora de estoque')
          return
        }

        const newCart = cart.map(product => {
          if (product.id === productId) {
            product.amount += 1
          }
          return product
        })

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
        return setCart(newCart)
      }

      const response = await api.get(`products/${productId}`)
      const newProduct = {...response.data, amount: 1}
      const newCart = [...cart, newProduct]

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      return setCart(newCart)
    } catch {
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      if (cart.every(product => product.id !== productId)) throw new Error()

      const newCart = cart.filter(product => product.id !== productId)

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      return setCart(newCart)
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) return

      const stock = await api.get(`stock/${productId}`)
      const stockAmount = stock.data.amount

      if (stockAmount < amount) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      const newCart = cart.map(product => {
        if (product.id === productId) {
          product.amount = amount
        }
        return product
      })

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      return setCart(newCart)
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
