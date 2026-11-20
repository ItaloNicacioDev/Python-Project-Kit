# Changelog

## 0.1.1
- Corrigido: criar um projeto dentro de uma pasta que já é um projeto uv fazia o `uv add` falhar (o projeto novo entrava no workspace da pasta pai). Todo `uv init` agora usa `--no-workspace`.
- Se alguma etapa falhar, a pasta meio criada é removida automaticamente.

## 0.1.0
- Primeira versão: comando **Python: Novo Projeto** com FastAPI, Django, Flask, IA / Data Science, Aplicação e Biblioteca.
- Oferece instalar o uv quando ele não é encontrado.
- Configuração `pythonNovoProjeto.pastaPadrao`.
