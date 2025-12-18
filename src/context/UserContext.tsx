import React, { createContext, useContext, useState } from "react";

interface UserContextType {
	userName: string;
	setUserName: (name: string) => void;
	transactionData: {
		qrCode: string;
		transactionId: string;
	};
	setTransactionData: React.Dispatch<
		React.SetStateAction<{
			qrCode: string;
			transactionId: string;
		}>
	>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [userName, setUserName] = useState("");
	const [transactionData, setTransactionData] = useState(
		localStorage.getItem("transactionData")
			? JSON.parse(localStorage.getItem("transactionData")!)
			: {
					qrCode: "",
					transactionId: "",
			  },
	);

	return (
		<UserContext.Provider
			value={{
				userName,
				setUserName,
				transactionData,
				setTransactionData: (data) => {
					localStorage.setItem("transactionData", JSON.stringify(data));
					setTransactionData(data);
				},
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

export const useUser = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
};
