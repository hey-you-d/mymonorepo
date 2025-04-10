import { ReactElement, MouseEvent } from "react";
import { SimpleCartCheckoutPaneArgsType, SimpleCartProductInfo, UpdateCheckoutListOperation } from "../../types/SimpleCart";

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
                <div key={`checkoutItem_${product.sku}`}>
                    <button onClick={(e) => clickHandler(e, product, "decrement")}>{"<"}</button>
                    <p>{`${product.name} - ${product.qty} - A$${product.qty * product.price}`}</p>
                    <button onClick={(e) => clickHandler(e, product, "increment")}>{">"}</button>
                </div>
            );
        });
    }

    let totalTransaction = 0;
    checkoutList.forEach((product) => totalTransaction += (product.qty * product.price));

    return renderedOutput(<>{renderedCart}</>, totalTransaction);
}
