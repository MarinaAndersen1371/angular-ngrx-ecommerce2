import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { NgxSpinnerService } from 'ngx-spinner';
import { tap } from 'rxjs/operators';

import * as fromAuthActions from 'src/app/modules/auth/state/auth.actions';
import * as fromCustomerSupportActions from 'src/app/pages/customer-support/state/customer-support.actions';
import * as fromMailActions from 'src/app/modules/mails/state/mail.actions';
import * as fromOrderActions from 'src/app/modules/orders/state/order.actions';
import * as fromProductActions from 'src/app/modules/products/state/product.actions';
import * as fromTicketActions from 'src/app/pages/customer-support/state/ticket.actions';
import * as fromUserActions from 'src/app/modules/auth/state/user.actions';

@Injectable()
export class SpinnerEffects {
  spinneron$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          fromAuthActions.loginPage,
          fromAuthActions.registerPage,
          fromCustomerSupportActions.sendMessage,
          fromMailActions.loadMails,
          fromMailActions.loadMail,
          fromOrderActions.loadMyOrders,
          fromOrderActions.loadAdminOrders,
          fromOrderActions.loadManagerOrders,
          fromOrderActions.loadSupportOrders,
          fromOrderActions.loadOrder,
          fromOrderActions.loadAdminOrder,
          fromOrderActions.loadManagerOrder,
          fromOrderActions.loadSupportOrder,
          fromProductActions.loadProducts,
          fromProductActions.loadAdminProducts,
          fromProductActions.loadManagerProducts,
          fromProductActions.loadFranchiseProducts,
          fromProductActions.loadProduct,
          fromProductActions.loadAdminProduct,
          fromProductActions.loadManagerProduct,
          fromProductActions.loadFranchiseProduct,
          fromProductActions.addProduct,
          fromProductActions.addManagerProduct,
          fromTicketActions.loadTickets,
          fromTicketActions.loadManagerTickets,
          fromTicketActions.loadTicket,
          fromTicketActions.loadManagerTicket,
          fromUserActions.loadUsers,
          fromUserActions.loadManagerUsers,
          fromUserActions.loadUser,
          fromUserActions.loadProfile,
          fromUserActions.loadManagerUser,
          fromUserActions.addToCart
        ),
        tap(() => this.spinner.show())
      ),
    { dispatch: false }
  );

  spinneroff$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          fromAuthActions.loginSuccess,
          fromAuthActions.loginFailure,
          fromAuthActions.registerSuccess,
          fromAuthActions.registerFailure,
          fromProductActions.loadProductsFailure,
          fromProductActions.loadProductsSuccess,
          fromProductActions.loadProductFailure,
          fromProductActions.loadProductSuccess,
          fromProductActions.addProductSuccess,
          fromProductActions.addProductFailure,
          fromCustomerSupportActions.sendMessageSuccess,
          fromCustomerSupportActions.sendMessageFailure,
          fromTicketActions.loadTicketsSuccess,
          fromTicketActions.loadTicketsFailure,
          fromTicketActions.loadTicketSuccess,
          fromTicketActions.loadTicketFailure,
          fromUserActions.loadUsersSuccess,
          fromUserActions.loadUsersFailure,
          fromUserActions.loadUserSuccess,
          fromUserActions.loadUserFailure,
          fromUserActions.addToCartSuccess,
          fromUserActions.addToCartFailure,
          fromOrderActions.loadOrdersSuccess,
          fromOrderActions.loadOrdersFailure,
          fromOrderActions.loadOrderSuccess,
          fromOrderActions.loadOrderFailure,
          fromMailActions.loadMailsSuccess,
          fromMailActions.loadMailsFailure,
          fromMailActions.loadMailSuccess,
          fromMailActions.loadMailFailure
        ),
        tap(() => {
          this.spinner.hide();
        })
      ),
    { dispatch: false }
  );

  constructor(private actions$: Actions, private spinner: NgxSpinnerService) {}
}
