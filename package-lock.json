import CryptoJS from "crypto-js";

export function hashUserData(u) {
	return {
		em: [CryptoJS.SHA256(u.email || "").toString(CryptoJS.enc.Hex)],
		ph: [CryptoJS.SHA256(u.phone || "").toString(CryptoJS.enc.Hex)],
		fn: [CryptoJS.SHA256(u.name || "").toString(CryptoJS.enc.Hex)],
		external_id: [CryptoJS.SHA256(u.cpf || "").toString(CryptoJS.enc.Hex)],
	};
}
