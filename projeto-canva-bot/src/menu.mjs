import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { spawn } from 'node:child_process';

const rl = readline.createInterface({ input, output });

function run(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: true });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Comando falhou (${code}): ${command} ${args.join(' ')}`));
    });
  });
}

function header() {
  console.clear();
  console.log('==============================================');
  console.log('   CANVA BOT STUDIO  •  Menu Principal');
  console.log('==============================================\n');
}

async function main() {
  while (true) {
    header();
    console.log('1) Criar novo projeto de vídeo (roteiro + payload)');
    console.log('2) Preencher template no Canva automaticamente');
    console.log('3) Sair\n');

    const option = (await rl.question('Escolha uma opção: ')).trim();

    try {
      if (option === '1') {
        const tema = (await rl.question('\nTema do vídeo: ')).trim();
        if (!tema) {
          console.log('Tema inválido.');
          await rl.question('\nEnter para continuar...');
          continue;
        }
        await run('node', ['src/index.mjs', `"${tema}"`]);
        console.log('\n✅ Projeto criado com sucesso.');
        await rl.question('\nEnter para voltar ao menu...');
      } else if (option === '2') {
        const payload = (await rl.question('\nCaminho do canva-fill.json: ')).trim();
        const url = (await rl.question('URL do design no Canva: ')).trim();
        if (!payload || !url) {
          console.log('Dados incompletos.');
          await rl.question('\nEnter para continuar...');
          continue;
        }
        await run('node', ['src/canva-auto.mjs', `"${payload}"`, `"${url}"`]);
        console.log('\n✅ Automação executada.');
        await rl.question('\nEnter para voltar ao menu...');
      } else if (option === '3') {
        break;
      } else {
        console.log('\nOpção inválida.');
        await rl.question('Enter para continuar...');
      }
    } catch (err) {
      console.log(`\n❌ ${err.message}`);
      await rl.question('Enter para continuar...');
    }
  }

  rl.close();
  console.log('\nAté logo 👋');
}

main();
