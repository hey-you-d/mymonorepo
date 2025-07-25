'use client';

import { useLayoutEffect, useEffect, useState, MouseEvent } from "react";
import styles from "@/app/page.module.css";
import { registerUser, loginUser, logoutUser, checkAuthTokenCookieExist } from "@/viewModels/Task/use-server/getTasksUserViewModel";
import { TaskUserType } from "@/types/Task";

export const TaskUser = ({userAuthenticated, setUserAuthenticated} : TaskUserType) => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [emailMessage, setEmailMessage] = useState<string>("");
    const [passwordMessage, setPasswordMessage] = useState<string>("");
    const [formMessage, setFormMessage] = useState<string>("only logged-in users can interact with the table");
    
    useEffect(() => {
        if (email.length < 1) {
            const storedEmail = sessionStorage.getItem("email");
            if (storedEmail) setEmail(storedEmail); 
        }    
    }, []); // run once

    useLayoutEffect(() => {
        const checkUserLoggedIn = async () => {    
            // for reference: the http only auth_token cookie is not accessible from the client-side
            const authTokenCookieExist = await checkAuthTokenCookieExist();
            if (authTokenCookieExist.outcome && !userAuthenticated) {
                setUserAuthenticated(true);
            }
            if (!authTokenCookieExist.outcome && userAuthenticated) {
                setUserAuthenticated(false);

                // TODO: a modal popup that says "you have been logged out"
            }
        };

        checkUserLoggedIn();
    }, []); // run once

    const validatePassword = () => {
        if (password.trim().length < 6) {
            setPasswordMessage("password must not be less than 6 chars");
            return false;
        }
        if(passwordMessage.trim().length > 0 ) setPasswordMessage("");
        return true;
    }

    const validateEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailMessage("incorrect email format");
            return false;
        }
        if(emailMessage.trim().length > 0 ) setEmailMessage("");
        return true;
    }

    const emailOnChangeHandler = (keyedInEmail: string) => {
        setEmail(keyedInEmail);
        // to handle use case scenario where an user accidentally refresh the page.
        // of course, password input field is exempt. 
        sessionStorage.setItem("email", keyedInEmail);
    }

    const userLoginHandler = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const isEmailOK = validateEmail();
        const isPasswordOK = validatePassword();
        if (isEmailOK && isPasswordOK) {
            setFormMessage("logging in...");

            const outcome = await loginUser(email, password);
            if (outcome) {
                setFormMessage("");
                setEmail("");
                setPassword("");
                sessionStorage.removeItem("email");
                setUserAuthenticated(outcome);
            } else {
                setFormMessage("Login failed: either wrong email or password"); 
                // just to be safe...
                if (userAuthenticated) setUserAuthenticated(false); 
            }
        }
    };

    const userLogoutHandler = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const outcome = await logoutUser();
        if (outcome) {
            setUserAuthenticated(!outcome);
        } else {
            setFormMessage("User Logout attempt failed");
            // just to be safe...
            if (userAuthenticated) setUserAuthenticated(false);  
        }
    };

    const userRegisterHandler = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const isEmailOK = validateEmail();
        const isPasswordOK = validatePassword();
        if (isEmailOK && isPasswordOK) {
            setFormMessage("registering...");
            const outcome = await registerUser(email, password);
            if (outcome) {
                setFormMessage("");
                setEmail("");
                setPassword("");
                sessionStorage.removeItem("email");
                setUserAuthenticated(outcome);
            } else {
                setFormMessage("User Registration attempt failed");  
                // just to be safe...
                if (userAuthenticated) setUserAuthenticated(false);
            }
        }
    };

    return !userAuthenticated ? (
        <div className={styles.tasksUserForm}>
            <div className={styles.tasksLabelEmail}>Email</div>
            <div className={styles.tasksLabelPassword}>Password</div>
            <div className={styles.tasksFieldEmail}>
                <input type="field" placeholder="Email" name="email" value={email}
                        onChange={(e) => emailOnChangeHandler(e.target.value)} />
            </div>
            <div className={styles.tasksFieldPassword}>
                <input type="password" placeholder="Password" name="password" value={password}
                        onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className={styles.tasksMessageEmail}>{emailMessage}</div>
            <div className={styles.tasksMessagePassword}>{passwordMessage}</div>
            <div className={styles.tasksFormButtons}>
                <span><button type="button" onClick={(e) => userLoginHandler(e)}>Login</button></span>
                <span>{" -or- "}</span>
                <span><button type="button" onClick={(e) => userRegisterHandler(e)}>Register</button></span>
            </div>
            <div className={styles.tasksFormMessage}>{formMessage}</div>
        </div>
   ) : (
    <div className={styles.tasksUserForm}>
        <span>{"You are logged in  "}</span>
        <span><button type="button" onClick={(e) => userLogoutHandler(e)}>Logout</button></span>
        <div className={styles.tasksFormMessage}>{formMessage}</div>
    </div>
   );
}