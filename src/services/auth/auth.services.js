import api from "../../plugins/axios.js";

export const AuthService = {
  async login(data) {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  async register(data) {
    const response = await api.post("/auth/register", data);
    return response.data;
  },
};
