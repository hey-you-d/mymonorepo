import { useState, useEffect } from 'react';
import { useSimpleCartViewModel } from "../../viewModels/useSimpleCartViewModel";
import { SimpleCartInventoryPane } from './simpleCartInventoryPane';
import { SimpleCartProductInfo } from "../../types/SimpleCart";
import { UpdateCheckoutListOperation } from '../../types/SimpleCart';

export const SimpleCartPage = () => {
  const { inventory, loading } = useSimpleCartViewModel();

  const [currentInventory, setCurrentInventory] = useState<SimpleCartProductInfo[]>(inventory);
  const [checkoutList, setCheckoutList] = useState<SimpleCartProductInfo[]>([]);
  
  useEffect(() => {
    setCurrentInventory(inventory);
  }, [inventory, setCurrentInventory]);
  
  const updateCheckoutList = (product: SimpleCartProductInfo, operation: UpdateCheckoutListOperation) => {
    let toBeUpdatedCheckoutList: SimpleCartProductInfo[] = checkoutList;
    let toBeUpdatedCurrentInventory: SimpleCartProductInfo[] = currentInventory;  

    const found = checkoutList.findIndex(aProduct => aProduct.sku === product.sku);
    const foundInInventory = inventory.findIndex(aProduct => aProduct.sku === product.sku);
    if(found >= 0) {
      switch(operation) {
        case "increment" :
          if (toBeUpdatedCheckoutList[found].qty + 1 <= inventory[foundInInventory].qty) {
            toBeUpdatedCheckoutList[found].qty += 1;
            toBeUpdatedCurrentInventory[found].qty -= 1;  
          }  
          break;
        case "decrement" :
          if (toBeUpdatedCheckoutList[found].qty - 1 >= 0) {
            toBeUpdatedCheckoutList[found].qty -= 1;
            toBeUpdatedCurrentInventory[found].qty += 1;
          }  
          break;  
      }
    } else {
      toBeUpdatedCheckoutList.push({ 
        sku: product.sku, 
        name: product.name, 
        price: product.price, 
        qty: 1, 
      });
    }
    //console.log(toBeUpdatedCheckoutList);
    setCheckoutList(toBeUpdatedCheckoutList);
    setCurrentInventory(toBeUpdatedCurrentInventory);
  }

  return ( 
    <>
      <SimpleCartInventoryPane currentInventory={currentInventory} loading={loading} checkoutList={checkoutList} updateCheckoutList={updateCheckoutList}  />
    </>
  );
};
