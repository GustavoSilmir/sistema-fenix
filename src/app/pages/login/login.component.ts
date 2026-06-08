import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private router = inject(Router);
  modoLogin = true; // Controla se exibe formulário de Login ou Cadastro
  carregando = false;

  // 1. Criamos o formulário básico. Adicionamos as validações dinamicamente.
  formulario = new FormGroup({
    nome: new FormControl(''),
    sobrenome: new FormControl(''),
    dataNascimento: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    senha: new FormControl('', [Validators.required]),
    confirmarSenha: new FormControl('')
  }, { validators: (group) => this.checarSenhas(group) }); // Ajuste aqui para escutar o modoLogin

  alternarModo(isLogin: boolean) {
    this.modoLogin = isLogin;
    
    // Limpa os valores antigos digitados ao trocar de aba
    this.formulario.reset(); 

    if (!isLogin) {
      // 📝 Se for CADASTRO, ativa todas as obrigatoriedades
      this.formulario.get('nome')?.setValidators([Validators.required]);
      this.formulario.get('sobrenome')?.setValidators([Validators.required]);
      this.formulario.get('dataNascimento')?.setValidators([Validators.required]);
      this.formulario.get('confirmarSenha')?.setValidators([Validators.required]);
      this.formulario.get('email')?.setValidators([Validators.required, Validators.email]);
      this.formulario.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      // 🔐 Se for LOGIN, limpa os validadores de cadastro e mantém o básico do login
      this.formulario.get('nome')?.clearValidators();
      this.formulario.get('sobrenome')?.clearValidators();
      this.formulario.get('dataNascimento')?.clearValidators();
      this.formulario.get('confirmarSenha')?.clearValidators();
      
      this.formulario.get('email')?.setValidators([Validators.required, Validators.email]);
      this.formulario.get('senha')?.setValidators([Validators.required]);
    }

    // Atualiza a validação de cada controle individualmente
    Object.values(this.formulario.controls).forEach(control => {
      control.updateValueAndValidity();
    });
    
    // Atualiza o estado geral do formulário
    this.formulario.updateValueAndValidity();
  }

  // Validador Customizado Inteligente
  checarSenhas(group: AbstractControl) {
    // 🔥 SE ESTIVER NO MODO LOGIN, NÃO PRECISA CHECAR AS DUAS SENHAS! Retorna válido direto (null).
    if (this.modoLogin) {
      return null;
    }

    const senha = group.get('senha')?.value;
    const confirmarSenha = group.get('confirmarSenha')?.value;
    
    return senha === confirmarSenha ? null : { naoBate: true };
  }

  async enviar() {
    // Se o formulário for inválido ou já estiver carregando, não faz nada
    if (this.formulario.invalid || this.carregando) return;

    // 🔄 Ativa a tela de carregamento e trava o formulário
    this.carregando = true;

    if (this.modoLogin) {
      try {
        const resposta = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.formulario.value.email,
            senha: this.formulario.value.senha
          })
        });

        const resultado = await resposta.json();

     // No seu login.component.ts, verifique se está exatamente assim:
if (resposta.ok) {
  localStorage.setItem('usuarioId', resultado.id.toString()); // Guarda o ID "2"
  localStorage.setItem('usuarioRole', resultado.role);
  localStorage.setItem('usuarioNome', resultado.nome);
  
  alert(`Bem-vindo de volta, ${resultado.nome}! 👋`);
  this.router.navigate(['/home']);
} else {
          alert(resultado.erro);
        }
      } catch (erro) {
        console.error(erro);
        alert('Não foi possível conectar ao servidor de autenticação.');
      } finally {
        // 🏁 O bloco 'finally' roda SEMPRE, dando certo ou errado, para destravar a tela
        this.carregando = false;
      }

    } else {
      try {
        const resposta = await fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.formulario.value)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
          alert('Conta criada com absoluto sucesso! 🎉');
          this.alternarModo(true); 
        } else {
          alert('Erro no cadastro: ' + resultado.erro);
        }
      } catch (erro) {
        console.error(erro);
        alert('Não foi possível conectar ao servidor de cadastro.');
      } finally {
        this.carregando = false;
      }
    }
  }
}