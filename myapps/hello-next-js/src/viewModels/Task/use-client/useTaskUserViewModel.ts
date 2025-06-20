import { useState, useMemo, useCallback } from "react";
import { TaskUserModel } from "@/models/Task/use-client/TaskUserModel";
import { UserModelType as User } from "@/types/Task";

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
          console.error("useTaskUserViewModel | registerUser | Error: failed to register a new user: ", error);
          throw error;
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
          console.error("useTaskUserViewModel | loginUser | Error: user login failure: ", error);
          throw error;
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
          console.error("useTaskUserViewModel | logoutUser | Error: user logout failure: ", error);
          throw error;  
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
          console.error("useTaskUserViewModel | checkAuthTokenCookieExist | Error: check http-only auth_token cookie failure: ", error);
          throw error;  
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
