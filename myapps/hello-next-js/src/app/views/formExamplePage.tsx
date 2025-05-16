'use client';
// The View connects the ViewModel and UI component.
import { useState, useActionState } from "react";
import { saveGenericFormDatasToDatabase, saveFormDatasToDatabase } from "@/app/models/FormExample";
import { GenericFormExampleType } from "@/app/types/GenericForm";

const initialState = {
    success: false,
    message: "",
};

export const GenericFormExamplePage = () => {
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [validationMsg, setValidationMsg] = useState("");

    // for reference: onSubmit works on the client-side. So it expects functions that actually will work on the client. 
    // We can't just give it a function that will work on the server. Thats why we use the "classic" action attribute 
    const handleSubmit = async (e: React.MouseEvent) => {
        e.preventDefault();

        const outcome = await saveGenericFormDatasToDatabase({
            firstName: firstName,
            email: email,
            password: password,
        } satisfies GenericFormExampleType);

        setValidationMsg(outcome.message);
    };

    return (
        <div>
            <input type="text" placeholder="First Name" name="firstName" value={firstName}
                onChange={(e) => setFirstName(e.target.value)} />
            <br />       
            <input type="email" placeholder="Email" name="email" value={email}
                onChange={(e) => setEmail(e.target.value)} />
            <br />    
            <input type="password" placeholder="Password" name="password" value={password}
                onChange={(e) => setPassword(e.target.value)} />
            <br />    
            <button type="button" onClick={handleSubmit}>Submit</button>
            <p>{validationMsg}</p>    
        </div>
    );
}

export const FormExamplePage = () => {
    // for reference:
    // 1. We ideally want this control to be in both our frontend and backend, but never only on the frontend! 
    // Client-side validations can always be manipulated, so we never trust the data coming from users.
    // 2. We also want to show errors to the users if they put invalid input. And a loading state would be cool too 
    // when we're validating the data on our backend (in our server action).
    // 3. useActionState can do the job. It is a React hook and therefore must be used in a Client Component. 
    // So first, make sure that your form elements are inside a client component.
    // 4. useActionState will take our server action and an initial state as parameters and 
    // will return the state that came from our backend, formAction that we pass to the action attribute on 
    // our <form> element, and a pending state while the form is submitting.
    const [state, formAction, pending] = useActionState(
        saveFormDatasToDatabase,
        initialState
    );

    // for reference: With NextJS 13+, the action attribute can take JavaScript functions, and this function can work on the server side 
    // with the "use server" directive. The action attribute will work even if JavaScript is disabled because it's not something that 
    // works on the client—it works on the server 
    // dev note 2: The "defaultValue" attributes in every input element was added so that they will not reset when 
    // the form is submitted—unless a specific error occurs in that input field.
    return (
        <form action={formAction}>
            <input type="text" placeholder="First Name" name="firstName" required  
                defaultValue={state.inputs?.firstName} />
            <br/>     
            <input type="email" placeholder="Email" name="email" required  
                defaultValue={state.inputs?.email} />
            <br/>     
            <input type="password" placeholder="Password" name="password" required 
                defaultValue={state.inputs?.password} />
            <br/>     
            <button disabled={pending}>Submit</button>    
            <p>{state?.message}</p>
        </form>
    );
};
