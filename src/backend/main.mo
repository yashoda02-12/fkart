import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public type UserProfile = {
    name : Text;
    email : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Types and State
  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    imageUrl : Text;
    stock : Nat;
    rating : Float;
    numReviews : Nat;
    createdAt : Int;
  };

  type ProductInput = {
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    imageUrl : Text;
    stock : Nat;
  };

  let products = Map.empty<Nat, Product>();
  var nextProductId = 1;

  module Product {
    public func compareRating(p1 : Product, p2 : Product) : Order.Order {
      Float.compare(p2.rating, p1.rating);
    };

    public func comparePrice(p1 : Product, p2 : Product) : Order.Order {
      Float.compare(p1.price, p2.price);
    };
  };

  // Product Management (Admin-only for create/update/delete)
  public shared ({ caller }) func createProduct(product : ProductInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };

    let productId = nextProductId;
    products.add(productId, {
      id = productId;
      name = product.name;
      description = product.description;
      price = product.price;
      category = product.category;
      imageUrl = product.imageUrl;
      stock = product.stock;
      rating = 0.0;
      numReviews = 0;
      createdAt = Time.now();
    });
    nextProductId += 1;
    productId;
  };

  public shared ({ caller }) func updateProduct(id : Nat, product : ProductInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    switch (products.get(id)) {
      case (null) {
        Runtime.trap("Product not found");
      };
      case (?existingProduct) {
        let updatedProduct = {
          existingProduct with
          name = product.name;
          description = product.description;
          price = product.price;
          category = product.category;
          imageUrl = product.imageUrl;
          stock = product.stock;
        };
        products.add(id, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    let result = products.remove(id);
  };

  // Product queries (accessible to all including guests)
  public query func getProduct(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) {
        Runtime.trap("Product not found");
      };
      case (?product) { product };
    };
  };

  public query func getAllProducts() : async [Product] {
    let iter = products.values();
    iter.toArray();
  };

  public query func getProductsByCategory(category : Text) : async [Product] {
    let iter = products.values();
    let filtered = iter.filter(func(p) { p.category == category });
    filtered.toArray();
  };

  public query func searchProducts(searchTerm : Text) : async [Product] {
    let filtered = products.values().filter(
      func(product) {
        product.name.contains(#text searchTerm);
      }
    );
    filtered.toArray();
  };

  public query func sortProductsByPrice() : async [Product] {
    products.values().toArray().sort(Product.comparePrice);
  };

  public query func sortProductsByRating() : async [Product] {
    products.values().toArray().sort(Product.compareRating);
  };

  // Cart Management (User-only)
  let cartState = Map.empty<Principal, List.List<{ productId : Nat; quantity : Nat }>>();

  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    let existingCart = switch (cartState.get(caller)) {
      case (null) { List.empty<{ productId : Nat; quantity : Nat }>() };
      case (?cart) { cart };
    };

    let cartList = existingCart;
    cartList.add<{ productId : Nat; quantity : Nat }>({ productId; quantity });
    cartState.add(caller, cartList);
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };

    switch (cartState.get(caller)) {
      case (null) { () };
      case (?cart) {
        let filtered = cart.filter(func(item) { item.productId != productId });
        cartState.add(caller, filtered);
      };
    };
  };

  public shared ({ caller }) func updateCartQuantity(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cart");
    };

    switch (cartState.get(caller)) {
      case (null) { () };
      case (?cart) {
        let mapped = cart.map<{ productId : Nat; quantity : Nat }, { productId : Nat; quantity : Nat }>(
          func(item) {
            if (item.productId == productId) {
              { productId; quantity };
            } else {
              item;
            };
          }
        );
        cartState.add(caller, mapped);
      };
    };
  };

  public query ({ caller }) func getCart() : async [{ productId : Nat; quantity : Nat }] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    switch (cartState.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };

    cartState.remove(caller);
  };

  // Order Management
  type OrderItem = {
    productId : Nat;
    quantity : Nat;
    price : Float;
    name : Text;
  };

  type ShippingAddress = {
    street : Text;
    city : Text;
    state : Text;
    zip : Text;
    country : Text;
  };

  public type Order = {
    id : Nat;
    userId : Principal;
    items : [OrderItem];
    totalPrice : Float;
    status : Text;
    shippingAddress : ShippingAddress;
    createdAt : Int;
  };

  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 1;

  public shared ({ caller }) func placeOrder(items : [OrderItem], totalPrice : Float, shippingAddress : ShippingAddress) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let orderId = nextOrderId;
    let newOrder : Order = {
      id = orderId;
      userId = caller;
      items;
      totalPrice;
      status = "pending";
      shippingAddress;
      createdAt = Time.now();
    };

    orders.add(orderId, newOrder);
    nextOrderId += 1;
    cartState.remove(caller);
    orderId;
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    let iter = orders.values();
    let filtered = iter.filter(func(order) { order.userId == caller });
    filtered.toArray();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };

    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        let updatedOrder = { order with status };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        // Users can only view their own orders, admins can view all
        if (order.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  // Review and Rating System
  public type Review = {
    id : Nat;
    productId : Nat;
    userId : Principal;
    userName : Text;
    rating : Nat;
    comment : Text;
    createdAt : Int;
  };

  let reviews = Map.empty<Nat, List.List<Review>>();
  var nextReviewId = 1;

  public shared ({ caller }) func addReview(productId : Nat, rating : Nat, comment : Text, userName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add reviews");
    };

    let newReview : Review = {
      id = nextReviewId;
      productId;
      userId = caller;
      userName;
      rating;
      comment;
      createdAt = Time.now();
    };

    if (not products.containsKey(productId)) {
      Runtime.trap("Product not found");
    };

    let product = switch (products.get(productId)) {
      case (null) {
        Runtime.trap("Product not found");
      };
      case (?product) { product };
    };

    let existingReviews = switch (reviews.get(productId)) {
      case (null) { List.empty<Review>() };
      case (?reviews) { reviews };
    };

    let totalRatings = product.rating * product.numReviews.toFloat() + rating.toFloat();
    let numReviews = product.numReviews + 1;
    let newRating = totalRatings / numReviews.toFloat();

    let updatedProduct = {
      product with
      rating = newRating;
      numReviews;
    };

    products.add(productId, updatedProduct);

    nextReviewId += 1;
    existingReviews.add<Review>(newReview);
    reviews.add(productId, existingReviews);
  };

  public query func getProductReviews(productId : Nat) : async [Review] {
    switch (reviews.get(productId)) {
      case (null) { [] };
      case (?productReviews) { productReviews.toArray() };
    };
  };
};
