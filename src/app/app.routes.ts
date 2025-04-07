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
import {ProductsComponent} from '../../src/app/components/products/products.component';
import {PaymentComponent} from '../../src/app/components/payment/payment.component';

import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [ 
    { path: 'login', component: LoginComponent }, // Login
    { path: 'register', component: RegisterComponent }, // Registro
    { path: 'home', component: HomeComponent },   
    
    //Super usuarios
    { path: 'users', component: UserManagementComponent, canActivate: [RoleGuard], data: { expectedRoles: ['admin', 'superuser'] } },
    
    //admin    
    { path: 'inventory', component: InventoryComponent, canActivate: [RoleGuard], data: { expectedRoles: ['admin', 'superuser'] } },
    { path: 'orders', component: OrderListComponent, canActivate: [RoleGuard], data: { expectedRoles: ['admin', 'superuser'] } },    
    { path: 'inventory/edit/:id', component: EditarItemComponent, canActivate: [RoleGuard], data: { expectedRoles: ['admin', 'superuser'] } },

    //usuarios
    { path: 'products', component: ProductsComponent },
    { path: 'cart', component: CarritoComponent, canActivate: [RoleGuard], data: { expectedRoles: ['admin', 'superuser', 'user'] } },
    { path: 'pay', component: PaymentComponent, canActivate: [RoleGuard], data: { expectedRoles: ['admin', 'superuser', 'user'] } },



    { path: '', redirectTo: '/inventory', pathMatch: 'full' },
];
