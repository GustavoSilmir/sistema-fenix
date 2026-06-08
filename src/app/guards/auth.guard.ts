import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Lê o papel do usuário salvo na memória
  const perfilLogado = localStorage.getItem('usuarioRole');

  if (perfilLogado === 'admin') {
    return true; // 🟢 Sinal verde! Pode acessar a tela Admin
  }

  // 🔴 Sinal vermelho! Avisa e joga o usuário comum de volta para a Home
  alert('Acesso Negado! Área exclusiva do Usuário Master.');
  router.navigate(['/home']);
  return false;
};