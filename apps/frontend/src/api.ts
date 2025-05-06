import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000",
});

export async function getToken() {
  const res = await API.post("/auth/token");
  return res.data.token;
}

export async function createPayment(
  data: {
    name: string;
    amount: number;
    method: string;
  },
  token: string
) {
  if (!token) throw new Error("Token não definido");
  const res = await API.post("/payments", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getPaymentStatus(id: string, token: string) {
  if (!token) throw new Error("Token não definido");
  const res = await API.get(`/payments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
