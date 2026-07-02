import API from "./api";

// Backend response: { success: true, data: { message: "answer text" } }
// res.data = { success, data: { message } }
// We return res.data.data so ChatDrawer gets { message: "answer text" }
export const sendMessage = async (message: string, history: any[] = []) => {
  const res = await API.post("/chat/message", { message, history });
  return res.data.data; // { message: "answer text" }
};