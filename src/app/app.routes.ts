import { Routes } from '@angular/router';
import {LoginComponent} from '../../src/app/components/auth/login/login.component';
import {RegisterComponent} from '../../src/app/components/auth/register/register.component';
import {HomeComponent} from '../../src/app/components/home/home.component';
import {InventoryComponent} from '../../src/app/components/inventory/inventory.component';
import {EditarItemComponent} from '../../src/app/editar-item/editar-item.component';
import {CarritoComponent} from '../../src/app/components/carrito/carrito.component';
import {VerifyEmailComponent} from '../../src/app/components/verify-email/verify-email.component';
import {UserManagementComponent} from '../../src/app/components/user-management/user-management.component';
import {OrderListComponent} from '../../src/app/components/order-list/order-list.component';

export const routes: Routes = [ 
    { path: 'login', component: LoginComponent }, // Login
    { path: 'register', component: RegisterComponent }, // Registro+
    { path: 'home', component: HomeComponent },
    { path: 'inventory', component: InventoryComponent },
    { path: 'inventory/edit/:id', component: EditarItemComponent },
    { path: 'cart', component: CarritoComponent },
    { path: 'verify-email', component: VerifyEmailComponent },
    { path: 'users', component: UserManagementComponent },
    { path: 'orders', component: OrderListComponent },
    { path: '', redirectTo: '/inventory', pathMatch: 'full' },
    
];
