import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_BASE_URL
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};