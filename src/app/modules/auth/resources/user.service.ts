import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from 'src/app/modules/auth/resources/auth';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<any> {
    return this.http.get<any>('/api/users');
  }

  getUser(_id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${_id}`);
  }

  removeUser(userId: string): Observable<User> {
    return this.http.put<User>(`/api/users/${userId}/deleted`, {});
  }

  updateUser(
    _id: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    purpose: string,
    birthday: string,
    gender: string,
    coupon: string,
    testScore: any,
    isManager: boolean,
    isSupport: boolean
  ): Observable<User> {
    return this.http.put<User>(`/api/users/${_id}/edit`, {
      firstName,
      lastName,
      email,
      phone,
      purpose,
      birthday,
      gender,
      coupon,
      testScore,
      isManager,
      isSupport,
    });
  }

  updateProfile(
    _id: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone: string,
    purpose: string,
    birthday: string,
    gender: string
  ): Observable<User> {
    return this.http.put<User>(`/api/users/${_id}/profile`, {
      firstName,
      lastName,
      email,
      password,
      phone,
      purpose,
      birthday,
      gender,
    });
  }

  updateUserTest(
    _id: string,
    test1: string,
    test2: string,
    test3: string,
    test4: string,
    test5: string
  ): Observable<User> {
    return this.http.put<User>(`/api/users/${_id}/test`, {
      test1,
      test2,
      test3,
      test4,
      test5,
    });
  }

  updateUserCoupon(_id: string, coupon: string): Observable<User> {
    return this.http.put<User>(`/api/users/${_id}/coupon`, {
      coupon,
    });
  }

  updateTestScore(_id: string, testScore: number): Observable<User> {
    return this.http.put<User>(`/api/users/${_id}/testscore`, {
      testScore,
    });
  }

  resetPassword(_id: string): Observable<User> {
    return this.http.put<User>(`/api/users/${_id}/resetpassword`, {});
  }

  addToCart(
    _id: string,
    item: any,
    qty: number,
    warranty: string,
    gift: string,
    extra1: string,
    extra2: string
  ): Observable<User> {
    return this.http.put<User>(`/api/users/${_id}`, {
      item,
      qty,
      warranty,
      gift,
      extra1,
      extra2,
    });
  }

  removeFromCart(_id: string, item: any): Observable<User> {
    return this.http.put<User>(`/api/users/${_id}/remove`, { item });
  }
}
