export type SimpleCartProductInfo = {
    sku: string,
    name: string,
    qty: number,
    price: number,
}

//type updateCheckoutList = (product: SimpleCartProductInfo) => void; 
type updateCheckoutList = () => void;

export type SimpleCartInventoryCardType = {
    product: SimpleCartProductInfo,
    updateCheckoutList: updateCheckoutList,
}

export type SimpleCartInventoryPaneArgs = {
    currentInventory: SimpleCartProductInfo[],
    loading: boolean,
    checkoutList: SimpleCartProductInfo[],
    updateCheckoutList: updateCheckoutList,
}
