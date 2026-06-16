import { useState } from 'react';

// Mock de dados para simular as vagas do feed
const VAGAS_MOCK = [
  {
    id: '1',
    area: 'TI',
    title: 'Teste',
    tags: ['teste', 'Presencial', 'teste'],
    company: 'Teste',
    salary: 'R$ 100 – R$ 1000',
    skills: ['Node.js', 'Trabalho em equipe', 'JavaScript', 'Git', 'Python', 'UX/UI Design']
  },
  {
    id: '2',
    area: 'Design',
    title: 'UX/UI Designer Junior',
    tags: ['Estágio', 'Híbrido', 'Flexível'],
    company: 'Creative Solutions',
    salary: 'R$ 800 – R$ 1500',
    skills: ['Figma', 'Prototipagem', 'UX Research', 'Trabalho em equipe']
  }
];

export function Feed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const isFinished = currentIndex >= VAGAS_MOCK.length;
  const currentVaga = VAGAS_MOCK[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  // Renderização do Empty State (Segunda imagem)
  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Sem mais vagas por agora 🎉
        </h2>
        <p className="text-[var(--color-text-muted)] text-base">
          Volte mais tarde para conferir novas oportunidades.
        </p>
      </div>
    );
  }

  // Renderização do Card de Vaga (Primeira imagem)
  return (
    <div className="flex flex-col items-center py-12 px-4 min-h-[calc(100vh-80px)] bg-[var(--color-bg)]">
      
      {/* Card Principal */}
      <div className="w-full max-w-xl bg-[var(--color-white)] border border-[var(--color-border)] rounded-2xl shadow-sm p-8">
        
        <div className="mb-6">
          <span className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            {currentVaga.area}
          </span>
          <h2 className="text-3xl font-bold text-[var(--color-text)] mt-2 mb-4">
            {currentVaga.title}
          </h2>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {currentVaga.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] px-3 py-1 rounded-md text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-base text-[var(--color-text)] mb-2">
            {currentVaga.company}
          </p>
          <p className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
            <span>💰</span> {currentVaga.salary}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase mb-3">
            Habilidades
          </h3>
          <div className="flex flex-wrap gap-2">
            {currentVaga.skills.map((skill, index) => (
              <span 
                key={index} 
                className="bg-[var(--color-white)] border border-[var(--color-border)] text-[var(--color-text)] px-4 py-1.5 rounded-full text-sm font-medium shadow-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center gap-6 mt-8">
        
        {/* Botão de Recusar (X) */}
        <button 
          onClick={handleNext}
          className="w-16 h-16 flex items-center justify-center rounded-full border-2 border-[#2C3E50] text-[#2C3E50] hover:bg-gray-100 transition duration-150"
          aria-label="Pular vaga"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Botão de Curtir (Coração) */}
        <button 
          onClick={handleNext}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-[#ED7D63] text-white hover:bg-[#d96a50] transition duration-150 shadow-md"
          aria-label="Curtir vaga"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      {/* Paginação */}
      <div className="mt-4 text-[var(--color-text-muted)] text-sm font-medium">
        {currentIndex + 1} / {VAGAS_MOCK.length}
      </div>
      
    </div>
  );
}
