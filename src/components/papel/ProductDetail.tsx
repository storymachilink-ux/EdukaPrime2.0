import React, { useState } from 'react';

interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  pdfUrl: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  ageRange: string;
  theme: string;
  emoji?: string;
  fullDescription?: string;
  gif?: string;
  benefits?: string[];
  tip?: string;
  items?: Array<{
    number: string;
    name: string;
    difficulty: 'Fácil' | 'Médio' | 'Difícil';
    ageRange: string;
    theme: string;
    type: string;
  }>;
}

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  userPlan?: string;
}

export default function ProductDetail({ product, onClose, userPlan = 'completo' }: ProductDetailProps) {
  const [pdfError, setPdfError] = useState(false);
  const isGoogleDriveLink = product.pdfUrl.includes('drive.google.com');

  // Verificar acesso do usuário ao produto
  const isBasicPlan = userPlan === 'basico';
  const isNatalBasicPlan = userPlan === 'natal-basico';
  const isNatalCompletoPlan = userPlan === 'natal-completo';

  // Produtos Halloween Premium (IDs 3, 4) - Bloqueados para plano básico
  const isHalloweenPremiumProduct = ['3', '4'].includes(product.id);
  const isFreeProduct = product.id === '1'; // Turma EdukaBoo é liberada para plano básico
  const isBasicHalloweenProduct = product.id === '2'; // Básico Halloween - liberado para basico

  // Produtos Natal (IDs 5, 6, 7)
  const isNatalProduct = ['5', '6', '7'].includes(product.id);
  const isNatalBasicoProduct = product.id === '5'; // Kit Básico Natalino

  // Produto Stranger Things (bonus-1) - Bloqueado para Natal
  const isStrangerThingsProduct = product.id === 'bonus-1';

  // URLs de checkout
  const natalCheckoutUrl = 'https://checkout.edukaprime.com.br/VCCL1O8SCFXS';
  const halloweenCheckoutUrl = 'https://checkout.edukaprime.com.br/VCCL1O8SCDW3';

  let hasProductAccess = true;

  // edukaboo-basico (plan: basico) - APENAS Turma EdukaBoo (produto 1)
  if (isBasicPlan) {
    hasProductAccess = (product.id === '1');
  }

  // edukaboo-completo (plan: completo) - Turma EdukaBoo + Halloween (1, 2, 3, 4)
  // Bloqueado em Natal (5, 6, 7)
  if (!isBasicPlan && !isNatalBasicPlan && !isNatalCompletoPlan && isNatalProduct) {
    hasProductAccess = false; // edukaboo-completo não acessa Natal
  }

  // Bloquear Stranger Things para acessos Natal
  if ((isNatalBasicPlan || isNatalCompletoPlan) && isStrangerThingsProduct) {
    hasProductAccess = false; // Turma Stranger Things bloqueada para Natal
  }

  // Bloquear produtos Natal para usuários Natal Basic (exceto Kit Básico)
  if (isNatalBasicPlan && !isNatalBasicoProduct) {
    hasProductAccess = false; // user03natal só acessa Kit Básico
  }

  // Bloquear produtos fora de Natal para usuários Natal Completo
  if (isNatalCompletoPlan && !isNatalProduct) {
    hasProductAccess = false; // user76natal não acessa produtos fora de Natal
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Header com botão voltar */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-6 md:py-8 flex items-center justify-between">
        <button
          onClick={onClose}
          className="text-white hover:opacity-80 transition-opacity duration-200 font-semibold text-lg flex items-center gap-2"
        >
          ← Voltar
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center flex-1">
          {product.emoji && <span className="mr-2">{product.emoji}</span>}
          {product.title}
        </h2>
        <div className="w-6"></div>
      </div>

      {/* Conteúdo Principal */}
      <div className="p-6 md:p-10 space-y-8">

        {/* Seção 1: Descrição Geral */}
        {product.fullDescription && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              📖 Descrição Geral
            </h3>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.fullDescription}
              </p>
            </div>

            {/* GIF Abaixo da Descrição */}
            {product.gif && (
              <div className="flex justify-center pt-2">
                <div className="rounded-2xl overflow-hidden border-3 border-purple-300 shadow-lg">
                  <img
                    src={product.gif}
                    alt={`GIF de ${product.title}`}
                    className="w-full h-auto max-w-md"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Seção 2: Benefícios */}
        {product.benefits && product.benefits.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              🎯 Ideal para desenvolver
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {product.benefits.map((benefit, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border-2 border-blue-200">
                  <p className="text-gray-700 font-semibold text-center">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção 3: Tabela de Items */}
        {product.items && product.items.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">
              📂 {product.title === 'Histórias' ? 'Lista de Histórias incluidas' : 'Lista de Papercrafts Disponíveis'}
            </h3>
            <div className="overflow-x-auto rounded-2xl border-2 border-purple-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                    <th className="px-4 py-3 text-left font-semibold">Nº</th>
                    <th className="px-4 py-3 text-left font-semibold">Nome do Paper</th>
                    <th className="px-4 py-3 text-center font-semibold">Dificuldade</th>
                    <th className="px-4 py-3 text-center font-semibold">Faixa Etária</th>
                    <th className="px-4 py-3 text-center font-semibold">Tema</th>
                    <th className="px-4 py-3 text-center font-semibold">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {product.items.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-bold text-purple-600">{item.number}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{item.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          item.difficulty === 'Fácil' ? 'bg-green-100 text-green-700' :
                          item.difficulty === 'Médio' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">{item.ageRange}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{item.theme}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{item.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Seção 4: PDF e Ações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda - Info Cards */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              ℹ️ Informações
            </h3>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Dificuldade */}
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-4 border-2 border-orange-300">
                <p className="text-xs text-gray-700 mb-1 font-semibold">Dificuldade</p>
                <p className="text-lg font-bold text-orange-700 capitalize">
                  {product.difficulty}
                </p>
              </div>

              {/* Faixa Etária */}
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 border-2 border-blue-300">
                <p className="text-xs text-gray-700 mb-1 font-semibold">Faixa Etária</p>
                <p className="text-lg font-bold text-blue-700">
                  {product.ageRange}
                </p>
              </div>

              {/* Tema */}
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-4 border-2 border-purple-300">
                <p className="text-xs text-gray-700 mb-1 font-semibold">Tema</p>
                <p className="text-lg font-bold text-purple-700">
                  {product.theme}
                </p>
              </div>

              {/* Descrição rápida */}
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-4 border-2 border-green-300">
                <p className="text-xs text-gray-700 mb-1 font-semibold">Sobre</p>
                <p className="text-sm font-bold text-green-700">
                  {product.items ? `${product.items.length} items` : 'Especial'}
                </p>
              </div>
            </div>

            {/* Dica */}
            {product.tip && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4">
                <p className="text-sm text-yellow-800 font-semibold flex items-start gap-2">
                  <span>💡</span>
                  <span>{product.tip}</span>
                </p>
              </div>
            )}
          </div>

          {/* Coluna Direita - Visualizador PDF ou Drive */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {isGoogleDriveLink ? '📁 Google Drive' : '📄 Visualizador PDF'}
            </h3>

            {/* Área do PDF ou Google Drive */}
            <div className="rounded-2xl overflow-hidden border-4 border-purple-300 shadow-xl bg-gray-100 h-96 flex items-center justify-center">
              {isGoogleDriveLink ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                  <div className="text-6xl mb-4">📁</div>
                  <p className="text-center text-gray-800 font-bold mb-2">
                    Arquivos no Google Drive
                  </p>
                  <p className="text-sm text-gray-700 text-center mb-6">
                    {hasProductAccess ? 'Clique no botão abaixo para acessar todos os PDFs e arquivos' : 'Acesso restrito a este produto'}
                  </p>
                  {hasProductAccess ? (
                    <button
                      onClick={() => window.open(product.pdfUrl, '_blank')}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                    >
                      Abrir Google Drive
                    </button>
                  ) : (
                    <button
                      onClick={() => window.open(isNatalProduct ? natalCheckoutUrl : halloweenCheckoutUrl, '_blank')}
                      className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 cursor-pointer"
                    >
                      🔒 Desbloquear Acesso
                    </button>
                  )}
                </div>
              ) : pdfError ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 p-6">
                  <div className="text-4xl mb-4">❌</div>
                  <p className="text-center text-gray-700 font-semibold mb-3">
                    Não foi possível carregar o PDF
                  </p>
                  <p className="text-sm text-gray-600 text-center">
                    Use o botão de download para obter o arquivo
                  </p>
                </div>
              ) : (
                <iframe
                  src={`${product.pdfUrl}#toolbar=0`}
                  className="w-full h-full"
                  title={`PDF de ${product.title}`}
                  onError={() => setPdfError(true)}
                />
              )}
            </div>

            {/* Botões de Ação */}
            <div className="space-y-3">
              {isGoogleDriveLink ? (
                <>
                  {/* Botão Acessar Google Drive */}
                  {hasProductAccess ? (
                    <a
                      href={product.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
                    >
                      <span>📁</span>
                      Acessar Google Drive
                    </a>
                  ) : (
                    <button
                      onClick={() => window.open(isNatalProduct ? natalCheckoutUrl : halloweenCheckoutUrl, '_blank')}
                      className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg cursor-pointer"
                    >
                      <span>🔒</span>
                      Desbloquear Acesso
                    </button>
                  )}

                  {/* Botão Abrir em Nova Aba */}
                  {hasProductAccess ? (
                    <button
                      onClick={() => window.open(product.pdfUrl, '_blank')}
                      className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
                    >
                      <span>🔗</span>
                      Abrir em Nova Aba
                    </button>
                  ) : (
                    <button
                      onClick={() => window.open(isNatalProduct ? natalCheckoutUrl : halloweenCheckoutUrl, '_blank')}
                      className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg cursor-pointer"
                    >
                      <span>🔒</span>
                      Desbloquear Acesso
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* Botão Download */}
                  <a
                    href={product.pdfUrl}
                    download
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
                  >
                    <span>📥</span>
                    Download do PDF
                  </a>

                  {/* Botão Print */}
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
                  >
                    <span>🖨️</span>
                    Imprimir
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
