import { toast } from "react-toastify";
import { i18n } from "../translate/i18n";

const toastError = err => {
	const errorMsg = err.response?.data?.error;
	const toastConfig = {
		toastId: errorMsg,
		autoClose: 2000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: false,
		draggable: true,
		progress: undefined,
		theme: "light",
	};
	if (errorMsg && i18n.exists(`backendErrors.${errorMsg}`)) {
		toast.error(i18n.t(`backendErrors.${errorMsg}`), toastConfig);
	}
};

export default toastError;
