import { ReactElement } from "react";
import { SimpleCartProductInfo } from "../../types/SimpleCart";

type SimpleCartCheckoutPaneArgsType = {
    addedToCartProducts: SimpleCartProductInfo[]
}

export const SimpleCartCheckoutPane = ({addedToCartProducts} :  SimpleCartCheckoutPaneArgsType) => {
    if (addedToCartProducts.length <= 0) (<p>Empty Cart</p>);

    let cart: ReactElement[] = [];
    
    addedToCartProducts.forEach((product) => {
        cart.push(
            <p>{`${product.name} - ${product.qty} - A$${product.qty * product.price}`}</p>
        );
    })

    return cart;
}
    