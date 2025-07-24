import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { apiRequest } from "@/lib/api";
import { clearUserData, setUserData, startFetchingLocalToken, finishFetchingLocalToken } from "@/redux/slices/authSlice";
import { UserAuthType, SignUpData } from "@/redux/types/user.type";
import { ServerResponse } from "@/redux/slices/ServerResponse";
import {useDispatch, useSelector} from 'react-redux'
import { RootState } from "@/redux/store";
import { ENDPOINTS } from "@/lib/endpoints";
import { toast } from "sonner";

const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.userAuth);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logOutHandler = () => {
    localStorage.clear();
    dispatch(clearUserData());
    navigate("/")
  };

  const loginHandler = async (pin: string) => {
    try {
      setIsLoading(true);
      const res = await apiRequest<ServerResponse<UserAuthType>>(
        ENDPOINTS.AUTH.LOGIN,
        "POST",
        "",
        {
            pin
        }
      );
      navigate('/pos')
        dispatch(setUserData(res.data));
      localStorage.setItem("user", JSON.stringify(res.data));
        setIsLoading(false);
        return { success: true, message: res.message };
    } catch (error) {
      setIsLoading(false);
        //handleGenericError(error);
        toast.error(error?.response?.data?.errors)
      const axiosError = error as AxiosError<ServerResponse<unknown>>;
      // @ts-expect-error
      const { data } = axiosError.response;

      return {
        success: false,
        message:
          data.message ??
          ((error instanceof Error && error.message) || "Login failed"),
      };
    }
  };


  useEffect(() => {
    dispatch(startFetchingLocalToken());

    const localUserJSON = localStorage.getItem("user");
    const localUser: UserAuthType = localUserJSON && JSON.parse(localUserJSON);

    if (localUser && localUser.token.access_token) {
      dispatch(setUserData(localUser));
    } else {
      if (authState.token.access_token === "") {
        // navigate("/");
      }
      dispatch(finishFetchingLocalToken());
    }
  }, [authState.token.access_token]);

  return {
    ...authState,
    logOutHandler,
    loginHandler,
    isLoading,
  };
};

export default useAuth;
