import { ReactElement, MouseEvent } from "react";
import { SimpleCartCheckoutPaneArgsType, SimpleCartProductInfo, UpdateCheckoutListOperation } from "../../types/SimpleCart";
import { CheckoutTable, CheckoutCell } from "./styles";

const renderedOutput = (list: ReactElement, total?: number) => (
    <>
        <h3>---Cart---</h3>
        {list}
        {total ? <><hr/><p>{`Total: A$${total}`}</p></>  : <></>}
    </>
)

export const SimpleCartCheckoutPane = ({checkoutList, updateCheckoutList} :  SimpleCartCheckoutPaneArgsType) => {    
    let renderedCart: ReactElement[] = [];

    const clickHandler = (e: MouseEvent<HTMLButtonElement>, product: SimpleCartProductInfo, operation: UpdateCheckoutListOperation) => {
        e.preventDefault();
        console.log("clickHandler ", operation, product);
        updateCheckoutList(product, operation);
    }

    if (checkoutList.length <= 0) {
        renderedOutput(<p>Empty Cart</p>);
    } else {
        checkoutList.forEach((product) => {
            renderedCart.push(
                <CheckoutTable key={`checkoutItem_${product.sku}`}>
                    <CheckoutCell><p>{`${product.name} - ${product.qty} - A$${product.qty * product.price}`}</p></CheckoutCell>
                    <CheckoutCell><button onClick={(e) => clickHandler(e, product, "decrement")}>{"<"}</button></CheckoutCell>
                    <CheckoutCell><button onClick={(e) => clickHandler(e, product, "increment")}>{">"}</button></CheckoutCell>
                </CheckoutTable>
            );
        });
    }

    let totalTransaction = 0;
    checkoutList.forEach((product) => totalTransaction += (product.qty * product.price));

    return renderedOutput(<>{renderedCart}</>, totalTransaction);
}
