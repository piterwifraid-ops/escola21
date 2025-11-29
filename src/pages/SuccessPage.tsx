import React from "react";
import useUtmNavigator from "../hooks/useUtmNavigator";
import { usePixelTracking } from '../hooks/usePixelTracking';

const SuccessPage: React.FC = () => {
	usePixelTracking();
	
	const navigate = useUtmNavigator();

	const getFutureDate = () => {
		const date = new Date();
		date.setDate(date.getDate() + 1);
		return date.getDate() + " de julho";
	};

	return (
		<main className="container mx-auto px-1 py-5 flex-grow">
			<div className="max-w-3xl mx-auto">
				<div className="bg-white rounded-lg p-8">
					<h1 className="text-[#1351B4] text-3xl font-bold mb-7 leading-tight">
						INSCRIÇÃO REALIZADA
						<br />
						COM SUCESSO!
					</h1>

					<div className="space-y-6 text-lg">
						<p>Olá!</p>

						<p>
							Recebemos sua inscrição para a vaga no programa Agente Escola destinado ao
							fortalecimento das escolas públicas.
						</p>

						<p>
							Agradecemos o seu interesse em fazer parte dessa iniciativa que visa transformar a educação
							no nosso país!
						</p>

						<div className="mt-12">
							<h2 className="text-[#1351B4] text-2xl font-bold mb-6">O que acontece agora?</h2>

							<div className="space-y-6">
								<div className="flex items-start gap-3">
									<span className="text-2xl">🔍</span>
									<div>
										<h3 className="text-[#1351B4] font-bold">Análise de Dados:</h3>
										<p>
											Sua inscrição será avaliada pela equipe responsável com base nos critérios
											do programa.
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<span className="text-2xl">📅</span>
									<div>
										<h3 className="text-[#1351B4] font-bold">Prazos:</h3>
										<p>
											As análises ocorrerão até o dia <strong>{getFutureDate()}</strong>. Os
											candidatos selecionados para a próxima etapa serão comunicados por e-mail
											e/ou telefone.
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className="mt-12 flex justify-center">
							
						</div>
					</div>
				</div>
			</div>
		</main>
	);
};

export default SuccessPage;