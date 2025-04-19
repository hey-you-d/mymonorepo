export type SimpleCartProductInfo = {
    sku: string,
    name: string,
    qty: number,
    price: number,
}

export type UpdateCheckoutListOperation = "increment" | "decrement";
type updateCheckoutList = (_product: SimpleCartProductInfo, _operation: UpdateCheckoutListOperation) => void; 

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

export type SimpleCartCheckoutPaneArgsType = {
    checkoutList: SimpleCartProductInfo[],
    updateCheckoutList: updateCheckoutList,
}
