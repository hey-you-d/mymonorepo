import { useState, useEffect } from 'react';
import { useSimpleCartViewModel } from "../../viewModels/useSimpleCartViewModel";
import { SimpleCartInventoryPane } from './simpleCartInventoryPane';
import { SimpleCartCheckoutPane } from './simpleCartCheckoutPane';
import { SimpleCartProductInfo } from "../../types/SimpleCart"

export const SimpleCartPage = () => {
  const { inventory, loading } = useSimpleCartViewModel();

  const [checkoutList, setCheckoutList] = useState<SimpleCartProductInfo[]>([]);

  useEffect(() => {
    console.log("simpleCartPage - checkoutList ", checkoutList);
    
    console.log("parent mounted");
    return () => console.log("parent unmounted");
  });

  const updateCheckoutList = (product: SimpleCartProductInfo) => {
    let toBeUpdatedCheckoutList: SimpleCartProductInfo[] = checkoutList;
      const found = checkoutList.findIndex(aProduct => aProduct.sku === product.sku);

      if(found >= 0) {
        toBeUpdatedCheckoutList[found].qty += 1;
        //console.log("found ", toBeUpdatedCheckoutList);
      } else {
        const newCheckoutItem = { 
          sku: product.sku, 
          name: product.name, 
          price: product.price, 
          qty: 1, 
        };
        toBeUpdatedCheckoutList.push(newCheckoutItem);
        //console.log("not found ", toBeUpdatedCheckoutList);
      }
      
      setCheckoutList(toBeUpdatedCheckoutList);
  }

  return ( 
    <>
      <SimpleCartInventoryPane currentInventory={inventory} loading={loading} checkoutList={checkoutList} updateCheckoutList={updateCheckoutList}  />
      <SimpleCartCheckoutPane checkoutList={checkoutList} />
    </>
  );
};
