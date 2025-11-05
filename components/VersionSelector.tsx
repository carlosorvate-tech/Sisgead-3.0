// 🎯 SISGEAD Version Selector - Guia Inteligente de Escolha
// Ajuda administradores a escolherem entre Standard e Premium

import React, { useState } from 'react';

type Version = 'standard' | 'premium' | null;

interface VersionSelectorProps {
  onVersionSelected: (version: 'standard' | 'premium') => void;
}

export function VersionSelector({ onVersionSelected }: VersionSelectorProps) {
  const [selectedVersion, setSelectedVersion] = useState<Version>(null);
  const [showComparison, setShowComparison] = useState(false);

  const handleSelect = (version: 'standard' | 'premium') => {
    setSelectedVersion(version);
    // Salvar escolha no localStorage para próximas sessões
    localStorage.setItem('sisgead-version', version);
    setTimeout(() => onVersionSelected(version), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Bem-vindo ao SISGEAD
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Sistema Inteligente de Gestão de Equipes de Alto Desempenho
          </p>
          <p className="text-lg text-gray-500">
            Escolha a versão ideal para sua organização
          </p>
        </div>

        {/* Informativo sobre as versões */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Duas Versões, Diferentes Necessidades
              </h3>
              <p className="text-blue-800 leading-relaxed">
                O SISGEAD está disponível em duas versões para atender organizações de diferentes portes.
                A <strong>versão Standard</strong> é perfeita para equipes únicas e pequenas organizações,
                enquanto a <strong>versão Premium</strong> oferece recursos avançados para grandes corporações
                com múltiplas unidades de gestão.
              </p>
            </div>
          </div>
        </div>

        {/* Cards de Seleção */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* STANDARD Card */}
          <div 
            className={`bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl cursor-pointer ${
              selectedVersion === 'standard' ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-200'
            }`}
            onClick={() => setSelectedVersion('standard')}
          >
            <div className="p-8">
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-semibold">
                  GRATUITO
                </span>
                <span className="text-3xl">🏢</span>
              </div>

              {/* Título */}
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                SISGEAD Standard
              </h2>
              <p className="text-gray-600 mb-6">
                Para pequenas e médias organizações
              </p>

              {/* Ideal para */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ideal para:
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Empresas com <strong>1 unidade de gestão</strong></li>
                  <li>• Equipes de até <strong>100 colaboradores</strong></li>
                  <li>• Uso departamental simples</li>
                  <li>• Orçamento limitado para ferramentas</li>
                </ul>
              </div>

              {/* Requisitos Técnicos */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Requisitos Técnicos:
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      <strong>Desktop/Laptop:</strong> 4GB RAM, navegador moderno
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      <strong>Mobile/Tablet:</strong> Totalmente compatível
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      <strong>Internet:</strong> 3G ou superior
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      <strong>Download:</strong> ~200 KB (rápido)
                    </span>
                  </div>
                </div>
              </div>

              {/* Funcionalidades */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Questionário DISC completo
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Formação de equipes com IA
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Portal administrativo básico
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Relatórios e análises
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Smart Hints inteligentes
                </div>
              </div>

              {/* Botão */}
              <button
                onClick={() => handleSelect('standard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                Escolher Standard
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* PREMIUM Card */}
          <div 
            className={`bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl cursor-pointer relative overflow-hidden ${
              selectedVersion === 'premium' ? 'border-purple-500 ring-4 ring-purple-200' : 'border-gray-200'
            }`}
            onClick={() => setSelectedVersion('premium')}
          >
            {/* Ribbon */}
            <div className="absolute top-4 -right-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-1 transform rotate-45 text-xs font-bold shadow-lg">
              ENTERPRISE
            </div>

            <div className="p-8">
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  PREMIUM
                </span>
                <span className="text-3xl">🏛️</span>
              </div>

              {/* Título */}
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                SISGEAD Premium
              </h2>
              <p className="text-gray-600 mb-6">
                Para grandes corporações multi-unidade
              </p>

              {/* Ideal para */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ideal para:
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Múltiplas unidades</strong> de gestão</li>
                  <li>• <strong>100+ colaboradores</strong> distribuídos</li>
                  <li>• Necessidade de <strong>compliance LGPD</strong></li>
                  <li>• Governança centralizada</li>
                </ul>
              </div>

              {/* Requisitos Técnicos */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Requisitos Técnicos:
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-2">⚠️</span>
                    <span className="text-gray-700">
                      <strong>Desktop/Laptop:</strong> 8GB+ RAM recomendado
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-2">⚠️</span>
                    <span className="text-gray-700">
                      <strong>Mobile/Tablet:</strong> Funcional mas limitado
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">
                      <strong>Internet:</strong> 4G/Banda larga
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-2">⚠️</span>
                    <span className="text-gray-700">
                      <strong>Download:</strong> ~300 KB (médio)
                    </span>
                  </div>
                </div>
              </div>

              {/* Funcionalidades */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm font-semibold text-purple-700">
                  <svg className="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Tudo do Standard, MAIS:
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Gestão multi-tenant completa
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Dashboard Super Admin
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Security & Compliance LGPD
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Auditoria avançada completa
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Relatórios regulatórios (ANPD)
                </div>
              </div>

              {/* Botão */}
              <button
                onClick={() => handleSelect('premium')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg"
              >
                Escolher Premium
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Botão de Comparação Detalhada */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="text-blue-600 hover:text-blue-800 font-medium underline flex items-center justify-center mx-auto"
          >
            {showComparison ? 'Ocultar' : 'Ver'} comparação detalhada de funcionalidades
            <svg 
              className={`w-4 h-4 ml-2 transition-transform ${showComparison ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Tabela de Comparação Detalhada */}
        {showComparison && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-fadeIn">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Comparação Completa de Funcionalidades
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Funcionalidade</th>
                    <th className="text-center py-4 px-4 font-semibold text-blue-700">Standard</th>
                    <th className="text-center py-4 px-4 font-semibold text-purple-700">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800">Questionário DISC</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-green-500 text-xl">✓</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-green-500 text-xl">✓</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800">Formação de Equipes com IA</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-green-500 text-xl">✓</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-green-500 text-xl">✓</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800">Portal Administrativo</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-blue-600 text-sm">Básico</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-purple-600 text-sm font-semibold">Avançado</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800">Relatórios e Análises</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-blue-600 text-sm">Simples</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-purple-600 text-sm font-semibold">Completos</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-purple-50">
                    <td className="py-3 px-4 text-gray-800 font-medium">Gestão Multi-Tenant</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-gray-400 text-xl">✗</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-green-500 text-xl">✓</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-purple-50">
                    <td className="py-3 px-4 text-gray-800 font-medium">Super Admin Dashboard</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-gray-400 text-xl">✗</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-green-500 text-xl">✓</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-purple-50">
                    <td className="py-3 px-4 text-gray-800 font-medium">Compliance LGPD Completo</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-gray-400 text-xl">✗</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-green-500 text-xl">✓</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-purple-50">
                    <td className="py-3 px-4 text-gray-800 font-medium">Auditoria Avançada</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-gray-400 text-xl">✗</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-green-500 text-xl">✓</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-purple-50">
                    <td className="py-3 px-4 text-gray-800 font-medium">Relatórios Regulatórios (ANPD)</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-gray-400 text-xl">✗</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-green-500 text-xl">✓</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-purple-50">
                    <td className="py-3 px-4 text-gray-800 font-medium">Analytics Cross-Tenant</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-gray-400 text-xl">✗</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-green-500 text-xl">✓</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 border-t-2 border-gray-300">
                    <td className="py-3 px-4 text-gray-800 font-semibold">Número de Organizações</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-blue-600 font-semibold">1</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-purple-600 font-semibold">Ilimitadas</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800 font-semibold">Limite de Colaboradores</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-blue-600 font-semibold">~100</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-purple-600 font-semibold">Ilimitado</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800 font-semibold">Suporte</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-blue-600 text-sm">Comunidade</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-purple-600 text-sm font-semibold">Dedicado</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer com informação adicional */}
        <div className="text-center text-sm text-gray-500">
          <p>
            💡 <strong>Dica:</strong> Não tem certeza? Comece com o Standard. 
            Você pode migrar para o Premium quando sua organização crescer.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default VersionSelector;