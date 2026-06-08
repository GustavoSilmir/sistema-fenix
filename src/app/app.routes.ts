import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AdminComponent } from './pages/admin/admin.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Se o link estiver vazio, manda direto para o Login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  
  // 🔒 A rota admin está protegida pelo nosso Guarda!
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  
  // Se digitar qualquer coisa errada, joga de volta pro login
  { path: '**', redirectTo: 'login' }
];