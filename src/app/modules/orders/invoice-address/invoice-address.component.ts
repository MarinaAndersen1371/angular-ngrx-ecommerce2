import { Component, OnInit, Input } from '@angular/core';
import { Order } from 'src/app/modules/orders/resources/orders';

@Component({
  selector: 'app-invoice-address',
  templateUrl: './invoice-address.component.html',
  styleUrls: ['./invoice-address.component.scss'],
})
export class InvoiceAddressComponent implements OnInit {
  constructor() {}
  @Input() name!: string;
  @Input() address!: string;
  @Input() postalCode!: string;
  @Input() city!: string;
  @Input() country!: string;

  ngOnInit(): void {}
}
