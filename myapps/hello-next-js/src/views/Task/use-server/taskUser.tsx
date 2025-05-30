import { useState, Dispatch, SetStateAction, MouseEvent } from "react";
import styles from "@/app/page.module.css";
//import { registerUser, logoutUser } from "@/viewModels/Task/use-server/getTasksUserViewModel";

type TaskUserType = {
    userAuthenticated: boolean,
    setUserAuthenticated: Dispatch<SetStateAction<boolean>>,
}

export const TaskUser = ({userAuthenticated, setUserAuthenticated} : TaskUserType) => {
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

    const userLoginHandler = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const isEmailOK = validateEmail();
        const isPasswordOK = validatePassword();
        if (isEmailOK && isPasswordOK) {
            // TODO: GET request from backend, obtain JWT, and store JWT in cookie
            setFormMessage("logging in...");
            setEmail("");
            setPassword("");
            if (!userAuthenticated) {
                setUserAuthenticated(true);
            }
        }
    };

    const userLogoutHandler = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        // TODO: delete the stored cookie containing the JWT
        setUserAuthenticated(false);
    };

    const userRegisterHandler = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        
        const isEmailOK = validateEmail();
        const isPasswordOK = validatePassword();
        if (isEmailOK && isPasswordOK) {
            // TODO: POST request to backend, generate JWT, store in db, and return JWT + store it in cookie 
            setFormMessage("registering...");
            setEmail("");
            setPassword("");
            if (!userAuthenticated) {
                setUserAuthenticated(true);
            }
        }
    };

    return !userAuthenticated ? (
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
                    <button type="button" onClick={(e) => userLoginHandler(e)}>
                        Login
                    </button>
                </span>
                <span>{" -or- "}</span>
                <span>
                    <button type="button" onClick={(e) => userRegisterHandler(e)}>
                        Register
                    </button>
                </span>
            </div>
            <div className={styles.tasksFormMessage}>
                {formMessage}
            </div>
        </div>
   ) : (
    <div className={styles.tasksUserForm}>
        <span>{"You are logged in  "}</span>
        <span><button type="button" onClick={(e) => userLogoutHandler(e)}>Logout</button></span>
    </div>
   );
}