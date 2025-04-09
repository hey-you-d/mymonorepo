import { ReactElement } from "react";
import { SimpleCartInventoryCard } from "../../components/SimpleCartInventoryCard";
import { SimpleCartCheckoutPane } from "./simpleCartCheckoutPane";
import { SimpleCartInventoryPaneArgs } from "../../types/SimpleCart";

const renderedOutput = (children: ReactElement) => (
  <>
    <h3>---Stocks---</h3>
    {children}
  </>
);

export const SimpleCartInventoryPane = ({ currentInventory, loading, checkoutList, updateCheckoutList }: SimpleCartInventoryPaneArgs) => {
  if (loading) return renderedOutput(<p>Loading...</p>);  
  
  let productCards: ReactElement[] = [];
  currentInventory.forEach((product) => {
    productCards.push(
      SimpleCartInventoryCard({product, updateCheckoutList})
    );
  })

  return renderedOutput(<>{productCards}<SimpleCartCheckoutPane checkoutList={checkoutList}/></>);
};
