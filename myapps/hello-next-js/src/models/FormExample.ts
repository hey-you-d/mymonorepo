'use server';

import { GenericFormExampleType } from "@/types/GenericForm";

const serverSideValidations = (rawData: GenericFormExampleType) => {
    if (
        !rawData.firstName ||    
        !rawData.email ||
        !rawData.password
    ) {
        return { message: "Server validation: Please fill all the areas.", inputs: rawData };
    }
    
    if (rawData.firstName.length < 10) {
        return {
          success: false,
          message: "Server validation: First name can't be less than 10 characters.",
          inputs: rawData,
        };
    }

    if (rawData.password.length < 6 || rawData.password.length > 20) {
        return {
          success: false,  
          message: "Server validation: Password must be between 6 and 20 characters.",
          inputs: rawData,
        };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawData.email)) {
        return {
            success: false,
            message: "Server validation: Please enter a valid email address.",
            inputs: rawData,
        };
    }

    // perform POST to DB here...
    
    return {
        success: true,
        message: "Form submitted successfully!",
    };
} 

export const saveGenericFormDatasToDatabase = async (formData: GenericFormExampleType) => {
    const rawData = {
        email: formData["email"] as string,
        firstName: formData["firstName"] as string,
        password: formData["password"] as string,
    } satisfies GenericFormExampleType;

    console.log("inputs coming from the form ", rawData);

    return serverSideValidations(rawData);
};

export const saveFormDatasToDatabase = async (_: unknown , formData: FormData) => {
    const rawData = {
        email: (formData.get("email") as string) || "",
        firstName: (formData.get("firstName") as string) || "",
        password: (formData.get("password") as string) || "",
    } satisfies GenericFormExampleType;

    console.log("inputs coming from the form ", rawData);

    return serverSideValidations(rawData);
}
