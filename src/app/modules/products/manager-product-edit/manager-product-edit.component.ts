import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { faArrowLeft, faEdit } from '@fortawesome/free-solid-svg-icons';

import { AppState } from 'src/app/store';
import { ProductService } from 'src/app/modules/products/resources/product.service';
import * as fromProductActions from 'src/app/modules/products/state/product.actions';

@Component({
  selector: 'app-manager-product-edit',
  templateUrl: './manager-product-edit.component.html',
  styleUrls: ['./manager-product-edit.component.scss'],
})
export class ManagerProductEditComponent implements OnInit {
  model: any = {};
  productId: any;
  faArrowLeft = faArrowLeft;
  faEdit = faEdit;

  constructor(
    private service: ProductService,
    private route: ActivatedRoute,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.service
      .getProduct(this.productId)
      .subscribe((product) => (this.model = product));
  }

  onSubmit() {
    this.store.dispatch(
      fromProductActions.updateManagerProduct({
        id: this.productId,
        name: this.model.name,
        brand: this.model.brand,
        category: this.model.category,
        description: this.model.description,
        pricePurchase: this.model.pricePurchase,
        price: this.model.price,
        quantity: this.model.quantity,
        extra: this.model.extra,
        imageUrl: this.model.imageUrl,
        modifiedBy: 'Manager',
      })
    );
  }
}
