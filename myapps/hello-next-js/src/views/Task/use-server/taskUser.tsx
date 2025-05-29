import { useState } from "react";
import styles from "@/app/page.module.css";


/*
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
*/

export const TaskUser = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [emailMessage, setEmailMessage] = useState<string>("");
    const [passwordMessage, setPasswordMessage] = useState<string>("");
    const [formMessage, setFormMessage] = useState<string>("");

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

    const userLoginHandler = async () => {
        const isEmailOK = validateEmail();
        const isPasswordOK = validatePassword();
        if (isEmailOK && isPasswordOK) {
            // TODO: GET request from backend, obtain JWT, and store JWT in cookie
            setFormMessage("logging in...");
        }
    };

    const userRegisterHandler = async () => {
        const isEmailOK = validateEmail();
        const isPasswordOK = validatePassword();
        if (isEmailOK && isPasswordOK) {
            // TODO: POST request to backend, generate JWT, store in db, and return JWT + store it in cookie 
            setFormMessage("registering...");
        }
    };

    return (
        <div className={styles.tasksUserForm}>
            <div className={styles.tasksLabelEmail}>Email</div>
            <div className={styles.tasksLabelPassword}>Password</div>
            <div className={styles.tasksFieldEmail}>
                <input type="field" placeholder="Email" name="email" value={email}
                        onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className={styles.tasksFieldPassword}>
                <input type="password" placeholder="Password" name="password" value={password}
                        onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className={styles.tasksMessageEmail}>{emailMessage}</div>
            <div className={styles.tasksMessagePassword}>{passwordMessage}</div>
            <div className={styles.tasksFormButtons}>
                <span>
                    <button type="button" onClick={(e) => userLoginHandler()}>
                        Login
                    </button>
                </span>
                <span>{" -or- "}</span>
                <span>
                    <button type="button" onClick={(e) => userRegisterHandler()}>
                        Register
                    </button>
                </span>
            </div>
            <div className={styles.tasksFormMessage}>
                {formMessage}
            </div>
        </div>
    )
}