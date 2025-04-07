import { ReactElement, Dispatch, SetStateAction } from "react";
import { SimpleCartInventoryCard } from "../../components/SimpleCartInventoryCard";
import { SimpleCartProductInfo } from "../../types/SimpleCart";

type SimpleCartInventoryPaneArgs = {
    currentInventory: SimpleCartProductInfo[],
    loading: boolean,
    setSelectedProduct: Dispatch<SetStateAction<SimpleCartProductInfo>>,
}

export const SimpleCartInventoryPane = ({ currentInventory, loading, setSelectedProduct }: SimpleCartInventoryPaneArgs) => {
    if (loading) return <p>Loading...</p>;
  
    let productCards: ReactElement[] = [];
    currentInventory.forEach((product) => {
      productCards.push(
        SimpleCartInventoryCard({product, setSelectedProduct})
      );
    })

    return productCards;
};
