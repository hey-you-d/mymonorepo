import { useState, useMemo, useCallback } from "react";
import { TaskUserModel } from "@/models/Task/use-client/TaskUserModel";
import { UserModelType as User } from "@/types/Task";

export const useTaskUserViewModel = () => {
    const [user, setUser] = useState({
        error: true,
        message: "useTaskUserViewModel | registerUser | unknown error"
    });
    const [loading, setLoading] = useState(true);
      
    // Memoize userModel so it is created only once unless apiEndpoint changes
    const taskUserModel = useMemo(() => new TaskUserModel(), []);

    const registerUser = useCallback(async (email: string, password: string) => {
        setLoading(true);
        try {
          const result: User | undefined = await taskUserModel.registerUser(email, password);
          if (result) {
            setUser(result);  
          } else {
            throw new Error("useTaskUserViewModel | registerUser | model component returned undefined")
          }
        } catch (error) {
          console.error("useTaskUserViewModel | registerUser | Error: failed to register a new user: ", error);
          setUser({
            error: true,
            message: "useTaskUserViewModel | registerUser | Error: failed to register a new user"
          });
        } finally {
          setLoading(false);
        }
    }, [taskUserModel]);

    const loginUser = useCallback(async (email: string, password: string) => {
        setLoading(true);
        try {
          const result: User | undefined = await taskUserModel.loginUser(email, password);
          if (result) {
            setUser(result);  
          } else {
            throw new Error("useTaskUserViewModel | loginUser | model component returned undefined")
          }
        } catch (error) {
          console.error("useTaskUserViewModel | loginUser | Error: user login failure: ", error);
          setUser({
            error: true,
            message: "useTaskUserViewModel | loginUser | Error: user login failure"
          });
        } finally {
          setLoading(false);
        }
    }, [taskUserModel]);

    const logoutUser = useCallback(async () => {
        setLoading(true);
        try {
          const result: User | undefined = await taskUserModel.logoutUser();
          if (result) {
            setUser(result);  
          } else {
            throw new Error("useTaskUserViewModel | logoutUser | model component returned undefined")
          }
        } catch (error) {
          console.error("useTaskUserViewModel | logoutUser | Error: user logout failure: ", error);
          setUser({
            error: true,
            message: "useTaskUserViewModel | logoutUser | Error: user logout failure"
          });
        } finally {
          setLoading(false);
        }
    }, [taskUserModel]);

    return {
        user,
        loading,
        registerUser,
        loginUser,
        logoutUser,
    }
}
