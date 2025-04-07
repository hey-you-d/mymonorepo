import { MouseEvent } from 'react';
import { Dispatch, SetStateAction, useState } from 'react';
import { SimpleCartProductInfo } from '../types/SimpleCart';

type SimpleCartInventoryCardType = {
    product: SimpleCartProductInfo,
    setSelectedProduct: Dispatch<SetStateAction<SimpleCartProductInfo>>,
}

export const SimpleCartInventoryCard = ({ product, setSelectedProduct } : SimpleCartInventoryCardType) => {
    const [quantity, setQuantity] = useState<number>(product.qty);    
    
    const addToCartButtonHandler = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if(quantity > 0) {
          setQuantity(quantity - 1);
          setSelectedProduct(product);
        }
    }
  
    return product ? (
    <div key={product.sku}>
        <p><sub>{`[SKU: ${product.sku}] `}</sub><strong>{product.name}</strong></p>
        <p>{`A$${product.price} each - QTY: ${quantity > 0 ? quantity : "out of stock"}`}</p>
        {quantity > 0 ? <button onClick={addToCartButtonHandler}>Add to Cart</button> : <p>Out of Stock</p>}
        
    </div>
  ) : (
    <p>Oops, unrecognised product</p>
  )
};