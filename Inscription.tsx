import { useLocation, useNavigate } from "react-router-dom";

const UTM_TEMPLATE = 'utm_source=FB&utm_campaign={{campaign.name}}|{{campaign.id}}&utm_medium={{adset.name}}|{{adset.id}}&utm_content={{ad.name}}|{{ad.id}}&utm_term={{placement}}';

const useUtmNavigator = () => {
	const location = useLocation();
	const navigate = useNavigate();

	return (route: string, options?: any) => {
		// If it's an external URL, perform a full redirect adding UTM template
		if (/^https?:\/\//i.test(route)) {
			const sep = route.includes("?") ? "&" : "?";
			window.location.href = route + sep + UTM_TEMPLATE;
			return;
		}

		// Internal navigation: merge any existing query params (from route and location)
		const [basePath, routeQuery = ""] = route.split("?");
		const locQuery = location.search ? location.search.replace(/^\?/, "") : "";

		// collect non-empty params and remove existing utm keys to avoid duplicates
		const allParts = [...(routeQuery ? [routeQuery] : []), ...(locQuery ? [locQuery] : [])]
			.filter(Boolean)
			.flatMap((s) => s.split("&"))
			.filter(Boolean)
			.filter((pair) => {
				const k = pair.split("=")[0];
				return !["utm_source", "utm_campaign", "utm_medium", "utm_content", "utm_term"].includes(k);
			});

		// append UTM template (raw, with placeholders)
		allParts.push(UTM_TEMPLATE);

		const finalQuery = allParts.join("&");
		const finalPath = basePath + (finalQuery ? "?" + finalQuery : "");

		navigate(finalPath, options);
	};
};

export default useUtmNavigator;
