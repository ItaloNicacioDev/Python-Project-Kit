const vscode = require('vscode');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const TIPOS = [
  { label: 'FastAPI', description: 'gerador oficial fastapi-new', id: 'fastapi' },
  { label: 'Django', description: 'django-admin startproject + app core', id: 'django' },
  { label: 'Flask', description: 'app mínimo com a última versão', id: 'flask' },
  { label: 'IA / Data Science', description: 'Cookiecutter Data Science (interativo)', id: 'ia' },
  { label: 'Aplicação Python', description: 'uv init', id: 'app' },
  { label: 'Biblioteca / Pacote', description: 'uv init --lib', id: 'lib' },
];

const GITIGNORE = '.venv/\n__pycache__/\n*.pyc\n.env\n';
const FLASK_APP = `from flask import Flask

app = Flask(__name__)


@app.route("/")
def raiz():
    return "ok"

# Rodar: uv run flask --app app run --debug
`;

class UvAusente extends Error {}

function run(out, cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    out.appendLine(`> ${cmd} ${args.join(' ')}`);
    const p = spawn(cmd, args, { cwd });
    p.stdout.on('data', (d) => out.append(d.toString()));
    p.stderr.on('data', (d) => out.append(d.toString()));
    p.on('error', (e) => reject(e.code === 'ENOENT' ? new UvAusente() : e));
    p.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`"${cmd} ${args.join(' ')}" terminou com código ${code}`))
    );
  });
}

function passos(tipo, nome, base, raiz) {
  const uv = (args, cwd) => ({ args, cwd });
  switch (tipo) {
    case 'fastapi':
      return [uv(['tool', 'run', 'fastapi-new', nome], base)];
    case 'django':
      return [
        uv(['init', '--bare', '--no-workspace', nome], base),
        uv(['add', 'django'], raiz),
        uv(['run', 'django-admin', 'startproject', 'config', '.'], raiz),
        uv(['run', 'python', 'manage.py', 'startapp', 'core'], raiz),
      ];
    case 'flask':
      return [uv(['init', '--bare', '--no-workspace', nome], base), uv(['add', 'flask'], raiz)];
    case 'app':
      return [uv(['init', '--no-workspace', nome], base)];
    case 'lib':
      return [uv(['init', '--lib', '--no-workspace', nome], base)];
  }
  return [];
}

async function oferecerInstalarUv() {
  const r = await vscode.window.showErrorMessage(
    'O uv não está instalado (ou o VS Code precisa ser reiniciado depois de instalar).',
    'Instalar uv'
  );
  if (r === 'Instalar uv') {
    const t = vscode.window.createTerminal('Instalar uv');
    t.show();
    t.sendText(
      process.platform === 'win32'
        ? 'winget install --id=astral-sh.uv -e'
        : 'curl -LsSf https://astral.sh/uv/install.sh | sh'
    );
    vscode.window.showInformationMessage(
      'Quando a instalação terminar, feche e abra o VS Code e rode o comando de novo.'
    );
  }
}

async function criar() {
  const tipo = await vscode.window.showQuickPick(TIPOS, {
    placeHolder: 'Que tipo de projeto Python?',
  });
  if (!tipo) return;

  let nome = '';
  if (tipo.id !== 'ia') {
    nome = await vscode.window.showInputBox({
      prompt: 'Nome do projeto',
      validateInput: (v) =>
        /^[A-Za-z][A-Za-z0-9_-]*$/.test(v || '')
          ? null
          : 'Use letras, números, _ ou -, começando por letra',
    });
    if (!nome) return;
  }

  let base = vscode.workspace.getConfiguration('pythonNovoProjeto').get('pastaPadrao');
  if (!base) {
    const sel = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: false,
      openLabel: 'Criar o projeto aqui',
      defaultUri: vscode.Uri.file(os.homedir()),
    });
    if (!sel) return;
    base = sel[0].fsPath;
  }
  fs.mkdirSync(base, { recursive: true });

  if (tipo.id === 'ia') {
    const t = vscode.window.createTerminal({ name: 'Data Science', cwd: base });
    t.show();
    t.sendText('uv tool run --from cookiecutter-data-science ccds');
    return;
  }

  const raiz = path.join(base, nome);
  if (fs.existsSync(raiz)) {
    vscode.window.showErrorMessage(`Já existe: ${raiz}`);
    return;
  }

  const out = vscode.window.createOutputChannel('Python: Novo Projeto');
  out.show(true);
  try {
    await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: `Criando ${nome}...` },
      async () => {
        for (const p of passos(tipo.id, nome, base, raiz)) {
          await run(out, 'uv', p.args, p.cwd);
        }
        if (tipo.id === 'flask') fs.writeFileSync(path.join(raiz, 'app.py'), FLASK_APP);
        if (tipo.id === 'django' || tipo.id === 'flask')
          fs.writeFileSync(path.join(raiz, '.gitignore'), GITIGNORE);
      }
    );
  } catch (e) {
    try { fs.rmSync(raiz, { recursive: true, force: true }); } catch (_) {}
    if (e instanceof UvAusente) return oferecerInstalarUv();
    vscode.window.showErrorMessage(`Falhou: ${e.message}. Veja a saída "Python: Novo Projeto".`);
    return;
  }

  const r = await vscode.window.showInformationMessage(
    `Projeto "${nome}" criado.`,
    'Abrir nesta janela',
    'Abrir em nova janela'
  );
  if (r) {
    vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(raiz), {
      forceNewWindow: r === 'Abrir em nova janela',
    });
  }
}

function activate(context) {
  context.subscriptions.push(vscode.commands.registerCommand('pythonNovoProjeto.criar', criar));
}
function deactivate() {}
module.exports = { activate, deactivate };
