// ## Part 1 — Variables, Arrow Functions, Destructuring, Spread
// ### Exercise 6 — Spread and Rest

const watchlist = ["Inception", "Interstellar"];
const newMovies = ["Tenet", "Oppenheimer"];

// 1. Create a new array that combines watchlist and newMovies. Do not mutate either.
const combined = [...watchlist, ...newMovies]; // your code here

// 2. Create a new array with "Dune" at the beginning of watchlist. Do not mutate watchlist.
const withDune = ["Dune", ...watchlist];// your code here

// 3. Create a shallow copy of watchlist.
const copy = [...watchlist];// your code here

// 4. Merge these two objects into one new object:
const baseInfo = { title: "Dune", year: 2021 };
const extraInfo = { rating: 8.0, genre: "Sci-Fi" };
const merged = {...baseInfo, ...extraInfo};// your code here

// 5. Create a new object based on baseInfo, but with rating set to 9.0:
const updated = {...baseInfo, rating : 9.0};// your code here

// 6. Write a function logMovies that accepts any number of movie titles and logs each one.
//    Call it with: logMovies("Inception", "Dune", "Tenet")
const logMovies = (...titles) => { titles.forEach((title) => console.log(title))};// your code here

console.log(watchlist);  // ["Inception", "Interstellar"] — should be unchanged
console.log(newMovies);  // ["Tenet", "Oppenheimer"] — should be unchanged
