import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromAuth from 'src/app/modules/auth/state/auth.reducer';

export const selectAuthState = createFeatureSelector<fromAuth.State>(
  fromAuth.authFeatureKey
);

export interface AuthLinksViewModal {
  isLoggedIn: boolean;
  _id: any;
  firstName: string;
  email: string;
  isAdmin: boolean;
  isManager: boolean;
  isSupport: boolean;
  isPrime: boolean;
  isFranchise: boolean;
  coupon: string;
}

export const selectIsLoggedIn = createSelector(
  selectAuthState,
  (state: fromAuth.State): boolean => state.user != null
);

export const selectID = createSelector(
  selectAuthState,
  (state: fromAuth.State): any => state.user != null && state.user._id
);

export const selectName = createSelector(
  selectAuthState,
  (state: fromAuth.State): any => state.user != null && state.user.firstName
);

export const selectEmail = createSelector(
  selectAuthState,
  (state: fromAuth.State): any => state.user != null && state.user.email
);

export const selectIsAdmin = createSelector(
  selectAuthState,
  (state: fromAuth.State): boolean => state.user != null && state.user.isAdmin
);

export const selectIsManager = createSelector(
  selectAuthState,
  (state: fromAuth.State): boolean => state.user != null && state.user.isManager
);

export const selectIsSupport = createSelector(
  selectAuthState,
  (state: fromAuth.State): boolean => state.user != null && state.user.isSupport
);

export const selectIsPrime = createSelector(
  selectAuthState,
  (state: fromAuth.State): boolean => state.user != null && state.user.isPrime
);

export const selectIsFranchise = createSelector(
  selectAuthState,
  (state: fromAuth.State): boolean =>
    state.user != null && state.user.isFranchise
);

export const selectCoupon = createSelector(
  selectAuthState,
  (state: fromAuth.State): any => state.user != null && state.user.coupon
);

export const selectAuthLinksViewModel = createSelector(
  selectIsLoggedIn,
  selectID,
  selectName,
  selectEmail,
  selectIsAdmin,
  selectIsManager,
  selectIsSupport,
  selectIsPrime,
  selectIsFranchise,
  selectCoupon,
  (
    isLoggedIn: boolean,
    _id: any,
    firstName: string,
    email: string,
    isAdmin: boolean,
    isManager: boolean,
    isSupport: boolean,
    isPrime: boolean,
    isFranchise: boolean,
    coupon: string
  ): AuthLinksViewModal => {
    return {
      isLoggedIn: isLoggedIn,
      _id: _id,
      firstName: firstName,
      email: email,
      isAdmin: isAdmin,
      isManager: isManager,
      isSupport: isSupport,
      isPrime: isPrime,
      isFranchise: isFranchise,
      coupon: coupon,
    };
  }
);
