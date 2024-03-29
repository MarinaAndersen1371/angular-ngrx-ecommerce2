import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { User } from './auth';

@Injectable({
  providedIn: 'root',
})
export class SupportGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const user: User | null = JSON.parse(localStorage.getItem('user') || '');

    if (!user || !user.isSupport) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    return true;
  }
}
