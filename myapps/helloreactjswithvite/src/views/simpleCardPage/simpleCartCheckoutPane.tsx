import { ReactElement } from "react";
import { SimpleCartProductInfo } from "../../types/SimpleCart";

type SimpleCartCheckoutPaneArgsType = {
    checkoutList: SimpleCartProductInfo[],
}

const renderedOutput = (list: ReactElement, total?: number) => (
    <>
        <h3>---Cart---</h3>
        {list}
        {total ? <><hr/><p>{`Total: A$${total}`}</p></>  : <></>}
    </>
)

export const SimpleCartCheckoutPane = ({checkoutList} :  SimpleCartCheckoutPaneArgsType) => {    
    let renderedCart: ReactElement[] = [];

    if (checkoutList.length <= 0) {
        renderedOutput(<p>Empty Cart</p>);
    } else {
        checkoutList.forEach((product) => {
            renderedCart.push(
                <p key={`checkoutItem_${product.sku}`}>{`${product.name} - ${product.qty} - A$${product.qty * product.price}`}</p>
            );
        });
    }

    let totalTransaction = 0;
    checkoutList.forEach((product) => totalTransaction += (product.qty * product.price));

    return renderedOutput(<>{renderedCart}</>, totalTransaction);
}
