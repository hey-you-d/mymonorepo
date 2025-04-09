import { useState } from 'react';
import { useSimpleCartViewModel } from "../../viewModels/useSimpleCartViewModel";
import { SimpleCartInventoryPane } from './simpleCartInventoryPane';
import { SimpleCartProductInfo } from "../../types/SimpleCart"

export const SimpleCartPage = () => {
  const { inventory, loading } = useSimpleCartViewModel();

  const [checkoutList, setCheckoutList] = useState<SimpleCartProductInfo[]>([]);

  const updateCheckoutList = (product: SimpleCartProductInfo) => {
    let toBeUpdatedCheckoutList: SimpleCartProductInfo[] = checkoutList;
      const found = checkoutList.findIndex(aProduct => aProduct.sku === product.sku);

      if(found >= 0) {
        toBeUpdatedCheckoutList[found].qty += 1;
      } else {
        toBeUpdatedCheckoutList.push({ 
          sku: product.sku, 
          name: product.name, 
          price: product.price, 
          qty: 1, 
        });
      }
      
      setCheckoutList(toBeUpdatedCheckoutList);
  }

  return ( 
    <>
      <SimpleCartInventoryPane currentInventory={inventory} loading={loading} checkoutList={checkoutList} updateCheckoutList={updateCheckoutList}  />
    </>
  );
};
