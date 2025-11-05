/**
 * ARQUIVO DE DIAGNÓSTICO - APENAS PARA DEBUG
 * Este arquivo pode ser removido após resolução do problema
 */

// Para testar diretamente no console do browser:
// 1. Abra F12 no navegador
// 2. Cole este código no console
// 3. Execute testGeminiConnection()

async function testGeminiConnection() {
    console.log('=== TESTE DE DIAGNÓSTICO SISGEAD 2.0 ===');
    
    const WORKER_URL = 'https://sisgead-gemini-proxy.carlosorvate-tech.workers.dev';
    
    console.log('1. Testando conectividade básica...');
    
    try {
        // Teste 1: OPTIONS (CORS)
        console.log('   Testando CORS...');
        const corsResponse = await fetch(WORKER_URL, {
            method: 'OPTIONS',
            headers: {
                'Origin': window.location.origin
            }
        });
        console.log('   ✅ CORS Response:', corsResponse.status, corsResponse.statusText);
        
        // Teste 2: POST simples
        console.log('   Testando POST request...');
        const testResponse = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': window.location.origin
            },
            body: JSON.stringify({
                prompt: 'Teste simples. Responda apenas: OK',
                model: 'gemini-1.5-flash'
            })
        });
        
        console.log('   Status:', testResponse.status, testResponse.statusText);
        
        if (!testResponse.ok) {
            const errorText = await testResponse.text();
            console.log('   ❌ Erro detalhado:', errorText);
            
            try {
                const errorJson = JSON.parse(errorText);
                console.log('   📋 Erro estruturado:', errorJson);
                
                if (errorJson.error && errorJson.error.error) {
                    const geminiError = errorJson.error.error;
                    console.log('   🎯 Erro específico do Gemini:', geminiError);
                    
                    if (geminiError.status === 'NOT_FOUND') {
                        console.log('   💡 DIAGNÓSTICO: Modelo não encontrado ou chave API inválida');
                    } else if (geminiError.status === 'PERMISSION_DENIED') {
                        console.log('   💡 DIAGNÓSTICO: Problema de permissão com a chave API');
                    }
                }
            } catch (e) {
                console.log('   ❌ Erro não é JSON válido');
            }
        } else {
            const result = await testResponse.json();
            console.log('   ✅ Sucesso! Resposta:', result);
        }
        
    } catch (error) {
        console.log('   ❌ Erro de rede/conexão:', error);
    }
    
    console.log('2. Testando função interna do SISGEAD...');
    
    // Teste da função interna (se disponível)
    if (window.geminiService) {
        try {
            const testResult = await window.geminiService.testFunction();
            console.log('   ✅ Função interna funcionando:', testResult);
        } catch (error) {
            console.log('   ❌ Erro na função interna:', error.message);
        }
    } else {
        console.log('   ⚠️ Função interna não disponível (normal em produção)');
    }
    
    console.log('=== FIM DO DIAGNÓSTICO ===');
    console.log('PRÓXIMOS PASSOS:');
    console.log('1. Se CORS falhar: Problema de configuração do Cloudflare Worker');
    console.log('2. Se POST retornar 404 NOT_FOUND: Chave API não configurada');
    console.log('3. Se POST retornar 403 PERMISSION_DENIED: Chave API inválida');
    console.log('4. Se tudo funcionar: Problema pode estar no código React');
}

// Para usar: cole no console e execute testGeminiConnection()
console.log('Para diagnosticar, execute: testGeminiConnection()');