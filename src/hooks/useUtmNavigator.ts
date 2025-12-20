import { useLocation, useNavigate } from "react-router-dom";

const useUtmNavigator = () => {
	const location = useLocation();
	const navigate = useNavigate();

	console.log("chamada");

	return (route: string, options?: any) => {
		console.log("Navigating to:", route, "with options:", options, location.search);

		navigate(route + location.search, options);
	};
};

export default useUtmNavigator;
