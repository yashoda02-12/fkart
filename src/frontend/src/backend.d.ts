import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
    email: string;
}
export interface ProductInput {
    name: string;
    description: string;
    stock: bigint;
    imageUrl: string;
    category: string;
    price: number;
}
export interface ShippingAddress {
    zip: string;
    street: string;
    country: string;
    city: string;
    state: string;
}
export interface OrderItem {
    name: string;
    productId: bigint;
    quantity: bigint;
    price: number;
}
export interface Order {
    id: bigint;
    status: string;
    userId: Principal;
    createdAt: bigint;
    shippingAddress: ShippingAddress;
    items: Array<OrderItem>;
    totalPrice: number;
}
export interface Review {
    id: bigint;
    userName: string;
    userId: Principal;
    createdAt: bigint;
    productId: bigint;
    comment: string;
    rating: bigint;
}
export interface Product {
    id: bigint;
    name: string;
    createdAt: bigint;
    numReviews: bigint;
    description: string;
    stock: bigint;
    imageUrl: string;
    category: string;
    rating: number;
    price: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addReview(productId: bigint, rating: bigint, comment: string, userName: string): Promise<void>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    createProduct(product: ProductInput): Promise<bigint>;
    deleteProduct(id: bigint): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<{
        productId: bigint;
        quantity: bigint;
    }>>;
    getMyOrders(): Promise<Array<Order>>;
    getOrder(orderId: bigint): Promise<Order>;
    getProduct(id: bigint): Promise<Product>;
    getProductReviews(productId: bigint): Promise<Array<Review>>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(items: Array<OrderItem>, totalPrice: number, shippingAddress: ShippingAddress): Promise<bigint>;
    removeFromCart(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(searchTerm: string): Promise<Array<Product>>;
    sortProductsByPrice(): Promise<Array<Product>>;
    sortProductsByRating(): Promise<Array<Product>>;
    updateCartQuantity(productId: bigint, quantity: bigint): Promise<void>;
    updateOrderStatus(orderId: bigint, status: string): Promise<void>;
    updateProduct(id: bigint, product: ProductInput): Promise<void>;
}
