import axios from "axios"
import { serverUrl } from "../config.js"
import { setUserData } from "../redux/userSlice"

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getCurrentUser = async (dispatch) => {
    try {
        const result = await axios.get(serverUrl + "/api/user/currentuser" , {
            withCredentials:true,
            headers: getAuthHeaders()
        })
        
        dispatch(setUserData(result.data))
    } catch (error) {
        console.log(error)
        localStorage.removeItem("token");
        dispatch(setUserData(null));
    }
}

export const generateNotes = async (payload) => {
    try {
        const result = await axios.post(
          serverUrl + "/api/notes/generate-notes",
          payload,
          { withCredentials: true, headers: getAuthHeaders() }
        );
        return result.data

    } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to generate notes";

        const err = new Error(message);
        err.status = error?.response?.status;
        err.details = error?.response?.data;
        throw err;
    }
}

export const downloadPdf = async (result) => {
    try {
        const response = await axios.post(serverUrl+ "/api/pdf/generate-pdf" , {result} , {
            responseType:"blob" , withCredentials:true
        })

        const blob = new Blob([response.data], {
      type: "application/pdf"
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ExamNotesAI.pdf";
    link.click();

    window.URL.revokeObjectURL(url);
    } catch (error) {
         void error;
         throw new Error("PDF download failed");

    }
}
