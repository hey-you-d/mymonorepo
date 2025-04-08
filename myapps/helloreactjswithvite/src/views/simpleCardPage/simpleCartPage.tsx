import { useState } from 'react';
import { useSimpleCartViewModel } from "../../viewModels/useSimpleCartViewModel";
import { SimpleCartInventoryPane } from './simpleCartInventoryPane';
import { SimpleCartCheckoutPane } from './simpleCartCheckoutPane';
import { SimpleCartProductInfo } from "../../types/SimpleCart"

export const SimpleCartPage = () => {
  const { inventory, loading } = useSimpleCartViewModel();

  const [selectedProduct, setSelectedProduct] = useState<SimpleCartProductInfo>({ sku: "", name: "", qty: 0, price: 0 });
  const [addedToCardProducts, setAddedToCartProducts] = useState<SimpleCartProductInfo[]>([]);

  let currentInventory: SimpleCartProductInfo[] = inventory;
  if (!loading && selectedProduct.sku.length > 0) {
    console.log(selectedProduct);
    // TODO : work on the logic -find if elem exist in addedToCardProducts. If yes, increment the qty
    // if not, just push into the array. 
    addedToCardProducts.push(selectedProduct);
  }

  return ( 
    <>
      <SimpleCartInventoryPane currentInventory={currentInventory} loading={loading} setSelectedProduct={setSelectedProduct}  />
      <SimpleCartCheckoutPane addedToCartProducts={addedToCardProducts} setAddedToCartProducts={setAddedToCartProducts} />
    </>
  );
};
