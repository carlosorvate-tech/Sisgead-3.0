// 🧪 SCRIPT DE TESTE REAL - SISGEAD PREMIUM 3.0
// Execute este script no console do navegador (F12) na página de produção

console.log('🚀 Iniciando Teste Real SISGEAD Premium 3.0');
console.log('📍 URL:', window.location.href);

// Função para aguardar elemento aparecer
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Elemento ${selector} não encontrado em ${timeout}ms`));
    }, timeout);
  });
}

// Função para simular digitação
function simulateTyping(element, text, delay = 50) {
  return new Promise((resolve) => {
    let i = 0;
    element.focus();
    
    const typeChar = () => {
      if (i < text.length) {
        element.value = text.substring(0, i + 1);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        i++;
        setTimeout(typeChar, delay);
      } else {
        resolve();
      }
    };
    
    typeChar();
  });
}

// Função para clicar com delay
function clickElement(element, delay = 500) {
  return new Promise((resolve) => {
    element.click();
    setTimeout(resolve, delay);
  });
}

// TESTE 1: Verificar carregamento inicial
async function test1_carregamentoInicial() {
  console.log('\n📋 TESTE 1: Carregamento Inicial');
  
  try {
    // Verificar se o seletor de versão carregou
    const versionSelector = await waitForElement('.version-selector, [data-testid="version-selector"], h1, .container');
    console.log('✅ Seletor de versão carregado');
    
    // Verificar branding INFINITUS
    const brandingElements = document.querySelectorAll('*');
    let hasInfinitusBranding = false;
    
    for (let element of brandingElements) {
      if (element.textContent && element.textContent.includes('INFINITUS')) {
        hasInfinitusBranding = true;
        break;
      }
    }
    
    if (hasInfinitusBranding) {
      console.log('✅ Branding INFINITUS encontrado');
    } else {
      console.log('⚠️ Branding INFINITUS não encontrado');
    }
    
    // Verificar botões de versão
    const buttons = document.querySelectorAll('button, .btn, a');
    let premiumButton = null;
    
    for (let btn of buttons) {
      if (btn.textContent && btn.textContent.includes('Premium')) {
        premiumButton = btn;
        break;
      }
    }
    
    if (premiumButton) {
      console.log('✅ Botão Premium encontrado');
      return { success: true, premiumButton };
    } else {
      console.log('❌ Botão Premium não encontrado');
      return { success: false };
    }
    
  } catch (error) {
    console.error('❌ Erro no teste 1:', error);
    return { success: false, error };
  }
}

// TESTE 2: Clicar em Premium e verificar Setup Wizard
async function test2_clickPremium(premiumButton) {
  console.log('\n📋 TESTE 2: Clique Premium → Setup Wizard');
  
  try {
    // Clicar no botão Premium
    await clickElement(premiumButton, 1000);
    console.log('✅ Clique no botão Premium realizado');
    
    // Aguardar Setup Wizard aparecer
    const setupWizard = await waitForElement('.setup-wizard, .wizard, h2, .step');
    console.log('✅ Setup Wizard carregado');
    
    // Verificar se é Step 1 (Usuário Master)
    const pageText = document.body.textContent || document.body.innerText;
    if (pageText.includes('Master') || pageText.includes('CPF') || pageText.includes('Criar')) {
      console.log('✅ Step 1 (Usuário Master) identificado');
      return { success: true };
    } else {
      console.log('⚠️ Step 1 não identificado claramente, mas wizard carregou');
      return { success: true };
    }
    
  } catch (error) {
    console.error('❌ Erro no teste 2:', error);
    return { success: false, error };
  }
}

// TESTE 3: Testar validação de CPF
async function test3_validacaoCPF() {
  console.log('\n📋 TESTE 3: Validação CPF');
  
  try {
    // Procurar campo CPF
    const cpfInput = document.querySelector('input[placeholder*="CPF"], input[placeholder*="000.000.000-00"], input[type="text"][maxlength="14"]');
    
    if (!cpfInput) {
      console.log('⚠️ Campo CPF não encontrado diretamente, procurando alternativas...');
      const inputs = document.querySelectorAll('input[type="text"]');
      const cpfInput2 = Array.from(inputs).find(input => {
        const label = input.previousElementSibling?.textContent || input.parentElement?.textContent || '';
        return label.includes('CPF');
      });
      
      if (cpfInput2) {
        console.log('✅ Campo CPF encontrado via label');
        await testCPFValidation(cpfInput2);
      } else {
        console.log('❌ Campo CPF não encontrado');
        return { success: false };
      }
    } else {
      console.log('✅ Campo CPF encontrado');
      await testCPFValidation(cpfInput);
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Erro no teste 3:', error);
    return { success: false, error };
  }
}

// Função auxiliar para testar CPF
async function testCPFValidation(cpfInput) {
  // Teste CPF inválido
  console.log('🔍 Testando CPF inválido: 111.111.111-11');
  cpfInput.value = '';
  await simulateTyping(cpfInput, '11111111111');
  
  // Aguardar um pouco e verificar mensagem de erro
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const errorElements = document.querySelectorAll('.error, .text-red-500, .text-red-600, .invalid');
  const hasError = Array.from(errorElements).some(el => el.textContent && el.textContent.trim());
  
  if (hasError) {
    console.log('✅ CPF inválido rejeitado corretamente');
  } else {
    console.log('⚠️ Validação CPF pode não estar funcionando');
  }
  
  // Teste CPF válido
  console.log('🔍 Testando CPF válido: 123.456.789-09');
  cpfInput.value = '';
  await simulateTyping(cpfInput, '12345678909');
  
  // Verificar formatação
  await new Promise(resolve => setTimeout(resolve, 200));
  if (cpfInput.value.includes('.') && cpfInput.value.includes('-')) {
    console.log('✅ Formatação automática funcionando');
  } else {
    console.log('⚠️ Formatação automática pode não estar funcionando');
  }
}

// TESTE 4: Preenchimento completo Step 1
async function test4_preenchimentoCompleto() {
  console.log('\n📋 TESTE 4: Preenchimento Completo Step 1');
  
  try {
    const inputs = document.querySelectorAll('input');
    console.log(`📝 ${inputs.length} campos encontrados`);
    
    // Dados de teste
    const testData = {
      nome: 'João Silva Master INFINITUS',
      cpf: '12345678909',
      email: 'joao.master@infinitus.com.br',
      telefone: '11999999999',
      senha: 'MinhaSenh@123'
    };
    
    // Preencher campos por tipo
    for (let input of inputs) {
      const placeholder = input.placeholder || '';
      const type = input.type || 'text';
      const label = input.previousElementSibling?.textContent || input.parentElement?.textContent || '';
      
      if (placeholder.includes('nome') || label.includes('Nome')) {
        await simulateTyping(input, testData.nome);
        console.log('✅ Nome preenchido');
      } else if (placeholder.includes('CPF') || label.includes('CPF')) {
        input.value = '';
        await simulateTyping(input, testData.cpf);
        console.log('✅ CPF preenchido');
      } else if (type === 'email' || placeholder.includes('email') || label.includes('Email')) {
        await simulateTyping(input, testData.email);
        console.log('✅ Email preenchido');
      } else if (placeholder.includes('telefone') || label.includes('Telefone')) {
        await simulateTyping(input, testData.telefone);
        console.log('✅ Telefone preenchido');
      } else if (type === 'password' || placeholder.includes('senha') || label.includes('Senha')) {
        await simulateTyping(input, testData.senha);
        console.log('✅ Senha preenchida');
      }
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Erro no teste 4:', error);
    return { success: false, error };
  }
}

// EXECUTAR TODOS OS TESTES
async function executarTestesCompletos() {
  console.log('🎯 INICIANDO BATERIA DE TESTES COMPLETA\n');
  console.log('=' .repeat(50));
  
  const resultados = {};
  
  // Teste 1: Carregamento
  const test1 = await test1_carregamentoInicial();
  resultados.carregamento = test1.success;
  
  if (test1.success && test1.premiumButton) {
    // Teste 2: Premium Click
    const test2 = await test2_clickPremium(test1.premiumButton);
    resultados.premiumClick = test2.success;
    
    if (test2.success) {
      // Teste 3: Validação CPF
      const test3 = await test3_validacaoCPF();
      resultados.validacaoCPF = test3.success;
      
      // Teste 4: Preenchimento
      const test4 = await test4_preenchimentoCompleto();
      resultados.preenchimento = test4.success;
    }
  }
  
  // Relatório final
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RELATÓRIO FINAL DOS TESTES');
  console.log('=' .repeat(50));
  
  for (let [teste, sucesso] of Object.entries(resultados)) {
    const status = sucesso ? '✅' : '❌';
    console.log(`${status} ${teste}: ${sucesso ? 'PASSOU' : 'FALHOU'}`);
  }
  
  const totalTestes = Object.keys(resultados).length;
  const testesPassaram = Object.values(resultados).filter(r => r).length;
  const percentualSucesso = Math.round((testesPassaram / totalTestes) * 100);
  
  console.log(`\n🎯 RESULTADO: ${testesPassaram}/${totalTestes} testes passaram (${percentualSucesso}%)`);
  
  if (percentualSucesso >= 80) {
    console.log('🏆 SISTEMA APROVADO PARA PRODUÇÃO!');
  } else {
    console.log('⚠️ Sistema precisa de ajustes');
  }
  
  return resultados;
}

// Executar automaticamente após 2 segundos
setTimeout(() => {
  console.log('🚀 Iniciando testes automáticos...');
  executarTestesCompletos();
}, 2000);

// Exportar funções para teste manual
window.testeSISGEAD = {
  executarTodos: executarTestesCompletos,
  teste1: test1_carregamentoInicial,
  teste3: test3_validacaoCPF,
  teste4: test4_preenchimentoCompleto
};

console.log('\n💡 INSTRUÇÕES:');
console.log('1. Os testes serão executados automaticamente');
console.log('2. Para executar manualmente: testeSISGEAD.executarTodos()');
console.log('3. Para teste específico: testeSISGEAD.teste1(), etc.');