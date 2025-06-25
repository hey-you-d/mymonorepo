import { useState, useMemo, useCallback } from "react";
import { TaskUserModel } from "@/models/Task/use-client/TaskUserModel";
import { catchedErrorMessage } from "@/lib/app/error";
import type { UserModelType as User } from "@/types/Task";

const fnSignature = "use-client | view-model | useTaskUserViewModel";

const useTaskUserViewModel = () => {
    const [loading, setLoading] = useState(true);
      
    // Memoize userModel so it is created only once unless apiEndpoint changes
    const taskUserModel = useMemo(() => new TaskUserModel(), []);

    const registerUser = useCallback(async (email: string, password: string) => {
        setLoading(true);
        try {
          const result: User | undefined = await taskUserModel.registerUser(email, password);
          if (result) {
            return (!result.error);
          }
          return false; 
        } catch (error) {
          const errorMsg = await catchedErrorMessage(fnSignature, "registerUser", error as Error);
          throw new Error(errorMsg);
        } finally {
          setLoading(false);
        }
    }, [taskUserModel]);

    const loginUser = useCallback(async (email: string, password: string) => {
        setLoading(true);
        try {
          const result: User | undefined = await taskUserModel.loginUser(email, password);
          if (result) {
            return (!result.error);
          }
          return false; 
        } catch (error) {
          const errorMsg = await catchedErrorMessage(fnSignature, "loginUser", error as Error);
          throw new Error(errorMsg);
        } finally {
          setLoading(false);
        }
    }, [taskUserModel]);

    const logoutUser = useCallback(async () => {
        setLoading(true);
        try {
          const result: User | undefined = await taskUserModel.logoutUser();
          if (result) {
            return (!result.error);
          }
          return false;
        } catch (error) {
          const errorMsg = await catchedErrorMessage(fnSignature, "logoutUser", error as Error);
          throw new Error(errorMsg);  
        } finally {
          setLoading(false);
        }
    }, [taskUserModel]);

    const checkAuthTokenCookieExist = useCallback(async () => {
        setLoading(true);
        try {
          const result: { outcome: boolean, message: string } = await taskUserModel.checkAuthTokenCookieExist();
          return result;
        } catch (error) {
          const errorMsg = await catchedErrorMessage(fnSignature, "checkAuthTokenCookieExist", error as Error);
          throw new Error(errorMsg);  
        } finally {
          setLoading(false);
        }
    }, [taskUserModel]);

    return {
        loading,
        registerUser,
        loginUser,
        logoutUser,
        checkAuthTokenCookieExist,
    };
};

export default useTaskUserViewModel;
