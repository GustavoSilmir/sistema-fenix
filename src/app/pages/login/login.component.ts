import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule], // 👈 Importante para habilitar o formGroup no HTML
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Injeção de dependência moderna do Angular 17
  private router = inject(Router);

  // Criamos o controle do formulário com validações básicas
  formularioLogin = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    senha: new FormControl('', [Validators.required])
  });

  efetuarLogin() {
    if (this.formularioLogin.invalid) return;

    // Pegamos os valores digitados de forma segura
    const emailDigitado = this.formularioLogin.value.email;
    const senhaDigitada = this.formularioLogin.value.senha;

    console.log('Tentativa de login com:', emailDigitado);

    // 🧪 Validação Simulado (Igual ao seu sistema anterior)
    if (emailDigitado === 'master@sistema.com' && senhaDigitada === 'admin123') {
      localStorage.setItem('usuarioRole', 'admin');
      this.router.navigate(['/home']);
    } else if (emailDigitado === 'user@sistema.com' && senhaDigitada === '123456') {
      localStorage.setItem('usuarioRole', 'user');
      this.router.navigate(['/home']);
    } else {
      alert('E-mail ou senha inválidos! (Use master@sistema.com ou user@sistema.com)');
    }
  }
}