import axios from "axios";
import type { AxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export async function makeRequest<T = any>(
  url: string,
  method: AxiosRequestConfig["method"] = "get",
  data?: any,
  token?: string,
  config?: AxiosRequestConfig
): Promise<T> {
  // 合併 headers，Authorization 放最後，確保不被覆蓋
  const mergedHeaders = {
    ...(config?.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const resp = await axios({
    url: BASE_URL + url,
    method,
    data,
    ...config,
    headers: mergedHeaders,
  });
  return resp.data;
}
