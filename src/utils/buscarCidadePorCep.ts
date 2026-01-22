// Função utilitária para buscar cidade pelo CEP usando ViaCEP
export async function buscarCidadePorCep(cep: string): Promise<string> {
  try {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return 'NÃO INFORMADO';
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    if (!response.ok) return 'NÃO INFORMADO';
    const data = await response.json();
    if (data.erro) return 'NÃO INFORMADO';
    return data.localidade || 'NÃO INFORMADO';
  } catch {
    return 'NÃO INFORMADO';
  }
}
