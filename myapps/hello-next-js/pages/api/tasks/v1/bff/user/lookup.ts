import type { NextApiRequest, NextApiResponse } from 'next';
import argon2 from 'argon2';
import { createAuthCookie } from './register';
import type { UserModelType } from '@/types/Task';
import { 
    TASKS_SQL_BASE_API_URL,  
    getJwtSecret, 
    generateJWT, 
    VERIFY_JWT_STRING,
    verifyJwtErrorMsgs,
    TASKS_API_HEADER, 
} from "@/lib/app/common";

const fnSignature = "tasks/v1 | BFF | user/lookup.ts";
const customResponseMessage = async (fnName: string, customMsg: string) => {
    const msg = `${fnSignature} | ${fnName} | ${customMsg}`;
    console.log(msg);
    return msg;
}
const missingParamErrorMessage = async (fnName: string, missingParamMsg: string) => {
    const errorMsg = `${fnSignature} | ${fnName} | ${missingParamMsg}`;
    console.error(errorMsg);
    return errorMsg;
}
const notOkErrorMessage = async (fnName: string, response: Response) => {
    const errorMsg = `${fnSignature} | ${fnName} | not ok response: ${response.status} - ${response.statusText} `;
    console.error(errorMsg);
    return errorMsg;
}
const catchedErrorMessage = async (fnName: string, error: Error) => {
    const errorMsg = `${fnSignature} | ${fnName} | catched error: ${error.name} - ${error.message}`;
    console.error(errorMsg);
    return errorMsg;
}

const handler = async (req: NextApiRequest, res: NextApiResponse, overrideFetchUrl?: string): Promise<void> => {
    switch (req.method) {
        case "POST" :
            try {
                const { email, password } : { email: string, password: string } = req.body;
                
                if (!email || email.trim().length < 1) {
                    return res.status(400).json(
                        { error: true, message: await missingParamErrorMessage("POST", "Title is required"), }
                    );
                }
                if (!password || password.trim().length < 1) {
                    return res.status(400).json(
                        { error: true, message: await missingParamErrorMessage("POST", "Password is required"), }
                    );
                }

                // In case this fn is called from within Next.js page routes methods such as getServerSideProps.
                // In this case, we must supply an absolute URL  
                const finalUrl = overrideFetchUrl ? overrideFetchUrl : TASKS_SQL_BASE_API_URL;
                // JWT auth is not needed for login process.
                // JWT will become accessible via cookie after successful login not before.
                const response = await fetch(`${finalUrl}/user/lookup`, {
                    method: 'POST',
                    headers: await TASKS_API_HEADER(), 
                    body: JSON.stringify({
                        email,
                    }),
                    credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
                });

                if (!response.ok) {
                    const errorMsg = await notOkErrorMessage("POST - Error checking user credential: ", response);
                    throw new Error(errorMsg);
                } 
            
                const outcome: UserModelType = await response.json();

                // confirm the site visitor entered the correct password
                if (!outcome.error && outcome.email && outcome.password && outcome.jwt) {
                    const hashedPwd = outcome.password;
                    const pwdOk = await argon2.verify(hashedPwd, password);
                    if (pwdOk && outcome.jwt) {
                        // Next, verify if the jwt stored in the cookie hasn't expired yet. Replace it with a new one if its already expired.
                        const verificationOutcome = await VERIFY_JWT_STRING(outcome.jwt);
                        if(!verificationOutcome.valid) {
                            await customResponseMessage("POST", `VERIFY_JWT_STRING | ${verificationOutcome.error}`)
                        }

                        if (!verificationOutcome.valid && verificationOutcome.error === verifyJwtErrorMsgs.TokenExpiredError) {
                            const jwtSecret: { jwtSecret: string } = await getJwtSecret();
                            const newJwt = await generateJWT(email, hashedPwd, jwtSecret.jwtSecret);
                            // update the DB
                            // JWT auth is not needed for login process.
                            // JWT will become accessible via cookie after successful login not before.
                            const response = await fetch(`${finalUrl}/user/update-jwt`, {
                                method: 'PATCH',
                                headers: await TASKS_API_HEADER(),
                                body: JSON.stringify({
                                    email,
                                    jwt: newJwt,
                                }),
                                credentials: 'include', // for reference: credentials: 'include' is required to send cookies in fetch for same-site or cross-site requests.
                            });

                            if (!response.ok) {
                                const errorMsg = await notOkErrorMessage("POST - Error replacing expired JWT: ", response);
                                throw new Error(errorMsg);
                            } 
                        
                            const outcome: UserModelType = await response.json();
                            if (!outcome.error && outcome.jwt && outcome.jwt.length > 0) {
                                // then, store JWT in a http-only cookie
                                await createAuthCookie(res, outcome.jwt);
                            } else {
                                const errorMsg = await notOkErrorMessage("POST - Error re-creating a new http-only cookie: ", response);
                                throw new Error(errorMsg);
                            }
                        } else {
                            // store JWT in a http-only cookie
                            // for reference: since the cookie is meant for storing a sensitive data (JWT), then we have to create the cookie
                            // on the server-side 
                            await createAuthCookie(res, outcome.jwt);
                        }
                                        
                        return res.status(200).json({
                            error: false,
                            message: await customResponseMessage("POST", "successful login") 
                        });
                    }
                    return res.status(200).json({
                        error: true,
                        message: await customResponseMessage("POST", "wrong password") 
                    });
                }

                if (outcome.message === "provided email does not exist in the db") {
                    return res.status(200).json({
                        error: true,
                        message: `User BFF - user login attempt outcome - ${outcome.message}` 
                    });
                }

                return res.status(500).json({
                    error: true,
                    message: "User BFF - user login error - jwt is undefined"
                });
            } catch(error) {
                const errorMsg = await catchedErrorMessage("POST", error as Error);
                return res.status(500).json({ error: errorMsg });
            } 
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);                      
    } 
}

export default handler;
                                