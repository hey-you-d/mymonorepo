import { MouseEvent, useState } from 'react';
import { SimpleCartProductInfo } from '../types/SimpleCart';

type SimpleCartInventoryCardType = {
    product: SimpleCartProductInfo,
    updateCheckoutList: (product: SimpleCartProductInfo) => void,
}

export const SimpleCartInventoryCard = ({ product, updateCheckoutList } : SimpleCartInventoryCardType) => {
    const [quantity, setQuantity] = useState<number>(product.qty);    

    const addToCartButtonHandler = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if(quantity > 0) {
          setQuantity(quantity - 1);
          updateCheckoutList(product);
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