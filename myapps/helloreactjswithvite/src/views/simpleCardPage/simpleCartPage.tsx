import { useState } from 'react';
import { useSimpleCartViewModel } from "../../viewModels/useSimpleCartViewModel";
import { SimpleCartInventoryPane } from './simpleCartInventoryPane';
import { SimpleCartProductInfo } from "../../types/SimpleCart";
import { UpdateCheckoutListOperation } from '../../types/SimpleCart';

export const SimpleCartPage = () => {
  const { inventory, loading } = useSimpleCartViewModel();

  const [checkoutList, setCheckoutList] = useState<SimpleCartProductInfo[]>([]);

  const updateCheckoutList = (product: SimpleCartProductInfo, operation: UpdateCheckoutListOperation) => {
    let toBeUpdatedCheckoutList: SimpleCartProductInfo[] = checkoutList;
      const found = checkoutList.findIndex(aProduct => aProduct.sku === product.sku);

      if(found >= 0) {
        if (operation === "increment") {
          toBeUpdatedCheckoutList[found].qty += 1;
        } else if(operation === "decrement") {
          toBeUpdatedCheckoutList[found].qty -= 1;
        }
      } else {
        toBeUpdatedCheckoutList.push({ 
          sku: product.sku, 
          name: product.name, 
          price: product.price, 
          qty: 1, 
        });
      }
      console.log(toBeUpdatedCheckoutList);
      setCheckoutList(toBeUpdatedCheckoutList);
  }

  return ( 
    <>
      <SimpleCartInventoryPane currentInventory={inventory} loading={loading} checkoutList={checkoutList} updateCheckoutList={updateCheckoutList}  />
    </>
  );
};
