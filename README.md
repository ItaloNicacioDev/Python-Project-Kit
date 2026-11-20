# Python: Novo Projeto

Uma tela de **New Project** para Python dentro do VS Code, no estilo do C# Dev Kit.
Abra a paleta de comandos (`Ctrl+Shift+P`), rode **Python: Novo Projeto**, escolha o tipo, o nome e a pasta. Pronto.

Nenhum template fica guardado na extensão: ela chama o [uv](https://docs.astral.sh/uv/) e os geradores oficiais de cada framework, então cada projeto novo já sai na **versão mais recente**.

## Tipos de projeto

| Tipo | Como é gerado |
|---|---|
| **FastAPI** | `uv tool run fastapi-new <nome>` (gerador do projeto FastAPI) |
| **Django** | `uv init` + `uv add django` + `django-admin startproject config .` + app `core` |
| **Flask** | `uv init` + `uv add flask` + `app.py` mínimo (o Flask não tem gerador oficial) |
| **IA / Data Science** | [Cookiecutter Data Science](https://cookiecutter-data-science.drivendata.org/) (`ccds`), que faz as próprias perguntas num terminal |
| **Aplicação Python** | `uv init` |
| **Biblioteca / Pacote** | `uv init --lib` |

Os projetos são criados com `--no-workspace`, então ficam independentes mesmo que você crie dentro de uma pasta que já é um projeto uv.

## Instalação

1. Baixe o arquivo `.vsix` na aba [Releases](https://github.com/ItaloNicacioDev/python-novo-projeto/releases).
2. No VS Code: aba **Extensões** → `...` → **Instalar do VSIX...** (ou `code --install-extension python-novo-projeto-0.1.1.vsix`).
3. Reinicie o VS Code.

## Requisitos

- **uv**. Se não estiver instalado, a extensão detecta e oferece um botão **Instalar uv** (`winget` no Windows, script oficial no Linux/macOS). Depois da instalação, feche e abra o VS Code.

## Configuração

| Configuração | Descrição |
|---|---|
| `pythonNovoProjeto.pastaPadrao` | Pasta onde os projetos são criados. Vazio = perguntar toda vez. |

Dica: use uma pasta neutra (por exemplo `C:\projetos`) que não seja ela mesma um projeto uv.

## Desenvolvimento

```bash
git clone https://github.com/ItaloNicacioDev/python-novo-projeto.git
cd python-novo-projeto
# F5 no VS Code abre uma janela com a extensão carregada
npx @vscode/vsce package --allow-missing-repository
```

## Licença

[MIT](LICENSE)
