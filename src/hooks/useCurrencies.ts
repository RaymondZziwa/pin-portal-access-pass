import { apiRequest } from "@/lib/api";
import { fetchDataFailure, fetchDataStart, fetchDataSuccess } from "@/redux/slices/currenciesSlice";
import { Currency } from "@/redux/types/Currency";
import { useEffect } from "react";
import useAuth from "./useAuth";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { ENDPOINTS } from "@/lib/endpoints";
import { ServerResponse } from "@/redux/slices/ServerResponse";

const useCurrencies = () => {
  const dispatch = useDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<Currency[]>>(
        ENDPOINTS.POS.GET_ALL_CURRENCIES,
        "GET",
        token.access_token
      );

       dispatch(
              fetchDataSuccess(
                response.success && response.data.length > 0 ? response.data : []
              )
            );// Dispatch action with fetched data on success
    } catch (error) {
      dispatch(
        fetchDataFailure(
          error instanceof Error ? error.message : "An error occurred"
        )
      ); // Dispatch action with error message on failure
    }
  };
  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const data = useSelector((state: RootState) => state.currencies);

  return { ...data, refresh: fetchDataFromApi };
};

export default useCurrencies;
