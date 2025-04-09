import { ReactElement, useEffect } from "react";
import { SimpleCartInventoryCard } from "../../components/SimpleCartInventoryCard";
import { SimpleCartProductInfo } from "../../types/SimpleCart";

type SimpleCartInventoryPaneArgs = {
    currentInventory: SimpleCartProductInfo[],
    loading: boolean,
    checkoutList: SimpleCartProductInfo[],
    updateCheckoutList: (product: SimpleCartProductInfo) => void,
}

const renderedOutput = (children: ReactElement) => (
  <>
    <h3>---Stocks---</h3>
    {children}
  </>
);

export const SimpleCartInventoryPane = ({ currentInventory, loading, checkoutList, updateCheckoutList }: SimpleCartInventoryPaneArgs) => {
  if (loading) return renderedOutput(<p>Loading...</p>);  
  
  useEffect(() => {
    console.log("SimpleCartInventoryPane checkoutList - ", checkoutList);
  });

  let productCards: ReactElement[] = [];
  currentInventory.forEach((product) => {
    productCards.push(
      SimpleCartInventoryCard({product, updateCheckoutList})
    );
  })

  return renderedOutput(<>{productCards}</>);
};
