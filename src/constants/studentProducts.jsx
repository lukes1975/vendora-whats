import { Electronics, Fashion, jobseekers, Mobile, Product1, Product10, Product2, Product3, Product4, Product5, Product6 } from "../assets";

export const studentProducts = [
  {
    id: 0,
    name: "iPhone 13 Pro Max",
    price: 180000,
    qty: 1,
    category: "electronics",
    cover: Product1,
    vendor: {
      id: 1,
      name: "John Doe",
      location: "Hostel A, Block 2",
      contact: "+234 801 234 5678",
      cover: jobseekers,
      subaccount: "SUB_ACC_xxxx",
      rating: 4.9,
      reviews: 24
    },
    desc: "Excellent condition iPhone 13 Pro Max, 256GB storage. Used for 6 months, no scratches, comes with original charger and box.",
  },
  {
    id: 1,
    name: "Calculus Textbook",
    price: 3500,
    qty: 1,
    category: "books",
    cover: Product2,
    vendor: {
      id: 2,
      name: "Sarah M.",
      location: "Hostel B, Room 15",
      contact: "+234 802 345 6789",
      cover: jobseekers,
      subaccount: "123",
      rating: 4.8,
      reviews: 12
    },
    desc: "Calculus textbook by Stewart, 7th edition. Barely used, no highlighting or notes inside.",
  },
  {
    id: 2,
    name: "Nike Air Force 1",
    price: 25000,
    qty: 1,
    category: "fashion",
    cover: Product3,
    vendor: {
      id: 3,
      name: "Mike T.",
      location: "Off-campus",
      contact: "+234 803 456 7890",
      cover: jobseekers,
      subaccount: "3456",
      rating: 4.7,
      reviews: 18
    },
    desc: "White Nike Air Force 1, size 42. Worn only a few times, still looks brand new.",
  },
  {
    id: 3,
    name: "Pizza Delivery",
    price: 2500,
    qty: 1,
    category: "food",
    cover: Product4,
    vendor: {
      id: 4,
      name: "Campus Kitchen",
      location: "Food Court",
      contact: "+234 804 567 8901",
      cover: jobseekers,
      subaccount: "7890",
      rating: 4.9,
      reviews: 45
    },
    desc: "Fresh pizza delivery to your hostel. Pepperoni, Margherita, or BBQ Chicken available.",
  },
  {
    id: 4,
    name: "Laptop Stand",
    price: 8000,
    qty: 1,
    category: "electronics",
    cover: Product5,
    vendor: {
      id: 5,
      name: "Tech Store",
      location: "Student Center",
      contact: "+234 805 678 9012",
      cover: jobseekers,
      subaccount: "9012",
      rating: 4.6,
      reviews: 8
    },
    desc: "Adjustable aluminum laptop stand. Perfect for studying and working from home.",
  },
  {
    id: 5,
    name: "Chemistry Lab Coat",
    price: 4500,
    qty: 1,
    category: "fashion",
    cover: Product6,
    vendor: {
      id: 6,
      name: "Lab Supplies",
      location: "Science Block",
      contact: "+234 806 789 0123",
      cover: jobseekers,
      subaccount: "0123",
      rating: 4.5,
      reviews: 15
    },
    desc: "White lab coat, size M. Clean and ready for chemistry lab sessions.",
  },
  {
    id: 6,
    name: "Programming Book",
    price: 5000,
    qty: 1,
    category: "books",
    cover: Product10,
    vendor: {
      id: 7,
      name: "Code Master",
      location: "Computer Lab",
      contact: "+234 807 890 1234",
      cover: jobseekers,
      subaccount: "1234",
      rating: 4.8,
      reviews: 22
    },
    desc: "Clean Code by Robert Martin. Essential for computer science students.",
  },
  {
    id: 7,
    name: "Jollof Rice",
    price: 1500,
    qty: 1,
    category: "food",
    cover: Product1,
    vendor: {
      id: 8,
      name: "Mama's Kitchen",
      location: "Hostel C",
      contact: "+234 808 901 2345",
      cover: jobseekers,
      subaccount: "2345",
      rating: 4.9,
      reviews: 67
    },
    desc: "Homemade jollof rice with chicken. Delivered hot to your room.",
  }
];

export const categories = [
  { name: "Electronics", icon: "📱", count: 45 },
  { name: "Fashion", icon: "👕", count: 32 },
  { name: "Books", icon: "📚", count: 78 },
  { name: "Food", icon: "🍕", count: 23 },
  { name: "Home & Living", icon: "🏠", count: 19 },
  { name: "Sports", icon: "⚽", count: 15 }
];

export const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" }
];
