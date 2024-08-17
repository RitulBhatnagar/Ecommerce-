export interface AddToCartDto {
  productId: string;
  quantity: number;
}

export interface CheckoutDto {
  shippingAddress: string;
}
