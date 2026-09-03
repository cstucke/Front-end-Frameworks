// ## Part 2 — Modules, Array Methods, async/await, Optional Chaining
// ### Exercise 8 — async/await
// Run this file in the browser console or with Node 18+.

const BASE_URL = "https://jsonplaceholder.typicode.com";

// 1. Write an async function fetchPosts() that:
//    - fetches BASE_URL + "/posts"
//    - parses the JSON response
//    - returns the first 5 items
//    - logs each item's title
async function fetchPosts() {
  try {
    const res = await fetch(BASE_URL + "/posts");
    const data = await res.json();
    const firstFive = data.slice(0, 5);
    firstFive.forEach((post) => console.log(post.title));
    return firstFive;
  } catch (err) {
    console.log("Failed to load posts");
  }
}

// 2. Add try/catch to fetchPosts().
//    If the fetch fails, log "Failed to load posts".

// 3. Write an async function getPostById(id) that:
//    - fetches BASE_URL + "/posts/" + id
//    - throws an Error if res.ok is false
//    - returns the parsed JSON object
async function getPostById(id) {
  const res = await fetch(BASE_URL + "/posts/" + id);
  if (!res.ok) {
    throw new Error(`Post: ${id} Status: ${res.status})`);
  }
  return res.json();
}

// Call getPostById(1) and log the result.
// Call getPostById(99999) — what happens? Handle it.
async function run() {
  try {
    const post = await getPostById(1);
    console.log(post);
  } catch (err) {
    console.log(err.message);
  }

  try {
    const missing = await getPostById(99999);
    console.log(missing);
  } catch (err) {
    console.log(err.message);
  }
}

run();