import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  
  nomeUsuario: string = '';
  roleUsuario: string = '';
  
  // Lista que guardará os usuários vindos da Neon
  listaUsuarios: any[] = [];
  
  // Controles do Modal e Painel de Treinos
  exibirModal = false;
  modoEdicao = false;
  idUsuarioSelecionado: number | null = null;
  exibirPainelTreino = false;
  alunoSelecionado: any = null;
  categoriasTreino = ['Peito', 'Tríceps', 'Costas', 'Bíceps', 'Perna', 'Ombro'];
  exerciciosDoAluno: any[] = []; // Guarda o que vem da Neon

  // 📋 Lista de exercícios fixos mapeados para o Seletor de Alta Performance
  opcoesExercicios: { [key: string]: string[] } = {
    'peito': ['Supino Reto', 'Supino Inclinado', 'Supino Declinado'],
    'tríceps': ['Tríceps Pulley', 'Tríceps Corda', 'Tríceps Testa'],
    'costas': ['Puxada Alta', 'Remada Baixa', 'Remada Curvada'],
    'bíceps': ['Rosca Direta', 'Rosca Alternada', 'Rosca Concentrada'],
    'perna': ['Agachamento Livre', 'Leg Press 45', 'Cadeira Extensora'],
    'ombro': ['Desenvolvimento Halter', 'Elevação Lateral', 'Elevação Frontal']
  };

  // 🎬 Mapeamento automático de exercícios para seus respectivos arquivos na pasta assets
  mapaGifsExercicios: { [key: string]: string } = {
    'supino reto': 'supino-reto.gif',
    // Quando você baixar novos GIFs para a pasta assets/exercicios/, adicione as chaves aqui em letras minúsculas:
    // 'supino inclinado': 'supino-inclinado.gif',
  };

  // Formulário Reativo para criar/editar usuários dentro do painel
  formularioUsuario = new FormGroup({
    nome: new FormControl('', [Validators.required]),
    sobrenome: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    senha: new FormControl(''), // Opcional na edição
    dataNascimento: new FormControl('', [Validators.required]),
    role: new FormControl('user', [Validators.required])
  });

  ngOnInit() {
    this.nomeUsuario = localStorage.getItem('usuarioNome') || 'Usuário';
    this.roleUsuario = localStorage.getItem('usuarioRole') || 'user';

    if (this.roleUsuario === 'admin') {
      this.carregarUsuarios();
    } else {
      // 🏋️‍♂️ Captura o ID do localStorage, converte para número e chama o banco
      const meuIdRaw = localStorage.getItem('usuarioId');
      if (meuIdRaw) {
        const meuId = Number(meuIdRaw);
        this.alunoSelecionado = { id: meuId, nome: this.nomeUsuario };
        this.carregarExerciciosDoBanco();
      }
    }
  }

  // 🔍 Buscar usuários na Neon (Apenas Admin)
  async carregarUsuarios() {
    try {
      const resposta = await fetch('/api/usuarios');
      if (resposta.ok) {
        this.listaUsuarios = await resposta.json();
      }
    } catch (erro) {
      console.error('Erro ao listar usuários:', erro);
    }
  }

  // ➕ Abre o modal para criar um novo usuário
  abrirModalNovo() {
    this.modoEdicao = false;
    this.idUsuarioSelecionado = null;
    this.formularioUsuario.reset({ role: 'user' });
    this.formularioUsuario.get('senha')?.setValidators([Validators.required]); // Senha obrigatória para novos
    this.formularioUsuario.get('senha')?.updateValueAndValidity();
    this.exibirModal = true;
  }

  // ✏️ Abre o modal preenchido para editar um usuário existente
  abrirModalEditar(usuario: any) {
    this.modoEdicao = true;
    const dataFormatada = usuario['data_nascimento'] ? usuario['data_nascimento'].split('T')[0] : '';
    
    this.idUsuarioSelecionado = usuario['id'];
    
    this.formularioUsuario.setValue({
      nome: usuario['nome'],
      sobrenome: usuario['sobrenome'],
      email: usuario['email'],
      senha: '', // Mantém em branco por segurança
      dataNascimento: dataFormatada,
      role: usuario['role']
    });

    this.formularioUsuario.get('senha')?.clearValidators(); // Senha opcional ao editar
    this.formularioUsuario.get('senha')?.updateValueAndValidity();
    this.exibirModal = true;
  }

  // 💾 Salva os dados do usuário (POST ou PUT)
  async salvarUsuario() {
    if (this.formularioUsuario.invalid) return;

    const dados = this.formularioUsuario.value;
    
    try {
      let resposta;
      if (this.modoEdicao) {
        resposta = await fetch('/api/usuarios', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: this.idUsuarioSelecionado, ...dados })
        });
      } else {
        resposta = await fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados)
        });
      }

      const resultado = await resposta.json();

      if (resposta.ok) {
        alert(this.modoEdicao ? 'Usuário updated com sucesso!' : 'Usuário criado com sucesso!');
        this.exibirModal = false;
        this.carregarUsuarios();
      } else {
        alert('Erro: ' + resultado.erro);
      }
    } catch (erro) {
      alert('Não foi possível salvar os dados.');
    }
  }

  // ❌ Deleta o usuário da Neon
  async deletarUsuario(id: number, nome: string) {
    if (confirm(`Tem certeza absoluta que deseja remover o usuário ${nome}?`)) {
      try {
        const resposta = await fetch(`/api/usuarios?id=${id}`, { method: 'DELETE' });
        if (resposta.ok) {
          alert('Usuário removido do sistema!');
          this.carregarUsuarios();
        } else {
          const resultado = await resposta.json();
          alert('Erro ao deletar: ' + resultado.erro);
        }
      } catch (erro) {
        alert('Erro de conexão ao tentar deletar.');
      }
    }
  }

  // 🚪 Limpa a sessão e desloga
  logout() {
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioNome');
    localStorage.removeItem('usuarioRole');
    this.router.navigate(['/login']);
  }

  // 🏋️‍♂️ Abre o painel de treinos de um aluno (Ação do Admin)
  async abrirTreinos(usuario: any) {
    this.alunoSelecionado = usuario;
    this.exibirPainelTreino = true;
    this.exerciciosDoAluno = []; // 🔥 Limpa o cache anterior para não misturar dados ao abrir
    this.carregarExerciciosDoBanco(true); // Força a busca limpa
  }

 async carregarExerciciosDoBanco(forcado: boolean = false) {
    if (!this.alunoSelecionado || !this.alunoSelecionado.id) return;

    try {
      const resposta = await fetch(`/api/treinos?usuarioId=${this.alunoSelecionado.id}`);
      if (resposta.ok) {
        const dados = await resposta.json();
        
        // Atribui os dados diretamente. Se o banco trouxer os treinos, eles renderizam na hora!
        if (dados && dados.length > 0) {
          this.exerciciosDoAluno = [...dados];
        } else {
          this.exerciciosDoAluno = [];
        }
        
        console.log('Exercícios carregados para o aluno:', this.exerciciosDoAluno);
      }
    } catch (erro) {
      console.error('Erro ao buscar exercícios:', erro);
    }
  }

  async incluirExercicio(categoria: string, nomeExercicio: string) {
    if (!nomeExercicio || !this.alunoSelecionado) return;

    // 🤖 Descobre o arquivo correspondente de forma automatizada
    const chaveExercicio = nomeExercicio.toLowerCase().trim();
    const nomeArquivoGif = this.mapaGifsExercicios[chaveExercicio] || '';
    
    // Configura o caminho apontando para assets/exercicios/ se houver o mapeamento cadastrado
    const caminhoUrlGif = nomeArquivoGif ? `assets/exercicios/${nomeArquivoGif}` : '';

    try {
      const resposta = await fetch('/api/treinos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: this.alunoSelecionado.id,
          categoria: categoria,
          nomeExercicio: nomeExercicio,
          urlGif: caminhoUrlGif // Grava o caminho local direto no banco
        })
      });

      if (resposta.ok) {
        // 🔥 Passamos true para ignorar travas e atualizar a lista instantaneamente na tela
        await this.carregarExerciciosDoBanco(true);
      } else {
        alert('Erro ao salvar o exercício no banco.');
      }
    } catch (erro) {
      console.error('Erro na requisição:', erro);
    }
  }

  // 🗑️ Remove o exercício da ficha
  async removerExercicio(id: number) {
    if (confirm('Deseja remover este exercício?')) {
      try {
        const resposta = await fetch(`/api/treinos?id=${id}`, { method: 'DELETE' });
        if (resposta.ok) {
          this.carregarExerciciosDoBanco(true); // 🔥 Força recarregamento após exclusão
        }
      } catch (erro) {
        alert('Erro ao deletar exercício.');
      }
    }
  }

  // 🔍 Filtra dinamicamente o array para renderizar na categoria correta da tela
  getExerciciosPorCategoria(categoria: string) {
    return this.exerciciosDoAluno.filter(ex => ex.categoria === categoria.toLowerCase());
  }
}