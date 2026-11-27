# Regras de trabalho

_Valem para pessoas e para agentes de IA que escrevem código neste repositório._

## Regras que não se quebram

1. **O conjunto de teste é intocado.** Nenhum código lê os casos de teste, exceto o comando de avaliação final. Nada de olhar erros do teste para ajustar prompt, limiar ou base.
2. **Divisão sempre por processo.** Casos do mesmo processo ficam do mesmo lado, tanto no corte 70/30 quanto em qualquer avaliação dentro do desenvolvimento.
3. **Ao avaliar um caso de desenvolvimento, os casos do mesmo processo saem da base de busca.** Sem isso a arquitetura encontra o próprio caso e a nota sai inflada.
4. **Dados são confidenciais.** A pasta `dados/` não entra no git. Nenhum texto de decisão vai para serviço externo sem aval da Energisa.
5. **Toda arquitetura é medida pelo mesmo avaliador.** Número medido de outro jeito não entra na comparação.

## Estrutura

```text
CONTEXT.md        contexto do projeto
GLOSSARIO.md      vocabulário de negócio
AGENTS.md         este arquivo
design/           uma decisão de desenho por arquivo, com opções e trade-offs
board/            painel interativo: board livre e mapa dos candidatos
implementacao/    planos de implementação, parados até as decisões fecharem
dados/            planilha e divisão (fora do git)
base/             código comum: dados, catálogo, contrato, LLM, avaliação
arquiteturas/     uma pasta por arquitetura
resultados/       saídas das rodadas (fora do git)
```

## Como as arquiteturas convivem

- Cada arquitetura vive na própria pasta em `arquiteturas/` e não importa código de outra arquitetura. O que for comum sobe para `base/`.
- Todas implementam o mesmo contrato, descrito em [implementacao/00-base-comum.md](implementacao/00-base-comum.md).
- Trocar de modelo é configuração, não mudança de código da arquitetura.

## Código

- Python na solução; HTML, CSS e JavaScript puros no `board/`, sem framework e sem etapa de build para abrir. Sem comentários no código.
- Nomes de domínio em português, seguindo o [GLOSSARIO.md](GLOSSARIO.md): `caso`, `dispositivo`, `determinacao`, `obf`.
- Sem LangChain nem frameworks de orquestração.
- Dependência nova só quando o plano da arquitetura a justifica.

## Documentos

- Escritos em português.
- Uma decisão de desenho por arquivo em `design/`, sempre com: a pergunta, por que importa aqui, opções com trade-offs, como testar, hipótese de partida e o que mudaria a decisão.
- Uma opção só é descartada com motivo escrito. Uma decisão só fecha com resultado medido ou com resposta da Energisa.
- O resultado de um experimento entra na seção "Resultado" do documento da decisão, com data, modelo e versão da base.
- Decisão fechada sobe para a tabela "Decisões já tomadas" do [CONTEXT.md](CONTEXT.md).
