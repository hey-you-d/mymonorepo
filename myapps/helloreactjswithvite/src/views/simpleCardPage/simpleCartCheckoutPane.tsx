import { ReactElement, useState } from "react";
import { SimpleCartProductInfo } from "../../types/SimpleCart";

type SimpleCartCheckoutPaneArgsType = {
    checkoutList: SimpleCartProductInfo[],
}

const renderedOutput = (children: ReactElement) => (
    <>
        <h3>---Cart---</h3>
        {children}    
    </>
)

export const SimpleCartCheckoutPane = ({checkoutList} :  SimpleCartCheckoutPaneArgsType) => {    
    const [cartList, setCartList] = useState<SimpleCartProductInfo[]>([]);
    
    //console.log("simpleCardCheckoutPane - checkoutList ", checkoutList);

    if (checkoutList.length <= 0) {
        renderedOutput(<p>Empty Cart</p>);
    } else {
        setCartList(checkoutList);
    }
    
    let renderedCart: ReactElement[] = [];
    if (cartList.length > 0) {
        cartList.forEach((product) => {
            renderedCart.push(
                <p key={`checkoutItem_${product.sku}`}>{`${product.name} - ${product.qty} - A$${product.qty * product.price}`}</p>
            );
        });
    } else {
        renderedCart.push(<p key="checkoutItem_empty">Empty Cart</p>);
    }

    return renderedOutput(<>{renderedCart}</>);
}
