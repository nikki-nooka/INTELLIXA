export function getCuratedResourcesForModule(category: string, title: string, topics: string[], index: number) {
  const textToScan = (title + " " + topics.join(" ")).toLowerCase();
  const isCpp = textToScan.includes("c++") || textToScan.includes("cpp");

  let youtubeVideos = [
    {
      title: "Data Structures Easy to Advanced Course - freeCodeCamp",
      url: "https://www.youtube.com/watch?v=RBSGKlAvoiM",
      duration: "8:03:17"
    },
    {
      title: "MyCodeSchool Data Structures Tutorial Playlist",
      url: "https://www.youtube.com/playlist?list=PL2_aWCzGMAwI3W_AddKK56Rx5kAOk3Yg7",
      duration: "14:22:00"
    }
  ];

  let leetcodeProblems: { title: string; url: string; difficulty: "Easy" | "Medium" | "Hard" }[] = [
    {
      title: "Two Sum",
      url: "https://leetcode.com/problems/two-sum/",
      difficulty: "Easy"
    },
    {
      title: "Reverse Linked List",
      url: "https://leetcode.com/problems/reverse-linked-list/",
      difficulty: "Easy"
    }
  ];

  let curatedContent = [
    "What is the difference between stack and heap memory, and how does it relate to pointers in C++?",
    "How does a hash collision occur, and what are the major ways to handle it?",
    "Explain the time and space complexity of QuickSort in worst and best cases."
  ];

  let industryUseCases = [
    {
      company: "Google",
      useCase: "Google utilizes custom prefix trees (Tries) inside search bar inputs to provide autocomplete suggestions in microseconds.",
      justification: "Using a Trie limits the search runtime complexity strictly to the length of the query word, bypassing database index scans."
    },
    {
      company: "Facebook",
      useCase: "Facebook structures its massive user relationships using Graph adjacency databases and traverses them with modified BFS models.",
      justification: "This facilitates extremely high-speed checks for degrees of connection, friend recommendations, and feed relevance scores."
    }
  ];

  // 1. DATA STRUCTURES & ALGORITHMS (DSA)
  if (category === "dsa") {
    if (textToScan.includes("graph") || textToScan.includes("dfs") || textToScan.includes("bfs") || textToScan.includes("shortest path") || textToScan.includes("dijkstra")) {
      youtubeVideos = isCpp ? [
        { title: "Graph Algorithms in C++ Tutorial - Striver", url: "https://www.youtube.com/playlist?list=PLgUwDviBHe0oE3gWYUMfTjgpY5YRJgqx1", duration: "12:15:00" },
        { title: "Dijkstra's Algorithm in C++ - Abdul Bari", url: "https://www.youtube.com/watch?v=XB4MIexjvY0", duration: "25:40" }
      ] : [
        { title: "Graph Algorithms for Technical Interviews - freeCodeCamp", url: "https://www.youtube.com/watch?v=tWVWeQqKl9k", duration: "2:15:30" },
        { title: "Dijkstra's Shortest Path Algorithm Explained - Abdul Bari", url: "https://www.youtube.com/watch?v=XB4MIexjvY0", duration: "25:40" }
      ];
      leetcodeProblems = [
        { title: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands/", difficulty: "Medium" },
        { title: "Network Delay Time", url: "https://leetcode.com/problems/network-delay-time/", difficulty: "Medium" }
      ];
      curatedContent = [
        "Compare Depth-First Search (DFS) and Breadth-First Search (BFS) in terms of space complexity.",
        "Explain the greedy choice property of Dijkstra's algorithm and why it fails with negative edge weights.",
        "How do you detect a cycle in a directed graph using DFS and recursion stacks?"
      ];
      industryUseCases = [
        { company: "Uber", useCase: "Uber utilizes Dijkstra and A* pathfinding search variations on massive road graphs to route passenger cabs in real-time.", justification: "Determines mathematically optimal pathways while factoring in live traffic weights." },
        { company: "LinkedIn", useCase: "LinkedIn structures members as graph vertices and runs multi-level BFS queries to calculate connection degrees.", justification: "Enables instant rendering of 1st, 2nd, and 3rd-degree social labels alongside listings." }
      ];
    } else if (textToScan.includes("dynamic programming") || textToScan.includes("dp") || textToScan.includes("memoization") || textToScan.includes("tabulation")) {
      youtubeVideos = isCpp ? [
        { title: "Dynamic Programming in C++ Playlist - Striver", url: "https://www.youtube.com/playlist?list=PLgUwDviBHe0qSgV78K_bS_hcoT4A82gdy", duration: "15:30:00" },
        { title: "DP Knapsack Problem Tutorial - Abdul Bari", url: "https://www.youtube.com/watch?v=nLmhmB6NygM", duration: "28:10" }
      ] : [
        { title: "Dynamic Programming - Learn to Solve Algorithmic Challenges - freeCodeCamp", url: "https://www.youtube.com/watch?v=oBt53YbR9K0", duration: "5:10:00" },
        { title: "Memoization and Tabulation - Striver DP Playlist Lecture 1", url: "https://www.youtube.com/watch?v=tyB0ySGQy94", duration: "28:15" }
      ];
      leetcodeProblems = [
        { title: "Climbing Stairs", url: "https://leetcode.com/problems/climbing-stairs/", difficulty: "Easy" },
        { title: "Coin Change", url: "https://leetcode.com/problems/coin-change/", difficulty: "Medium" }
      ];
      curatedContent = [
        "What is the difference between top-down memoization and bottom-up tabulation in dynamic programming?",
        "Explain the overlapping subproblems property and show how it applies to Fibonacci calculation.",
        "How do you solve the 0/1 Knapsack problem with Dynamic Programming, and what is its time complexity?"
      ];
      industryUseCases = [
        { company: "Google", useCase: "Google utilizes custom alignment Dynamic Programming models (like Needleman-Wunsch) to match DNA sequences and language strings.", justification: "Guarantees mathematically exact matches by calculating cost matrices of gaps, insertions, and substitutions." },
        { company: "Git", useCase: "Git uses the Longest Common Subsequence (LCS) dynamic programming model to calculate code diffs between commits.", justification: "Computes the exact minimal set of insertions and deletions necessary to transition files." }
      ];
    } else if (textToScan.includes("tree") || textToScan.includes("bst") || textToScan.includes("heap") || textToScan.includes("traversal")) {
      youtubeVideos = isCpp ? [
        { title: "Binary Tree & BST Series in C++ - Striver", url: "https://www.youtube.com/playlist?list=PLgUwDviBHe0qUxs8U8SF80Gg8pW255XvK", duration: "8:45:00" },
        { title: "Heaps and Priority Queue in C++ - Abdul Bari", url: "https://www.youtube.com/watch?v=H5JubkIy_p8", duration: "32:10" }
      ] : [
        { title: "Binary Tree Algorithms for Technical Interviews - freeCodeCamp", url: "https://www.youtube.com/watch?v=fAAZixBzIAI", duration: "1:45:00" },
        { title: "Binary Search Trees Explained - Abdul Bari", url: "https://www.youtube.com/watch?v=H5JubkIy_p8", duration: "32:10" }
      ];
      leetcodeProblems = [
        { title: "Validate Binary Search Tree", url: "https://leetcode.com/problems/validate-binary-search-tree/", difficulty: "Medium" },
        { title: "Kth Largest Element in an Array", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", difficulty: "Medium" }
      ];
      curatedContent = [
        "Explain the differences in time complexity between searching a balanced BST vs an unbalanced skewed tree.",
        "How does a Min-Heap insert an element, and what is the time complexity of the bubble-up process?",
        "Describe the iterative approach for pre-order traversal of a binary tree using an explicit stack."
      ];
      industryUseCases = [
        { company: "Google", useCase: "Google Cloud Spanner implements B-Trees to index and arrange distributed database partitions on disk storage blocks.", justification: "Minimizes disk read actions by maintaining high node branching factor." },
        { company: "MySQL", useCase: "MySQL's InnoDB database engine organizes index trees as B+ Trees where all data resides in leaf nodes.", justification: "Facilitates highly efficient sequential range scans on secondary indices." }
      ];
    } else if (textToScan.includes("linear") || textToScan.includes("list") || textToScan.includes("stack") || textToScan.includes("queue") || textToScan.includes("hash") || textToScan.includes("collision") || textToScan.includes("array")) {
      youtubeVideos = isCpp ? [
        { title: "Linked List Implementation in C++ - Love Babbar", url: "https://www.youtube.com/watch?v=q8gdBn9RPeI", duration: "1:15:30" },
        { title: "Stack & Queue Implementation in C++ - Striver", url: "https://www.youtube.com/watch?v=mJW57CdAsdg", duration: "45:20" }
      ] : [
        { title: "Linked Lists Explained - MyCodeSchool", url: "https://www.youtube.com/watch?v=NobHlGUj66Y", duration: "18:45" },
        { title: "Data Structures: Stacks and Queues - MyCodeSchool", url: "https://www.youtube.com/watch?v=F1MSMBGWb9Y", duration: "15:20" }
      ];
      leetcodeProblems = [
        { title: "Reverse Linked List", url: "https://leetcode.com/problems/reverse-linked-list/", difficulty: "Easy" },
        { title: "Linked List Cycle", url: "https://leetcode.com/problems/linked-list-cycle/", difficulty: "Easy" }
      ];
      curatedContent = [
        "How do you reverse a linked list in-place? Write the pointer manipulation logic.",
        "Explain how a stack can be implemented using two queues, and compare its efficiency.",
        "What are hash collisions, and how do separate chaining and open addressing resolve them?"
      ];
      industryUseCases = [
        { company: "Netflix", useCase: "Netflix structures its internal playback buffer system using circular queues to cache upcoming media segments in-memory.", justification: "Provides constant-time O(1) read/write performance to prevent frame buffering interruptions." },
        { company: "Redis", useCase: "Redis utilizes high-performance hashtables with dynamic incremental rehashing routines to support millions of key lookups.", justification: "Guarantees absolute O(1) average lookup latency for enterprise caching architectures." }
      ];
    } else if (textToScan.includes("sorting") || textToScan.includes("searching") || textToScan.includes("binary search") || textToScan.includes("recursion") || textToScan.includes("backtracking")) {
      youtubeVideos = isCpp ? [
        { title: "Binary Search Playlist in C++ - Striver", url: "https://www.youtube.com/playlist?list=PLgUwDviBHe0oFuxuPxM0La74NIDTf3183", duration: "6:20:00" },
        { title: "Recursion & Backtracking in C++ - Love Babbar", url: "https://www.youtube.com/watch?v=vETHS6Z9GNo", duration: "55:40" }
      ] : [
        { title: "Merge Sort vs Quick Sort - MyCodeSchool", url: "https://www.youtube.com/watch?v=COk73Cg8g0Y", duration: "19:10" },
        { title: "Binary Search Tutorial - freeCodeCamp", url: "https://www.youtube.com/watch?v=fDKIpRe8GW4", duration: "18:30" }
      ];
      leetcodeProblems = [
        { title: "Binary Search", url: "https://leetcode.com/problems/binary-search/", difficulty: "Easy" },
        { title: "Merge k Sorted Lists", url: "https://leetcode.com/problems/merge-k-sorted-lists/", difficulty: "Hard" }
      ];
      curatedContent = [
        "Why is QuickSort's worst-case time complexity O(N^2), and how can randomized pivot selection mitigate this?",
        "Write a recursive binary search function in C++ and state its recurrence relation.",
        "Explain how backtracking works using the N-Queens problem as a primary example."
      ];
      industryUseCases = [
        { company: "Amazon", useCase: "Amazon uses highly optimized heap sorting and divide-and-conquer algorithms to paginate and rank catalog items by price.", justification: "Allows constant-memory O(1) extra space overhead and O(N log K) sorting speeds." },
        { company: "Spotify", useCase: "Spotify uses quick-select and binary-search matching to filter playlist indices dynamically when users search fields.", justification: "Provides sub-millisecond search query evaluation on thousands of track records cached in local client memory." }
      ];
    } else {
      // Default / Syntax / C++
      youtubeVideos = [
        { title: "C++ Programming Course for Beginners - freeCodeCamp", url: "https://www.youtube.com/watch?v=vLnPwxZdW4Y", duration: "4:07:05" },
        { title: "C++ Standard Template Library (STL) Complete Guide - Luv", url: "https://www.youtube.com/watch?v=zBh79uD3gI0", duration: "25:12" }
      ];
      leetcodeProblems = [
        { title: "Valid Parentheses", url: "https://leetcode.com/problems/valid-parentheses/", difficulty: "Easy" },
        { title: "Merge Sorted Array", url: "https://leetcode.com/problems/merge-sorted-array/", difficulty: "Easy" }
      ];
      curatedContent = [
        "Explain RAII in C++ and how smart pointers (unique_ptr, shared_ptr) prevent memory leaks.",
        "What is the difference between passing by value, passing by pointer, and passing by reference in C++?",
        "How are virtual functions and vtables used to implement polymorphism in C++?"
      ];
      industryUseCases = [
        { company: "Adobe", useCase: "Adobe constructs Photoshop core graphic pipelines in C++ utilizing strict manual memory allocation and smart pointers.", justification: "Avoiding garbage collectors ensures perfect frame execution consistency without periodic background collection pauses." },
        { company: "Microsoft", useCase: "Microsoft utilizes modern C++ templates and STL map optimizations inside the Windows OS file index systems.", justification: "Guarantees direct access to hardware-level operations and maximum performance density on restricted chip registers." }
      ];
    }
  }

  // 2. FULLSTACK PATHWAY
  else if (category === "fullstack") {
    const isFrontend = textToScan.includes("front") || textToScan.includes("react") || textToScan.includes("html") || textToScan.includes("css") || textToScan.includes("ui") || textToScan.includes("design");
    const isDb = textToScan.includes("database") || textToScan.includes("sql") || textToScan.includes("nosql") || textToScan.includes("query") || textToScan.includes("postgre") || textToScan.includes("mongo");
    const isArch = textToScan.includes("architecture") || textToScan.includes("system") || textToScan.includes("scaling") || textToScan.includes("microservice") || textToScan.includes("cache") || textToScan.includes("redis");

    if (isFrontend) {
      if (index % 2 === 0) {
        youtubeVideos = [
          { title: "React JS Full Course for Beginners - freeCodeCamp", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", duration: "11:55:00" },
          { title: "Tailwind CSS Tutorial for Beginners - Net Ninja", url: "https://www.youtube.com/watch?v=mr15Xzb1Ook", duration: "2:45:00" }
        ];
        leetcodeProblems = [
          { title: "Two Sum", url: "https://leetcode.com/problems/two-sum/", difficulty: "Easy" },
          { title: "Valid Parentheses", url: "https://leetcode.com/problems/valid-parentheses/", difficulty: "Easy" }
        ];
        curatedContent = [
          "Explain Event Delegation in JavaScript and how it leverages event bubbling.",
          "What is the difference between CSS Flexbox and CSS Grid, and when would you use each?",
          "How do you optimize React rendering performance using useMemo, useCallback, and React.memo?"
        ];
        industryUseCases = [
          { company: "Meta", useCase: "Meta utilizes React's Concurrent Rendering fiber engine to deliver ultra-fast updates in the Facebook newsfeed.", justification: "Decouples heavy background computations from UI state updates, maintaining steady 60fps." },
          { company: "Vercel", useCase: "Vercel deploys Next.js frameworks with Incremental Static Regeneration (ISR) to cache and update server-side web pages.", justification: "Provides fast initial page loads while keeping dynamic landing content fresh." }
        ];
      } else {
        youtubeVideos = [
          { title: "HTML & CSS Full Course for Beginners - freeCodeCamp", url: "https://www.youtube.com/watch?v=mU6an7qYJ-Y", duration: "11:30:00" },
          { title: "JavaScript Programming Full Course - freeCodeCamp", url: "https://www.youtube.com/watch?v=PkZNo7MFNFg", duration: "7:05:00" }
        ];
        leetcodeProblems = [
          { title: "Spiral Matrix", url: "https://leetcode.com/problems/spiral-matrix/", difficulty: "Medium" },
          { title: "Container With Most Water", url: "https://leetcode.com/problems/container-with-most-water/", difficulty: "Medium" }
        ];
        curatedContent = [
          "What is the difference between the Virtual DOM and Shadow DOM in React?",
          "Explain the rule of React hooks, and why you cannot call hooks conditionally.",
          "How does the browser event loop handle asynchronous tasks like Promises vs setTimeouts?"
        ];
        industryUseCases = [
          { company: "Airbnb", useCase: "Airbnb uses responsive Flexbox layouts and server-driven UI systems to support multi-platform vacation searches.", justification: "Ensures seamless rendering on low-end mobile devices and wide desktop displays." },
          { company: "Stripe", useCase: "Stripe develops their checkout interfaces with precise media-query breakpoints and GPU-accelerated transition animations.", justification: "Maximizes checkout completion rates by providing an premium tactile feel." }
        ];
      }
    } else if (isDb) {
      youtubeVideos = [
        { title: "SQL Tutorial - Full Database Course for Beginners - freeCodeCamp", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY", duration: "4:20:00" },
        { title: "NoSQL Databases Explained - IBM Technology", url: "https://www.youtube.com/watch?v=qI_g07C_Q5I", duration: "16:45" }
      ];
      leetcodeProblems = [
        { title: "Second Highest Salary", url: "https://leetcode.com/problems/second-highest-salary/", difficulty: "Easy" },
        { title: "Nth Highest Salary", url: "https://leetcode.com/problems/nth-highest-salary/", difficulty: "Medium" }
      ];
      curatedContent = [
        "Explain database transaction properties (ACID) and how they are guaranteed in SQL engines.",
        "When should you use a Relational Database (PostgreSQL) versus a Document Database (MongoDB)?",
        "What are database indexes, how do they speed up SELECT queries, and what is their cost on INSERT operations?"
      ];
      industryUseCases = [
        { company: "Uber", useCase: "Uber manages massive geo-spatial trip records using PostgreSQL clusters with optimized spatial indexing.", justification: "Ensures atomic accuracy for trip calculations and perfect integrity for passenger billing." },
        { company: "Stripe", useCase: "Stripe uses relational databases with strict serializable transactions to coordinate global ledger transfers.", justification: "Avoids any possibility of double-spending or data loss in highly concurrent ledger balances." }
      ];
    } else if (isArch) {
      youtubeVideos = [
        { title: "System Design Course for Beginners - freeCodeCamp", url: "https://www.youtube.com/watch?v=S82C3tD7VqU", duration: "1:15:00" },
        { title: "How to Design a System at Scale - ByteByteGo", url: "https://www.youtube.com/watch?v=i53Gi_K397I", duration: "15:40" }
      ];
      leetcodeProblems = [
        { title: "LRU Cache", url: "https://leetcode.com/problems/lru-cache/", difficulty: "Medium" },
        { title: "Design Twitter", url: "https://leetcode.com/problems/design-twitter/", difficulty: "Medium" }
      ];
      curatedContent = [
        "What is horizontal scaling versus vertical scaling, and how does a load balancer distribute traffic?",
        "Explain how consistent hashing prevents cache stampedes and distributes key-value loads evenly.",
        "How does a content delivery network (CDN) accelerate asset delivery globally?"
      ];
      industryUseCases = [
        { company: "Twitter", useCase: "Twitter stores and serves user timeline requests from globally replicated Redis clusters.", justification: "Reduces API latency from seconds to milliseconds by bypassing disk lookups entirely." },
        { company: "Slack", useCase: "Slack uses distributed message queues and pub/sub routing to stream real-time chat alerts to millions of connected teams.", justification: "Ensures chat events are delivered in order with sub-100ms lag times." }
      ];
    } else {
      // Backend general / Node / Express
      youtubeVideos = [
        { title: "Node.js and Express.js Full Course - freeCodeCamp", url: "https://www.youtube.com/watch?v=Oe421EPjeBE", duration: "8:15:00" },
        { title: "REST APIs for Beginners - Design and Best Practices - ByteByteGo", url: "https://www.youtube.com/watch?v=-MTSQjw5DrM", duration: "18:30" }
      ];
      leetcodeProblems = [
        { title: "Design Underground System", url: "https://leetcode.com/problems/design-underground-system/", difficulty: "Medium" },
        { title: "Encode and Decode TinyURL", url: "https://leetcode.com/problems/encode-and-decode-tinyurl/", difficulty: "Medium" }
      ];
      curatedContent = [
        "How does the Node.js single-threaded event loop handle thousands of concurrent file-system or network queries?",
        "What is the difference between REST, GraphQL, and gRPC APIs, and what are their respective trade-offs?",
        "Explain how token-based authentication (JWT) works and how to protect against token leakage."
      ];
      industryUseCases = [
        { company: "Netflix", useCase: "Netflix utilizes Node.js API gateways to route, aggregate, and authenticate client requests across thousands of backend microservices.", justification: "Leverages Node's non-blocking network I/O model to process billions of api requests with low memory." },
        { company: "PayPal", useCase: "PayPal migrated their backend routing layers from Java to Node.js to streamline development and speed up response times.", justification: "Consolidated development on a single programming language and halved startup cold-start latencies." }
      ];
    }
  }

  // 3. CYBER SECURITY PATHWAY
  else if (category === "security") {
    const isCrypto = textToScan.includes("crypto") || textToScan.includes("hash") || textToScan.includes("encrypt") || textToScan.includes("auth") || textToScan.includes("token");
    const isAppSec = textToScan.includes("web") || textToScan.includes("vuln") || textToScan.includes("owasp") || textToScan.includes("inject") || textToScan.includes("xss") || textToScan.includes("csrf") || textToScan.includes("pentest");

    if (isCrypto) {
      youtubeVideos = [
        { title: "Hashing vs Encryption - Simply Explained", url: "https://www.youtube.com/watch?v=N63MIdzR7pI", duration: "12:15" },
        { title: "OAuth 2.0 and OpenID Connect Explained", url: "https://www.youtube.com/watch?v=996OiexHze0", duration: "18:40" }
      ];
      leetcodeProblems = [
        { title: "Encode and Decode TinyURL", url: "https://leetcode.com/problems/encode-and-decode-tinyurl/", difficulty: "Medium" },
        { title: "Decrypt String Mapping", url: "https://leetcode.com/problems/decrypt-string-from-alphabet-to-integer-mapping/", difficulty: "Easy" }
      ];
      curatedContent = [
        "Explain the fundamental difference between Symmetric and Asymmetric cryptography, giving real examples.",
        "What is salt in password hashing, and why does salting protect against rainbow table attacks?",
        "How does SSL/TLS handshake establish a secure, encrypted HTTPS tunnel?"
      ];
      industryUseCases = [
        { company: "Stripe", useCase: "Stripe secures credit cards using AES-256 encryption at rest inside isolated PCI-DSS vaults.", justification: "Ensures that even if database records are leaked, transaction secrets remain unreadable." },
        { company: "Okta", useCase: "Okta coordinates single-sign-on (SSO) configurations across thousands of enterprise portals using OAuth 2.0.", justification: "Allows secure user authentication without ever exposing account passwords." }
      ];
    } else if (isAppSec) {
      youtubeVideos = [
        { title: "Web Application Penetration Testing Tutorial - freeCodeCamp", url: "https://www.youtube.com/watch?v=2_SAtS_vSno", duration: "10:15:00" },
        { title: "OWASP Top 10 Vulnerabilities Explained", url: "https://www.youtube.com/watch?v=3jL76vFOnbA", duration: "22:15" }
      ];
      leetcodeProblems = [
        { title: "Valid Parentheses", url: "https://leetcode.com/problems/valid-parentheses/", difficulty: "Easy" },
        { title: "Strictly Palindromic Number", url: "https://leetcode.com/problems/strictly-palindromic-number/", difficulty: "Medium" }
      ];
      curatedContent = [
        "What is SQL Injection (SQLi), and how do parameterized queries completely prevent it?",
        "Describe the difference between Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).",
        "How does CORS (Cross-Origin Resource Sharing) protect web applications from malicious scripts?"
      ];
      industryUseCases = [
        { company: "Netflix", useCase: "Netflix implements strict input validations and parameterized ORM layers to neutralize SQL injection.", justification: "Protects millions of customer records and subscription information from data leaks." },
        { company: "GitHub", useCase: "GitHub forces secure anti-CSRF token verification on all form submissions and session updates.", justification: "Blocks malicious external web pages from taking unauthorized actions." }
      ];
    } else {
      // General Intro & Networking Security
      youtubeVideos = [
        { title: "Cyber Security Full Course for Beginners - freeCodeCamp", url: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", duration: "11:45:00" },
        { title: "CompTIA Security+ Full Course - Professor Messer", url: "https://www.youtube.com/watch?v=9g0_H6_S1BY", duration: "14:30:00" }
      ];
      leetcodeProblems = [
        { title: "Validate IP Address", url: "https://leetcode.com/problems/validate-ip-address/", difficulty: "Medium" },
        { title: "IP to CIDR", url: "https://leetcode.com/problemset/all/?search=ip-to-cidr", difficulty: "Medium" }
      ];
      curatedContent = [
        "Explain the 3-way handshake of TCP/IP protocol and how a SYN Flood attack exploits it.",
        "What is the OSI model, and at which layer do Firewalls and Routers operate?",
        "How do you perform packet inspection using Wireshark to locate cleartext credentials?"
      ];
      industryUseCases = [
        { company: "Cloudflare", useCase: "Cloudflare filters DNS and TCP traffic at the network edge to mitigate high-volume DDoS floods.", justification: "Shields downstream client origin nodes from traffic saturation, preserving system availability." },
        { company: "Cisco", useCase: "Cisco deploys adaptive firewalls inside corporate networks to continuously audit and block unauthorized port probes.", justification: "Maintains a secure perimeter to prevent corporate system intrusions." }
      ];
    }
  }

  // 4. DATA SCIENCE & AI PATHWAY
  else if (category === "data") {
    const isMl = textToScan.includes("machine learning") || textToScan.includes("ml") || textToScan.includes("regression") || textToScan.includes("classification") || textToScan.includes("gradient");
    const isDeep = textToScan.includes("deep") || textToScan.includes("neural") || textToScan.includes("pytorch") || textToScan.includes("tensorflow") || textToScan.includes("llm") || textToScan.includes("generative") || textToScan.includes("transformer");

    if (isMl) {
      youtubeVideos = [
        { title: "Machine Learning Course for Beginners - freeCodeCamp", url: "https://www.youtube.com/watch?v=GwIo3gToTSM", duration: "8:45:00" },
        { title: "Linear Regression & Gradient Descent Explained", url: "https://www.youtube.com/watch?v=sDv4f4s2SB8", duration: "15:20" }
      ];
      leetcodeProblems = [
        { title: "K Closest Points to Origin", url: "https://leetcode.com/problems/k-closest-points-to-origin/", difficulty: "Medium" },
        { title: "Find K Pairs with Smallest Sums", url: "https://leetcode.com/problems/find-k-pairs-with-smallest-sums/", difficulty: "Medium" }
      ];
      curatedContent = [
        "What is the bias-variance trade-off, and how does regularization (L1/L2) help prevent overfitting?",
        "Explain the difference between supervised and unsupervised machine learning algorithms.",
        "How does the Gradient Descent optimization routine work to minimize loss functions?"
      ];
      industryUseCases = [
        { company: "Netflix", useCase: "Netflix ranks movie listings on user home pages using regression-based collaborative filtering engines.", justification: "Delivers highly personalized recommendations to keep viewer engagement high." },
        { company: "Stripe", useCase: "Stripe runs real-time classification models to detect and block fraudulent credit card transactions during purchase pipelines.", justification: "Protects online merchants from chargebacks and credit card processing fraud." }
      ];
    } else if (isDeep) {
      youtubeVideos = [
        { title: "But what is a neural network? - 3Blue1Brown", url: "https://www.youtube.com/watch?v=aircAruvnKk", duration: "20:10" },
        { title: "Large Language Models (LLMs) Explained - 3Blue1Brown", url: "https://www.youtube.com/watch?v=wjZofJX0v4M", duration: "28:15" }
      ];
      leetcodeProblems = [
        { title: "Implement Trie (Prefix Tree)", url: "https://leetcode.com/problems/implement-trie-prefix-tree/", difficulty: "Medium" },
        { title: "Word Search II", url: "https://leetcode.com/problems/word-search-ii/", difficulty: "Hard" }
      ];
      curatedContent = [
        "What is backpropagation in neural networks, and how does the chain rule of calculus compute gradients?",
        "Explain the vanishing gradient problem, and how do activation functions like ReLU or GELU mitigate it?",
        "Describe the core structural block of a Transformer network and how self-attention weights are calculated."
      ];
      industryUseCases = [
        { company: "Tesla", useCase: "Tesla runs multi-layered convolutional neural networks on custom onboard processors to segment camera frames in real-time.", justification: "Provides sub-millisecond lane detection and obstacle recognition for safe operations." },
        { company: "Google", useCase: "Google Search utilizes Transformer models like BERT to parse and understand natural language query intent.", justification: "Provides highly accurate search results by understanding contextual relationships between words." }
      ];
    } else {
      // Intro / Pandas / Analysis
      youtubeVideos = [
        { title: "Python for Data Science - Course for Beginners - freeCodeCamp", url: "https://www.youtube.com/watch?v=LHBEI3L3OD8", duration: "12:00:00" },
        { title: "Pandas Tutorial - Data Analysis with Python", url: "https://www.youtube.com/watch?v=vmEHCJofslg", duration: "1:40:00" }
      ];
      leetcodeProblems = [
        { title: "Median of Two Sorted Arrays", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/", difficulty: "Hard" },
        { title: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals/", difficulty: "Medium" }
      ];
      curatedContent = [
        "Explain the difference between Series and DataFrame structures in Python's Pandas library.",
        "How do you treat missing or null values inside a massive data analysis dataframe?",
        "What are SQL Window Functions, and how do they help with continuous data aggregation?"
      ];
      industryUseCases = [
        { company: "Airbnb", useCase: "Airbnb processes millions of active listings with Pandas and Spark dataframes to determine dynamic price tiers.", justification: "Enables host accounts to maximize bookings while adapting to real-time city metrics." },
        { company: "Walmart", useCase: "Walmart utilizes high-performance SQL analytic databases to trace product inventory fluctuations across retail branches.", justification: "Avoids inventory depletion by predicting supply-chain demand cycles." }
      ];
    }
  }

  // 5. CLOUD ENGINEERING & DEVOPS PATHWAY
  else if (category === "cloud") {
    const isIac = textToScan.includes("terraform") || textToScan.includes("ansible") || textToScan.includes("iac") || textToScan.includes("pipeline") || textToScan.includes("ci") || textToScan.includes("cd");
    const isK8s = textToScan.includes("k8s") || textToScan.includes("kubernetes") || textToScan.includes("docker") || textToScan.includes("container");

    if (isIac) {
      youtubeVideos = [
        { title: "Terraform Course for Beginners - freeCodeCamp", url: "https://www.youtube.com/watch?v=SLB_c_ayR98", duration: "2:30:00" },
        { title: "DevOps CI/CD Pipelines Explained", url: "https://www.youtube.com/watch?v=scEDHsr3APg", duration: "15:40" }
      ];
      leetcodeProblems = [
        { title: "Min Stack", url: "https://leetcode.com/problems/min-stack/", difficulty: "Easy" },
        { title: "Logger Rate Limiter", url: "https://leetcode.com/problemset/all/?search=logger-rate-limiter", difficulty: "Easy" }
      ];
      curatedContent = [
        "What is Infrastructure as Code (IaC), and why is state-file management critical in Terraform?",
        "Describe the difference between continuous integration (CI) and continuous delivery (CD).",
        "How do you securely manage environment secrets (like API keys) in modern automated pipelines?"
      ];
      industryUseCases = [
        { company: "HashiCorp", useCase: "HashiCorp uses Terraform to declare, provision, and version multi-cloud enterprise networks.", justification: "Prevents drift in network configurations and guarantees highly repeatable topology setups." },
        { company: "GitLab", useCase: "GitLab executes automatic linting and testing runners on every single code commit.", justification: "Verifies deployment safety before code changes reach production clusters." }
      ];
    } else if (isK8s) {
      youtubeVideos = [
        { title: "Kubernetes Tutorial for Beginners [FULL COURSE] - TechWorld with Nana", url: "https://www.youtube.com/watch?v=X48VuDVv0do", duration: "4:10:00" },
        { title: "Docker Containers Deep Dive", url: "https://www.youtube.com/watch?v=gAkwW2tuIqE", duration: "32:15" }
      ];
      leetcodeProblems = [
        { title: "Queue Reconstruction by Height", url: "https://leetcode.com/problems/queue-reconstruction-by-height/", difficulty: "Medium" },
        { title: "Task Scheduler", url: "https://leetcode.com/problems/task-scheduler/", difficulty: "Medium" }
      ];
      curatedContent = [
        "What is the difference between a virtual machine hypervisor and a lightweight container engine?",
        "Explain the core concepts of Kubernetes: Pods, Services, Deployments, and Ingress.",
        "How does a Kubernetes cluster perform self-healing and handle replica-set failures?"
      ];
      industryUseCases = [
        { company: "Niantic", useCase: "Niantic scheduled pokemon container loads globally on Google Kubernetes Engine (GKE).", justification: "Scaled game-server pods automatically to handle unpredictable surges in millions of concurrent players." },
        { company: "Box", useCase: "Box migrated their bare-metal server monoliths into microservices hosted in Kubernetes clusters.", justification: "Improved developer shipment velocity and halved hardware computing requirements." }
      ];
    } else {
      // General Cloud Intro / Providers
      youtubeVideos = [
        { title: "AWS Certified Cloud Practitioner Training Course - freeCodeCamp", url: "https://www.youtube.com/watch?v=SOTamWNgDKc", duration: "13:10:00" },
        { title: "Google Cloud Platform (GCP) Fundamentals - freeCodeCamp", url: "https://www.youtube.com/watch?v=jpNs0Lg9R4k", duration: "6:20:00" }
      ];
      leetcodeProblems = [
        { title: "Design Underground System", url: "https://leetcode.com/problems/design-underground-system/", difficulty: "Medium" },
        { title: "Web Crawler Multithreaded", url: "https://leetcode.com/problems/web-crawler-multithreaded/", difficulty: "Medium" }
      ];
      curatedContent = [
        "What is the difference between IaaS, PaaS, and SaaS cloud delivery models?",
        "How do Virtual Private Clouds (VPC) isolate network traffic, and what are public vs private subnets?",
        "Explain how cloud load balancers achieve high availability and manage auto-scaling triggers."
      ];
      industryUseCases = [
        { company: "Netflix", useCase: "Netflix hosts their massive content streaming catalog entirely inside AWS virtual machine clusters.", justification: "Leverages cloud scale to dynamically allocate thousands of stream-delivery instances during peak viewing hours." },
        { company: "Spotify", useCase: "Spotify manages millions of audio assets inside secure Google Cloud Storage buckets.", justification: "Guarantees global fast delivery of audio tracks with sub-100ms request latencies." }
      ];
    }
  }

  // 6. UI/UX DESIGN & FIGMA PATHWAY
  else if (category === "design") {
    if (index % 2 === 0) {
      youtubeVideos = [
        { title: "UI / UX Design Tutorial for Beginners - freeCodeCamp", url: "https://www.youtube.com/watch?v=c9Wg6Ry_YWI", duration: "3:45:00" },
        { title: "Figma UI Design Tutorial: Get Started in 20 Minutes", url: "https://www.youtube.com/watch?v=FTFaQWZBqA8", duration: "20:00" }
      ];
      leetcodeProblems = [
        { title: "Container With Most Water", url: "https://leetcode.com/problems/container-with-most-water/", difficulty: "Medium" },
        { title: "Max Area of Island", url: "https://leetcode.com/problems/max-area-of-island/", difficulty: "Medium" }
      ];
      curatedContent = [
        "What is the difference between User Interface (UI) design and User Experience (UX) design?",
        "Explain the core Gestalt Principles of visual design and how they apply to layout hierarchy.",
        "How do you conduct effective user interviews to isolate usability friction?"
      ];
      industryUseCases = [
        { company: "Google", useCase: "Google applies the Material Design system to standardise visual interfaces across mobile and web.", justification: "Ensures users feel immediate familiarity across different Google application suites." },
        { company: "Apple", useCase: "Apple strictly enforces their Human Interface Guidelines (HIG) across the iOS application store.", justification: "Ensures third-party apps look and feel native, delivering cohesive user navigation." }
      ];
    } else {
      youtubeVideos = [
        { title: "How To Build A Design System in Figma", url: "https://www.youtube.com/watch?v=zZ9b0-wI_Lw", duration: "45:10" },
        { title: "Micro-Animations & Interaction Design Best Practices", url: "https://www.youtube.com/watch?v=E_P-sN72v-o", duration: "18:30" }
      ];
      leetcodeProblems = [
        { title: "Spiral Matrix", url: "https://leetcode.com/problems/spiral-matrix/", difficulty: "Medium" },
        { title: "Valid Sudoku", url: "https://leetcode.com/problems/valid-sudoku/", difficulty: "Medium" }
      ];
      curatedContent = [
        "What is a Design System, and why is atomic design methodology useful?",
        "How do micro-interactions and animations guide user focus and reduce cognitive load?",
        "Explain the difference between low-fidelity wireframes and high-fidelity interactive prototypes."
      ];
      industryUseCases = [
        { company: "Spotify", useCase: "Spotify maintains a unified design system (Encore) to power player controls on web, desktop, and smart TVs.", justification: "Guarantees brand and functional layout consistency across dozens of engineering platforms." },
        { company: "Duolingo", useCase: "Duolingo designs colorful game-like interactions and micro-animations for user feedback when lessons are completed.", justification: "Triggers dopamine releases that dramatically boost daily student app retention." }
      ];
    }
  }

  // 7. PRODUCT MANAGEMENT PATHWAY
  else if (category === "product") {
    if (index % 2 === 0) {
      youtubeVideos = [
        { title: "Introduction to Product Management - Harvard Business School", url: "https://www.youtube.com/watch?v=SWe7p_S6Tsc", duration: "24:15" },
        { title: "Product Strategy & Vision - Product School", url: "https://www.youtube.com/watch?v=3R-VlR_y82g", duration: "18:40" }
      ];
      leetcodeProblems = [
        { title: "Best Time to Buy and Sell Stock", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", difficulty: "Easy" },
        { title: "Product of Array Except Self", url: "https://leetcode.com/problems/product-of-array-except-self/", difficulty: "Medium" }
      ];
      curatedContent = [
        "What is a Minimum Viable Product (MVP), and how do you prioritize features for initial launch?",
        "How do you define and track North Star Metrics and key product KPIs (e.g. LTV, CAC, Churn)?",
        "Explain the difference between product vision, product strategy, and product roadmap."
      ];
      industryUseCases = [
        { company: "Amazon", useCase: "Amazon utilizes the 'Working Backwards' PM model, drafting press releases before writing code.", justification: "Forces product managers to rigorously define absolute customer value before engineering launch." },
        { company: "LinkedIn", useCase: "LinkedIn runs comprehensive A/B testing on premium upsell layouts to determine optimal metric conversions.", justification: "Backs product modification decisions with solid data-driven customer behavioral insights." }
      ];
    } else {
      youtubeVideos = [
        { title: "Scrum in under 5 minutes", url: "https://www.youtube.com/watch?v=2Vt7Ep0796E", duration: "4:50" },
        { title: "Agile Product Management Explained", url: "https://www.youtube.com/watch?v=v3vL7uN_mrs", duration: "14:20" }
      ];
      leetcodeProblems = [
        { title: "Task Scheduler", url: "https://leetcode.com/problems/task-scheduler/", difficulty: "Medium" },
        { title: "Design Parking System", url: "https://leetcode.com/problems/design-parking-system/", difficulty: "Easy" }
      ];
      curatedContent = [
        "What are Scrum roles, and what are the specific duties of a Product Owner?",
        "How do you manage stakeholder requests and say 'no' without burning relationship bridges?",
        "Explain how story points are estimated, and what velocity represents in sprint planning."
      ];
      industryUseCases = [
        { company: "Spotify", useCase: "Spotify organized its engineering into autonomous cross-functional squads, tribes, and chapters.", justification: "Enables independent product increments without blocking coordination overhead." },
        { company: "Atlassian", useCase: "Atlassian PMs structure their sprint backlogs inside Jira with strict epic and ticket dependencies.", justification: "Visualizes product development velocity and isolates delivery blockers instantly." }
      ];
    }
  }

  // 8. MOBILE DEVELOPMENT PATHWAY
  else if (category === "mobile") {
    if (index % 2 === 0) {
      youtubeVideos = [
        { title: "Android Development for Beginners - Full Course - freeCodeCamp", url: "https://www.youtube.com/watch?v=fis26HlhDII", duration: "11:30:00" },
        { title: "SwiftUI Tutorial for Beginners (2024)", url: "https://www.youtube.com/watch?v=8Xg9_SjO7_g", duration: "3:15:00" }
      ];
      leetcodeProblems = [
        { title: "Min Stack", url: "https://leetcode.com/problems/min-stack/", difficulty: "Easy" },
        { title: "First Bad Version", url: "https://leetcode.com/problems/first-bad-version/", difficulty: "Easy" }
      ];
      curatedContent = [
        "What is the difference between native development and cross-platform mobile development?",
        "Explain the lifecycle of an Android Activity versus an iOS ViewController.",
        "How does responsive layout rendering work in mobile frameworks (like SwiftUI Stacks or Jetpack Compose Columns)?"
      ];
      industryUseCases = [
        { company: "Uber", useCase: "Uber built their native iOS and Android rider applications using unified architectures (RIBs) to coordinate driver tracking.", justification: "Provides sub-second live GPS tracking updates and highly reliable payment authorization." },
        { company: "Instagram", useCase: "Instagram relies heavily on native mobile cache managers to pre-render and play media reels smoothly.", justification: "Prevents stuttering and maximizes feed scroll duration on various phone hardware." }
      ];
    } else {
      youtubeVideos = [
        { title: "Flutter Course for Beginners - freeCodeCamp", url: "https://www.youtube.com/watch?v=VPvVD8t02U8", duration: "37:00:00" },
        { title: "React Native Express Tutorial", url: "https://www.youtube.com/watch?v=gvkqT_qiByM", duration: "1:15:00" }
      ];
      leetcodeProblems = [
        { title: "Design Twitter", url: "https://leetcode.com/problems/design-twitter/", difficulty: "Medium" },
        { title: "Valid Parentheses", url: "https://leetcode.com/problems/valid-parentheses/", difficulty: "Easy" }
      ];
      curatedContent = [
        "Explain how the Flutter rendering engine draws widgets onto a canvas, bypassing native components.",
        "What is the JavaScript Bridge in React Native, and how does the new architecture (Fabric) improve it?",
        "How do you securely store user preferences and auth tokens on mobile devices (SecureStore / EncryptedSharedPreferences)?"
      ];
      industryUseCases = [
        { company: "Google", useCase: "Google manages the Google Pay mobile application entirely using a unified Flutter codebase.", justification: "Saves half of development cost by writing a single code repository that deploys on both iOS and Android simultaneously." },
        { company: "Shopify", useCase: "Shopify shifted their primary mobile development to React Native to share business logic across web and mobile.", justification: "Accelerated shipment velocity and unified frontend developer skillsets across teams." }
      ];
    }
  }

  return {
    youtubeVideos,
    leetcodeProblems,
    curatedContent,
    industryUseCases
  };
}
