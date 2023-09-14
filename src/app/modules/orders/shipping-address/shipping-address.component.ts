import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-shipping-address',
  templateUrl: './shipping-address.component.html',
  styleUrls: ['./shipping-address.component.scss'],
})
export class ShippingAddressComponent implements OnInit {
  constructor() {}

  @Input() name!: string;
  @Input() address!: string;
  @Input() postalCode!: string;
  @Input() city!: string;
  @Input() country!: string;
  @Input() sentAt!: string;
  @Input() deliveredAt!: string;
  @Input() returnReceivedAt!: string;
  @Input() isSent!: boolean;
  @Input() isDelivered!: boolean;
  @Input() returnReceived!: boolean;

  ngOnInit(): void {}
}
