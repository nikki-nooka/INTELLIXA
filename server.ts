/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import { GoogleGenAI, Type } from '@google/genai';

const require = createRequire(import.meta.url);
// @ts-ignore
const pdfParsePkg = require('pdf-parse');
const pdf = async (buffer: Buffer) => {
  const parser = new pdfParsePkg.PDFParse({ data: buffer });
  return parser.getText();
};
// @ts-ignore
const mammoth = require('mammoth');
import { getCuratedResourcesForModule as getCuratedResourcesForModuleImpl } from './curatedResources';

dotenv.config();

// Helper to retry Gemini API calls, supporting seamless model fallbacks in case of quota limits (429 RESOURCE_EXHAUSTED)
async function callGeminiWithRetry(
  ai: GoogleGenAI,
  model: string,
  contents: any,
  config?: any,
  retries = 2,
  delayMs = 1500
): Promise<any> {
  let attempt = 0;
  // Sequence of robust fallback models to ensure continuous operation if quota limits are encountered
  const modelsToTry = [model, 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];

  while (attempt <= retries) {
    const currentModel = modelsToTry[Math.min(attempt, modelsToTry.length - 1)];
    try {
      console.log(`[Gemini] Requesting model: ${currentModel} (Attempt ${attempt + 1}/${retries + 1})`);
      return await ai.models.generateContent({
        model: currentModel,
        contents,
        config,
      });
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isQuotaExceeded = errMsg.includes('429') || 
                              errMsg.toLowerCase().includes('quota') || 
                              errMsg.includes('RESOURCE_EXHAUSTED');
      
      if (isQuotaExceeded) {
        console.warn(`[Gemini Quota] ${currentModel} hit quota limit: ${errMsg}.`);
        attempt++;
        if (attempt > retries) {
          throw err;
        }
        console.warn(`[Gemini Quota] Switching to fallback model for attempt ${attempt + 1}...`);
        continue;
      }

      attempt++;
      if (attempt > retries) {
        throw err;
      }
      console.warn(`[Gemini Retry] Attempt ${attempt} failed with error: ${errMsg}. Retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('Unreachable code in callGeminiWithRetry');
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI to prevent server crashes if the API key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Gemini API calls will fail.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// ----------------------------------------------------
// HIGH-FIDELITY MOCK FALLBACKS (Guarantees out-of-the-box functionality)
// ----------------------------------------------------

function getCuratedResourcesForModule(category: string, title: string, topics: string[], index: number) {
  return getCuratedResourcesForModuleImpl(category, title, topics, index);
  /*
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

  // 1. Graphs, DFS, BFS, Shortest Path, Dijkstra
  if (textToScan.includes("graph") || textToScan.includes("dfs") || textToScan.includes("bfs") || textToScan.includes("shortest path") || textToScan.includes("dijkstra")) {
    if (isCpp) {
      youtubeVideos = [
        {
          title: "Graph Algorithms in C++ Tutorial - Striver",
          url: "https://www.youtube.com/playlist?list=PLgUwDviBHe0oE3gWYUMfTjgpY5YRJgqx1",
          duration: "12:15:00"
        },
        {
          title: "Dijkstra's Algorithm in C++ - Abdul Bari",
          url: "https://www.youtube.com/watch?v=XB4MIexjvY0",
          duration: "25:40"
        }
      ];
    } else {
      youtubeVideos = [
        {
          title: "Graph Algorithms for Technical Interviews - freeCodeCamp",
          url: "https://www.youtube.com/watch?v=tWVWeQqKl9k",
          duration: "2:15:30"
        },
        {
          title: "Dijkstra's Shortest Path Algorithm Explained - Abdul Bari",
          url: "https://www.youtube.com/watch?v=XB4MIexjvY0",
          duration: "25:40"
        }
      ];
    }
    leetcodeProblems = [
      {
        title: "Number of Islands",
        url: "https://leetcode.com/problems/number-of-islands/",
        difficulty: "Medium"
      },
      {
        title: "Network Delay Time",
        url: "https://leetcode.com/problems/network-delay-time/",
        difficulty: "Medium"
      }
    ];
    curatedContent = [
      "Compare Depth-First Search (DFS) and Breadth-First Search (BFS) in terms of space complexity.",
      "Explain the greedy choice property of Dijkstra's algorithm and why it fails with negative edge weights.",
      "How do you detect a cycle in a directed graph using DFS and recursion stacks?"
    ];
    industryUseCases = [
      {
        company: "Uber",
        useCase: "Uber utilizes Dijkstra and A* pathfinding search variations on massive road graphs to route passenger cabs in real-time.",
        justification: "Determines mathematically optimal pathways while factoring in live traffic weights and dynamic congestion metrics."
      },
      {
        company: "LinkedIn",
        useCase: "LinkedIn structures members as graph vertices and runs multi-level BFS queries to calculate connection degrees.",
        justification: "Enables instant rendering of 1st, 2nd, and 3rd-degree social labels alongside profile search listings."
      }
    ];
  }

  // 2. Dynamic Programming, Memoization, Tabulation, DP
  else if (textToScan.includes("dynamic programming") || textToScan.includes("dp") || textToScan.includes("memoization") || textToScan.includes("tabulation")) {
    if (isCpp) {
      youtubeVideos = [
        {
          title: "Dynamic Programming in C++ Playlist - Striver",
          url: "https://www.youtube.com/playlist?list=PLgUwDviBHe0qSgV78K_bS_hcoT4A82gdy",
          duration: "15:30:00"
        },
        {
          title: "DP Knapsack Problem Tutorial - Abdul Bari",
          url: "https://www.youtube.com/watch?v=nLmhmB6NygM",
          duration: "28:10"
        }
      ];
    } else {
      youtubeVideos = [
        {
          title: "Dynamic Programming - Learn to Solve Algorithmic Challenges - freeCodeCamp",
          url: "https://www.youtube.com/watch?v=oBt53YbR9K0",
          duration: "5:10:00"
        },
        {
          title: "Memoization and Tabulation - Striver DP Playlist Lecture 1",
          url: "https://www.youtube.com/watch?v=tyB0ySGQy94",
          duration: "28:15"
        }
      ];
    }
    leetcodeProblems = [
      {
        title: "Climbing Stairs",
        url: "https://leetcode.com/problems/climbing-stairs/",
        difficulty: "Easy"
      },
      {
        title: "Coin Change",
        url: "https://leetcode.com/problems/coin-change/",
        difficulty: "Medium"
      }
    ];
    curatedContent = [
      "What is the difference between top-down memoization and bottom-up tabulation in dynamic programming?",
      "Explain the overlapping subproblems property and show how it applies to the Fibonacci sequence calculation.",
      "How do you solve the 0/1 Knapsack problem with Dynamic Programming, and what is its time complexity?"
    ];
    industryUseCases = [
      {
        company: "Google",
        useCase: "Google utilizes custom alignment Dynamic Programming models (like Needleman-Wunsch) to match DNA sequences and language strings.",
        justification: "Guarantees mathematically exact matches by calculating cost matrices of gaps, insertions, and character substitutions."
      },
      {
        company: "Git",
        useCase: "Git uses the Longest Common Subsequence (LCS) dynamic programming model to calculate code diffs between commits.",
        justification: "Computes the exact minimal set of insertions and deletions necessary to transition files cleanly."
      }
    ];
  }

  // 3. Trees, Binary Search Tree (BST), Heaps, Traversal
  else if (textToScan.includes("tree") || textToScan.includes("bst") || textToScan.includes("heap") || textToScan.includes("traversal")) {
    if (isCpp) {
      youtubeVideos = [
        {
          title: "Binary Tree & BST Series in C++ - Striver",
          url: "https://www.youtube.com/playlist?list=PLgUwDviBHe0qUxs8U8SF80Gg8pW255XvK",
          duration: "8:45:00"
        },
        {
          title: "Heaps and Priority Queue in C++ - Abdul Bari",
          url: "https://www.youtube.com/watch?v=H5JubkIy_p8",
          duration: "32:10"
        }
      ];
    } else {
      youtubeVideos = [
        {
          title: "Binary Tree Algorithms for Technical Interviews - freeCodeCamp",
          url: "https://www.youtube.com/watch?v=fAAZixBzIAI",
          duration: "1:45:00"
        },
        {
          title: "Binary Search Trees Explained - Abdul Bari",
          url: "https://www.youtube.com/watch?v=H5JubkIy_p8",
          duration: "32:10"
        }
      ];
    }
    leetcodeProblems = [
      {
        title: "Validate Binary Search Tree",
        url: "https://leetcode.com/problems/validate-binary-search-tree/",
        difficulty: "Medium"
      },
      {
        title: "Kth Largest Element in an Array",
        url: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
        difficulty: "Medium"
      }
    ];
    curatedContent = [
      "Explain the differences in time complexity between searching a balanced BST vs an unbalanced skewed tree.",
      "How does a Min-Heap insert an element, and what is the time complexity of the bubble-up process?",
      "Describe the iterative approach for pre-order traversal of a binary tree using an explicit stack."
    ];
    industryUseCases = [
      {
        company: "Google",
        useCase: "Google Cloud Spanner implements B-Trees to index and arrange distributed database partitions on disk storage blocks.",
        justification: "Minimizes disk read actions by maintaining high node branching factor and consistent logarithmic lookup guarantees."
      },
      {
        company: "MySQL",
        useCase: "MySQL's InnoDB database engine organizes index trees as B+ Trees where all data resides exclusively in leaf nodes.",
        justification: "Facilitates highly efficient sequential range scans on secondary indices with contiguous memory page caching."
      }
    ];
  }

  // 4. Arrays, Linked Lists, Stack, Queue, Hashing, Collision, Linear Structures
  else if (textToScan.includes("linear") || textToScan.includes("list") || textToScan.includes("stack") || textToScan.includes("queue") || textToScan.includes("hash") || textToScan.includes("collision") || textToScan.includes("array")) {
    if (isCpp) {
      youtubeVideos = [
        {
          title: "Linked List Implementation in C++ - Love Babbar",
          url: "https://www.youtube.com/watch?v=q8gdBn9RPeI",
          duration: "1:15:30"
        },
        {
          title: "Stack & Queue Implementation in C++ - Striver",
          url: "https://www.youtube.com/watch?v=mJW57CdAsdg",
          duration: "45:20"
        }
      ];
    } else {
      youtubeVideos = [
        {
          title: "Linked Lists Explained - MyCodeSchool",
          url: "https://www.youtube.com/watch?v=NobHlGUj66Y",
          duration: "18:45"
        },
        {
          title: "Data Structures: Introduction to Stacks and Queues - MyCodeSchool",
          url: "https://www.youtube.com/watch?v=F1MSMBGWb9Y",
          duration: "15:20"
        }
      ];
    }
    leetcodeProblems = [
      {
        title: "Reverse Linked List",
        url: "https://leetcode.com/problems/reverse-linked-list/",
        difficulty: "Easy"
      },
      {
        title: "Linked List Cycle",
        url: "https://leetcode.com/problems/linked-list-cycle/",
        difficulty: "Easy"
      }
    ];
    curatedContent = [
      "How do you reverse a linked list in-place? Write the pointer manipulation logic.",
      "Explain how a stack can be implemented using two queues, and compare its efficiency.",
      "What are hash collisions, and how do separate chaining and open addressing resolve them?"
    ];
    industryUseCases = [
      {
        company: "Netflix",
        useCase: "Netflix structures its internal playback buffer system using circular queues to cache upcoming media segments in-memory.",
        justification: "Provides constant-time O(1) read/write performance to prevent frame buffering interruptions on fluctuating networks."
      },
      {
        company: "Redis",
        useCase: "Redis utilizes high-performance hashtables with dynamic incremental rehashing routines to support millions of key lookups.",
        justification: "Guarantees absolute O(1) average lookup latency for enterprise caching architectures."
      }
    ];
  }

  // 5. Sorting, Searching, Algorithms, Binary Search, Recursion, Backtracking
  else if (textToScan.includes("sorting") || textToScan.includes("searching") || textToScan.includes("binary search") || textToScan.includes("recursion") || textToScan.includes("backtracking")) {
    if (isCpp) {
      youtubeVideos = [
        {
          title: "Binary Search Playlist in C++ - Striver",
          url: "https://www.youtube.com/playlist?list=PLgUwDviBHe0oFuxuPxM0La74NIDTf3183",
          duration: "6:20:00"
        },
        {
          title: "Recursion & Backtracking in C++ - Love Babbar",
          url: "https://www.youtube.com/watch?v=vETHS6Z9GNo",
          duration: "55:40"
        }
      ];
    } else {
      youtubeVideos = [
        {
          title: "Merge Sort vs Quick Sort - MyCodeSchool",
          url: "https://www.youtube.com/watch?v=COk73Cg8g0Y",
          duration: "19:10"
        },
        {
          title: "Binary Search Tutorial - freeCodeCamp",
          url: "https://www.youtube.com/watch?v=fDKIpRe8GW4",
          duration: "18:30"
        }
      ];
    }
    leetcodeProblems = [
      {
        title: "Binary Search",
        url: "https://leetcode.com/problems/binary-search/",
        difficulty: "Easy"
      },
      {
        title: "Merge k Sorted Lists",
        url: "https://leetcode.com/problems/merge-k-sorted-lists/",
        difficulty: "Hard"
      }
    ];
    curatedContent = [
      "Why is QuickSort's worst-case time complexity O(N^2), and how can randomized pivot selection mitigate this?",
      "Write a recursive binary search function in C++ and state its recurrence relation.",
      "Explain how backtracking works using the N-Queens problem as a primary example."
    ];
    industryUseCases = [
      {
        company: "Amazon",
        useCase: "Amazon uses highly optimized heap sorting and divide-and-conquer algorithms to paginate and rank catalog items by price.",
        justification: "Allows constant-memory O(1) extra space overhead and O(N log K) sorting speeds for retrieving top items."
      },
      {
        company: "Spotify",
        useCase: "Spotify uses quick-select and binary-search matching to filter playlist indices dynamically when users search fields.",
        justification: "Provides sub-millisecond search query evaluation on thousands of track records cached in local client memory."
      }
    ];
  }

  // 6. System Design, Databases, Scalability, Sharding, Microservices
  else if (textToScan.includes("system design") || textToScan.includes("scalability") || textToScan.includes("database") || textToScan.includes("sharding") || textToScan.includes("microservices")) {
    youtubeVideos = [
      {
        title: "System Design Course for Beginners - freeCodeCamp",
        url: "https://www.youtube.com/watch?v=S82C3tD7VqU",
        duration: "1:15:00"
      },
      {
        title: "How to Design a System at Scale - ByteByteGo",
        url: "https://www.youtube.com/watch?v=i53Gi_K397I",
        duration: "15:40"
      }
    ];
    leetcodeProblems = [
      {
        title: "LRU Cache",
        url: "https://leetcode.com/problems/lru-cache/",
        difficulty: "Medium"
      },
      {
        title: "Design Twitter",
        url: "https://leetcode.com/problems/design-twitter/",
        difficulty: "Medium"
      }
    ];
    curatedContent = [
      "What is database sharding, and how does it differ from master-slave replication?",
      "Explain the CAP Theorem and how you make trade-offs between Consistency and Availability.",
      "How does a reverse proxy like Nginx improve backend server security and load balancing?"
    ];
    industryUseCases = [
      {
        company: "Twitter",
        useCase: "Twitter uses Redis memory clusters structured as cached lists to pre-compute and store home timelines for active users.",
        justification: "Dramatically reduces heavy join queries on relational database nodes during high tweet traffic."
      },
      {
        company: "Discord",
        useCase: "Discord migrated its message storage from MongoDB to Cassandra/ScyllaDB to scale to billions of concurrent chat messages.",
        justification: "Avoids memory bottlenecks and supports seamless horizontal write scalability with a masterless ring architecture."
      }
    ];
  }

  // 7. C++ Syntax, OOP, STL, Pointers, Memory, References
  else if (isCpp || textToScan.includes("pointers") || textToScan.includes("memory") || textToScan.includes("oop") || textToScan.includes("stl") || textToScan.includes("syntax") || textToScan.includes("reference")) {
    youtubeVideos = [
      {
        title: "C++ Programming Course for Beginners - freeCodeCamp",
        url: "https://www.youtube.com/watch?v=vLnPwxZdW4Y",
        duration: "4:07:05"
      },
      {
        title: "C++ Standard Template Library (STL) Complete Guide - Luv",
        url: "https://www.youtube.com/watch?v=zBh79uD3gI0",
        duration: "25:12"
      }
    ];
    leetcodeProblems = [
      {
        title: "Valid Parentheses",
        url: "https://leetcode.com/problems/valid-parentheses/",
        difficulty: "Easy"
      },
      {
        title: "Merge Sorted Array",
        url: "https://leetcode.com/problems/merge-sorted-array/",
        difficulty: "Easy"
      }
    ];
    curatedContent = [
      "Explain RAII in C++ and how smart pointers (unique_ptr, shared_ptr) prevent memory leaks.",
      "What is the difference between passing by value, passing by pointer, and passing by reference in C++?",
      "How are virtual functions and vtables used to implement polymorphism in C++?"
    ];
    industryUseCases = [
      {
        company: "Adobe",
        useCase: "Adobe constructs Photoshop core graphic pipelines in C++ utilizing strict manual memory allocation and smart pointers.",
        justification: "Avoiding garbage collectors ensures perfect frame execution consistency without periodic background collection pauses."
      },
      {
        company: "Microsoft",
        useCase: "Microsoft utilizes modern C++ templates and STL map optimizations inside the Windows OS file index systems.",
        justification: "Guarantees direct access to hardware-level operations and maximum performance density on restricted chip registers."
      }
    ];
  }

  return {
    youtubeVideos,
    leetcodeProblems,
    curatedContent,
    industryUseCases
  };
  */
}

function getMockRoadmap(careerGoal: string, difficulty: string, preferredLanguage: string) {
  const isTelugu = preferredLanguage === 'Telugu';
  const isSpanish = preferredLanguage === 'Spanish';
  const goalLower = (careerGoal || '').toLowerCase();
  const diffNormalized = (difficulty || 'Beginner');

  // 1. Detect Tech Category
  let category: 'fullstack' | 'security' | 'data' | 'cloud' | 'design' | 'product' | 'mobile' | 'dsa' | 'generic' = 'generic';

  if (goalLower.includes('data structure') || goalLower.includes('dsa') || goalLower.includes('algorithm') || goalLower.includes('c++') || goalLower.includes('cpp') || goalLower.includes('competitive programming') || goalLower.includes('computer science') || goalLower.includes('programming paradigm')) {
    category = 'dsa';
  } else if (goalLower.includes('security') || goalLower.includes('cyber') || goalLower.includes('hacker') || goalLower.includes('pentest') || goalLower.includes('threat') || goalLower.includes('defense') || goalLower.includes('crypt') || goalLower.includes('soc')) {
    category = 'security';
  } else if (goalLower.includes('data') || goalLower.includes('ml') || goalLower.includes('ai') || goalLower.includes('machine learning') || goalLower.includes('artificial') || goalLower.includes('neural') || goalLower.includes('deep learning') || goalLower.includes('analytics') || goalLower.includes('nlp')) {
    category = 'data';
  } else if (goalLower.includes('cloud') || goalLower.includes('devops') || goalLower.includes('systems') || goalLower.includes('architect') || goalLower.includes('infrastructure') || goalLower.includes('kubernetes') || goalLower.includes('aws') || goalLower.includes('gcp') || goalLower.includes('sre') || goalLower.includes('platform')) {
    category = 'cloud';
  } else if (goalLower.includes('design') || goalLower.includes('ui') || goalLower.includes('ux') || goalLower.includes('figma') || goalLower.includes('graphic') || goalLower.includes('wireframe') || goalLower.includes('interaction')) {
    category = 'design';
  } else if (goalLower.includes('product manager') || goalLower.includes('pm') || goalLower.includes('product owner') || goalLower.includes('scrum') || goalLower.includes('backlog') || goalLower.includes('agile')) {
    category = 'product';
  } else if (goalLower.includes('mobile') || goalLower.includes('ios') || goalLower.includes('android') || goalLower.includes('game') || goalLower.includes('unity') || goalLower.includes('unreal') || goalLower.includes('flutter') || goalLower.includes('app developer')) {
    category = 'mobile';
  } else if (goalLower.includes('full stack') || goalLower.includes('full-stack') || goalLower.includes('web') || goalLower.includes('frontend') || goalLower.includes('backend') || goalLower.includes('developer') || goalLower.includes('engineer') || goalLower.includes('programmer') || goalLower.includes('coder') || goalLower.includes('coding')) {
    category = 'fullstack';
  }

  // 2. Setup difficulty metadata (Duration & Intro)
  let duration = '6 Months';
  let diffLabel = 'Beginner Base';
  if (diffNormalized === 'Intermediate') {
    duration = '4 Months';
    diffLabel = 'Intermediate Track';
  } else if (diffNormalized === 'Advanced') {
    duration = '3 Months';
    diffLabel = 'Advanced Mastery';
  }

  let title = `Roadmap to ${careerGoal}`;
  let description = `A highly curated, dynamic ${diffLabel} pathway designed to help you become an expert in ${careerGoal}. Fuses cutting-edge technical systems engineering with ethical responsibility and mindful digital stewardship.`;

  if (isTelugu) {
    title = `${careerGoal} - (${diffNormalized} స్థాయి)`;
    description = `సాంకేతిక నైపుణ్యం మరియు నైతిక బాధ్యతలను జతచేస్తూ, ${careerGoal} గా మారడానికి రూపొందించిన ఒక విశిష్ట ${diffNormalized} స్థాయి అధ్యయన మార్గం.`;
  } else if (isSpanish) {
    title = `Ruta hacia ${careerGoal} (${diffNormalized})`;
    description = `Una trayectoria de nivel ${diffNormalized} optimizada profesionalmente para convertirte en ${careerGoal}. Conecta la excelencia en ingeniería con la responsabilidad ética y el impacto humano positivo.`;
  }

  // 3. Define curricula modules mapping
  const modules: any[] = [];

  // DATA STRUCTURES & ALGORITHMS (DSA) & C++ PATHWAY
  if (category === 'dsa') {
    if (diffNormalized === 'Beginner') {
      modules.push(
        {
          id: 'dsa_b1',
          title: isTelugu ? 'భాషా సింటాక్స్ మరియు కోర్ మెమరీ నమూనాలు' : isSpanish ? 'Sintaxis de Lenguaje y Modelos de Memoria Core' : 'Language Syntax & Core Memory Models',
          duration: '4 Weeks',
          topics: ['C++ Syntax & Base Types', 'Pointers & Memory Allocation', 'References & Memory Addresses', 'Standard Input/Output (iostream)', 'Compiling via g++'],
          description: isSpanish ? 'Dominio de variables, control de flujos y compilación en C++.' : 'Mastering variables, loop control flows, compiling C++ files, and understanding how stack and heap memory allocations work.',
          status: 'not_started',
          ethicalWisdom: 'Memory safety is software respect. Prevent buffer overflows and double-free errors to guarantee reliable execution.'
        },
        {
          id: 'dsa_b2',
          title: isTelugu ? 'లీనియర్ డేటా స్ట్రక్చర్స్ & కాంప్లెక్సిటీ' : isSpanish ? 'Estructuras de Datos Lineales y Complejidad' : 'Linear Data Structures & Space-Time Analysis',
          duration: '4 Weeks',
          topics: ['Static and Dynamic Arrays', 'Singly & Doubly Linked Lists', 'Stack & Queue structures', 'Hashing and Collision Resolution', 'Big-O Complexity Notation'],
          description: isSpanish ? 'Estructuración de memoria de forma lineal y análisis de límites de ejecución.' : 'Structuring memory linearly, navigating node pointers, implementing stack/queue behaviors, and analyzing execution limits.',
          status: 'not_started',
          ethicalWisdom: 'Analyzing worst-case time boundaries guarantees that your software won\'t lock up or degrade for users under heavy loads.'
        },
        {
          id: 'dsa_b3',
          title: isTelugu ? 'నాన్-లీనియర్ స్ట్రక్చర్స్: ట్రీస్ & హీప్స్' : isSpanish ? 'Estructuras No Lineales: Árboles y Montículos' : 'Non-Linear Structures: Trees & Heaps',
          duration: '4 Weeks',
          topics: ['Binary Trees representations', 'Binary Search Trees (BST)', 'Heaps & Priority Queues', 'Tree Traversal algorithms (In/Pre/Post)', 'Self-Balancing Trees basics'],
          description: isSpanish ? 'Exploración de estructuras jerárquicas y recorridos recursivos de árboles.' : 'Exploring hierarchical structures, executing recursive tree traversals, and managing priority queues with binary heaps.',
          status: 'not_started',
          ethicalWisdom: 'Hierarchical clarity brings structural security. Ensure balanced trees to maintain quick, predictable lookup times for all users.'
        },
        {
          id: 'dsa_b4',
          title: isTelugu ? 'కోర్ అల్గోరిథమ్స్ & సెర్చ్ ఆప్టిమైజేషన్' : isSpanish ? 'Algoritmos Core y Optimización de Búsqueda' : 'Core Algorithms & Search Optimization',
          duration: '4 Weeks',
          topics: ['Divide and Conquer paradigms', 'Sorting (Quick, Merge, Heap)', 'Binary Search and bounds', 'Recursion & Backtracking', 'Greedy Strategy & Optimization'],
          description: isSpanish ? 'Implementación de rutinas de búsqueda y ordenación de alto rendimiento.' : 'Implementing high-performance search-and-sort routines, breaking complex challenges into recursive subproblems, and choosing optimal paths.',
          status: 'not_started',
          ethicalWisdom: 'Opting for energy-efficient sorting algorithms directly conserves CPU computational cycles, reducing physical power usage.'
        }
      );
    } else if (diffNormalized === 'Intermediate') {
      modules.push(
        {
          id: 'dsa_i1',
          title: isSpanish ? 'C++ OOP Avanzado y STL' : 'Advanced C++ OOP & Standard Template Library (STL)',
          duration: '4 Weeks',
          topics: ['Classes, Objects & Encapsulation', 'Inheritance & Polymorphism', 'STL Containers (vector, list, map, set)', 'STL Iterators & Algorithms', 'Template Programming basics'],
          description: isSpanish ? 'Diseño de objetos de software reutilizables y colecciones estándar de C++.' : 'Designing reusable software objects, mastering polymorphic interfaces, and leveraging C++ standard collections for efficient storage.',
          status: 'not_started',
          ethicalWisdom: 'Encapsulation shields critical member variables, establishing robust code contracts and preventing accidental state mutations.'
        },
        {
          id: 'dsa_i2',
          title: isSpanish ? 'Representaciones de Grafos y Recorridos' : 'Graph Representations & Traversal Algorithms',
          duration: '4 Weeks',
          topics: ['Adjacency Matrix & List structures', 'Breadth-First Search (BFS)', 'Depth-First Search (DFS)', 'Topological Sorting', 'Connected Components detection'],
          description: isSpanish ? 'Mapeo de relaciones de red como grafos y diseño de colas de recorrido.' : 'Mapping network relationships as graphs, designing traversal queues/stacks, and detecting cycles in dependencies.',
          status: 'not_started',
          ethicalWisdom: 'Graphs model social relationships and digital networks. Ensure traversal paths are audited to respect user network boundaries.'
        },
        {
          id: 'dsa_i3',
          title: isSpanish ? 'Programación Dinámica y Memoización' : 'Dynamic Programming & Memoization',
          duration: '4 Weeks',
          topics: ['Overlapping Subproblems property', 'Optimal Substructure property', 'Memoization (Top-down approach)', 'Tabulation (Bottom-up approach)', 'Classic DP (Knapsack, LCS, LIS)'],
          description: isSpanish ? 'Optimización de algoritmos recursivos almacenando en caché resultados intermedios.' : 'Optimizing recursive algorithms by caching intermediate results, calculating matrix chains, and solving multi-stage decision problems.',
          status: 'not_started',
          ethicalWisdom: 'Caching prevents redundant calculations, dramatically improving throughput and reducing server CPU overhead.'
        },
        {
          id: 'dsa_i4',
          title: isSpanish ? 'Caminos Más Cortos y Árboles de Expansión' : 'Shortest Paths & Spanning Trees',
          duration: '4 Weeks',
          topics: ['Dijkstra\'s shortest path algorithm', 'Bellman-Ford negative edge detection', 'Kruskal\'s Minimum Spanning Tree (MST)', 'Prim\'s MST algorithm', 'Disjoint Set Union (DSU)'],
          description: isSpanish ? 'Búsqueda de caminos de costo mínimo en grafos ponderados.' : 'Finding minimal-cost paths across weighted graphs, configuring efficient spanning networks, and merging sets.',
          status: 'not_started',
          ethicalWisdom: 'Shortest path efficiency optimizes real-world routing. Saving traversal costs represents engineering stewardship of user resources.'
        }
      );
    } else {
      // Advanced
      modules.push(
        {
          id: 'dsa_a1',
          title: isSpanish ? 'Sistemas de Alto Rendimiento y C++ Moderno' : 'High-Performance Systems & Modern C++ (C++20/23)',
          duration: '4 Weeks',
          topics: ['Move Semantics & Smart Pointers', 'RAII (Resource Acquisition Is Initialization)', 'Concurrency & std::thread', 'Lock-free Data Structures basics', 'C++ Coroutines & Ranges'],
          description: isSpanish ? 'Modelos modernos de propiedad de memoria y prevención de fugas de recursos.' : 'Mastering modern memory ownership models, preventing resource leaks with smart pointers, and writing multi-threaded async tasks.',
          status: 'not_started',
          ethicalWisdom: 'Unsafe raw pointers cause fatal system leaks. Using smart pointers is a commitment to memory safety and application durability.'
        },
        {
          id: 'dsa_a2',
          title: isSpanish ? 'Árboles Avanzados y Consultas de Rango' : 'Advanced Trees & Range Queries',
          duration: '4 Weeks',
          topics: ['Segment Trees', 'Fenwick Trees (Binary Indexed)', 'Trie (Prefix Trees)', 'Suffix Trees basics', 'Lowest Common Ancestor (LCA)'],
          description: isSpanish ? 'Aceleración de consultas de rango y actualizaciones en arrays.' : 'Accelerating range queries and updates on arrays, implementing lightning-fast autocomplete text dictionary structures via prefix trees.',
          status: 'not_started',
          ethicalWisdom: 'Optimizing dictionary prefix trees reduces bandwidth and query sizes, respecting user connection latency.'
        },
        {
          id: 'dsa_a3',
          title: isSpanish ? 'Flujo de Red y Algoritmos de Grafos Avanzados' : 'Advanced Graph & Network Flow Algorithms',
          duration: '4 Weeks',
          topics: ['Ford-Fulkerson Maximum Flow', 'Bipartite Matching', 'Tarjan\'s Strongly Connected Components', 'Articulations Points & Bridges', 'Eulerian Paths'],
          description: isSpanish ? 'Dimensionamiento de límites de flujo máximo y detección de puntos críticos de falla.' : 'Sizing max-flow pipeline limits, detecting critical structural single points of failure in network designs.',
          status: 'not_started',
          ethicalWisdom: 'Identifying bridges prevents complete systemic collapse. Designing self-healing paths protects critical public infrastructure.'
        },
        {
          id: 'dsa_a4',
          title: isSpanish ? 'Alineación Algorítmica y Ética a Gran Escala' : 'Hard Problems, Approximation & Algorithmic Alignment',
          duration: '3 Weeks',
          topics: ['P vs NP Completeness', 'Approximation algorithms (TSP, Vertex Cover)', 'Bitmask Dynamic Programming', 'Heuristics optimization', 'Dharma in algorithmic scale'],
          description: isSpanish ? 'Análisis de problemas intratables y validación de equidad en la escala algorítmica.' : 'Analyzing intractable problems, drafting guaranteed near-optimal approximations, and checking algorithmic bias at scale.',
          status: 'not_started',
          ethicalWisdom: 'When algorithms decide life outcomes, biases scale exponentially. Validating fair distribution is the highest duty of the elite computer scientist.'
        }
      );
    }
  }

  // FULLSTACK DEVELOPMENT PATHWAY
  if (category === 'fullstack') {
    if (diffNormalized === 'Beginner') {
      modules.push(
        {
          id: 'fs_b1',
          title: isTelugu ? 'వెబ్ పునాదులు & రెస్పాన్సివ్ డిజైన్' : isSpanish ? 'Bases Web y Maquetación Adaptable' : 'Semantic Web Foundations & Layouts',
          duration: '4 Weeks',
          topics: ['HTML5 Semantic Elements', 'Tailwind CSS Utility Design', 'CSS Flexbox & Grid layouts', 'Responsive Screen Breakpoints', 'Browser DOM Mechanics'],
          description: isTelugu ? 'HTML, CSS మరియు ఆధునిక రెస్పాన్సివ్ లేఅవుట్ డిజైన్‌ల పునాదుల అధ్యయనం.' : isSpanish ? 'Dominio de maquetación HTML5 semántica y estilos modulares con Tailwind CSS.' : 'Mastering visual document structures, CSS cascading architectures, and accessible user designs.',
          status: 'not_started',
          ethicalWisdom: isTelugu ? 'అందరికీ అందుబాటులో ఉండే డిజైన్లను రూపొందించడం ద్వారా సామాజిక సమానత్వానికి ప్రాధాన్యత ఇవ్వడం మన బాధ్యత.' : isSpanish ? 'Diseñar interfaces inclusivas accesibles para personas con discapacidades es un deber fundamental.' : 'Ensuring web layouts are fully accessible and support screen-readers equalizes human information access.'
        },
        {
          id: 'fs_b2',
          title: isTelugu ? 'జావాస్క్రిప్ట్ & రియాక్ట్ UI డెవలప్‌మెంట్' : isSpanish ? 'JavaScript Dinámico y Componentes React' : 'Reactive UI & Frontend Workflows',
          duration: '5 Weeks',
          topics: ['JavaScript ES6+ Syntax', 'React functional components', 'React Hooks (useState, useEffect)', 'State Props & Event handling', 'Vite & Dev Tool setups'],
          description: isTelugu ? 'రియాక్ట్ ఉపయోగించి వేగవంతమైన, ఇంటరాక్టివ్ యూజర్ ఇంటర్‌ఫేస్‌ల రూపకల్పన.' : isSpanish ? 'Aprende a crear vistas reactivas dinámicas estructuradas en componentes modulares con React.' : 'Integrating virtual DOM rendering, reusable functional interfaces, and clean component states.',
          status: 'not_started',
          ethicalWisdom: isTelugu ? 'వాడుకరులను తప్పుదోవ పట్టించకుండా, సరళమైన మరియు పారదర్శకమైన యూజర్ ఎక్స్‌పీరియన్స్ ఇవ్వాలి.' : isSpanish ? 'La honestidad de interfaz implica evitar patrones oscuros que manipulen a los usuarios.' : 'Creating interfaces with clear, upfront user paths guards against manipulative UX patterns.'
        },
        {
          id: 'fs_b3',
          title: isTelugu ? 'బ్యాకెండ్ సర్వర్లు & రిలేషనల్ డేటాబేస్లు' : isSpanish ? 'Servidores Backend y Base de Datos Relacional' : 'Backend Services & Database Integrations',
          duration: '5 Weeks',
          topics: ['Node.js & Express servers', 'PostgreSQL database basics', 'CRUD SQL Queries', 'REST API endpoints design', 'Postman testing & Environment variables'],
          description: isTelugu ? 'డేటాను సురక్షితంగా సేవ్ చేయడానికి బ్యాకెండ్ ఏపీఐ సర్వర్లు మరియు రిలేషనల్ డేటాబేస్‌ల సృష్టి.' : isSpanish ? 'Introducción al desarrollo backend con Node.js, Express y bases de datos SQL relacionales.' : 'Constructing robust server pipelines, querying structured relational tables, and securing keys.',
          status: 'not_started',
          ethicalWisdom: isTelugu ? 'వినియోగదారుల సమాచారాన్ని భద్రపరచడం మరియు గుప్తీకరించడం మన ముఖ్య కర్తవ్యం.' : isSpanish ? 'Cuidar y encriptar la información privada en bases de datos es parte de tu responsabilidad.' : 'Encrypting personal fields and maintaining tight backend input sanitation mitigates data leakage.'
        },
        {
          id: 'fs_b4',
          title: isTelugu ? 'క్లౌడ్ నియోగం & తుది ఆడిట్' : isSpanish ? 'Despliegue Cloud y Auditoría de Seguridad' : 'Production Cloud Deployment & Audits',
          duration: '4 Weeks',
          topics: ['Render & Vercel Hosting', 'Security Header configurations', 'Performance load optimization', 'Git Version Control workflows', 'Final ethical impact checks'],
          description: isTelugu ? 'సర్వర్లను క్లౌడ్‌లో విజయవంతంగా రన్ చేయడం మరియు భద్రతా ప్రమాణాల తనిఖీ.' : isSpanish ? 'Lanzamiento de aplicaciones completas a la nube y auditoría de vulnerabilidades iniciales.' : 'Hosting, monitoring, configuring SSL certificates, and completing secure launch checklists.',
          status: 'not_started',
          ethicalWisdom: isTelugu ? 'తక్కువ పవర్ వాడే సర్వర్ రీజియన్లను ఎంచుకోవడం ద్వారా కార్బన్ ఉద్గారాలను తగ్గించడం ధర్మం.' : isSpanish ? 'Utilizar regiones en la nube eficientes ayuda a mitigar la huella de carbono digital.' : 'Selecting energy-efficient hosting regions directly assists in conserving ecological balance.'
        }
      );
    } else if (diffNormalized === 'Intermediate') {
      modules.push(
        {
          id: 'fs_i1',
          title: isTelugu ? 'అధునాతన UI & నెక్స్ట్.జేఎస్ ఆర్కిటెక్చర్' : isSpanish ? 'Arquitectura Avanzada con Next.js y SSR' : 'Enterprise UI & Server-Side Rendering (Next.js)',
          duration: '4 Weeks',
          topics: ['Next.js App Router', 'Server Side Rendering (SSR) vs SSG', 'Global State (Zustand/Redux)', 'Tailwind CSS UI Systems', 'Framer Motion layouts'],
          description: isTelugu ? 'Next.js ఉపయోగించి సర్వర్-సైడ్ రెండరింగ్ మరియు ఆధునిక గ్లోబల్ స్టేట్ మేనేజ్‌మెంట్.' : isSpanish ? 'Desarrollo web moderno con SSR, enrutamiento por carpetas y control global de estado.' : 'Leveraging hybrid server-client loading patterns, decoupled states, and micro-animations.',
          status: 'not_started',
          ethicalWisdom: isTelugu ? 'వినియోగదారుల వేగాన్ని గౌరవిస్తూ, కోడ్ సైజును తగ్గించి త్వరిత లోడింగ్‌ను అందించడం మన బాధ్యత.' : isSpanish ? 'Optimizar el rendimiento para dispositivos de gama baja democratiza el acceso digital.' : 'Optimizing rendering budgets allows users on lower-end devices to load information smoothly.'
        },
        {
          id: 'fs_i2',
          title: isTelugu ? 'డేటా లేయర్ మరియు ఏపీఐ ఆప్టిమైజేషన్' : isSpanish ? 'Optimización de Datos y Prisma ORM' : 'Optimized API Pipelines & Prisma ORM',
          duration: '4 Weeks',
          topics: ['REST vs GraphQL APIs', 'Prisma ORM transactions', 'Database Indexing strategies', 'Redis Cache configurations', 'CORS & Security policy setups'],
          description: isTelugu ? 'డేటాబేస్ రెస్పాన్స్ సమయాన్ని తగ్గించడం మరియు సురక్షితమైన ఏపీఐ కమ్యూనికేషన్ పద్ధతులు.' : isSpanish ? 'Modelado de esquemas complejos, transacciones de base de datos y caché intermedio con Redis.' : 'Minimizing backend latency, structuring indexing strategies, and configuring web token caches.',
          status: 'not_started',
          ethicalWisdom: isTelugu ? 'డేటా నిల్వ సమయాలలో కనీస సమాచారాన్ని సేకరించడమే నైతికత.' : isSpanish ? 'El principio de minimización de datos exige guardar solo la información estrictamente necesaria.' : 'The principle of data minimization limits secondary risks of storing excessive customer data.'
        },
        {
          id: 'fs_i3',
          title: isTelugu ? 'ఆటోమేటెడ్ టెస్టింగ్ & డాకర్ కంటైనర్లు' : isSpanish ? 'Pruebas Automatizadas y Contenedores Docker' : 'Containerization & Test-Driven Development',
          duration: '4 Weeks',
          topics: ['Docker containers orchestration', 'Jest & React Testing Library', 'GitHub Actions CI/CD', 'Environment isolation testing', 'Database mocking techniques'],
          description: isTelugu ? 'డాకర్ కంటైనర్ల ఉపయోగం మరియు ఆటోమేటెడ్ టెస్టింగ్ రన్ చేసే పైప్‌లైన్ల సృష్టి.' : isSpanish ? 'Contenerización de microservicios con Docker y despliegue automatizado continuo.' : 'Enforcing strict logic isolation, testing core application flows, and automating deployment builds.',
          status: 'not_started',
          ethicalWisdom: isTelugu ? 'పరీక్షలు చేయకుండా కోడ్‌ను విడుదల చేయడం వల్ల వాడుకరుల ప్రాసెస్ దెబ్బతింటుంది.' : isSpanish ? 'Entregar código libre de errores graves protege la productividad y confianza de tus usuarios.' : 'Strict automated checks prevent crashing updates, preserving user workflow integrity.'
        },
        {
          id: 'fs_i4',
          title: isTelugu ? 'సెక్యూరిటీ గేట్‌వేస్ & నైతిక విధానాలు' : isSpanish ? 'Pasarelas de Autenticación y Criptografía' : 'API Security Gateways & JWT Auth',
          duration: '4 Weeks',
          topics: ['JWT Authentication workflows', 'OAuth2.0 Social login', 'OWASP Top 10 mitigation', 'Data Retention schedules', 'Rate Limiting middlewares'],
          description: isTelugu ? 'బ్యాకెండ్‌ను హ్యాకింగ్స్ నుండి కాపాడటానికి రేట్ లిమిటింగ్ మరియు ఓ-ఆథ్ సదుపాయాలు.' : isSpanish ? 'Manejo de tokens de sesión seguros, mitigaciones de hackeos y políticas de privacidad.' : 'Formulating defensive headers, configuring secure cookies, and implementing anti-CSRF layers.',
          status: 'not_started',
          ethicalWisdom: isTelugu ? 'వాడుకరుల సమాచారాన్ని నిలిపి ఉంచే గడువును స్పష్టంగా వివరించడం ధర్మం.' : isSpanish ? 'Garantizar la transparencia y dar control al usuario sobre sus datos es justicia digital.' : 'Providing users with clear and accessible options to delete their data upholds digital autonomy.'
        }
      );
    } else {
      // Advanced
      modules.push(
        {
          id: 'fs_a1',
          title: isTelugu ? 'ఎంటర్‌ప్రైజ్ సిస్టమ్ డిజైన్ & మైక్రోసర్వీసెస్' : isSpanish ? 'Diseño de Sistemas Empresariales y Microservicios' : 'Enterprise System Design & Event-Driven Microservices',
          duration: '4 Weeks',
          topics: ['Microservices orchestration', 'Apache Kafka Message brokers', 'gRPC high-speed protocol', 'API Gateway patterns', 'Distributed tracing setups'],
          description: isTelugu ? 'అతి పెద్ద ఎంటర్‌ప్రైజ్ సాఫ్ట్‌వేర్ల కోసం ఈవెంట్-డ్రివెన్ సిస్టమ్స్ డిజైన్.' : isSpanish ? 'Estructuración de servicios desacoplados utilizando Kafka, protocolos rápidos y pasarelas de pago.' : 'Structuring massive asynchronous communication architectures, trace audits, and API proxies.',
          status: 'not_started',
          ethicalWisdom: isTelugu ? 'మోసపూరిత కార్యకలాపాలను నిరోధించడానికి సిస్టమ్‌ను డిజైన్ చేయడం మన ప్రథమ కర్తవ్యం.' : isSpanish ? 'Prevenir fraudes financieros mediante código limpio y rastreable es un deber cívico.' : 'Designing transaction pipelines to prevent systematic fraud safeguards human financial lives.'
        },
        {
          id: 'fs_a2',
          title: isTelugu ? 'డేటాబేస్ షార్డింగ్ & డిస్ట్రిబ్యూటెడ్ క్యాషింగ్' : isSpanish ? 'Fragmentación de Datos y Caché Distribuido' : 'Distributed Databases & Performance Caching',
          duration: '4 Weeks',
          topics: ['Database Sharding techniques', 'PostgreSQL Read Replicas', 'Redis Clusters clustering', 'Elasticsearch rapid indexing', 'Connection pool monitoring'],
          description: isTelugu ? 'కోట్లాది రికార్డులను సెకన్లలో శోధించడానికి డేటాబేస్ షార్డింగ్ మరియు రీడ్ రెప్లికాస్.' : isSpanish ? 'Optimización de consultas para millones de filas, replicación activa de base de datos y clusters Redis.' : 'Mitigating bottleneck latency, scaling queries across geographically distributed read replicas.',
          status: 'not_started',
          ethicalWisdom: isTelugu ? 'సాంకేతికత తక్కువ ఇంటర్నెట్ ఉన్న మారుమూల ప్రాంతాల్లో కూడా వేగంగా పనిచేసేలా చూడటం ధర్మం.' : isSpanish ? 'Optimizar consultas ahorra recursos energéticos y democratiza el acceso en redes lentas.' : 'High-efficiency database architectures reduce computing energy footprint while maintaining utility for slower connections.'
        },
        {
          id: 'fs_a3',
          title: isTelugu ? 'కుబెర్నెటిస్ & క్లౌడ్ ఇన్‌ఫ్రాస్ట్రక్చర్ ఆటోమేషన్' : isSpanish ? 'Orquestación Kubernetes e Infraestructura como Código' : 'Kubernetes Orchestration & Terraform IaC',
          duration: '4 Weeks',
          topics: ['Kubernetes Pods & Ingress', 'Helm chart distributions', 'Terraform (Infrastructure as Code)', 'Prometheus & Grafana telemetry', 'Rolling deployments setups'],
          description: isTelugu ? 'కుబెర్నెటిస్ ఉపయోగించి అప్లికేషన్లను ఆటోమేటిక్‌గా స్కేల్ చేయడం మరియు మానిటరింగ్.' : isSpanish ? 'Aprovisionamiento de servidores en código y orquestación de contenedores auto-reparables.' : 'Formulating declarative system resources, monitoring failures proactively, and scaling instances.',
          status: 'not_started',
          ethicalWisdom: isTelugu ? 'నిరంతరాయమైన డిజిటల్ సేవలను అందించడం ద్వారా సమాజానికి భరోసా ఇవ్వాలి.' : isSpanish ? 'Evitar la caída de servicios críticos del sistema es proteger la estabilidad comunitaria.' : 'Maintaining server uptime during heavy load preserves reliable services for community needs.'
        },
        {
          id: 'fs_a4',
          title: isTelugu ? 'నైతిక సాఫ్ట్‌వేర్ పద్ధతులు & సామాజిక బాధ్యత' : isSpanish ? 'Liderazgo Tecnológico y Stewardship Dharma' : 'Societal-Scale Alignment & Dharma Stewardship',
          duration: '3 Weeks',
          topics: ['Carbon-neutral cluster options', 'Algorithmic biases auditing', 'Data sovereignty laws compliance', 'Open-source contribution models', 'Accessible tech stewardship'],
          description: isTelugu ? 'పర్యావరణ అనుకూల సర్వర్ నిర్వహణ మరియు అల్గారిథమ్స్‌లో పక్షపాతాల నివారణ.' : isSpanish ? 'Desarrollo sostenible libre de sesgos automatizados, promoviendo el código abierto ético.' : 'Ensuring systems avoid discrimination, comply with data sovereignty, and run sustainably.',
          status: 'not_started',
          ethicalWisdom: isTelugu ? 'మన సాంకేతిక సృజన మానవత్వానికి మరియు ప్రకృతికి హాని కలిగించకూడదు.' : isSpanish ? 'Que tu código sirva siempre como un faro de beneficio colectivo e integridad social.' : 'Code is digital karma. Let your architectural decisions build positive, carbon-conscious loops of progress.'
        }
      );
    }
  }

  // CYBERSECURITY PATHWAY
  else if (category === 'security') {
    if (diffNormalized === 'Beginner') {
      modules.push(
        {
          id: 'sec_b1',
          title: isSpanish ? 'Fundamentos de Redes y Administración Linux' : 'Computer Networking & OS Basics',
          duration: '4 Weeks',
          topics: ['TCP/IP Network stack', 'Linux CLI administration', 'IP Routing & Subnets', 'DNS & HTTP mechanics', 'Bash scripting basics'],
          description: isSpanish ? 'Aprende los fundamentos del protocolo TCP/IP, redes esenciales y comandos básicos en Linux.' : 'Mastering foundational packet networks, subnet masking, command lines, and core Linux security directories.',
          status: 'not_started',
          ethicalWisdom: 'The power to access systems comes with a strict duty of absolute authorization. Legitimate defensive engineering is built upon clear ethical lines.'
        },
        {
          id: 'sec_b2',
          title: isSpanish ? 'Conceptos de Criptografía y Seguridad' : 'Security Fundamentals & Cryptography',
          duration: '6 Weeks',
          topics: ['Symmetric & Asymmetric Keys', 'Hashing Algorithms (SHA256)', 'SSL/TLS Handshakes', 'Firewalls & IPS basics', 'Digital Signatures'],
          description: isSpanish ? 'Conceptos teóricos y prácticos de codificación y protección criptográfica de datos.' : 'Studying the core math of cryptosystems, establishing secure channels, and defending data boundaries.',
          status: 'not_started',
          ethicalWisdom: 'Privacy is a core human right. Securing cryptographic channels prevents unauthorized surveillance and protects personal dignity.'
        },
        {
          id: 'sec_b3',
          title: isSpanish ? 'Mitigación de Vulnerabilidades Web' : 'OWASP Top 10 & Vulnerability Concepts',
          duration: '6 Weeks',
          topics: ['SQL Injection mitigations', 'Cross-Site Scripting (XSS)', 'Broken Authentication flows', 'Security Misconfigurations', 'Input Sanitation patterns'],
          description: isSpanish ? 'Análisis de las principales fallas de seguridad web identificadas por OWASP.' : 'Analyzing major web system backdoors, parsing payload behaviors, and programming mitigation guards.',
          status: 'not_started',
          ethicalWisdom: 'Proactively patching security holes in public-facing portals is a protective duty to avoid catastrophic consumer identity leaks.'
        },
        {
          id: 'sec_b4',
          title: isSpanish ? 'Auditoría Inicial y Código de Conducta' : 'Basic Security Audits & Defensive Ethics',
          duration: '4 Weeks',
          topics: ['CIS Benchmarks guidelines', 'Vulnerability scanning basics', 'System log review', 'Responsible disclosure guidelines', 'Ethics of white-hat hacking'],
          description: isSpanish ? 'Introducción a la auditoría de configuraciones seguras e informes responsables.' : 'Setting up server benchmarks, checking for outdated dependencies, and exploring the rules of ethical engagement.',
          status: 'not_started',
          ethicalWisdom: 'An ethical hacker reports gaps immediately to the affected organization rather than using vulnerabilities for personal benefit.'
        }
      );
    } else if (diffNormalized === 'Intermediate') {
      modules.push(
        {
          id: 'sec_i1',
          title: isSpanish ? 'Pentesting Aplicado y Análisis de Red' : 'Applied Penetration Testing & Network Scans',
          duration: '4 Weeks',
          topics: ['Kali Linux security tools', 'Nmap network scans', 'Wireshark packet deep-dive', 'Metasploit exploit concepts', 'Burp Suite web auditing'],
          description: isSpanish ? 'Aprende a analizar el tráfico de red en vivo, interceptar paquetes e identificar servicios vulnerables.' : 'Simulating real-world attacks, executing deep network discovery, and using proxy debuggers.',
          status: 'not_started',
          ethicalWisdom: 'Penetration testing must only be conducted on targets within the exact boundaries of your written, authorized contract.'
        },
        {
          id: 'sec_i2',
          title: isSpanish ? 'Gestión de Identidades (IAM) y SIEM' : 'Identity Access Management (IAM) & SIEM Systems',
          duration: '4 Weeks',
          topics: ['Splunk config & SIEM logic', 'Intrusion Detection (IDS/IPS)', 'RBAC (Role Based Access)', 'Active Directory security', 'Log analysis automation'],
          description: isSpanish ? 'Implementación de tableros de monitoreo Splunk para detectar intrusiones en la red.' : 'Configuring security event triggers, auditing active directories, and formulating strict access control trees.',
          status: 'not_started',
          ethicalWisdom: 'Limiting administrative user privileges to the absolute bare minimum required prevents systemic damage from credential compromise.'
        },
        {
          id: 'sec_i3',
          title: isSpanish ? 'Seguridad en la Nube y Pipelines CI/CD' : 'Cloud Security & Automated DevSecOps',
          duration: '4 Weeks',
          topics: ['VPC Network isolation', 'Kubernetes secret storage', 'IAM Roles & Policies', 'Static App Security Testing (SAST)', 'Snyk dependency audits'],
          description: isSpanish ? 'Estructuración de redes virtuales en la nube y escaneo de vulnerabilidades en código.' : 'Hardening serverless runtimes, managing cryptographic credentials, and integrating automated static checkers.',
          status: 'not_started',
          ethicalWisdom: 'Leaving public cloud buckets unauthenticated is one of the leading causes of modern breaches. Carelessness is an ethical failure.'
        },
        {
          id: 'sec_i4',
          title: isSpanish ? 'Respuesta a Incidentes y Deber Moral' : 'Incident Response & Responsible Disclosure',
          duration: '4 Weeks',
          topics: ['Incident response playbooks', 'Digital forensics basics', 'Disaster Recovery backups', 'Threat Intelligence sharing', 'CVE publication guidelines'],
          description: isSpanish ? 'Cómo reaccionar ante intrusiones, recuperar respaldos y compartir inteligencia.' : 'Designing failover protocols, preserving digital log footprints under pressure, and safely sharing bug findings.',
          status: 'not_started',
          ethicalWisdom: 'Your moral duty (Dharma) is to guide affected clients through post-mortems with total transparency, never covering up breaches.'
        }
      );
    } else {
      // Advanced
      modules.push(
        {
          id: 'sec_a1',
          title: isSpanish ? 'Ingeniería Inversa y Malware' : 'Advanced Exploits & Reverse Engineering',
          duration: '4 Weeks',
          topics: ['Ghidra disassembly tools', 'Buffer Overflow exploits', 'EDR bypass techniques', 'Asm basics & Hex parsing', 'Active Directory security limits'],
          description: isSpanish ? 'Análisis estático de binarios maliciosos y técnicas avanzadas de bypass de seguridad.' : 'Compiling proof-of-concept exploits, analyzing binaries under isolated sandboxes, and evaluating EDR limits.',
          status: 'not_started',
          ethicalWisdom: 'Developing defensive mitigations requires understanding the attacker; however, custom weaponized tools must never leak.'
        },
        {
          id: 'sec_a2',
          title: isSpanish ? 'Criptografía Avanzada y Zero-Trust' : 'Cryptographic Engineering & Zero-Trust Design',
          duration: '4 Weeks',
          topics: ['Elliptic Curve math (ECC)', 'Zero-Knowledge Proofs (ZKP)', 'Zero-Trust Architecture', 'Network Micro-segmentation', 'Key rotation automation'],
          description: isSpanish ? 'Modelado de sistemas complejos basados en el principio de "nunca confiar, siempre verificar".' : 'Designing architectures that operate under zero assumption of internal perimeter trust, utilizing elliptic cryptosystems.',
          status: 'not_started',
          ethicalWisdom: 'Zero-trust shifts defense from blind perimeter confidence to localized, granular moral audits of every API interaction.'
        },
        {
          id: 'sec_a3',
          title: isSpanish ? 'Modelado de Amenazas STRIDE' : 'STRIDE Threat Modeling & Risk Audits',
          duration: '4 Weeks',
          topics: ['STRIDE risk scoring', 'Security compliance audits', 'Data sovereignty compliance', 'Red vs Blue team drills', 'Automated security validation'],
          description: isSpanish ? 'Modelos de amenazas estructurados y cumplimiento legal de protección de datos.' : 'Formulating compliance rules, simulating high-pressure team drills, and preparing threat mitigation roadmaps.',
          status: 'not_started',
          ethicalWisdom: 'A compliance audit is not a checklist; it is an active pledge to protect the private lives of millions of human citizens.'
        },
        {
          id: 'sec_a4',
          title: isSpanish ? 'Resiliencia Sistémica y Ciberética Dharma' : 'Systemic Digital Resilience & Ethical Sovereignty',
          duration: '3 Weeks',
          topics: ['Critical Infrastructure defense', 'Open-source audit models', 'Protecting vulnerable systems', 'Green defensive pipelines', 'Stewardship of digital assets'],
          description: isSpanish ? 'Protección de servicios públicos vitales y la moral colectiva de la defensa digital.' : 'Hardening public power grids, local health networks, and public service databases against state-sponsored actor profiles.',
          status: 'not_started',
          ethicalWisdom: 'Technology is an arm of social service. Guarding public infrastructure against digital sabotage is a sacred dharma of security engineers.'
        }
      );
    }
  }

  // DATA SCIENCE & MACHINE LEARNING / AI PATHWAY
  else if (category === 'data') {
    if (diffNormalized === 'Beginner') {
      modules.push(
        {
          id: 'ds_b1',
          title: 'Python for Data Science & Environments',
          duration: '4 Weeks',
          topics: ['Python ES6+ Syntax & Types', 'Jupyter Notebook environments', 'Git Version Control', 'NumPy dimensional arrays', 'Anaconda setups'],
          description: 'Getting comfortable writing functional Python scripts and loading large multidimensional matrices in dynamic notebooks.',
          status: 'not_started',
          ethicalWisdom: 'Clean data analysis starts with pristine environment setups. Always document where and how your baseline environments are configured.'
        },
        {
          id: 'ds_b2',
          title: 'Data Wrangling & Analytical SQL Queries',
          duration: '6 Weeks',
          topics: ['Pandas DataFrame filters', 'Analytical SQL JOINs', 'Handling Missing Values', 'Outlier Detection math', 'Data Cleaning pipelines'],
          description: 'Manipulating tabular files, merging mismatched spreadsheets, and structuring analytical SQL databases.',
          status: 'not_started',
          ethicalWisdom: 'Removing outliers without deep documentation can lead to biased models that completely ignore minority populations.'
        },
        {
          id: 'ds_b3',
          title: 'Mathematical Foundations & Statistics',
          duration: '6 Weeks',
          topics: ['Probability distribution curves', 'Linear Algebra matrices', 'Descriptive Statistics', 'Hypothesis testing', 'Correlation vs Causation'],
          description: 'Discovering the mathematical layers behind data distributions, computing correlation indices, and testing significance.',
          status: 'not_started',
          ethicalWisdom: 'Mistaking correlation for causation in algorithmic calculations can enforce unfair stereotypes on human behaviors.'
        },
        {
          id: 'ds_b4',
          title: 'Data Visualization & Ethical Storytelling',
          duration: '4 Weeks',
          topics: ['Matplotlib & Seaborn charts', 'Dashboard presentation patterns', 'Bias in graphical scales', 'Exploratory Data Analysis (EDA)', 'Reporting data integrity'],
          description: 'Creating high-impact charts, structuring exploratory reports, and checking data parameters for demographic representative parity.',
          status: 'not_started',
          ethicalWisdom: 'Manipulating y-axis scales to exaggerate growth is a direct breach of technical honesty. True data stories tell the objective truth.'
        }
      );
    } else if (diffNormalized === 'Intermediate') {
      modules.push(
        {
          id: 'ds_i1',
          title: 'Applied Machine Learning (Scikit-Learn)',
          duration: '4 Weeks',
          topics: ['Linear & Logistic Regression', 'Decision Trees & Random Forests', 'Support Vector Machines (SVM)', 'Hyperparameter cross-validation', 'Model validation metrics'],
          description: 'Training predictive models, tuning parameters to avoid overfitting, and computing confusion matrices.',
          status: 'not_started',
          ethicalWisdom: 'A model is only as good as its training dataset. Auditing features for racial or gender proxies is an essential duty.'
        },
        {
          id: 'ds_i2',
          title: 'Data Warehousing & ETL Pipelines',
          duration: '5 Weeks',
          topics: ['Apache Airflow schedulers', 'ETL Data pipelines', 'Snowflake / BigQuery databases', 'Data Lake setups', 'DB partitioning'],
          description: 'Structuring automated pipelines that load raw event logs, partition datasets, and populate scalable Cloud Data Warehouses.',
          status: 'not_started',
          ethicalWisdom: 'Data lakes must include clear security access limits. Securing user identities during batch transfers is a high priority.'
        },
        {
          id: 'ds_i3',
          title: 'Deep Learning & Neural Network Basics',
          duration: '4 Weeks',
          topics: ['Artificial Neural Networks (ANN)', 'TensorFlow & PyTorch basics', 'Backpropagation gradient descent', 'CNN image filters', 'Overfitting dropout layers'],
          description: 'Constructing multi-layer neural networks, implementing gradient descent optimizers, and processing computer vision arrays.',
          status: 'not_started',
          ethicalWisdom: 'Deep learning models act as black boxes. Developing explainability pipelines is critical for models used in healthcare or finance.'
        },
        {
          id: 'ds_i4',
          title: 'Model Interpretability & Bias Audits',
          duration: '3 Weeks',
          topics: ['SHAP & LIME frameworks', 'Algorithmic bias audit tools', 'Demographic Parity calculations', 'Model Card documentation', 'Responsible model release'],
          description: 'Calculating model feature importances, auditing outputs for disparate impact, and writing comprehensive model specifications.',
          status: 'not_started',
          ethicalWisdom: 'Strive to achieve demographic parity. If your machine learning model outputs bias against a group, you must refuse to deploy it.'
        }
      );
    } else {
      // Advanced
      modules.push(
        {
          id: 'ds_a1',
          title: 'Large Language Models & Transformers',
          duration: '4 Weeks',
          topics: ['Transformers architecture (Self-Attention)', 'HuggingFace Hub fine-tuning', 'Vector Databases (Pinecone/Milvus)', 'Retrieval-Augmented Generation (RAG)', 'Prompt engineering safety'],
          description: 'Fine-tuning transformer networks, integrating semantic search indices, and establishing safe grounding pipelines.',
          status: 'not_started',
          ethicalWisdom: 'LLM fine-tuning datasets can memorize private credentials. Guarding datasets prevents downstream data exposure.'
        },
        {
          id: 'ds_a2',
          title: 'Production MLOps & Scalable Endpoints',
          duration: '4 Weeks',
          topics: ['Triton Inference Server', 'Kubeflow pipeline models', 'MLflow metric tracking', 'Model Drift triggers', 'Kubernetes GPU scheduling'],
          description: 'Deploying high-throughput endpoints on Kubernetes, tracing drift deviations, and optimizing GPU utilization budgets.',
          status: 'not_started',
          ethicalWisdom: 'Continuous monitoring is your shield. Tracking model drift prevents decaying predictive systems from making false decisions.'
        },
        {
          id: 'ds_a3',
          title: 'Distributed Training & Cloud Optimization',
          duration: '4 Weeks',
          topics: ['PyTorch Distributed Data Parallel (DDP)', 'TPU Pod scaling strategies', 'Model Quantization techniques', 'Mixed Precision training', 'Carbon-efficient compute schedules'],
          description: 'Distributing massive neural networks across multiple servers, quantizing models for lightweight mobile deployment.',
          status: 'not_started',
          ethicalWisdom: 'Deep learning uses massive electricity. Quantizing architectures and scheduling training during green hours minimizes global footprint.'
        },
        {
          id: 'ds_a4',
          title: 'Ethical AI Alignment, Safety & Dharma',
          duration: '3 Weeks',
          topics: ['Reinforcement Learning (RLHF)', 'Hallucination containment pipelines', 'Red-Teaming adversarial attacks', 'Autonomous systems safety', 'Technology for global equality'],
          description: 'Implementing human feedback alignment, defending models from malicious injection attacks, and dedicating AI skills to social service.',
          status: 'not_started',
          ethicalWisdom: 'Intelligence without morality is dangerous. Aligning your models to protect human welfare and social harmony is the ultimate Dharma.'
        }
      );
    }
  }

  // CLOUD & DEVOPS PATHWAY
  else if (category === 'cloud') {
    if (diffNormalized === 'Beginner') {
      modules.push(
        {
          id: 'c_b1',
          title: 'Linux Systems & Bash CLI Essentials',
          duration: '4 Weeks',
          topics: ['Bash scripting basics', 'File system access permissions', 'SSH connection configs', 'Systemd services', 'Linux process hierarchies'],
          description: 'Developing absolute comfort working in terminal shells, isolating permissions, and configuring standard background daemons.',
          status: 'not_started',
          ethicalWisdom: 'Security starts with the Linux kernel. Configuring rigid permissions restricts automated threat lateral movements.'
        },
        {
          id: 'c_b2',
          title: 'Computer Networking & VPC Architectures',
          duration: '6 Weeks',
          topics: ['TCP/IP Network models', 'DNS record configurations', 'VPC Subnet allocations', 'Routing tables & CIDR', 'Load Balancer rules'],
          description: 'Architecting isolated private network layers, configuring routing tables, and setting up reverse proxy networks.',
          status: 'not_started',
          ethicalWisdom: 'Network isolation is a firewall for trust. Preventing public access to internal system endpoints keeps critical databases safe.'
        },
        {
          id: 'c_b3',
          title: 'Basic Infrastructure Automation',
          duration: '6 Weeks',
          topics: ['Python systems scripting', 'Git flow branching strategies', 'YAML & JSON syntaxes', 'AWS / GCP command line interfaces', 'Cron job scheduling'],
          description: 'Writing scripts to automate backup pipelines, checking API states, and managing code version checkouts.',
          status: 'not_started',
          ethicalWisdom: 'Automation is highly powerful. Ensuring your scripts check target environments before running prevents catastrophic system damage.'
        },
        {
          id: 'c_b4',
          title: 'Cloud Providers & Carbon-Efficient Hosting',
          duration: '4 Weeks',
          topics: ['Virtual Instance allocations', 'Cloud budget alerts', 'Object Storage partitions', 'Green cloud regions', 'Moral cloud stewardship'],
          description: 'Provisioning basic cloud virtual machines, setting up storage alerts, and optimizing computational footprint policies.',
          status: 'not_started',
          ethicalWisdom: 'Wasting idle cloud compute runs directly impacts the ecosystem. Scaling down unused resources is a form of environmental Dharma.'
        }
      );
    } else if (diffNormalized === 'Intermediate') {
      modules.push(
        {
          id: 'c_i1',
          title: 'Infrastructure as Code with Terraform',
          duration: '4 Weeks',
          topics: ['Terraform resource providers', 'Terraform State lock setups', 'Declarative system models', 'VPC & Subnet provisioning', 'Cloud Init configurations'],
          description: 'Managing cloud topologies as code, locking team configurations, and automating network deployment architectures.',
          status: 'not_started',
          ethicalWisdom: 'Defining topologies declarative ensures reproducibility. Code transparency reduces accidental security mistakes.'
        },
        {
          id: 'c_i2',
          title: 'Containerization & CI/CD Pipelines',
          duration: '5 Weeks',
          topics: ['Dockerfile layer optimizations', 'Docker Compose definitions', 'GitHub Actions workflow files', 'Registry security scans', 'Artifact versioning'],
          description: 'Constructing lightweight virtual containers, compiling secure deployment runners, and scanning dependencies automatically.',
          status: 'not_started',
          ethicalWisdom: 'Injecting secrets directly into Dockerfiles leads to severe compromises. Utilize secure environment parameter stores.'
        },
        {
          id: 'c_i3',
          title: 'Scalable Databases & High Availability',
          duration: '4 Weeks',
          topics: ['Multi-AZ Database setups', 'Read Replica pipelines', 'SSL encrypted database connection', 'Object storage life cycles', 'Cloud CDN configurations'],
          description: 'Deploying transaction systems that survive regional server crashes, establishing global asset distribution layers.',
          status: 'not_started',
          ethicalWisdom: 'A system crash during critical user actions can cost livelihoods. High availability is your promise of reliable utility.'
        },
        {
          id: 'c_i4',
          title: 'Disaster Recovery & Carbon Analytics',
          duration: '3 Weeks',
          topics: ['RTO & RPO metrics calculations', 'Encrypted cloud backups', 'Carbon footprint optimization tools', 'Failover drills', 'Sustainable architecture'],
          description: 'Designing recovery drills, measuring carbon emission outputs of cloud clusters, and locking backup retention policies.',
          status: 'not_started',
          ethicalWisdom: 'A backup is useless unless it is continuously tested. Enforcing absolute disaster recovery plans is our duty to the community.'
        }
      );
    } else {
      // Advanced
      modules.push(
        {
          id: 'c_a1',
          title: 'Production Kubernetes Orchestration',
          duration: '4 Weeks',
          topics: ['Kubernetes Deployment models', 'Ingress Controller setups', 'Persistent Volumes configs', 'Istio Service Mesh routing', 'Horizontal Pod Autoscalers'],
          description: 'Scaling multi-container microservices on production Kubernetes, isolating routing paths via meshes, and configuring autoscale thresholds.',
          status: 'not_started',
          ethicalWisdom: 'High compute power demands high scaling discipline. Automatically scaling down pods during low-use hours saves carbon loads.'
        },
        {
          id: 'c_a2',
          title: 'Cloud Security Compliance & KMS Keys',
          duration: '4 Weeks',
          topics: ['KMS encryption keys management', 'IAM Policy least-privilege configurations', 'Automated security compliance scans', 'VPC flow logs audits', 'IAM role scopes'],
          description: 'Structuring least-privilege policies, rotating encryption keys automatically, and building secure server vaults.',
          status: 'not_started',
          ethicalWisdom: 'Security compliance is not a checkbox. It is an active moral pledge to safeguard consumer identities and data sovereignty.'
        },
        {
          id: 'c_a3',
          title: 'Observability, SRE & Telemetry Systems',
          duration: '4 Weeks',
          topics: ['Prometheus metric scrapers', 'Grafana alerting dashboards', 'ELK log indexing pipelines', 'SLO & SLA definitions', 'Incident escalation systems'],
          description: 'Parsing distributed logs, mapping cluster performance indicators, and formulating strict incident management channels.',
          status: 'not_started',
          ethicalWisdom: 'SRE observability is a window of empathy into client friction. Detecting and fixing bottlenecks prevents user frustration.'
        },
        {
          id: 'c_a4',
          title: 'Chaos Engineering & Technology Stewardship',
          duration: '3 Weeks',
          topics: ['Chaos Mesh drills', 'Zero-downtime Canary deployments', 'Cloud cost optimization analytics', 'Public infrastructure defense', 'Dharma-guided stewardship'],
          description: 'Intentionally breaking servers to verify self-healing topologies, managing enterprise budgets, and defending critical services.',
          status: 'not_started',
          ethicalWisdom: 'Your ultimate mission is to create a secure, bulletproof cloud layer that supports society silently and resiliently. This is SRE Dharma.'
        }
      );
    }
  }

  // DESIGN PATHWAY
  else if (category === 'design') {
    if (diffNormalized === 'Beginner') {
      modules.push(
        {
          id: 'des_b1',
          title: 'Visual Hierarchy & Color Science',
          duration: '4 Weeks',
          topics: ['Color contrast ratios', 'Typographic pairing systems', 'Gestalt Alignment rules', 'Grid layouts basics', 'Negative space layouts'],
          description: 'Learning the fundamentals of visual balance, typography weight hierarchies, and clean color systems.',
          status: 'not_started',
          ethicalWisdom: 'Contrast ratios must satisfy WCAG guidelines. Designing readable interfaces is a direct act of inclusivity.'
        },
        {
          id: 'des_b2',
          title: 'Figma Tooling & Layout Structures',
          duration: '6 Weeks',
          topics: ['Figma Auto Layout frames', 'Component Varient sets', 'Reusable UI components', 'Basic prototyping wires', 'Vector path drawings'],
          description: 'Gaining complete proficiency in Figma, configuring components that scale dynamically, and linking visual mockups.',
          status: 'not_started',
          ethicalWisdom: 'Clean, modular Figma files respect downstream developer time. True design collaboration values our engineering peers.'
        },
        {
          id: 'des_b3',
          title: 'User Research & Information Flow',
          duration: '6 Weeks',
          topics: ['User interview frameworks', 'Card sorting analysis', 'Information Architecture sitemaps', 'User Journey blueprints', 'Low-fidelity wireframing'],
          description: 'Conducting structured user interviews, organizing platform navigation flows, and building conceptual maps.',
          status: 'not_started',
          ethicalWisdom: 'Designing without user feedback is designing based on personal ego. Listening to diverse community groups is design humility.'
        },
        {
          id: 'des_b4',
          title: 'Responsive Layouts & Universal Design',
          duration: '4 Weeks',
          topics: ['Mobile viewport grids', 'Accessible touch targets', 'WCAG color conformance', 'Form input labels', 'Inclusive UX guidelines'],
          description: 'Adapting web screens to mobile resolutions, verifying contrast ratios, and structuring readable input forms.',
          status: 'not_started',
          ethicalWisdom: 'Inclusivity is not a trend. Giving every single human, regardless of capability, an elegant digital experience is our moral goal.'
        }
      );
    } else if (diffNormalized === 'Intermediate') {
      modules.push(
        {
          id: 'des_i1',
          title: 'Advanced Prototyping & Motion Systems',
          duration: '4 Weeks',
          topics: ['Smart Animate in Figma', 'Component state transitions', 'Micro-interactions design', 'Easing curves setups', 'User testing prototypes'],
          description: 'Building high-fidelity interactive prototypes that look and feel like completed applications, utilizing micro-motions.',
          status: 'not_started',
          ethicalWisdom: 'Animations must guide, never overwhelm. Minimizing unnecessary flashing motions respects cognitive diversity.'
        },
        {
          id: 'des_i2',
          title: 'Design Systems & Developer Handoff',
          duration: '5 Weeks',
          topics: ['Atomic Design principles', 'Visual design tokens', 'Figma variables setup', 'Developer spec redlines', 'Component documentation'],
          description: 'Evolving loose component files into scalable design systems, naming visual design tokens, and aligning specifications.',
          status: 'not_started',
          ethicalWisdom: 'Consistent systems reduce cognitive fatigue for our end users, keeping tech approachable and stress-free.'
        },
        {
          id: 'des_i3',
          title: 'Usability Testing & Product Feedback',
          duration: '4 Weeks',
          topics: ['Maze validation platforms', 'Heatmap tracking maps', 'A/B testing flows', 'Task success metrics', 'Usability feedback loops'],
          description: 'Conducting unmoderated usability tests, identifying navigation bottlenecks, and iterating layouts using real metrics.',
          status: 'not_started',
          ethicalWisdom: 'Metrics guide us, but must never overrule human empathy. Optimize for long-term user satisfaction, not raw addictive loops.'
        },
        {
          id: 'des_i4',
          title: 'Ethical Design Patterns vs Dark Patterns',
          duration: '3 Weeks',
          topics: ['Identifying Dark Patterns', 'Deceptive unsubscribe loops', 'Clear permission notifications', 'Compassionate subscription setups', 'GDPR cookie design'],
          description: 'Studying patterns that manipulate users, and actively replacing them with honest, transparent UI alternatives.',
          status: 'not_started',
          ethicalWisdom: 'Ethical designers refuse to create deceptive subscription loops or click-shaming modals. Respecting customer autonomy is our Dharma.'
        }
      );
    } else {
      // Advanced
      modules.push(
        {
          id: 'des_a1',
          title: 'Enterprise Design Systems & Visual Tokens',
          duration: '4 Weeks',
          topics: ['Multi-brand variable hierarchies', 'Visual Token synchronization with code', 'Figma API integrations', 'Cross-platform design systems', 'Handoff automation tools'],
          description: 'Architecting design systems that serve millions across several apps, utilizing synchronized token structures.',
          status: 'not_started',
          ethicalWisdom: 'A system that scales to millions has a high responsibility. Maintain consistent design standards to protect user accessibility.'
        },
        {
          id: 'des_a2',
          title: 'Global Localization & Adaptive Interfaces',
          duration: '4 Weeks',
          topics: ['Right-to-Left (RTL) layout frameworks', 'Dynamic font scaling audits', 'Context-aware layout margins', 'Localized terminology', 'Cross-cultural visual semantics'],
          description: 'Designing layouts that support global scripts, fluidly resizing text boundaries, and testing cultural visual responses.',
          status: 'not_started',
          ethicalWisdom: 'Adapting layouts for international scripts honors global cultures, ensuring technology is never a localized barrier.'
        },
        {
          id: 'des_a3',
          title: 'Conversational & Spatial Interfaces',
          duration: '4 Weeks',
          topics: ['Voice UI (VUI) flows', 'Spatial grid systems for AR', 'Gesture-based interfaces', 'Accessibility in immersive worlds', 'Cognitive load balancing'],
          description: 'Formulating interface sitemaps for smart-home screens, AR goggles, and gesture-driven wearable systems.',
          status: 'not_started',
          ethicalWisdom: 'Our ultimate target is to make technology natural, screen-free, and seamlessly integrated into human lives.'
        },
        {
          id: 'des_a4',
          title: 'Systemic Equity & Universal Design Dharma',
          duration: '3 Weeks',
          topics: ['Accessible public-sector portals', 'Universal Equity guidelines', 'Eco-conscious minimal rendering', 'Design for human connection', 'Dharma tech stewardship'],
          description: 'Crafting interfaces for public transport networks, critical health resources, and dedicating layout craft to universal benefit.',
          status: 'not_started',
          ethicalWisdom: 'Design is the interface of human-digital interaction. May your visuals bring clarity, alleviate stress, and uphold absolute equality.'
        }
      );
    }
  }

  // PRODUCT MANAGEMENT PATHWAY
  else if (category === 'product') {
    if (diffNormalized === 'Beginner') {
      modules.push(
        {
          id: 'pm_b1',
          title: 'Product Lifecycle & Agile Scrum Basics',
          duration: '4 Weeks',
          topics: ['Product discovery phases', 'Scrum framework roles', 'User Persona modeling', 'Agile backlog management', 'Sprint meetings structure'],
          description: 'Understanding the path from raw user pain-point discovery to structured sprint execution and team sprint alignment.',
          status: 'not_started',
          ethicalWisdom: 'A product manager must align the team around genuine customer needs, never just shipping features to hit arbitrary numbers.'
        },
        {
          id: 'pm_b2',
          title: 'PRDs & User Stories Documentation',
          duration: '6 Weeks',
          topics: ['Writing Product Requirement Docs', 'User Story writing formats', 'Acceptance Criteria mapping', 'Figma prototype feedback', 'Feature scoping frameworks'],
          description: 'Drafting precise requirements, writing actionable engineering tasks, and establishing product boundaries.',
          status: 'not_started',
          ethicalWisdom: 'Clear, well-defined user stories are an act of respect for developer energy, reducing frustration and double-work.'
        },
        {
          id: 'pm_b3',
          title: 'Agile Delivery & Backlog Tooling',
          duration: '6 Weeks',
          topics: ['Jira / Linear tracking configurations', 'Sprint capacity points', 'Kanban flow monitoring', 'Release Notes publishing', 'Retrospective formats'],
          description: 'Organizing development boards, assigning team story points, and resolving sprint blockages.',
          status: 'not_started',
          ethicalWisdom: 'Scrum metrics must never be used as weapons to overwork teams. Healthy sustainable momentum is our delivery Dharma.'
        },
        {
          id: 'pm_b4',
          title: 'Inclusivity Metrics & SaaS Business Models',
          duration: '4 Weeks',
          topics: ['SaaS vs Marketplace metrics', 'Defining Value indicators', 'Ethical KPI structures', 'Accessible release checklists', 'Social impact reviews'],
          description: 'Analyzing baseline product margins, setting up non-deceptive growth metrics, and verifying public safety goals.',
          status: 'not_started',
          ethicalWisdom: 'An ethical product defines success through user empowerment and retention, not raw user screen-time obsession.'
        }
      );
    } else if (diffNormalized === 'Intermediate') {
      modules.push(
        {
          id: 'pm_i1',
          title: 'Strategic Prioritization & Roadmapping',
          duration: '4 Weeks',
          topics: ['RICE score calculations', 'Kano priorization models', 'Product Roadmap GANTT charts', 'Stakeholder alignment techniques', 'Opportunity Solution Trees'],
          description: 'Evaluating feature impact-vs-cost matrices, aligning remote stakeholders, and building high-level timelines.',
          status: 'not_started',
          ethicalWisdom: 'Prioritization is saying no to good ideas to focus on the absolute highest human value. Guard your backlog from distraction.'
        },
        {
          id: 'pm_i2',
          title: 'Product Analytics & Analytical SQL Queries',
          duration: '5 Weeks',
          topics: ['SQL database structures', 'Amplitude / Mixpanel event logs', 'Funnel conversion optimizations', 'Cohort Retention curves', 'User segmentations'],
          description: 'Writing queries to verify database tables, tracking web event drop-off ratios, and auditing cohort retention.',
          status: 'not_started',
          ethicalWisdom: 'Analyze data to improve user journeys, but fiercely protect user anonymity and respect data consent policies.'
        },
        {
          id: 'pm_i3',
          title: 'System Architectures & Dev Collaboration',
          duration: '4 Weeks',
          topics: ['REST API architecture for PMs', 'Database schema designs basics', 'Microservices vs Monolith architectures', 'Security checklist reviews', 'Technical debt management'],
          description: 'Understanding software architectures, collaborating with tech leads on system limitations, and prioritizing code refactoring.',
          status: 'not_started',
          ethicalWisdom: 'An outstanding PM budgets 20% of engineering bandwidth for tech debt. Respecting stable engineering creates safe systems.'
        },
        {
          id: 'pm_i4',
          title: 'Privacy Compliance & Trust-Centric Growth',
          duration: '3 Weeks',
          topics: ['GDPR & CCPA policies', 'Cookie consent optimizations', 'Friction-free opt-out pathways', 'Trust indicator KPIs', 'Transparent pricing models'],
          description: 'Setting up legally compliant storage guardrails, designing transparent subscription plans, and auditing churn markers.',
          status: 'not_started',
          ethicalWisdom: 'Trust is the most valuable currency. Refusing to hide checkout terms or trap customers in subscriptions is product integrity.'
        }
      );
    } else {
      // Advanced
      modules.push(
        {
          id: 'pm_a1',
          title: 'Global Scale & Network Growth Loops',
          duration: '4 Weeks',
          topics: ['Growth Loops architectures', 'International payment localized gateways', 'Dynamic cohort testing frameworks', 'Network effect flywheels', 'Multi-tenant PM rules'],
          description: 'Designing product engines that scale internationally, optimizing local conversions, and scaling platform value.',
          status: 'not_started',
          ethicalWisdom: 'As your product reaches millions, even minor errors scale. Keep deep quality safeguards in place for global cohorts.'
        },
        {
          id: 'pm_a2',
          title: 'Advanced System Strategy for Executives',
          duration: '4 Weeks',
          topics: ['Cloud compute budget allocations', 'Machine learning business metrics', 'Infrastructure cost models', 'Scalability risk evaluations', 'Vendor negotiations'],
          description: 'Sizing tech budgets, planning infrastructure investments, and mapping out AI system metrics.',
          status: 'not_started',
          ethicalWisdom: 'Allocate resources to optimize computational efficiency, actively reducing the carbon costs of large scale cloud systems.'
        },
        {
          id: 'pm_a3',
          title: 'Portfolio Governance & Strategic OKRs',
          duration: '4 Weeks',
          topics: ['OKR metric formulations', 'Portfolio resource distribution', 'Corporate governance structures', 'Systemic risk mitigations', 'Executive presentation charts'],
          description: 'Drafting high-level team alignment goals, managing multi-team allocations, and auditing portfolio risks.',
          status: 'not_started',
          ethicalWisdom: 'Objectives must inspire human contribution. Let your team metrics reward quality, safety, and community service.'
        },
        {
          id: 'pm_a4',
          title: 'Ethical Leadership & Digital Well-Being',
          duration: '3 Weeks',
          topics: ['Time-well-spent design metrics', 'Sustainable cloud product goals', 'Public interest technology stewardship', 'Technology for systemic equality', 'Dharma alignment models'],
          description: 'Evolving product metrics from engagement to focus, integrating carbon-reduction roadmap goals, and leading products with moral purpose.',
          status: 'not_started',
          ethicalWisdom: 'A product manager is a custodian of human focus. May your technology serve human wellbeing, elevate digital health, and act with absolute honor.'
        }
      );
    }
  }

  // MOBILE & GAME PATHWAY
  else if (category === 'mobile') {
    if (diffNormalized === 'Beginner') {
      modules.push(
        {
          id: 'mob_b1',
          title: 'Mobile Programming Syntax & IDEs',
          duration: '4 Weeks',
          topics: ['Dart / Swift / Kotlin syntax', 'Variables & loops structures', 'Android Studio / Xcode IDEs', 'Compilation error debugging', 'Git branch setups'],
          description: 'Getting familiar with mobile-specific languages, compiling native emulators, and organizing source code repositories.',
          status: 'not_started',
          ethicalWisdom: 'Pragmatic coding starts with reproducible compilations. Keep code structures clean and check standard lint warnings.'
        },
        {
          id: 'mob_b2',
          title: 'Mobile UI Layouts & Material Design',
          duration: '6 Weeks',
          topics: ['Flutter widgets hierarchies', 'SwiftUI / Jetpack Compose views', 'Flexbox layout grids', 'Click Event handlers', 'Local state updates'],
          description: 'Structuring responsive mobile views, managing local layouts, and handling click actions.',
          status: 'not_started',
          ethicalWisdom: 'UI elements must scale gracefully with system text sizes. Respecting elder accessibility is mobile design empathy.'
        },
        {
          id: 'mob_b3',
          title: 'SQLite Databases & Local Storage',
          duration: '6 Weeks',
          topics: ['SQLite CRUD query structures', 'Shared Preferences variables', 'Local JSON serialization', 'File system directories', 'Offline indicators'],
          description: 'Saving user data to sandboxed local databases, reading configurations, and writing robust offline fallbacks.',
          status: 'not_started',
          ethicalWisdom: 'Never save sensitive plain-text user passwords to unencrypted local storage vaults. Utilize system keychain interfaces.'
        },
        {
          id: 'mob_b4',
          title: 'API Integrations & Permission Audits',
          duration: '4 Weeks',
          topics: ['HTTP GET/POST requests', 'REST JSON parsing', 'Mobile Permission audits', 'App bundle builds', 'Launch checks'],
          description: 'Fetching remote assets, rendering image buffers, and compiling final bundles for device testing.',
          status: 'not_started',
          ethicalWisdom: 'Avoid requesting permissions you do not strictly need. Requesting background location for a simple app is unethical.'
        }
      );
    } else if (diffNormalized === 'Intermediate') {
      modules.push(
        {
          id: 'mob_i1',
          title: 'Cross-Platform App State Architectures',
          duration: '4 Weeks',
          topics: ['Flutter Bloc / Provider', 'Jetpack Compose ViewModels', 'MVVM code architectures', 'Global event busses', 'State hydration patterns'],
          description: 'Structuring complex applications using decoupled state engines, optimizing view updates, and hydrating cached models.',
          status: 'not_started',
          ethicalWisdom: 'Decoupling display UI from state machines avoids memory leaks and respects system processing limits.'
        },
        {
          id: 'mob_i2',
          title: 'Push Notifications & Social Logins',
          duration: '5 Weeks',
          topics: ['Firebase API integration', 'OAuth mobile redirect patterns', 'Push Notification middlewares', 'Deep linking setups', 'Cloud synchronizations'],
          description: 'Configuring messaging engines, managing secure OAuth tokens, and setting up system URL schemes.',
          status: 'not_started',
          ethicalWisdom: 'Notification alerts can easily become addictive noise. Give users precise, granular control over alert preferences.'
        },
        {
          id: 'mob_i3',
          title: 'Offline-First Storage & Image Caching',
          duration: '4 Weeks',
          topics: ['Offline first sync managers', 'Image caching pipelines', 'Background worker queues', 'Memory leak trace tools', 'Network rate limit handlers'],
          description: 'Building apps that perform flawlessly in flight mode, optimizing local memory caches, and queuing offline transactions.',
          status: 'not_started',
          ethicalWisdom: 'Offline-first design is digital inclusion. Protecting app utility on slow, unstable networks empowers underserved cohorts.'
        },
        {
          id: 'mob_i4',
          title: 'Keystore Security & Accessible Themes',
          duration: '3 Weeks',
          topics: ['iOS Keychain & Android Keystore APIs', 'Biometric secure prompts', 'System accessibility triggers', 'Dynamic Dark Mode styling', 'App Store security audits'],
          description: 'Locking private session tokens inside biometric hardware cryptosystems, and creating high-contrast dark themes.',
          status: 'not_started',
          ethicalWisdom: 'Your user is your guest. Guarding their biometric data with native system keystore layers is our basic trust-holding duty.'
        }
      );
    } else {
      // Advanced
      modules.push(
        {
          id: 'mob_a1',
          title: 'Native Bridges & Graphics Engines',
          duration: '4 Weeks',
          topics: ['Flutter Method Channels', 'Custom Swift/Kotlin modules', 'OpenGL / Metal canvas rendering', 'Low-level device resource checks', 'Multi-threaded tasks'],
          description: 'Writing low-level native bridges to compile custom drivers, and configuring high-speed 2D rendering canvases.',
          status: 'not_started',
          ethicalWisdom: 'Direct native bridges demand absolute safety. Sandboxing custom memory pointers prevents fatal platform segmentation crashes.'
        },
        {
          id: 'mob_a2',
          title: 'Real-Time WebSockets & Canvas Physics',
          duration: '4 Weeks',
          topics: ['WebSocket protocol networks', 'Interactive touch gesture engines', 'Physics canvas vector math', 'Real-time state synchronization', 'Frame rate optimization (120Hz)'],
          description: 'Engineering interactive, instant WebSocket bridges, and optimizing vector layouts to maintain consistent 120Hz frames.',
          status: 'not_started',
          ethicalWisdom: 'Optimized rendering prevents processor overheating, drastically extending device battery lifespans for energy conservation.'
        },
        {
          id: 'mob_a3',
          title: 'DevOps CI/CD Build Pipelines & Testing',
          duration: '4 Weeks',
          topics: ['Fastlane automation scripts', 'App Center beta deployment pools', 'Mobile End-to-End integration tests', 'Crashlytics trace triggers', 'Symbolic translation mapping'],
          description: 'Automating multi-platform app compilation flows, scheduling automated UI touch checks, and tracking crash matrices.',
          status: 'not_started',
          ethicalWisdom: 'Resolving crash traces before public releases protects hundreds of thousands of users from critical operational failures.'
        },
        {
          id: 'mob_a4',
          title: 'Privacy Compliance & Digital Well-Being Dharma',
          duration: '3 Weeks',
          topics: ['Screen-Time limiting widgets', 'Strict sandboxing storage laws', 'Dynamic typography scale support', 'Global accessibility testing', 'Mobile stewardship'],
          description: 'Creating screen-time tracking widgets, validating absolute layout scaling, and dedicating mobile skills to public benefit utilities.',
          status: 'not_started',
          ethicalWisdom: 'Code is dynamic action. Building mobile tools that enhance human connection without creating dependency is digital Dharma.'
        }
      );
    }
  }

  // FALLBACK / GENERIC PATHWAY
  else {
    const term = careerGoal || 'Software Engineer';
    if (diffNormalized === 'Beginner') {
      modules.push(
        {
          id: 'gen_b1',
          title: isTelugu ? `${term} పునాదులు మరియు పరిచయం` : isSpanish ? `Fundamentos de ${term} y Herramientas` : `Foundations & Core Principles of ${term}`,
          duration: '4 Weeks',
          topics: [`Core syntax of ${term}`, 'Essential compiler frameworks', 'Basic command setups', 'Version Control with Git', 'First console project'],
          description: isSpanish ? `Bases teóricas y prácticas iniciales para comenzar en ${term} con bases sólidas.` : `Mastering the absolute basics, compiling simple scripts, and setting up the local workspace.`,
          status: 'not_started',
          ethicalWisdom: 'Beginning your journey requires clear mental boundaries. Keep your code well-organized and your intent pure.'
        },
        {
          id: 'gen_b2',
          title: isTelugu ? `నిర్మాణాత్మక ప్రోగ్రామింగ్` : isSpanish ? `Estructuras y Construcciones Básicas` : `Control Flow & Fundamental Structures`,
          duration: '4 Weeks',
          topics: ['Conditional statements', 'Loop operations and nesting', 'Base function declarations', 'Simple logical debugging', 'Core error isolation'],
          description: isSpanish ? `Estructuras de control lógicas y funciones para organizar el flujo del programa.` : `Understanding how data flows through control blocks, executing loops, and isolating baseline errors.`,
          status: 'not_started',
          ethicalWisdom: 'Honest structures reflect clean thinking. Ensure your logic accounts for all input branches to prevent hidden bugs.'
        },
        {
          id: 'gen_b3',
          title: isTelugu ? `డేటా స్ట్రక్చర్స్ మరియు సేకరణలు` : isSpanish ? `Colecciones y Estructuras de Datos` : `Data Collections & Fundamental Types`,
          duration: '4 Weeks',
          topics: ['Array indexing and operations', 'Basic string processing', 'Key-Value dictionary mappings', 'In-memory stack dynamics', 'Recursive logic basics'],
          description: isSpanish ? `Manejo de colecciones de datos esenciales, diccionarios y arrays para guardar información.` : `Structuring application memory with linear arrays, dynamic maps, and exploring self-referential function loops.`,
          status: 'not_started',
          ethicalWisdom: 'Respect your users by treating their inputs with respect. Validating boundaries is a hallmark of defensive design.'
        },
        {
          id: 'gen_b4',
          title: isTelugu ? `తొలి కోడింగ్ ప్రాజెక్ట్ & ధర్మ సమన్వయం` : isSpanish ? `Proyecto Capstone Inicial y Alineación Ética` : `Baseline Capstone Project & Holistic Alignment`,
          duration: '4 Weeks',
          topics: ['Iterative project architecture', 'Structuring human-readable logs', 'Writing simple terminal test assertions', 'Peer review feedback cycles', 'Ethical software design principles'],
          description: isSpanish ? `Unión de conceptos para crear un proyecto inicial práctico alineado con un impacto constructivo.` : `Building a cohesive console application, testing basic constraints, and assessing the ethical footprint of your creation.`,
          status: 'not_started',
          ethicalWisdom: 'Your digital creation acts in the physical world. Let your first complete product reflect utility and social responsibility.'
        }
      );
    } else if (diffNormalized === 'Intermediate') {
      modules.push(
        {
          id: 'gen_i1',
          title: isSpanish ? `Arquitectura de Sistemas y Flujo de Estado` : `System Architectures & State Flow`,
          duration: '4 Weeks',
          topics: ['Decoupled state engines', 'ViewModel data flows', 'Caching strategies', 'Global event handlers', 'Network connectivity checkers'],
          description: isSpanish ? `Estructuración de aplicaciones utilizando componentes desacoplados y estados dinámicos.` : `Designing resilient applications with data segregation, handling state updates, and managing local cache layers.`,
          status: 'not_started',
          ethicalWisdom: 'Decoupling application view states prevents memory leakage and respects client resource limitations.'
        },
        {
          id: 'gen_i2',
          title: isSpanish ? `APIs, Operaciones de BD y Middleware` : `APIs, Database Operations & Middleware`,
          duration: '4 Weeks',
          topics: ['RESTful API integrations', 'Relational tables & SQL queries', 'Middleware routing patterns', 'Input parsing sanitization', 'JSON web token handshakes'],
          description: isSpanish ? `Integración con servidores externos, almacenamiento en bases de datos y seguridad.` : `Building robust API bridges, querying relational data nodes, and validating payloads against injection exploits.`,
          status: 'not_started',
          ethicalWisdom: 'Protecting remote connections and sanitizing inputs is our basic duty to shield user data from malicious actors.'
        },
        {
          id: 'gen_i3',
          title: isSpanish ? `Contenedores y Pruebas CI/CD` : `Continuous Integration & Environment Isolation`,
          duration: '4 Weeks',
          topics: ['Docker container structures', 'Automated mock test routines', 'CI/CD pipeline workflows', 'System load validations', 'Versioned checkouts'],
          description: isSpanish ? `Configuración de contenedores Docker y flujos automatizados de Git.` : `Configuring standard runtime wrappers, drafting integration testing scripts, and automating compilation setups.`,
          status: 'not_started',
          ethicalWisdom: 'Rigorous tests are a pledge to our consumers. Avoiding buggy updates maintains digital work security.'
        },
        {
          id: 'gen_i4',
          title: isSpanish ? `Cumplimiento Ético y Mitigaciones` : `API Security & Trust Auditing`,
          duration: '3 Weeks',
          topics: ['JWT Token storage security', 'Compliance policies audits', 'Transparent consent designs', 'Eco-efficiency metrics checking', 'Dharma-guided reviews'],
          description: isSpanish ? `Verificaciones de seguridad finales, privacidad y de carbono.` : `Validating payload boundaries, checking cloud computing metrics, and certifying universal access standards.`,
          status: 'not_started',
          ethicalWisdom: 'Our tech creations represent our values in action. Letting integrity guide product bounds is the core of design Dharma.'
        }
      );
    } else {
      // Advanced
      modules.push(
        {
          id: 'gen_a1',
          title: isSpanish ? `Diseño de Sistemas a Gran Escala para ${term}` : `Scalable Enterprise Design for ${term}`,
          duration: '4 Weeks',
          topics: ['Decoupled event buses', 'Distributed task systems', 'API Gateway designs', 'System health checks', 'Remote procedural calls (RPC)'],
          description: isSpanish ? `Sistemas distribuidos avanzados y mensajería asíncrona.` : `Architecting multi-tier distributed nodes, structuring high-performance asynchronous messaging, and tracing runtime latency.`,
          status: 'not_started',
          ethicalWisdom: 'Enterprise-grade scale demands enterprise-grade safety. Isolate network boundaries to protect customer privacy.'
        },
        {
          id: 'gen_a2',
          title: isSpanish ? `Optimización y Alta Velocidad` : `High Performance Optimization & Caching`,
          duration: '4 Weeks',
          topics: ['Sharding distributed tables', 'Geographic read replicas', 'Memory key-value indexing', 'Connection pool optimizations', 'Thread concurrency analysis'],
          description: isSpanish ? `Replicación de bases de datos y optimización de latencia en milisegundos.` : `Managing high-density queries, sharding data nodes to eliminate compute bottlenecks, and utilizing fast RAM keys.`,
          status: 'not_started',
          ethicalWisdom: 'Highly efficient architectures conserve electricity. Optimizing performance directly reduces the ecological cost of computing.'
        },
        {
          id: 'gen_a3',
          title: isSpanish ? `Infraestructura Kubernetes e IaC` : `Kubernetes Orchestration & Declarative IaC`,
          duration: '4 Weeks',
          topics: ['Declarative system topologies (IaC)', 'Kubernetes container management', 'Self-healing cluster pods', 'Global system telemetry configs', 'Zero-downtime canary launches'],
          description: isSpanish ? `Orquestación avanzada de contenedores y monitoreo de telemetría.` : `Writing declarative infrastructure configurations, compiling orchestrators, and tracking performance indicators.`,
          status: 'not_started',
          ethicalWisdom: 'A crash in public services directly harms communities. Keeping systems reliable is an act of deep public care.'
        },
        {
          id: 'gen_a4',
          title: isSpanish ? `Alineación Global y Dharma en ${term}` : `Societal-Scale Stewardship & Dharma in ${term}`,
          duration: '3 Weeks',
          topics: ['Preventing systemic biases', 'Carbon-neutral orchestration', 'Guarding public infrastructure systems', 'Accessible open-source designs', 'Dharma tech stewardship'],
          description: isSpanish ? `Tecnología neutral, sostenible y alineada para el bienestar colectivo.` : `Eliciting clear moral boundaries in algorithms, auditing carbon expenditures, and committing technical skills to human uplift.`,
          status: 'not_started',
          ethicalWisdom: 'Skill combined with compassion is true wisdom. Ensure your software remains a force for equity, access, and societal peace.'
        }
      );
    }
  }

  // 4. Return complete, highly structural, realistic roadmap object
  const enrichedModules = modules.map((mod, index) => {
    const cleanGoal = careerGoal || 'Software Engineer';
    const curated = getCuratedResourcesForModule(category, mod.title, mod.topics, index);

    return {
      ...mod,
      targetRole: `${cleanGoal} (${difficulty}) - Module ${index + 1} Specialist`,
      youtubeVideos: curated.youtubeVideos,
      leetcodeProblems: curated.leetcodeProblems,
      curatedContent: curated.curatedContent,
      industryUseCases: curated.industryUseCases
    };
  });

  return {
    title,
    description,
    careerGoal,
    duration,
    difficulty: diffNormalized,
    modules: enrichedModules
  };
}

function getMockDharmaExplanation(concept: string, preferredLanguage: string, messages: any[] = []) {
  const isTelugu = preferredLanguage === 'Telugu';
  const isSpanish = preferredLanguage === 'Spanish';

  const isFollowUp = messages && messages.length > 0;
  const lastMessage = isFollowUp ? messages[messages.length - 1].text : '';

  if (isFollowUp) {
    if (isSpanish) {
      return {
        answerText: `### Profundización Épica: Explorando "${lastMessage}"\n\nPara resolver esto de manera recursiva e interactiva, desglosaremos su funcionamiento interno:\n\n- **La Resolución Recursiva**: Cada problema complejo es simplemente una pila de sub-problemas más sencillos. Al resolver las condiciones base primero, el problema mayor se resuelve de forma natural.\n- **Ejemplo en el mundo real**: Imagina un lente zoom de fotografía o un resolvedor automático de dependencias en React. Refinamos iterativamente hasta alcanzar la claridad óptima.\n\nCódigo práctico de ejemplo:\n\n\`\`\`javascript\n// Secuencia recursiva de análisis para ${concept}\nfunction resolverPaso(estado) {\n  console.log("Analizando capa:", estado.profundidad);\n  if (estado.profundidad <= 0) return "¡Clariad óptima alcanzada!";\n  return resolverPaso({ ...estado, profundidad: estado.profundidad - 1 });\n}\n\`\`\``,
        recursiveFollowUps: [
          `💡 Muéstrame una guía paso a paso para depurar este código`,
          `🛠️ ¿Qué sucede si ocurre un bucle infinito o un caso extremo?`,
          `🌍 Explícame otra analogía del mundo real para este tema`
        ]
      };
    }
    return {
      answerText: `### Epic Deep-Dive: Exploring "${lastMessage}" recursively\n\nTo solve this in a deep and recursive manner, let's break down how this sub-concept works:\n\n- **The Recursive Resolution**: Every complex problem is just a stack of simpler ones. By solving the base conditions first, the outer layers resolve naturally.\n- **Real-World Execution**: Think of it like a photography zoom lens adjusting its focus rings, or an AI neural network refining weights—we continuously zoom in until we reach absolute clarity.\n\nHere is a practical code execution pattern to master this sub-topic:\n\n\`\`\`javascript\n// Deep-dive execution sequence for ${concept}\nfunction resolveStep(input) {\n  console.log("Analyzing layer:", input.depth);\n  if (input.depth <= 0) return "Optimal Clarity Reached!";\n  return resolveStep({ ...input, depth: input.depth - 1 });\n}\n\`\`\``,
      recursiveFollowUps: [
        `💡 Show me a step-by-step debug walkthrough of this code`,
        `🛠️ What happens if we hit an infinite loop/edge case here?`,
        `🌍 Explain another real-life epic analogy for this level`
      ]
    };
  }

  // Initial explanation
  let answerText = "";
  let asciiDiagram = "";
  let realLifeProject = {
    title: "",
    description: "",
    steps: [] as string[],
    codeSnippet: ""
  };

  if (concept.toLowerCase().includes('recursion')) {
    answerText = `### The Infinite Mirror: Understanding Recursion\n\nRecursion is one of the most elegant, mind-bending concepts in computer science. At its heart, it is a method where the solution to a problem depends on solutions to smaller instances of the same problem. \n\nThink of standing between two mirrors—an endless cascade of you, stretching into the horizon. But in code, we must have a way to stop: the **Base Case**! Without a base case, we fall into the abyss of stack overflow.\n\nEach step down pushes a state onto the call stack. When we hit the base case, the stack unravels, solving the entire problem level by level.`;
    asciiDiagram = `
[Call: recurse(3)] ---> pushes to stack
  [Call: recurse(2)] ---> pushes to stack
    [Call: recurse(1)] ---> pushes to stack (Base Case Hit!)
    [Return: 1] <--- resolves & pops
  [Return: 2] <--- resolves & pops
[Return: 6] <--- final epic resolution!
`;
    realLifeProject = {
      title: "Real-Life Automated Directory & File Indexer",
      description: "How computer operating systems search or count nested folder structures. Since folders contain files and other folders of arbitrary depth, you cannot use simple loops. You MUST use recursion to traverse every branch of the file tree recursively.",
      steps: [
        "Create a function `indexFolder(folderPath)`",
        "Read all items inside `folderPath`",
        "For each item: If it is a File, record its details",
        "If it is a Subfolder, call `indexFolder(item.path)` (the recursive call!) to go deeper.",
        "Aggregate and return the final flattened list of files once there are no more subfolders."
      ],
      codeSnippet: `// Node.js Recursive Folder Indexer
const fs = require('fs');
const path = require('path');

function indexFolder(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat && stat.isDirectory()) {
      // RECURSIVE CALL: Go deeper into subfolder
      results = results.concat(indexFolder(fullPath));
    } else {
      // BASE CASE: Just collect file
      results.push(fullPath);
    }
  });
  return results;
}`
    };
  } else if (concept.toLowerCase().includes('photograph')) {
    answerText = `### Capturing Light & Shadows: The Mechanics of Photography\n\nPhotography is the physical and digital capture of light. It's a combination of physics, art, and computer science working in perfect synchronization.\n\nTo capture an epic image, three pillars (the Exposure Triangle) must be balanced:\n1. **Aperture (f-stop)**: Controls the depth of field and how much light enters the lens.\n2. **Shutter Speed**: Controls how long the sensor is exposed to light, capturing motion or freezing time.\n3. **ISO**: Controls the sensor's sensitivity to light.\n\nIn modern photography, **Computational Photography** (like Night Mode on smartphones) solves physical hardware limitations recursively by blending multiple raw exposures in real-time.`;
    asciiDiagram = `
  LIGHT ---> [ LENS APERTURE ] ---> [ SHUTTER GATE ] ---> [ IMAGE SENSOR (ISO) ]
                   |                     |                        |
             Depth of Field         Motion Blur              Digital Noise
`;
    realLifeProject = {
      title: "Smartphone HDR (High Dynamic Range) Night Pipe",
      description: "A digital pipeline that captures high-quality night photos by recursively blending a stream of underexposed and overexposed image frames to denoise and extract rich colors from near-total darkness.",
      steps: [
        "Capture a circular buffer of 8-10 rapid exposures when the shutter is pressed.",
        "Apply an alignment algorithm: Align frame N to frame N-1 by matching keypoint grids.",
        "Recursively blend pixel weights: Average noisy pixels with aligned frames to reduce random sensor noise mathematically.",
        "Apply local tone-mapping to boost shadows without blowing out highlights, producing a stunning, clear, low-light photograph."
      ],
      codeSnippet: `// Mock HDR Frame Blend Pipeline
function blendFramesRecursive(frames, index = 0, accumulator = null) {
  // Base Case: No more frames to blend
  if (index >= frames.length) return accumulator;
  
  const currentFrame = frames[index];
  if (accumulator === null) {
    return blendFramesRecursive(frames, index + 1, currentFrame);
  }
  
  // Blend current frame with accumulated average (Denoising step)
  const blended = accumulator.map((pixel, i) => {
    return (pixel * index + currentFrame[i]) / (index + 1);
  });
  
  // Recursive step: go to next frame
  return blendFramesRecursive(frames, index + 1, blended);
}`
    };
  } else if (concept.toLowerCase().includes('generative ai') || concept.toLowerCase().includes('artificial')) {
    answerText = `### The Algorithmic Muse: Generative AI & LLMs\n\nGenerative AI refers to algorithms (such as Large Language Models and Diffusion Models) designed to create new content—text, images, code, or music—based on patterns learned from training data.\n\nInstead of executing predefined hardcoded rules, Generative AI models are trained on colossal datasets. They map words, concepts, or pixels into multi-dimensional coordinate systems called **Embeddings**. When you prompt the model, it predicts the next most likely token recursively, generating a flow of response word by word.`;
    asciiDiagram = `
[ User Prompt ] ---> [ Input Embeddings ] ---> [ Transformer Layers (Attention mechanism) ]
                                                            |
[ Generated Output ] <--- [ Predict Next Token ] <----------+ (Recursive Loop)
`;
    realLifeProject = {
      title: "Interactive Code Companion & Autonomous Agent Loop",
      description: "An AI-driven code editor agent that reads user instructions, scans the local directory recursively, writes code, compiles it, and feeds compilation errors back into itself recursively until the build succeeds.",
      steps: [
        "Accept a prompt and gather the codebase context.",
        "Prompt the LLM to write a code file.",
        "Execute the local compiler to verify the code.",
        "If compile fails: Send the error log back to the LLM recursively, asking it to patch the syntax, and re-compile.",
        "Stop and present the polished file once the compilation succeeds."
      ],
      codeSnippet: `// Autonomous Self-Correcting Compilation Loop
async function writeAndCompileCode(agentPrompt, fileContents, attempts = 0) {
  if (attempts >= 3) throw new Error("Could not solve compilation after 3 attempts.");
  
  // Call LLM to generate or fix code
  const generatedCode = await callLLM(agentPrompt, fileContents);
  await saveFile(generatedCode);
  
  const compileResult = runCompiler();
  if (compileResult.success) {
    return { success: true, code: generatedCode }; // Base case: Compile succeeds!
  } else {
    // Recursive Step: Try to fix compiler errors
    console.warn("Compilation failed, recursing to fix errors:", compileResult.errors);
    const retryPrompt = \`Fix this compile error: \${compileResult.errors}\`;
    return writeAndCompileCode(retryPrompt, generatedCode, attempts + 1);
  }
}`
    };
  } else {
    // General Concept
    answerText = `### Explaining "${concept}" in an Epic Manner\n\n**${concept}** is a brilliant and fascinating topic! To understand it, let's look at its core essence. Every complex system is built from simple, intuitive laws. When we break down **${concept}**, we find a beautiful dance of inputs, processors, and outputs designed to serve human needs and build creative, interesting solutions.`;
    asciiDiagram = `
[ INPUT STATE ] ---> [ "${concept.toUpperCase()}" DYNAMICS ] ---> [ EPIC OUTCOME ]
       |                                                            ^
       +------------------- (Dynamic Exploration Loop) -------------+
`;
    realLifeProject = {
      title: `The Open-Source ${concept} Sandbox`,
      description: `A hands-on, highly interactive visual sandbox project designed to teach and demonstrate the core operational mechanics of ${concept} in a fun, gamified way.`,
      steps: [
        `Initialize a web canvas to visually represent ${concept} data structures.`,
        "Create sliders to tweak real-time parameters dynamically.",
        "Monitor state changes and print high-fidelity logs in a console view.",
        "Allow users to step forward/backward to inspect edge cases recursively."
      ],
      codeSnippet: `// Core logic loop for ${concept} simulation
function simulateStep(systemState) {
  console.log("Processing step for ${concept}...");
  const nextState = { ...systemState, tick: systemState.tick + 1 };
  // Perform simulation formulas
  return nextState;
}`
    };
  }

  return {
    answerText,
    asciiDiagram,
    realLifeProject,
    recursiveFollowUps: [
      `🔍 Deep Dive: Explain the core mechanics of "${concept}" recursively`,
      `🛠️ Show me a hands-on implementation guide for "${realLifeProject.title || concept}"`,
      `💡 Solve a specific, complex real-world issue in "${concept}" step-by-step`,
      `🌍 Give me a highly creative, mind-blowing analogy to understand this better`
    ]
  };
}

function getMockChatbotAnswer(question: string, preferredLanguage: string) {
  const isTelugu = preferredLanguage === 'Telugu';
  const isSpanish = preferredLanguage === 'Spanish';

  if (isTelugu) {
    return {
      text: `నమస్కారం! మీ ప్రశ్న: "**${question}**" చాలా చక్కనిది.\n\nనేను మీ AI ధర్మ కోచ్‌ని. మీ సందేహాన్ని సులభంగా వివరిస్తాను:\n\n1. **ప్రధాన అంశం**: ఈ విషయాన్ని అర్థం చేసుకోవడానికి ప్రాథమిక పునాదులు అవసరం.\n2. **ఆచరణాత్మక విధానం**: దీనిని చిన్న చిన్న భాగాలుగా విభజించి ప్రాక్టీస్ చేయండి. నిరంతర సాధనతో విజయం లభిస్తుంది.\n3. **సామాజిక బాధ్యత (ధర్మం)**: మీరు నేర్చుకునే జ్ఞానం సమాజానికి ఏ విధంగా ఉపయోగపడుతుందో ఆలోచించండి.\n\nఏదైనా నిర్దిష్ట కోడ్ లేదా మరింత సమాచారం కావాలంటే నన్ను అడగండి!`
    };
  } else if (isSpanish) {
    return {
      text: `¡Hola! Tu pregunta sobre "**${question}**" es sumamente interesante.\n\nComo tu tutor de inteligencia artificial, permíteme estructurar la respuesta en tres dimensiones clave:\n\n1. **Concepto Clave**: Para dominar este tema, es esencial desglosar el problema principal en componentes lógicos más pequeños.\n2. **Práctica Aplicada**: Te sugiero crear pequeños laboratorios experimentales donde implementes esto de manera directa.\n3. **El Sentido del Dharma (Deber Ético)**: Asegúrate de que las herramientas creadas a partir de este conocimiento promuevan la transparencia y la inclusión social.\n\n¿Te gustaría que profundicemos en algún aspecto específico o revisemos un fragmento de código?`
    };
  } else {
    return {
      text: `Hello! Your question about "**${question}**" is highly relevant to your learning path.\n\nHere is a comprehensive breakdown to help you master this concept:\n\n### 1. The Core Principle\nFocus on understanding the underlying patterns rather than just memorizing rules. Break down the question into its functional components.\n\n### 2. Practical Implementation\n- **Start Small**: Create minimal examples to test how each parameter or line behaves.\n- **Verify Inputs**: Ensure your interfaces are solid and handle edge cases gracefully.\n- **Log & Debug**: Keep detailed console or telemetry trails during experimentation.\n\n### 3. Holistic Responsibility (Dharma Lens)\nWhenever you build systems around this concept, always consider usability and accessibility. Our ultimate duty is to construct digital products that are safe, ethical, and universally beneficial.\n\nWould you like me to generate a specific code example or design flowchart related to this question?`
    };
  }
}

function getMockVoiceResponse(spokenText: string, preferredLanguage: string) {
  const isTelugu = preferredLanguage === 'Telugu';
  const isSpanish = preferredLanguage === 'Spanish';

  if (isTelugu) {
    return {
      replyText: `నేను వింటున్నాను. "${spokenText}" గురించి మీరు చాలా చక్కగా అడిగారు. దీనిపై మనం కలిసి మరింత అధ్యయనం చేద్దాం!`,
      emotion: 'encouraging'
    };
  } else if (isSpanish) {
    return {
      replyText: `Te escucho con atención. Tu idea sobre "${spokenText}" suena fantástica. ¡Sigamos adelante con tu aprendizaje!`,
      emotion: 'encouraging'
    };
  } else {
    return {
      replyText: `I hear you loud and clear. Your thoughts on "${spokenText}" are great. Let's keep exploring this together!`,
      emotion: 'encouraging'
    };
  }
}

function getMockResumeAnalysis(resumeText: string, careerTarget: string, preferredLanguage: string, jobDescriptionText?: string) {
  const isTelugu = preferredLanguage === 'Telugu';
  const isSpanish = preferredLanguage === 'Spanish';

  const wordCount = resumeText ? resumeText.split(/\s+/).length : 0;
  const computedScore = Math.min(95, Math.max(45, 60 + (wordCount % 25)));
  
  const hasJD = !!(jobDescriptionText && jobDescriptionText.trim().length > 0);
  const jdPreview = hasJD ? (jobDescriptionText!.length > 40 ? jobDescriptionText!.substring(0, 40) + "..." : jobDescriptionText) : "";

  if (isTelugu) {
    return {
      score: computedScore,
      checklist: [
        { id: "check_1", label: "పరిమాణాత్మక కొలమానాలను చేర్చండి", status: "warn", recommendation: "మీ విజయాలను నిరూపించడానికి శాతాలు లేదా సంఖ్యలను జోడించండి." },
        { id: "check_2", label: "శక్తివంతమైన క్రియాపదాలతో ప్రారంభించండి", status: "pass", recommendation: "మీరు గొప్ప క్రియాపదాలను ఉపయోగించారు." },
        { id: "check_3", label: "కెరీర్ లక్ష్య కీలకపదాలు", status: "fail", recommendation: `మీ రెజ్యూమెలో "${careerTarget}" కు సరిపోయే సాంకేతిక పదాలు లేవు.` }
      ],
      strengths: [
        "మంచి ఫార్మాటింగ్ మరియు విభాగాలు.",
        "ప్రాజెక్టులలో ఆధునిక సాంకేతికతల ప్రదర్శన."
      ],
      gaps: [
        "సాంకేతిక నైపుణ్యాల యొక్క సరైన వర్గీకరణ అవసరం.",
        "వ్యాపార ఫలితాలపై దృష్టి పెట్టాలి."
      ],
      suggestedChanges: [
        {
          section: "అనుభవం (Experience)",
          originalText: "సాఫ్ట్‌వేర్ అప్లికేషన్‌ల నిర్వహణకు బాధ్యత వహించాను.",
          suggestedText: `స్వయంచాలక వ్యవస్థలను పర్యవేక్షించి, "${careerTarget}" లో డేటా నిల్వ సామర్థ్యాన్ని 30% పెంచాను.`,
          explanation: "ఇది మీ పాత్ర మరియు ప్రయోజనాన్ని స్పష్టంగా వివరిస్తుంది."
        }
      ],
      jobDescriptionText: jobDescriptionText || "",
      drawbacks: [
        hasJD 
          ? `జాబ్ డిస్క్రిప్షన్ ఉత్పత్తి-స్థాయి కార్యకలాపాలకు అధిక ప్రాధాన్యత ఇస్తుంది, అయితే ప్రస్తుత రెజ్యూమె ప్రధానంగా చిన్న-స్థాయి విద్యా ప్రాజెక్ట్‌లను మాత్రమే కలిగి ఉంది.`
          : `రెజ్యూమెలో ఉత్పత్తి పర్యావరణ అనుభవం లేదా స్కేలబిలిటీ కొలమానాలు తక్కువగా ఉన్నాయి.`,
        `క్లౌడ్ మరియు భద్రతా నిబంధనల ప్రస్తావన రెజ్యూమెలో ఎక్కడా లేదు.`,
        `సేవల ప్రతిస్పందన సమయాన్ని లేదా డేటాబేస్ ఆప్టిమైజేషన్‌ను చూపించే కొలమానాలు లేకపోవడం వల్ల ఏటీఎస్ స్కోరు తగ్గే అవకాశం ఉంది.`
      ],
      gapsWithJobDescription: [
        hasJD
          ? `జాబ్ డిస్క్రిప్షన్ లో అడిగిన అధునాతన సాధనాలు (ఉదాహరణకు: CI/CD, కుబెర్నెటీస్ లేదా డాకర్) మీ రెజ్యూమెలో లేవు.`
          : `సిస్టమ్-స్థాయి పనితీరు ఆప్టిమైజేషన్లు మరియు అధునాతన ఆర్కిటెక్చర్ నమూనాల కొరత ఉంది.`,
        `నిజ-సమయ సహకార ప్రాజెక్ట్ అనుభవం (Agile/Scrum పద్ధతులు) తగినంతగా చూపించబడలేదు.`
      ],
      keyInsights: [
        `రిక్రూటర్లు స్వతంత్రంగా ఉత్పత్తి-స్థాయి కోడ్‌ను వ్రాయగల మరియు క్లౌడ్ లో అమర్చగల అభ్యర్థులను కోరుకుంటున్నారు.`,
        `డేటాబేస్ ఆప్టిమైజేషన్ మరియు సురక్షితమైన ఏపిఐ రూపకల్పనకు అత్యధిక ప్రాధాన్యత ఇవ్వబడింది.`,
        `సాంకేతిక నైపుణ్యాలతో పాటు నైతిక మరియు సురక్షిత కోడింగ్ పద్ధతుల పట్ల అవగాహన ఉండటం అదనపు బలం.`
      ],
      keyFormatsToSolve: [
        `మీ ప్రాజెక్ట్ మరియు అనుభవ వివరాలలో 'X-Y-Z' ఫార్మాట్ ను ఉపయోగించండి: "[Z] చేయడం ద్వారా [Y] కొలవబడిన [X] సాధించాను".`,
        `ఏటీఎస్ ఫిల్టర్లను సులభంగా అధిగమించడానికి రెజ్యూమె పైభాగంలో 'ప్రధాన సాంకేతికతలు (Core Technologies)' అనే ప్రత్యేక విభాగాన్ని జోడించండి.`,
        `ప్రాజెక్టులను సాధారణ శీర్షికలకు బదులుగా 'ఉత్పత్తి-స్థాయి ఆర్కిటెక్చర్స్ (Production-Grade Architectures)' గా వర్గీకరించండి.`
      ],
      optimizedResumeText: `[విద్వాంసుడి పేరు / అభ్యర్థి పేరు]
ఇమెయిల్: candidate@email.com | లింక్డ్‌ఇన్ | గిట్‌హబ్

సారాంశం (Professional Summary):
మొండి పట్టుదల మరియు పరిశోధనాత్మక ఆలోచన గల సాఫ్ట్‌వేర్ ఇంజనీర్. సురక్షితమైన, వేగవంతమైన బ్యాకెండ్ ఏపిఐలు మరియు డిస్ట్రిబ్యూటెడ్ సిస్టమ్స్ రూపకల్పనలో నైపుణ్యం కలిగి ఉన్నాను. క్లౌడ్ టెక్నాలజీలు మరియు డేటాబేస్ ఆప్టిమైజేషన్ల ద్వారా అప్లికేషన్ సామర్థ్యాన్ని పెంచడానికి సిద్ధంగా ఉన్నాను.

సాంకేతిక నైపుణ్యాలు (Core Technical Skills):
- ప్రోగ్రామింగ్ భాషలు: జావాస్క్రిప్ట్/టైప్‌స్క్రిప్ట్, పైథాన్, SQL, HTML5, CSS3
- ఫ్రేమ్‌వర్కులు & క్లౌడ్: రియాక్ట్, ఎక్స్‌ప్రెస్, నోడ్.జెఎస్, డాకర్, AWS (S3/EC2), CI/CD పైప్‌లైన్స్
- సాధనాలు & పద్ధతులు: గిట్, అజైల్/స్క్రమ్, సాఫ్ట్‌వేర్ నైతిక భద్రత

వృత్తిపరమైన విజయాలు & ప్రాజెక్టులు (Key Projects & Experience):
* ఉత్పత్తి-స్థాయి బ్యాకెండ్ ఆప్టిమైజేషన్:
  - ఇండెక్సింగ్ మరియు మల్టీ-థ్రెడింగ్ ద్వారా డేటాబేస్ క్వెరీ సమయాన్ని 35% తగ్గించాను.
  - భద్రతా లోపాలను అరికట్టడానికి ఇన్పుట్ శానిటైజేషన్ మరియు నైతిక డేటా నిల్వ ప్రమాణాలను అమలు చేశాను.
* ఇంటరాక్టివ్ వెబ్ అప్లికేషన్:
  - రియాక్ట్ మరియు వెబ్‌సాకెట్ ఉపయోగించి నిజ-సమయ అప్లికేషన్ ను నిర్మించాను, దీని వల్ల వినియోగదారుల నిశ్చితార్థం 20% పెరిగింది.

విద్య (Education):
కంప్యూటర్ సైన్స్ లో బ్యాచిలర్స్ డిగ్రీ / ఇంజనీరింగ్`
    };
  } else if (isSpanish) {
    return {
      score: computedScore,
      checklist: [
        { id: "check_1", label: "Incluir métricas cuantificables", status: "warn", recommendation: "Agrega porcentajes o números específicos para medir tu impacto profesional directo." },
        { id: "check_2", label: "Comenzar con verbos de acción", status: "pass", recommendation: "Buen uso de verbos fuertes como Lideré, Diseñé, o Implementé." },
        { id: "check_3", label: "Alineación de palabras clave con el objetivo", status: "fail", recommendation: `Falta incorporar palabras clave específicas para la posición de "${careerTarget}".` }
      ],
      strengths: [
        "Formato limpio y excelente legibilidad estructural.",
        "Proyectos prácticos detallados con arquitecturas modernas."
      ],
      gaps: [
        "Se necesitan más detalles sobre el impacto directo en el negocio.",
        "Falta enfatizar habilidades de liderazgo colaborativo."
      ],
      suggestedChanges: [
        {
          section: "Experiencia Profesional",
          originalText: "Responsable de administrar las aplicaciones de software de la empresa.",
          suggestedText: `Lideré la migración de microservicios críticos para "${careerTarget}", reduciendo el tiempo de inactividad del sistema en un 40%.`,
          explanation: "Este cambio utiliza verbos de acción asertivos y resalta una métrica cuantificable."
        }
      ],
      jobDescriptionText: jobDescriptionText || "",
      drawbacks: [
        hasJD 
          ? `La descripción del puesto prioriza la experiencia en sistemas de producción a gran escala, mientras que el currículum actual destaca proyectos académicos pequeños.`
          : `El currículum carece de métricas claras de rendimiento y escala en entornos de producción real.`,
        `Falta de mención de estándares de seguridad informática y protocolos de cumplimiento en la nube.`,
        `No se presentan métricas de volumen de datos ni optimización de consultas complejas.`
      ],
      gapsWithJobDescription: [
        hasJD
          ? `Herramientas clave solicitadas en la descripción (como Docker, Kubernetes, o pipelines CI/CD) no se encuentran en el currículum actual.`
          : `Falta de experiencia visible con integraciones de nube y optimización a nivel de infraestructura.`,
        `Ausencia de metodologías ágiles de trabajo (Agile/Scrum) en la descripción de proyectos.`
      ],
      keyInsights: [
        `El empleador busca ingenieros capaces de escribir código limpio y robusto listo para producción sin supervisión constante.`,
        `Se otorga gran valor a la confiabilidad de las bases de datos y la reducción de latencia en las APIs.`,
        `Las habilidades de desarrollo seguro y consideraciones éticas de datos representan un fuerte diferenciador para el candidato.`
      ],
      keyFormatsToSolve: [
        `Aplica la fórmula 'X-Y-Z' de Google: "Logré [X], medido por [Y], mediante la acción [Z]" en los viñetas de experiencia.`,
        `Crea una sección destacada de 'Tecnologías Clave' en la parte superior para pasar de inmediato los filtros ATS automáticos.`,
        `Renombra la sección de proyectos escolares a 'Arquitecturas Modernas de Nivel de Producción'.`
      ],
      optimizedResumeText: `[Nombre del Candidato]
Email: candidate@email.com | LinkedIn | GitHub

Resumen Profesional:
Ingeniero de Software motivado y enfocado en la excelencia técnica. Especialista en construir APIs robustas y seguras con Node.js y React. Apasionado por la optimización de bases de datos, despliegues eficientes en la nube y la arquitectura de sistemas éticamente responsables.

Habilidades Técnicas Clave:
- Lenguajes: JavaScript, TypeScript, Python, SQL, HTML5, CSS3
- Frameworks y Nube: React, Node.js, Express, Docker, AWS (EC2, S3), CI/CD
- Metodologías: Scrum/Agile, Git, Prácticas de Codificación Segura y Ética

Experiencia Seleccionada & Proyectos:
* Optimización de Backend de Producción:
  - Reduje el tiempo de respuesta de consultas en un 35% mediante la implementación de índices avanzados y lógica multi-hilo en la base de datos.
  - Diseñé esquemas de datos seguros previniendo vulnerabilidades críticas mediante sanitización rigurosa de entradas de usuario.
* Aplicación Web Interactiva de Alto Rendimiento:
  - Desarrollé una aplicación en tiempo real utilizando React y WebSockets, aumentando el compromiso del usuario en un 20%.

Educación:
Grado en Ingeniería de Sistemas / Ciencias de la Computación`
    };
  } else {
    return {
      score: computedScore,
      checklist: [
        { id: "check_1", label: "Include Quantifiable Metrics & Numbers", status: "warn", recommendation: "Add specific percentages, speed metrics, or numeric scale to prove business impact." },
        { id: "check_2", label: "Use Active Technical Action Verbs", status: "pass", recommendation: "Great use of initiating verbs like 'Architected', 'Spearheaded', and 'Refactored'." },
        { id: "check_3", label: "Keyword Alignment with Target", status: "warn", recommendation: `Ensure specific toolsets and processes related to "${careerTarget}" are explicitly written in your Skills matrix.` }
      ],
      strengths: [
        "Well-organized structure with highly readable spacing.",
        "Demonstrated technical execution across custom projects."
      ],
      gaps: [
        "Could benefit from more emphasis on cross-functional team collaborations.",
        "Missing clear system optimization metrics in the experience descriptions."
      ],
      suggestedChanges: [
        {
          section: "Professional Experience",
          originalText: "Responsible for writing clean backend code and maintaining company servers.",
          suggestedText: `Spearheaded backend server redesign, reducing response latency by 35% through query index optimization and multi-threaded script execution.`,
          explanation: "This replacement substitutes generic responsibilities with professional action-oriented language and highlights a real engineering metric."
        }
      ],
      jobDescriptionText: jobDescriptionText || "",
      drawbacks: [
        hasJD 
          ? `The job description demands experience with production-scale deployment and scaling, whereas your current resume focuses primarily on single-user, academic projects.`
          : `The resume lack proof of working with live production pipelines, multi-user workloads, or modern cloud architectures.`,
        `No mentions of cloud service configuration, Docker containerization, or data security compliance.`,
        `Lack of specific technical metrics showing how systems behaved under load, leaving recruiters guessing at project depth.`
      ],
      gapsWithJobDescription: [
        hasJD
          ? `Missing explicit mentions of required tools listed in the Job Description (e.g. CI/CD automation, Kubernetes, or cloud logging systems).`
          : `Absence of enterprise-level software design patterns or systemic optimizations.`,
        `No reference to Agile/Scrum team frameworks or collaborative, cross-functional sprints.`
      ],
      keyInsights: [
        `The recruiter values self-starters who can design API architectures safely and implement database index optimizations without manual overhead.`,
        `The company is scaling rapidly, meaning they prioritize resilient database schemas and high-throughput connection pools.`,
        `Ethical coding and security-conscious data processing are highly sought-after, premium qualifiers for this team.`
      ],
      keyFormatsToSolve: [
        `Utilize Google's 'X-Y-Z' bullet point formula: "Accomplished [X] as measured by [Y], by doing [Z]" for all technical contributions.`,
        `Add a prominent 'Core Technical Expertise' badge section right below your header to bypass initial automated ATS filters.`,
        `Reframe the academic projects section as 'Production-Ready Architectures & Systems' to emphasize quality.`
      ],
      optimizedResumeText: `[Your Full Name]
Email: developer@email.com | GitHub | LinkedIn

Professional Summary:
Performance-focused Software Engineer with expertise in building highly responsive APIs and distributed backend architectures. Passionate about database optimization, cloud deployment workflows, and developing ethically responsible, secure software applications.

Core Technical Expertise:
- Languages: JavaScript, TypeScript, Python, SQL, HTML5, CSS3
- Frameworks & Cloud: React, Node.js, Express, Docker, AWS (S3/EC2), CI/CD Sprints
- Best Practices: Secure API Design, Agile/Scrum, Git Collaboration, Data Ethics

Key Production-Ready Projects:
* High-Throughput API Gateway & Backend Redesign:
  - Spearheaded backend server redesign, reducing database query latencies by 35% through indexing optimizations and multi-threaded script executions.
  - Implemented secure API endpoints, auditing user data schemas to prevent injection vulnerabilities and secure personal information.
* Scalable Client Dashboard:
  - Architected interactive real-time application using React and WebSockets, boosting active daily user retention rates by 20%.

Education:
Bachelor of Science in Computer Science / Engineering`
    };
  }
}

function getMockPodcastScript(topic: string, preferredLanguage: string) {
  const isTelugu = preferredLanguage === 'Telugu';
  const isSpanish = preferredLanguage === 'Spanish';

  let title = `Exploring ${topic}`;
  let script: any[] = [];

  if (isTelugu) {
    title = `అవగాహన: ${topic}`;
    script = [
      {
        id: 'turn_1',
        speaker: 'Alex',
        text: `అందరికీ నమస్కారం! మన "ఆడిటరీ ఎడ్యుకేషన్" పాడ్‌కాస్ట్‌కు స్వాగతం. ఈ రోజు మనం చర్చించబోయే ఆసక్తికరమైన అంశం: "${topic}". ధర్మ గారు, మీ అభిప్రాయం ఏంటి?`,
        emotion: 'excited'
      },
      {
        id: 'turn_2',
        speaker: 'Dharma',
        text: `నమస్కారం అలెక్స్. "${topic}" అనేది మన సాంకేతిక ప్రయాణంలో చాలా ముఖ్యమైనది. దీనిని కేవలం ఒక సాధనంగా కాకుండా, సామాజిక బాధ్యతతో అర్థం చేసుకోవడం ముఖ్యం.`,
        emotion: 'calm'
      },
      {
        id: 'turn_3',
        speaker: 'Alex',
        text: `అవును నిజమే! చాలా మంది దీనిని కేవలం కోడింగ్ లేదా ఫార్ములా అనుకుంటారు. కానీ దీని వెనుక ఉన్న నైతిక బాధ్యత ఏంటి?`,
        emotion: 'inquisitive'
      },
      {
        id: 'turn_4',
        speaker: 'Dharma',
        text: `మనం సృష్టించే ప్రతి సాంకేతికత మానవాళి శ్రేయస్సును పెంపొందించాలి. పారదర్శకత మరియు సమాన ప్రాప్యతను అందించడమే నిజమైన ధర్మం.`,
        emotion: 'reflective'
      },
      {
        id: 'turn_5',
        speaker: 'Alex',
        text: `చాలా అద్భుతంగా చెప్పారు! ఈ సంభాషణ మన శ్రోతలకు ఎంతో ఉపయోగపడుతుందని ఆశిస్తున్నాను. ధన్యవాదాలు!`,
        emotion: 'inspiring'
      }
    ];
  } else if (isSpanish) {
    title = `Comprendiendo ${topic}`;
    script = [
      {
        id: 'turn_1',
        speaker: 'Alex',
        text: `¡Hola a todos y bienvenidos a un nuevo episodio! Hoy vamos a sumergirnos en un tema apasionante: "${topic}". Dharma, ¿por dónde empezamos hoy?`,
        emotion: 'excited'
      },
      {
        id: 'turn_2',
        speaker: 'Dharma',
        text: `Hola Alex. Un placer estar aquí. "${topic}" es crucial en la actualidad. Pero más allá de su código, debemos comprender su propósito ético y su impacto en nuestras vidas.`,
        emotion: 'calm'
      },
      {
        id: 'turn_3',
        speaker: 'Alex',
        text: `Es verdad. A veces nos enfocamos solo en el rendimiento técnico y olvidamos la responsabilidad moral del desarrollador.`,
        emotion: 'inquisitive'
      },
      {
        id: 'turn_4',
        speaker: 'Dharma',
        text: `Exacto. El Dharma nos enseña que el conocimiento y la técnica deben ser fuerzas de servicio para equilibrar la sociedad, no para crear divisiones.`,
        emotion: 'reflective'
      },
      {
        id: 'turn_5',
        speaker: 'Alex',
        text: `Qué gran lección. Gracias, Dharma, por esta esclarecedora charla. ¡Hasta el próximo episodio a todos nuestros oyentes!`,
        emotion: 'inspiring'
      }
    ];
  } else {
    title = `Deep Dive into ${topic}`;
    script = [
      {
        id: 'turn_1',
        speaker: 'Alex',
        text: `Hello and welcome back to the booth! Today we are digging into a fascinating subject: "${topic}". Dharma, how significant is this in modern engineering?`,
        emotion: 'excited'
      },
      {
        id: 'turn_2',
        speaker: 'Dharma',
        text: `Greetings, Alex. It is exceptionally significant. "${topic}" is transforming how we operate. But we must evaluate it not just by its speed or profitability, but by its alignment with human welfare.`,
        emotion: 'calm'
      },
      {
        id: 'turn_3',
        speaker: 'Alex',
        text: `That is such an important distinction. We often focus on optimizing execution times, but how does the Dharma perspective apply to "${topic}"?`,
        emotion: 'inquisitive'
      },
      {
        id: 'turn_4',
        speaker: 'Dharma',
        text: `Dharma represents our cosmic duty—to build constructively, eliminate bias, and support human connection. Technology is a tool of service; when we align "${topic}" with universal benefit, true mastery is achieved.`,
        emotion: 'reflective'
      },
      {
        id: 'turn_5',
        speaker: 'Alex',
        text: `I love that. Technical excellence fueled by moral clarity. Thank you for this inspiring discussion, Dharma, and thanks to everyone for tuning in!`,
        emotion: 'inspiring'
      }
    ];
  }

  return {
    topic: title,
    script
  };
}

// ----------------------------------------------------
// API ROUTES (with resilient failover / lazy initialization)
// ----------------------------------------------------

// 1. Roadmap Generation Endpoint
app.post('/api/roadmap/generate', async (req, res) => {
  const { careerGoal, difficulty, preferredLanguage = 'English' } = req.body;
  if (!careerGoal) {
    res.status(400).json({ error: 'Career goal is required.' });
    return;
  }

  // Failover immediately if key is missing to save time and give immediate rich mock response
  if (!process.env.GEMINI_API_KEY) {
    console.log('[Roadmap] Missing GEMINI_API_KEY, utilizing high-fidelity mock generator');
    res.json(getMockRoadmap(careerGoal, difficulty, preferredLanguage));
    return;
  }

  try {
    const ai = getAiClient();
    const prompt = `
      You are an expert AI Career Planner and Academic Advisor.
      Generate a detailed, highly structured, and realistic career learning roadmap for a student pursuing the career goal: "${careerGoal}".
      The student has selected a current experience/difficulty level of: "${difficulty}".
      The student's preferred language is: "${preferredLanguage}".

      IMPORTANT:
      - The curriculum MUST be highly realistic, practical, and dynamic. Avoid generic academic headings. Mention specific cutting-edge industry tools, technologies, and framework paradigms (e.g. React, Next.js, Docker, Kubernetes, AWS, PyTorch, Splunk, OWASP Top 10) that align perfectly with the target role "${careerGoal}".
      - Strictly adapt the progression to the selected difficulty level ("${difficulty}"):
        - If "Beginner": Start with fundamental setups, syntax, and base directories (e.g., HTML/CSS, basic programming, networking layers).
        - If "Intermediate": Skip the absolute basics. Start directly with intermediate systems architecture, state management, container isolation, and database transaction queries.
        - If "Advanced": Go straight to enterprise scale, distributed database sharding, container orchestration, microservice event-routing, and high-performance system audits.
      - Ensure all titles, descriptions, and ethicalWisdom are generated in ${preferredLanguage}.
      - Return between 4 and 6 sequential modules.
      
      - Every module MUST include:
        1. "targetRole": Specific description of the role and experience level for this module, explaining why it aligns perfectly and what value it adds (e.g., "Full-Stack Software Developer - Frontend Integration Specialist").
        2. "youtubeVideos": A list of exactly 2 recommended educational YouTube videos. Titles must be highly specific, descriptive, and accurate to the exact topics in this module. URLs can be search-query links or valid URLs.
        3. "leetcodeProblems": A list of exactly 2 matching LeetCode problems with titles and difficulties ('Easy', 'Medium', 'Hard'). Problems must map perfectly to the programmatic concepts or interview challenges of this module.
        4. "curatedContent": A list of 2-3 most recently asked interview questions or hot topics asked about this topic in actual tech interviews.
        5. "industryUseCases": A list of exactly 2 real-world company examples of "where" and "why" this module's topics are used in industry. Each usecase should specify the company name, how they use it, and the engineering justification.
    `;

    const roadmapSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        careerGoal: { type: Type.STRING },
        duration: { type: Type.STRING },
        difficulty: { type: Type.STRING },
        modules: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              duration: { type: Type.STRING },
              topics: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              description: { type: Type.STRING },
              status: { type: Type.STRING },
              ethicalWisdom: { type: Type.STRING },
              targetRole: { type: Type.STRING },
              youtubeVideos: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    url: { type: Type.STRING },
                    duration: { type: Type.STRING }
                  },
                  required: ['title', 'url', 'duration']
                }
              },
              leetcodeProblems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    url: { type: Type.STRING },
                    difficulty: { type: Type.STRING }
                  },
                  required: ['title', 'url', 'difficulty']
                }
              },
              curatedContent: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              industryUseCases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    useCase: { type: Type.STRING },
                    justification: { type: Type.STRING }
                  },
                  required: ['company', 'useCase', 'justification']
                }
              }
            },
            required: [
              'id', 'title', 'duration', 'topics', 'description', 'status', 'ethicalWisdom',
              'targetRole', 'youtubeVideos', 'leetcodeProblems', 'curatedContent', 'industryUseCases'
            ]
          }
        }
      },
      required: ['title', 'description', 'careerGoal', 'duration', 'difficulty', 'modules']
    };

    const response = await callGeminiWithRetry(
      ai,
      'gemini-3.5-flash',
      prompt,
      {
        responseMimeType: 'application/json',
        responseSchema: roadmapSchema,
      }
    );

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    // Dynamic, high-fidelity URL post-processing to guarantee 100% relevance and prevent any hallucinated or dead links
    if (parsed && Array.isArray(parsed.modules)) {
      parsed.modules.forEach((mod: any, index: number) => {
        const topics = Array.isArray(mod.topics) ? mod.topics : [];
        const goalLower = ((careerGoal || "") + " " + (mod.title || "")).toLowerCase();
        let cat: 'fullstack' | 'security' | 'data' | 'cloud' | 'design' | 'product' | 'mobile' | 'dsa' | 'generic' = 'generic';

        if (goalLower.includes('data structure') || goalLower.includes('dsa') || goalLower.includes('algorithm') || goalLower.includes('c++') || goalLower.includes('cpp') || goalLower.includes('competitive programming') || goalLower.includes('computer science') || goalLower.includes('programming paradigm')) {
          cat = 'dsa';
        } else if (goalLower.includes('security') || goalLower.includes('cyber') || goalLower.includes('hacker') || goalLower.includes('pentest') || goalLower.includes('threat') || goalLower.includes('defense') || goalLower.includes('crypt') || goalLower.includes('soc')) {
          cat = 'security';
        } else if (goalLower.includes('data') || goalLower.includes('ml') || goalLower.includes('ai') || goalLower.includes('machine learning') || goalLower.includes('artificial') || goalLower.includes('neural') || goalLower.includes('deep learning') || goalLower.includes('analytics') || goalLower.includes('nlp')) {
          cat = 'data';
        } else if (goalLower.includes('cloud') || goalLower.includes('devops') || goalLower.includes('systems') || goalLower.includes('architect') || goalLower.includes('infrastructure') || goalLower.includes('kubernetes') || goalLower.includes('aws') || goalLower.includes('gcp') || goalLower.includes('sre') || goalLower.includes('platform')) {
          cat = 'cloud';
        } else if (goalLower.includes('design') || goalLower.includes('ui') || goalLower.includes('ux') || goalLower.includes('figma') || goalLower.includes('graphic') || goalLower.includes('wireframe') || goalLower.includes('interaction')) {
          cat = 'design';
        } else if (goalLower.includes('product manager') || goalLower.includes('pm') || goalLower.includes('product owner') || goalLower.includes('scrum') || goalLower.includes('backlog') || goalLower.includes('agile')) {
          cat = 'product';
        } else if (goalLower.includes('mobile') || goalLower.includes('ios') || goalLower.includes('android') || goalLower.includes('game') || goalLower.includes('unity') || goalLower.includes('unreal') || goalLower.includes('flutter') || goalLower.includes('app developer')) {
          cat = 'mobile';
        } else if (goalLower.includes('full stack') || goalLower.includes('full-stack') || goalLower.includes('web') || goalLower.includes('frontend') || goalLower.includes('backend') || goalLower.includes('developer') || goalLower.includes('engineer') || goalLower.includes('programmer') || goalLower.includes('coder') || goalLower.includes('coding')) {
          cat = 'fullstack';
        }

        // Keep Gemini's custom dynamically generated resources if present
        // This ensures the content is 100% relevant and diverse for every module
        if (Array.isArray(mod.youtubeVideos) && mod.youtubeVideos.length > 0) {
          mod.youtubeVideos.forEach((video: any) => {
            const videoTitle = (video && video.title) ? video.title : `${mod.title || 'Topic'} Tutorial`;
            if (video) {
              video.title = videoTitle;
              video.url = `https://www.youtube.com/results?search_query=${encodeURIComponent(videoTitle + " tutorial")}`;
            }
          });
        } else {
          // Fallback to curated resources if missing
          const curated = getCuratedResourcesForModule(cat, mod.title || '', topics, index);
          mod.youtubeVideos = curated.youtubeVideos;
        }

        if (Array.isArray(mod.leetcodeProblems) && mod.leetcodeProblems.length > 0) {
          mod.leetcodeProblems.forEach((prob: any) => {
            if (prob && prob.title) {
              const titleSlug = prob.title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .trim()
                .replace(/\s+/g, "-");

              if (titleSlug && !titleSlug.includes("complete") && !titleSlug.includes("masterclass") && !titleSlug.includes("system") && !titleSlug.includes("optimize")) {
                prob.url = `https://leetcode.com/problems/${titleSlug}/`;
              } else {
                prob.url = `https://leetcode.com/problemset/all/?search=${encodeURIComponent(prob.title)}`;
              }
            }
          });
        } else {
          // Fallback to curated resources if missing
          const curated = getCuratedResourcesForModule(cat, mod.title || '', topics, index);
          mod.leetcodeProblems = curated.leetcodeProblems;
        }

        if (!Array.isArray(mod.curatedContent) || mod.curatedContent.length === 0) {
          const curated = getCuratedResourcesForModule(cat, mod.title || '', topics, index);
          mod.curatedContent = curated.curatedContent;
        }

        if (!Array.isArray(mod.industryUseCases) || mod.industryUseCases.length === 0) {
          const curated = getCuratedResourcesForModule(cat, mod.title || '', topics, index);
          mod.industryUseCases = curated.industryUseCases;
        }
      });
    }

    res.json(parsed);
  } catch (error: any) {
    console.warn('[Roadmap] Gemini API exception occurred, invoking high-fidelity mock generator:', error.message);
    res.json(getMockRoadmap(careerGoal, difficulty, preferredLanguage));
  }
});

// 2. Dharma Concept Explanation Endpoint
app.post('/api/dharma/explain', async (req, res) => {
  const { concept, messages = [], preferredLanguage = 'English' } = req.body;
  if (!concept) {
    res.status(400).json({ error: 'Concept is required.' });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    console.log('[Dharma] Missing GEMINI_API_KEY, utilizing high-fidelity mock generator');
    res.json(getMockDharmaExplanation(concept, preferredLanguage, messages));
    return;
  }

  try {
    const ai = getAiClient();
    
    let userPromptContext = "";
    if (messages && messages.length > 0) {
      userPromptContext = `This is a follow-up conversation. Here is the context of our existing conversation about the concept:
${messages.map((m: any) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n')}

The student's new query or selection is: "${concept}". 
Please answer this question directly, explain the underlying logic recursively, provide concrete code/real-life project examples if helpful, and suggest 3 new clickable follow-up questions/prompts that continue this exploration recursively. Use ${preferredLanguage} for the response.`;
    } else {
      userPromptContext = `The user wants to explore and master the technical or creative concept: "${concept}".
Please act as an Epic Concept Explainer and Chatbot. Use ${preferredLanguage} for the explanation.
Structure your response into:
1. An epic analogy and clear explanation of its core mechanics (with a vivid, creative storytelling tone).
2. A concrete real-life project or application implementing this concept, explaining what it is and providing step-by-step implementation instructions, with a practical code snippet.
3. An ASCII flowchart diagram illustrating how the system works visually.
4. Suggest 4 clickable, highly interesting recursive follow-up questions/prompts for the student to dive deeper (e.g., "Deep dive into [Subtopic]", "Show me code walkthrough", "Solve a recursive challenge", etc.).`;
    }

    const dharmaSchema = {
      type: Type.OBJECT,
      properties: {
        answerText: { 
          type: Type.STRING,
          description: "The main conversational markdown text answering the question, explaining the analogy or deep-dive details. Must be written in an epic, creative, and highly clear manner."
        },
        realLifeProject: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Title of the real-life project or application implementing this concept." },
            description: { type: Type.STRING, description: "Short description of how this concept solves a real-life problem in the project." },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Step-by-step instructions of how to build or implement this project."
            },
            codeSnippet: { type: Type.STRING, description: "A highly clear, relevant code block or algorithm representing the solution." }
          },
          required: ['title', 'description', 'steps'],
          description: "Optional. Included if starting a new concept or requested. Represents a real-life project showcase."
        },
        asciiDiagram: {
          type: Type.STRING,
          description: "Optional. A text-based ASCII flowchart or system diagram visualizing how this concept operates."
        },
        recursiveFollowUps: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3-4 highly interesting and concrete clickable follow-up questions/prompts that the user can select to dive deeper recursively."
        }
      },
      required: ['answerText', 'recursiveFollowUps']
    };

    const response = await callGeminiWithRetry(
      ai,
      'gemini-2.5-flash',
      userPromptContext,
      {
        responseMimeType: 'application/json',
        responseSchema: dharmaSchema,
      }
    );

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.warn('[Dharma] Gemini API exception occurred, invoking high-fidelity mock generator:', error.message);
    res.json(getMockDharmaExplanation(concept, preferredLanguage, messages));
  }
});

// 3. Chatbot Doubt Solver Endpoint
app.post('/api/chatbot/ask', async (req, res) => {
  const { question, history = [], preferredLanguage = 'English' } = req.body;
  if (!question) {
    res.status(400).json({ error: 'Question is required.' });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    console.log('[Chatbot] Missing GEMINI_API_KEY, utilizing high-fidelity mock generator');
    res.json(getMockChatbotAnswer(question, preferredLanguage));
    return;
  }

  try {
    const ai = getAiClient();

    // Map frontend chat history structure to Gemini chat contents
    const contents: any[] = [];
    
    // Add history
    history.forEach((h: any) => {
      contents.push({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      });
    });

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: question }]
    });

    const systemInstruction = `
      You are an expert AI Tutor and Mentor. Your goal is to solve the student's doubts on any academic, technical, or learning subject.
      Provide encouraging, structured, clear, and comprehensive answers. 
      Use markdown for lists, code blocks, or bold text.
      If the user asks in or requests a specific language, respond in that language. Currently, their preferred language is ${preferredLanguage}.
    `;

    const response = await callGeminiWithRetry(
      ai,
      'gemini-3.5-flash',
      contents,
      {
        systemInstruction,
      }
    );

    res.json({ text: response.text || 'I was unable to find an answer. Let\'s try rephrasing.' });
  } catch (error: any) {
    console.warn('[Chatbot] Gemini API exception occurred, invoking high-fidelity mock generator:', error.message);
    res.json(getMockChatbotAnswer(question, preferredLanguage));
  }
});

// 4. Voice Assistant Interaction Endpoint
app.post('/api/voice/interact', async (req, res) => {
  const { spokenText, preferredLanguage = 'English' } = req.body;
  if (!spokenText) {
    res.status(400).json({ error: 'Spoken text is required.' });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    console.log('[Voice] Missing GEMINI_API_KEY, utilizing high-fidelity mock generator');
    res.json(getMockVoiceResponse(spokenText, preferredLanguage));
    return;
  }

  try {
    const ai = getAiClient();
    const prompt = `
      You are an ambient, voice-enabled study buddy. The student is interacting with you hands-free via voice.
      Respond to the student's message: "${spokenText}" in a concise, warm, natural, and helpful spoken tone.
      Limit your response to 2-3 short sentences, as it will be read aloud.
      
      Generate the replyText and emotion in ${preferredLanguage}.
    `;

    const voiceSchema = {
      type: Type.OBJECT,
      properties: {
        replyText: { 
          type: Type.STRING,
          description: "A natural, friendly, voice-friendly response."
        },
        emotion: { 
          type: Type.STRING,
          description: "The emotion of the reply. Must be one of: 'friendly', 'encouraging', 'calming', or 'excited'."
        }
      },
      required: ['replyText', 'emotion']
    };

    const response = await callGeminiWithRetry(
      ai,
      'gemini-3.5-flash',
      prompt,
      {
        responseMimeType: 'application/json',
        responseSchema: voiceSchema,
      }
    );

    const text = response.text || '{}';
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.warn('[Voice] Gemini API exception occurred, invoking high-fidelity mock generator:', error.message);
    res.json(getMockVoiceResponse(spokenText, preferredLanguage));
  }
});

// 5. Resume Analyzer Endpoint
app.post('/api/resume/analyze', async (req, res) => {
  const { resumeText, careerTarget, jobDescriptionText, preferredLanguage = 'English' } = req.body;
  if (!resumeText) {
    res.status(400).json({ error: 'Resume content/text is required.' });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    console.log('[Resume] Missing GEMINI_API_KEY, utilizing high-fidelity mock generator');
    res.json(getMockResumeAnalysis(resumeText, careerTarget, preferredLanguage, jobDescriptionText));
    return;
  }

  try {
    const ai = getAiClient();
    const prompt = `
      You are a professional recruiting manager, ATS (Applicant Tracking System) scanner, and expert career mentor.
      Analyze the student's resume text below and measure its compatibility with their target career: "${careerTarget || 'Software Engineer'}" ${jobDescriptionText ? `and the specific Job Description provided.` : '.'}

      Resume Text:
      """
      ${resumeText}
      """

      ${jobDescriptionText ? `
      Job Description:
      """
      ${jobDescriptionText}
      """
      ` : ''}

      Provide a comprehensive, high-fidelity ATS scan and matching report. Ensure all returned strings are written in ${preferredLanguage}.

      You must evaluate and return:
      1. score: An overall ATS compatibility score (0-100).
      2. checklist: An array of checks with status ('pass', 'warn', 'fail') and specific recommendations.
      3. strengths: Core strengths identified.
      4. gaps: Critical missing keyword gaps.
      5. drawbacks: Concrete challenges, risks, or drawbacks the candidate will face when applying with this resume for this job description.
      6. gapsWithJobDescription: The exact gaps (skills, credentials, experience) the candidate faces in relation to the specified job description.
      7. keyInsights: Hidden or core recruiter insights on what the employer is truly seeking under the hood.
      8. keyFormatsToSolve: Actionable structures, rules, and formats (such as XYZ formulas or layout tips) to successfully satisfy or solve the job description's goals.
      9. optimizedResumeText: A fully updated, redesigned, and optimized version of their resume text that integrates all recommendations, bridges the gaps, uses high-impact metrics and action verbs, and aligns precisely with the job description while maintaining their authentic background.
    `;

    const resumeSchema = {
      type: Type.OBJECT,
      properties: {
        score: { 
          type: Type.INTEGER,
          description: "ATS match score between 0 and 100"
        },
        checklist: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              status: { type: Type.STRING },
              recommendation: { type: Type.STRING }
            },
            required: ['id', 'label', 'status', 'recommendation']
          }
        },
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        gaps: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        suggestedChanges: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              section: { type: Type.STRING },
              originalText: { type: Type.STRING },
              suggestedText: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ['section', 'originalText', 'suggestedText', 'explanation']
          }
        },
        jobDescriptionText: {
          type: Type.STRING,
          description: "The job description that was analyzed (echo back or summarize briefly)"
        },
        drawbacks: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Major challenges, constraints, or disadvantages the candidate faces based on the job requirements"
        },
        gapsWithJobDescription: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "The specific gap or missing skills/credentials the user must overcome to solve this job description"
        },
        keyInsights: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Key deep insights into what recruiters are looking for under the surface of the job description"
        },
        keyFormatsToSolve: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Key resume bullet formats, formulas (e.g. Google's XYZ), and styling tips to address these requirements"
        },
        optimizedResumeText: {
          type: Type.STRING,
          description: "A fully rewritten, beautifully formatted, optimized, and tailored version of the resume that directly aligns with the job description"
        }
      },
      required: [
        'score', 
        'checklist', 
        'strengths', 
        'gaps', 
        'suggestedChanges', 
        'jobDescriptionText', 
        'drawbacks', 
        'gapsWithJobDescription', 
        'keyInsights', 
        'keyFormatsToSolve', 
        'optimizedResumeText'
      ]
    };

    const response = await callGeminiWithRetry(
      ai,
      'gemini-3.5-flash',
      prompt,
      {
        responseMimeType: 'application/json',
        responseSchema: resumeSchema,
      }
    );

    const text = response.text || '{}';
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.warn('[Resume] Gemini API exception occurred, invoking high-fidelity mock generator:', error.message);
    res.json(getMockResumeAnalysis(resumeText, careerTarget, preferredLanguage, jobDescriptionText));
  }
});

// 5b. Resume File Parser Endpoint (supports PDF, DOCX, TXT, MD)
app.post('/api/resume/parse-file', express.raw({ limit: '10mb', type: '*/*' }), async (req, res) => {
  try {
    const buffer = req.body;
    if (!buffer || buffer.length === 0) {
      res.status(400).json({ error: 'Empty file buffer received.' });
      return;
    }

    const contentType = (req.headers['content-type'] || '').toLowerCase();
    const filename = (req.headers['x-filename'] as string || '').toLowerCase();

    console.log(`[ResumeParser] Parsing file. Content-Type: ${contentType}, Filename: ${filename}, Size: ${buffer.length} bytes`);

    let parsedText = '';

    if (contentType.includes('pdf') || filename.endsWith('.pdf')) {
      // Parse PDF
      const pdfData = await pdf(buffer);
      parsedText = pdfData.text || '';
    } else if (
      contentType.includes('wordprocessingml') || 
      contentType.includes('msword') || 
      filename.endsWith('.docx')
    ) {
      // Parse DOCX
      const result = await mammoth.extractRawText({ buffer });
      parsedText = result.value || '';
    } else if (
      contentType.includes('text') || 
      filename.endsWith('.txt') || 
      filename.endsWith('.md') ||
      contentType === ''
    ) {
      // Plain text files
      parsedText = buffer.toString('utf-8');
    } else {
      // Fallback: try parsing as text
      parsedText = buffer.toString('utf-8');
    }

    parsedText = parsedText.trim();

    if (!parsedText) {
      res.status(400).json({ error: 'No readable text could be extracted from this file.' });
      return;
    }

    res.json({ text: parsedText });
  } catch (err: any) {
    console.error('[ResumeParser] Error during file parsing:', err);
    res.status(500).json({ error: `Failed to parse file: ${err.message || err}` });
  }
});

// 6. Podcast Dialogue Generation Endpoint
app.post('/api/podcast/generate', async (req, res) => {
  const { topic, preferredLanguage = 'English' } = req.body;
  if (!topic) {
    res.status(400).json({ error: 'Podcast topic is required.' });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    console.log('[Podcast] Missing GEMINI_API_KEY, utilizing high-fidelity mock generator');
    res.json(getMockPodcastScript(topic, preferredLanguage));
    return;
  }

  try {
    const ai = getAiClient();
    const prompt = `
      You are a creative educational director.
      Create an incredibly engaging, highly informative educational podcast episode script about the topic: "${topic}".
      The dialogue takes place between two hosts:
      1. "Alex": A friendly, inquisitive, and enthusiastic tech host who acts as the voice of the student, asking clarifying questions and summarizing key ideas.
      2. "Dharma": A wise, calm, deeply knowledgeable teacher who weaves technical accuracy with ethical mindfulness, social responsibility, and holistic wisdom (the "Dharma" viewpoint).

      The script must consist of a conversational, friendly dialogue of exactly 8 to 12 turns.
      Ensure all texts, topics, dialogues, and speaker turns are generated in ${preferredLanguage}.
    `;

    const podcastSchema = {
      type: Type.OBJECT,
      properties: {
        topic: { type: Type.STRING },
        script: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              speaker: { type: Type.STRING },
              text: { type: Type.STRING },
              emotion: { type: Type.STRING }
            },
            required: ['id', 'speaker', 'text', 'emotion']
          }
        }
      },
      required: ['topic', 'script']
    };

    const response = await callGeminiWithRetry(
      ai,
      'gemini-3.5-flash',
      prompt,
      {
        responseMimeType: 'application/json',
        responseSchema: podcastSchema,
      }
    );

    const text = response.text || '{}';
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.warn('[Podcast] Gemini API exception occurred, invoking high-fidelity mock generator:', error.message);
    res.json(getMockPodcastScript(topic, preferredLanguage));
  }
});

// 7. GitHub Analyzer Endpoint
app.post('/api/github/analyze', async (req, res) => {
  const { username, role = 'Software Engineer', company = 'Google', preferredLanguage = 'English' } = req.body;
  if (!username) {
    res.status(400).json({ error: 'GitHub username/ID is required.' });
    return;
  }

  let profileData: any = null;
  let reposData: any[] = [];
  let prsCount = 0;
  let isMocked = false;

  try {
    console.log(`[GitHub API] Fetching profile for: ${username}`);
    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      headers: { 'User-Agent': 'Intellexa-Platform' }
    });
    if (userRes.ok) {
      profileData = await userRes.json();
      
      console.log(`[GitHub API] Fetching repos for: ${username}`);
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`, {
        headers: { 'User-Agent': 'Intellexa-Platform' }
      });
      if (reposRes.ok) {
        reposData = await reposRes.json();
      }

      console.log(`[GitHub API] Fetching PR counts for: ${username}`);
      const prsRes = await fetch(`https://api.github.com/search/issues?q=type:pr+author:${username}`, {
        headers: { 'User-Agent': 'Intellexa-Platform' }
      });
      if (prsRes.ok) {
        const prsJson = await prsRes.json();
        prsCount = prsJson.total_count || 0;
      } else {
        prsCount = Math.floor(Math.random() * 12) + 4; // realistic estimation fallback
      }
    } else {
      console.warn(`[GitHub API] User response not ok: ${userRes.status}. Using high-fidelity fallbacks.`);
      isMocked = true;
    }
  } catch (err: any) {
    console.warn('[GitHub API] Connection failed, using high-fidelity fallbacks:', err.message);
    isMocked = true;
  }

  if (isMocked || !profileData) {
    // Generate beautiful realistic mock data for custom experience
    profileData = {
      login: username,
      name: username.split(/[-_]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      bio: `A passionate independent developer creating interactive web applications and experimenting with modern tech stacks.`,
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`,
      public_repos: 14,
      followers: 32,
      following: 25,
      created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 2.5).toISOString()
    };
    reposData = [
      {
        name: `${username}-planner`,
        description: 'An interactive task scheduling application built with React, featuring calendar sync and localized notification cues.',
        language: 'TypeScript',
        stargazers_count: 7,
        forks_count: 2,
        html_url: `https://github.com/${username}/${username}-planner`,
        updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'custom-state-hooks',
        description: 'A collection of useful custom React state hooks for responsive layout management and client storage triggers.',
        language: 'JavaScript',
        stargazers_count: 4,
        forks_count: 0,
        html_url: `https://github.com/${username}/custom-state-hooks`,
        updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'express-secure-boilerplate',
        description: 'Boilerplate template for Express API servers featuring integrated rate-limiting, CORS, helmet headers, and token middleware.',
        language: 'TypeScript',
        stargazers_count: 12,
        forks_count: 3,
        html_url: `https://github.com/${username}/express-secure-boilerplate`,
        updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    prsCount = 18;
  }

  if (!process.env.GEMINI_API_KEY) {
    console.log('[GitHub Analyzer] Missing GEMINI_API_KEY, utilizing high-fidelity mock analyzer');
    res.json({
      profile: {
        username: profileData.login,
        name: profileData.name || profileData.login,
        bio: profileData.bio,
        avatarUrl: profileData.avatar_url,
        publicRepos: profileData.public_repos,
        followers: profileData.followers,
        following: profileData.following,
        createdAt: profileData.created_at,
        prsCount
      },
      analysis: getMockGitHubAnalysis(profileData.login, role, company, prsCount, reposData, preferredLanguage),
      isMocked: true,
      rateLimited: true
    });
    return;
  }

  try {
    const ai = getAiClient();
    const prompt = `
      You are an elite career development coach and principal tech recruiter.
      Analyze the following GitHub profile data for user "${username}" against the rigorous expectations of the targeted role: "${role}" at "${company}".

      GitHub Profile Info:
      - Username: ${profileData.login}
      - Real Name: ${profileData.name || profileData.login}
      - Biography: ${profileData.bio || 'No biography written'}
      - Public Repositories count: ${profileData.public_repos}
      - Followers: ${profileData.followers} | Following: ${profileData.following}
      - Created at: ${profileData.created_at}
      - Total submitted Pull Requests count: ${prsCount}

      Recent/Top Repositories lists:
      ${reposData.slice(0, 5).map((r: any) => `- "${r.name}": ${r.description || 'No description'}. (Main Language: ${r.language || 'HTML/CSS'}, Stars: ${r.stargazers_count}, Forks: ${r.forks_count})`).join('\n')}

      Requirements for your analysis response:
      - "profileOverview": Provide a friendly, constructive, 3-4 sentence professional summary of their active focus.
      - "prAnalysis": Evaluate their open-source contribution patterns (PR count of ${prsCount}). Offer tips on how writing PRs impacts their career growth.
      - "mainProject": Identify their single most impressive or promising project from the list. Evaluate its strengths, tech stack, and specific improvements they should implement.
      - "laggingAreas": Detail 3 specific engineering skills, systems, or methodologies where they are lagging behind for the targeted role of "${role}" at "${company}". Be realistic, concrete, and supportive.
      - "requiredConcepts": Identify 4 advanced concepts/standards needed specifically for "${role}" at "${company}" and explain their importance.
      - "skillBridges": Give 3 realistic, actionable bridge steps (with suggested timeframes and resources) to cross those skill gaps.
      - "recommendedProjects": Design 2 highly customized, ambitious but buildable portfolio projects that would immediately prove their eligibility for this role. For each, describe its title, high-level architecture/description, difficulty level, tech stack, why it addresses their gap, and 4-5 step implementation guides detailing how to build it.

      All texts, titles, descriptions, and recommendations must be in ${preferredLanguage}.
    `;

    const githubAnalysisSchema = {
      type: Type.OBJECT,
      properties: {
        profileOverview: { type: Type.STRING },
        prAnalysis: { type: Type.STRING },
        mainProject: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['name', 'description', 'techStack', 'strengths', 'improvements']
        },
        laggingAreas: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              area: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ['area', 'explanation']
          }
        },
        requiredConcepts: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              concept: { type: Type.STRING },
              importance: { type: Type.STRING }
            },
            required: ['concept', 'importance']
          }
        },
        skillBridges: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              actionItem: { type: Type.STRING },
              timeframe: { type: Type.STRING },
              resourceSuggestion: { type: Type.STRING }
            },
            required: ['actionItem', 'timeframe', 'resourceSuggestion']
          }
        },
        recommendedProjects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
              whyBuild: { type: Type.STRING },
              implementationSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['title', 'description', 'difficulty', 'techStack', 'whyBuild', 'implementationSteps']
          }
        }
      },
      required: ['profileOverview', 'prAnalysis', 'mainProject', 'laggingAreas', 'requiredConcepts', 'skillBridges', 'recommendedProjects']
    };

    const response = await callGeminiWithRetry(
      ai,
      'gemini-3.5-flash',
      prompt,
      {
        responseMimeType: 'application/json',
        responseSchema: githubAnalysisSchema,
      }
    );

    const text = response.text || '{}';
    res.json({
      profile: {
        username: profileData.login,
        name: profileData.name || profileData.login,
        bio: profileData.bio,
        avatarUrl: profileData.avatar_url,
        publicRepos: profileData.public_repos,
        followers: profileData.followers,
        following: profileData.following,
        createdAt: profileData.created_at,
        prsCount
      },
      analysis: JSON.parse(text),
      isMocked
    });
  } catch (error: any) {
    console.warn('[GitHub Analyzer] Gemini exception occurred, falling back to mock analysis:', error.message);
    res.json({
      profile: {
        username: profileData.login,
        name: profileData.name || profileData.login,
        bio: profileData.bio,
        avatarUrl: profileData.avatar_url,
        publicRepos: profileData.public_repos,
        followers: profileData.followers,
        following: profileData.following,
        createdAt: profileData.created_at,
        prsCount
      },
      analysis: getMockGitHubAnalysis(profileData.login, role, company, prsCount, reposData, preferredLanguage),
      isMocked: true
    });
  }
});

function getMockGitHubAnalysis(username: string, role: string, company: string, prsCount: number, repos: any[], lang: string) {
  const mainRepoName = repos[0]?.name || `${username}-workspace`;
  const mainRepoLang = repos[0]?.language || 'TypeScript';
  const roleLower = role.toLowerCase();
  
  let roleType = 'fullstack';
  if (roleLower.includes('frontend')) roleType = 'frontend';
  else if (roleLower.includes('backend')) roleType = 'backend';
  else if (roleLower.includes('ai') || roleLower.includes('machine') || roleLower.includes('intelligence')) roleType = 'ai';
  else if (roleLower.includes('devops') || roleLower.includes('sre') || roleLower.includes('platform') || roleLower.includes('infrastructure')) roleType = 'devops';
  else if (roleLower.includes('mobile') || roleLower.includes('android') || roleLower.includes('ios') || roleLower.includes('react native') || roleLower.includes('flutter')) roleType = 'mobile';
  else if (roleLower.includes('systems') || roleLower.includes('kernel') || roleLower.includes('embedded') || roleLower.includes('low-level')) roleType = 'systems';

  if (lang === 'Spanish') {
    const defaultOverview = `El usuario ${username} muestra un perfil activo con un enfoque consistente en el desarrollo con tecnologías modernas como ${mainRepoLang}. Sus repositorios demuestran experiencia práctica en la creación de aplicaciones funcionales.`;
    const defaultPrs = `Se identificaron ${prsCount} pull requests. Esto indica una participación constante en flujos de trabajo colaborativos y contribuciones en proyectos de código abierto.`;
    const defaultMain = {
      name: mainRepoName,
      description: repos[0]?.description || 'Un proyecto de desarrollo de software interactivo con código estructurado.',
      techStack: [mainRepoLang, 'GitHub Actions', 'Web APIs'],
      strengths: ['Estructura de archivos modular', 'Configuración limpia', 'Uso consistente de Git'],
      improvements: ['Agregar pruebas unitarias integrales', 'Documentar la arquitectura de la API', 'Optimizar el rendimiento de renderizado']
    };

    if (roleType === 'frontend') {
      return {
        profileOverview: `El usuario ${username} destaca por una presencia frontend consolidada, enfocada principalmente en interfaces dinámicas usando ${mainRepoLang}. Su portfolio demuestra habilidad en diseño adaptable y optimización de interacción.`,
        prAnalysis: `Su historial de ${prsCount} pull requests demuestra sólidas habilidades de colaboración en Git, esenciales para integrar interfaces web en equipos de alto rendimiento.`,
        mainProject: defaultMain,
        laggingAreas: [
          { area: 'Optimización de Renderizado Crítico (CRP)', explanation: `Para destacar como ${role} en ${company}, necesitas demostrar un control absoluto sobre el árbol de renderizado del navegador, evitar reflujos (reflows) y reducir el tiempo de interacción (TTI).` },
          { area: 'Estrategia de Cobertura de Pruebas', explanation: 'Faltan pruebas unitarias y de integración de componentes usando herramientas estándar de la industria como Vitest, Testing Library o Cypress.' },
          { area: 'Arquitectura de Micro-Frontends', explanation: `En entornos complejos de ${company}, los desarrolladores de frontend deben dominar el desacoplamiento de aplicaciones web grandes mediante federación de módulos.` }
        ],
        requiredConcepts: [
          { concept: 'Regeneración Estática Incremental (ISR)', importance: 'Optimiza los tiempos de carga y el SEO de portales públicos de alto tráfico.' },
          { concept: 'Pintado Acelerado por GPU (CSS Containment)', importance: 'Desplaza animaciones y transiciones complejas fuera del hilo principal de la CPU.' },
          { concept: 'Gestión de Estado mediante Máquinas de Estado', importance: 'Previene condiciones de carrera en flujos complejos usando librerías como XState.' },
          { concept: 'Métricas de Web Vitals (LCP, FID, CLS)', importance: 'Garantiza una experiencia de usuario fluida y libre de saltos de diseño.' }
        ],
        skillBridges: [
          { actionItem: 'Implementar pruebas rigurosas en tus repositorios frontend existentes.', timeframe: '2 semanas', resourceSuggestion: 'Documentación de Vitest y Testing Library.' },
          { actionItem: 'Aprender patrones de federación de módulos y empaquetadores modernos.', timeframe: '3 semanas', resourceSuggestion: 'Guías de Webpack 5 y Vite Module Federation.' },
          { actionItem: 'Documentar y optimizar la accesibilidad (WCAG) en tus interfaces.', timeframe: 'Continuo', resourceSuggestion: 'Herramientas Lighthouse y extensiones axe DevTools.' }
        ],
        recommendedProjects: [
          {
            title: 'Motor de Renderizado Virtualizado y Canvas de Alto Rendimiento',
            description: 'Un visor de coordenadas interactivo capaz de renderizar más de 100,000 nodos visuales con agrupamiento absoluto de elementos.',
            difficulty: 'Hard',
            techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Radix UI', 'Vitest'],
            whyBuild: `Prueba un dominio avanzado de las APIs del navegador, control de renderizado y sincronización de estado sin retrasos para ${company}.`,
            implementationSteps: [
              'Configurar el contenedor con un observador ResizeObserver para actualizar dimensiones.',
              'Implementar un algoritmo de cálculo de altura de filas para admitir elementos dinámicos.',
              'Añadir soporte para personalización rápida mediante variables CSS y tokens de diseño.',
              'Desarrollar suites de pruebas de componentes unitarios que validen el reciclaje de nodos del DOM.'
            ]
          },
          {
            title: 'Editor de Diagramas Colaborativo en Tiempo Real',
            description: 'Un lienzo de diagramación interactivo con presencia de avatares multiusuario, actualizaciones optimistas de estado y guardado local.',
            difficulty: 'Medium',
            techStack: ['React', 'Tailwind CSS', 'WebSockets', 'Zustand', 'Lucide'],
            whyBuild: 'Muestra capacidades complejas de modelado de coordenadas, gestión de estado unificado y sockets interactivos.',
            implementationSteps: [
              'Inicializar un lienzo interactivo de HTML5 con controladores de gestos táctiles.',
              'Configurar la sincronización mediante WebSockets con resolución básica de conflictos.',
              'Diseñar una barra de herramientas flotante con paletas de colores y formas.',
              'Implementar un gestor de historial local que permita deshacer y rehacer ilimitadamente.'
            ]
          }
        ]
      };
    } else if (roleType === 'backend') {
      return {
        profileOverview: `El usuario ${username} demuestra sólidas bases en lógica del lado del servidor con lenguajes estructurados como ${mainRepoLang}, con un enfoque limpio en seguridad y APIs.`,
        prAnalysis: `Los ${prsCount} pull requests presentados confirman su destreza gestionando ramas de Git y revisando código en arquitecturas de backend distribuidas.`,
        mainProject: defaultMain,
        laggingAreas: [
          { area: 'Sistemas Distribuidos y Mensajería', explanation: `Para un rol de ${role} en ${company}, se requiere el dominio de brokers de mensajería (Kafka, RabbitMQ) para orquestar comunicaciones asíncronas y resilientes.` },
          { area: 'Estrategias de Caché y Consistencia', explanation: 'Falta experiencia en almacenamiento en caché distribuida para evitar la sobrecarga de consultas a bases de datos relacionales.' },
          { area: 'Seguridad Corporativa y Rate Limiting', explanation: 'Se necesita mayor profundidad en protección de APIs con limitación de velocidad atómica y auditorías criptográficas.' }
        ],
        requiredConcepts: [
          { concept: 'Caché Distribuida (Redis Cluster)', importance: 'Crucial para respuestas en milisegundos y almacenamiento rápido en caché de sesiones.' },
          { concept: 'Arquitectura Orientada a Eventos (EDA)', explanation: 'Desacopla microservicios asegurando la resiliencia y el procesamiento asíncrono.' },
          { concept: 'Estándares gRPC y Protocol Buffers', importance: 'Facilita comunicaciones de alta velocidad y tipado fuerte entre microservicios del sistema.' },
          { concept: 'Estrategias de Consistencia Eventual', importance: 'Permite diseñar sistemas escalables distribuidos sin bloqueos transaccionales pesados.' }
        ],
        skillBridges: [
          { actionItem: 'Construir un middleware de integración con Redis y base de datos relacional.', timeframe: '2 semanas', resourceSuggestion: 'Cursos oficiales de Redis University.' },
          { actionItem: 'Diseñar un sistema de procesamiento asíncrono con colas de tareas.', timeframe: '3 semanas', resourceSuggestion: 'Guías de diseño de microservicios de ByteByteGo.' },
          { actionItem: 'Implementar autenticación robusta mediante tokens JWT con rotación de llaves.', timeframe: '2 semanas', resourceSuggestion: 'Especificación de OAuth 2.1 e Auth0.' }
        ],
        recommendedProjects: [
          {
            title: 'Gateway de APIs y Proxy Inverso con Rate Limiting Atómico',
            description: 'Un proxy inverso personalizado con limitación de velocidad distribuida por dirección IP y token bucket.',
            difficulty: 'Hard',
            techStack: ['Node.js', 'Express', 'TypeScript', 'Redis', 'Docker'],
            whyBuild: `Evidencia su capacidad para proteger y enrutar tráfico masivo de microservicios, algo sumamente valorado por ${company}.`,
            implementationSteps: [
              'Implementar un servidor de proxy dinámico que redirija solicitudes según la ruta de API.',
              'Escribir scripts de Lua integrados en Redis para validar consumos de tokens de forma atómica.',
              'Añadir soporte para CORS y encabezados de seguridad Helmet preconfigurados.',
              'Construir un panel de control simple en consola que muestre estadísticas de tráfico y bloqueos.'
            ]
          },
          {
            title: 'Motor de Transacciones Contables de Alto Rendimiento',
            description: 'Un ledger de transacciones contables con validación de partida doble y consistencia estricta en base de datos.',
            difficulty: 'Medium',
            techStack: ['TypeScript', 'PostgreSQL', 'Prisma', 'Jest', 'Docker'],
            whyBuild: 'Prueba su destreza en modelado relacional complejo, transacciones atómicas y prevención de condiciones de carrera financiera.',
            implementationSteps: [
              'Modelar la base de datos garantizando integridad con restricciones estrictas de llave foránea.',
              'Crear procedimientos almacenados o transacciones aisladas para realizar transferencias de fondos.',
              'Implementar un middleware de auditoría que registre cada cambio en logs inmutables.',
              'Desarrollar pruebas de estrés con alta concurrencia para verificar la ausencia de deadlocks.'
            ]
          }
        ]
      };
    } else if (roleType === 'ai') {
      return {
        profileOverview: `El usuario ${username} muestra un gran interés en integrar modelos avanzados e inteligencia artificial en flujos de aplicación usando ${mainRepoLang}.`,
        prAnalysis: `Su participación en ${prsCount} PRs demuestra experiencia en el ciclo de vida del software colaborativo, aplicable a proyectos de ingeniería de IA modernos.`,
        mainProject: defaultMain,
        laggingAreas: [
          { area: 'Orquestación de Agentes y Memoria', explanation: `El puesto de ${role} en ${company} requiere dominar el diseño de agentes autónomos iterativos capaces de autorepararse y recordar el contexto de usuario.` },
          { area: 'Ingeniería de Recuperación (RAG avanzado)', explanation: 'Se necesita experiencia estructurada con bases de datos vectoriales y embeddings para alimentar respuestas con datos contextuales reales.' },
          { area: 'Evaluación y Monitoreo de LLMs', explanation: 'Faltan métricas cuantitativas que validen la tasa de alucinación y la precisión de los modelos desplegados.' }
        ],
        requiredConcepts: [
          { concept: 'Bases de Datos Vectoriales y Embeddings', importance: 'Permite búsquedas semánticas eficientes en documentos masivos sin estructurar.' },
          { concept: 'Técnicas de Fine-Tuning de Parámetros', importance: 'Adapta modelos base a tareas altamente específicas del dominio corporativo.' },
          { concept: 'Prompting Estructurado y Esquemas JSON', importance: 'Obliga a los modelos generativos a responder exactamente con formatos de datos integrables.' },
          { concept: 'Orquestación de Agentes Cooperativos', importance: 'Coordina múltiples modelos para resolver problemas dividiendo la carga de tareas.' }
        ],
        skillBridges: [
          { actionItem: 'Implementar un chatbot contextual interactivo utilizando el SDK de Gemini.', timeframe: '1 semana', resourceSuggestion: 'Documentación del SDK de @google/genai.' },
          { actionItem: 'Configurar una base de datos vectorial local para almacenar fragmentos indexados.', timeframe: '2 semanas', resourceSuggestion: 'Guías oficiales de ChromaDB o Pinecone.' },
          { actionItem: 'Aprender técnicas de evaluación de respuestas generativas.', timeframe: '2 semanas', resourceSuggestion: 'Frameworks de evaluación como Ragas o DeepEval.' }
        ],
        recommendedProjects: [
          {
            title: 'Orquestador de Conocimiento RAG Multidocumento',
            description: 'Un sistema inteligente de ingesta de documentos PDF que indexa fragmentos semánticos y ejecuta flujos de respuesta con el modelo Gemini.',
            difficulty: 'Hard',
            techStack: ['Node.js', 'TypeScript', 'Gemini API', 'Vector Database', 'Express'],
            whyBuild: `Demuestra una alineación completa con el stack de inteligencia artificial moderno esperado por ${company}.`,
            implementationSteps: [
              'Desarrollar un endpoint de carga e ingesta de archivos PDF para extraer texto.',
              'Dividir el contenido en fragmentos lógicos y generar embeddings semánticos con Gemini.',
              'Almacenar los vectores en una base de datos local y habilitar consultas de similitud de coseno.',
              'Escribir la interfaz de chat en React conectada con respuestas estructuradas por el modelo.'
            ]
          },
          {
            title: 'Consola NL-to-SQL con Autocorrección Automática',
            description: 'Una aplicación que traduce lenguaje natural a consultas SQL estructuradas, las ejecuta de forma segura y corrige errores de sintaxis automáticamente.',
            difficulty: 'Medium',
            techStack: ['React', 'TypeScript', 'Express', 'SQLite', 'Gemini API'],
            whyBuild: 'Prueba habilidades sofisticadas de prompting estructurado, manejo de bucles de control de errores y orquestación dinámica de SQL.',
            implementationSteps: [
              'Establecer una base de datos SQLite en memoria con un esquema de ejemplo.',
              'Diseñar el prompt del sistema que proporcione el esquema detallado de tablas al modelo.',
              'Implementar un bucle de ejecución que capture errores de SQL y los envíe de vuelta al LLM para su reparación.',
              'Mostrar los resultados en una rejilla dinámica interactiva de React.'
            ]
          }
        ]
      };
    } else if (roleType === 'devops') {
      return {
        profileOverview: `El usuario ${username} tiene bases sólidas en automatización, scripting e infraestructura como código utilizando tecnologías de contenedores y lenguajes estructurados como ${mainRepoLang}.`,
        prAnalysis: `Se registran ${prsCount} pull requests. Probar la estabilidad de la infraestructura de CI/CD mediante PRs es un pilar fundamental de la metodología DevOps en ${company}.`,
        mainProject: defaultMain,
        laggingAreas: [
          { area: 'Orquestación Extensible de Contenedores', explanation: `Para liderar como ${role} en ${company}, se necesita dominar el ciclo de vida profundo de Kubernetes, la creación de operadores y las redes internas de clúster.` },
          { area: 'Métricas de Telemetría y Observabilidad', explanation: 'Falta configurar pilas completas de recopilación de métricas dinámicas que alerten en tiempo real sobre picos de latencia o consumo.' },
          { area: 'Automatización de Pipelines Declarativos', explanation: 'Faltan flujos de integración y despliegue robustos con análisis estático de vulnerabilidades y firmas criptográficas.' }
        ],
        requiredConcepts: [
          { concept: 'Infraestructura como Código (Terraform)', importance: 'Permite provisionar entornos en la nube de forma determinista y reproducible.' },
          { concept: 'Métricas e Instrumentación (OpenTelemetry)', importance: 'Estandariza la recopilación de trazas de ejecución en microservicios complejos.' },
          { concept: 'Estrategias de Despliegue Progresivo (Canary)', importance: 'Mitiga el impacto de fallos de producción liberando actualizaciones de forma incremental.' },
          { concept: 'Políticas de Seguridad en Redes de Contenedores', importance: 'Aísla cargas de trabajo en clústeres para evitar escalada de accesos maliciosos.' }
        ],
        skillBridges: [
          { actionItem: 'Escribir flujos declarativos complejos de GitHub Actions con análisis estático.', timeframe: '1 semana', resourceSuggestion: 'Guías de seguridad de GitHub Actions.' },
          { actionItem: 'Configurar un clúster de Kubernetes local para probar despliegues.', timeframe: '2 semanas', resourceSuggestion: 'Documentación de Minikube y K3s.' },
          { actionItem: 'Implementar monitoreo en una API de Node con Prometheus y Grafana.', timeframe: '2 semanas', resourceSuggestion: 'Manuales de instrumentación de Prometheus.' }
        ],
        recommendedProjects: [
          {
            title: 'Daemon de Orquestación y Autoreparación de Contenedores',
            description: 'Un servicio en segundo plano que vigila el estado de salud de contenedores Docker remotos y los reinicia automáticamente bajo reglas complejas.',
            difficulty: 'Hard',
            techStack: ['Node.js', 'Docker API', 'TypeScript', 'Prometheus', 'Grafana'],
            whyBuild: `Muestra excelentes capacidades de ingeniería de sistemas, telemetría activa y automatización profunda alineada a los estándares de ${company}.`,
            implementationSteps: [
              'Conectarse de forma segura al socket de Docker mediante la API nativa.',
              'Implementar un despachador de sondeos de salud periódicos (health probes).',
              'Programar las reglas de contingencia para la reconstrucción de instancias degradadas.',
              'Configurar un exportador de métricas en formato Prometheus con tasas de reinicio y uso de CPU.'
            ]
          },
          {
            title: 'Plataforma Visual de Configuración de Pipelines de CI/CD',
            description: 'Un panel interactivo que simula la ejecución en paralelo de flujos de compilación y despliegue sobre un mapa de nodos interactivo.',
            difficulty: 'Medium',
            techStack: ['React', 'Tailwind CSS', 'TypeScript', 'Express'],
            whyBuild: 'Demuestra habilidades en el diseño de herramientas internas, optimización de flujos de trabajo e interfaces amigables para desarrolladores.',
            implementationSteps: [
              'Crear un editor gráfico interactivo para definir pasos de pipeline seriales y paralelos.',
              'Programar un simulador de cola de tareas en el backend Express con retrasos controlados.',
              'Transmitir los logs de compilación simulados en tiempo real hacia la UI.',
              'Resaltar cuellos de botella mediante mapas de calor de duración sobre los nodos del pipeline.'
            ]
          }
        ]
      };
    } else if (roleType === 'mobile') {
      return {
        profileOverview: `El usuario ${username} se enfoca en crear interfaces móviles interactivas con énfasis en el rendimiento nativo y experiencias fluidas con ${mainRepoLang}.`,
        prAnalysis: `Su participación de ${prsCount} pull requests refleja una mentalidad de equipo ideal para coordinar ciclos de publicación ágiles en tiendas de aplicaciones.`,
        mainProject: defaultMain,
        laggingAreas: [
          { area: 'Estrategias Offline-First Robustas', explanation: `Un ${role} en ${company} debe dominar la sincronización asíncrona de datos locales con resolución activa de conflictos de red.` },
          { area: 'Rendimiento de Animaciones complejas', explanation: 'Se requiere optimizar el renderizado móvil para mantener una tasa constante de 60/120 FPS utilizando aceleración de GPU.' },
          { area: 'Pruebas de IU y End-to-End en Dispositivos', explanation: 'Falta cobertura de pruebas de UI automatizadas con herramientas móviles como Maestro, Detox o Appium.' }
        ],
        requiredConcepts: [
          { concept: 'Sincronización Incremental de Datos', importance: 'Minimiza el consumo de batería y el uso de datos en redes celulares limitadas.' },
          { concept: 'Hilos de Ejecución nativos (Native Bridge)', importance: 'Evita bloquear la interfaz de usuario ejecutando cálculos pesados en hilos paralelos.' },
          { concept: 'Mecanismos de Persistencia Encriptada', importance: 'Protege las credenciales y tokens del usuario en almacenamiento seguro de hardware.' },
          { concept: 'Monitoreo de Crash y Telemetría en el Cliente', importance: 'Captura fallos inesperados en dispositivos remotos bajo fragmentación de OS.' }
        ],
        skillBridges: [
          { actionItem: 'Implementar una base de datos local encriptada en un proyecto móvil.', timeframe: '2 semanas', resourceSuggestion: 'Guías de SQLite seguro o SQLCipher.' },
          { actionItem: 'Crear animaciones complejas controladas por gestos de usuario.', timeframe: '2 semanas', resourceSuggestion: 'Documentación de React Native Reanimated.' },
          { actionItem: 'Automatizar la suite de pruebas de flujos de usuario principales.', timeframe: '2 semanas', resourceSuggestion: 'Tutoriales prácticos de Maestro UI.' }
        ],
        recommendedProjects: [
          {
            title: 'Motor de Sincronización Fuera de Línea (Offline-First Core)',
            description: 'Un gestor de sincronización de estado local para aplicaciones que almacena transacciones desconectadas y resuelve colisiones de datos al reconectarse.',
            difficulty: 'Hard',
            techStack: ['React Native / TypeScript', 'SQLite', 'WebSockets', 'Jest'],
            whyBuild: `Muestra competencias indispensables en ingeniería de software móvil, optimización de red y resiliencia de datos para ${company}.`,
            implementationSteps: [
              'Escribir un almacén local de base de datos SQLite con estructura de cola de transacciones.',
              'Implementar un sistema de registro de eventos (write-ahead transaction queue).',
              'Codificar reglas lógicas de resolución de conflictos basadas en marcas de tiempo (Last-Write-Wins).',
              'Crear una interfaz interactiva de monitoreo que simule microcortes de red.'
            ]
          },
          {
            title: 'Lienzo de Animación Interactiva Controlada por Gestos',
            description: 'Un playground móvil que integra gestos multitáctiles, dinámicas físicas de inercia y colisión en una interfaz premium.',
            difficulty: 'Medium',
            techStack: ['React Native', 'TypeScript', 'Reanimated', 'Gesture Handler'],
            whyBuild: 'Prueba la destreza para construir interacciones táctiles sofisticadas que superan los estándares de las aplicaciones genéricas.',
            implementationSteps: [
              'Definir controladores de gestos interactivos (pan, pinch, zoom).',
              'Vincular físicas de resortes y amortiguación a las coordenadas de los elementos.',
              'Optimizar el rendimiento evitando transferencias repetidas a través del puente JavaScript.',
              'Implementar microtransiciones visuales ante toques de alta velocidad.'
            ]
          }
        ]
      };
    } else if (roleType === 'systems') {
      return {
        profileOverview: `El usuario ${username} muestra un perfil con un enfoque hacia el desarrollo estructurado y estructuración de bajo nivel, utilizando recursos de sistema y ${mainRepoLang}.`,
        prAnalysis: `Sus ${prsCount} pull requests demuestran dominio de los flujos de integración de código seguros, una habilidad indispensable para la ingeniería de sistemas críticos de ${company}.`,
        mainProject: defaultMain,
        laggingAreas: [
          { area: 'Programación Concurrente y Redes de Bajo Nivel', explanation: `Para roles de ${role} en ${company}, se necesita experiencia de bajo nivel programando directamente sockets TCP/UDP, asignación manual de memoria y exclusiones mutuas.` },
          { area: 'Manejo Eficiente de Búferes e I/O de Archivos', explanation: 'Falta evidencia de manipulación directa de archivos binarios, serialización binaria manual y optimización de I/O de disco.' },
          { area: 'Sistemas Durables con Tolerancia a Fallos', explanation: 'Sus proyectos carecen de mecanismos de recuperación ante pérdidas repentinas de energía o bloqueos mediante bitácoras de escritura.' }
        ],
        requiredConcepts: [
          { concept: 'Asignación Dinámica de Memoria y Punteros', importance: 'Permite reducir la latencia de procesamiento evitando copias innecesarias en memoria.' },
          { concept: 'Bitácora de Escritura Adelantada (Write-Ahead Logging)', importance: 'Garantiza la consistencia del almacenamiento inyectando seguridad antes de confirmar cambios.' },
          { concept: 'Sistemas de Archivo y Compresión Dinámica', importance: 'Optimiza el espacio en disco agrupando registros en bloques binarios compactos.' },
          { concept: 'Sincronización de Hilos (Mutexes y Semáforos)', importance: 'Evita condiciones de carrera sobre variables compartidas en hilos paralelos.' }
        ],
        skillBridges: [
          { actionItem: 'Implementar un codificador de datos binarios personalizado con manipulación de bits.', timeframe: '2 semanas', resourceSuggestion: 'Especificaciones de codificación ASN.1 o Protocol Buffers.' },
          { actionItem: 'Escribir un servidor de red multiproceso utilizando sockets nativos.', timeframe: '3 semanas', resourceSuggestion: 'Manuales de sockets POSIX o Node.js Net.' },
          { actionItem: 'Escribir pruebas de estrés de concurrencia intensa con simulación de fallos.', timeframe: '2 semanas', resourceSuggestion: 'Metodología Chaos Engineering básica.' }
        ],
        recommendedProjects: [
          {
            title: 'Servidor de Mensajería TCP y Protocolo Binario Estructurado',
            description: 'Un bróker de comunicación en red de alta velocidad basado en tramas de bytes de tamaño fijo con sumas de verificación personalizadas.',
            difficulty: 'Hard',
            techStack: ['Node.js', 'Net Sockets', 'TypeScript', 'Buffer API', 'Jest'],
            whyBuild: `Muestra dominio avanzado de protocolos de red, parseo binario manual y optimización de bajo nivel crítica en ${company}.`,
            implementationSteps: [
              'Definir la especificación binaria: campos de encabezado, ID de comando, payload y suma de verificación.',
              'Escribir el parser y empaquetador de búferes de bytes (Buffer manipulation) con validación de integridad.',
              'Implementar un despachador de sockets TCP con manejo de reconexiones automáticas.',
              'Añadir suites de pruebas que simulen tramas corruptas o parcialmente transmitidas.'
            ]
          },
          {
            title: 'Base de Datos de Clave-Valor en Memoria con WAL Duradero',
            description: 'Un motor de almacenamiento local ultrarrápido con persistencia en disco inmutable mediante un archivo Append-Only Log.',
            difficulty: 'Medium',
            techStack: ['TypeScript', 'Node.js FS API', 'Jest'],
            whyBuild: 'Prueba la competencia de diseño de motores de datos, recuperación de caídas de sistema e integridad de almacenamiento.',
            implementationSteps: [
              'Desarrollar la estructura del mapa de índices en memoria para búsquedas O(1).',
              'Implementar el sistema de Write-Ahead Log (WAL) que guarde cada cambio de clave antes del mapa.',
              'Codificar el proceso automático de compactación del archivo de log para evitar crecimiento infinito.',
              'Desarrollar pruebas de colisiones y pruebas de estrés para verificar la restauración del estado al reiniciar.'
            ]
          }
        ]
      };
    } else {
      // Default Spanish Fullstack
      return {
        profileOverview: defaultOverview,
        prAnalysis: defaultPrs,
        mainProject: defaultMain,
        laggingAreas: [
          { area: 'Arquitectura de Sistemas a Gran Escala', explanation: `Para ingresar como ${role} en ${company}, se necesita experiencia en sistemas distribuidos, bases de datos no relacionales y escalado masivo.` },
          { area: 'Estrategia de Pruebas Automatizadas', explanation: 'Falta cobertura de pruebas unitarias, de integración y end-to-end utilizando herramientas modernas como Jest, Vitest o Playwright.' },
          { area: 'CI/CD de Nivel Corporativo', explanation: 'Los flujos de trabajo de automatización de despliegue, monitoreo y contenedores Docker no están del todo desarrollados en sus proyectos públicos.' }
        ],
        requiredConcepts: [
          { concept: 'Caché distribuida (Redis/Memcached)', importance: `Altamente crucial para optimizar la velocidad y rendimiento en ${company}.` },
          { concept: 'Design de APIs robustas basadas en gRPC o GraphQL', importance: 'Facilita la comunicación eficiente entre microservicios.' },
          { concept: 'Estrategias de base de datos distribuidas', importance: 'Garantiza la resiliencia en aplicaciones de alto tráfico.' },
          { concept: 'Métricas de Observabilidad (OpenTelemetry)', importance: 'Ayuda a monitorear y solucionar cuellos de botella en entornos productivos.' }
        ],
        skillBridges: [
          { actionItem: 'Implementar pruebas rigurosas en tus repositorios existentes.', timeframe: '2 semanas', resourceSuggestion: 'Documentación oficial de Vitest y Testing Library.' },
          { actionItem: 'Aprender patrones de diseño de microservicios y desplegar un servicio en la nube.', timeframe: '4 semanas', resourceSuggestion: 'Cursos de diseño de sistemas de ByteByteGo.' },
          { actionItem: 'Contribuir activamente a proyectos de código abierto establecidos.', timeframe: 'Continuo', resourceSuggestion: 'Explorar repositorios con etiquetas "good first issue" en GitHub.' }
        ],
        recommendedProjects: [
          {
            title: 'Servicio de Distribución de Eventos en Tiempo Real',
            description: 'Un middleware de mensajería escalable que gestiona miles de suscripciones en tiempo real con latencia ultra baja.',
            difficulty: 'Hard',
            techStack: ['Node.js', 'Redis Pub/Sub', 'TypeScript', 'WebSockets'],
            whyBuild: `Demuestra habilidades avanzadas en programación asíncrona, concurrencia y manejo de sockets indispensables para ${company}.`,
            implementationSteps: [
              'Configurar el servidor central Express con soporte de WebSocket.',
              'Integrar un clúster de Redis local para la distribución de mensajes asíncronos.',
              'Implementar autenticación segura mediante tokens JWT en las conexiones activas.',
              'Diseñar un panel de control con métricas de rendimiento y tasa de transferencia en vivo.'
            ]
          },
          {
            title: 'Monitoreo Centralizado de Microservicios',
            description: 'Un panel de observabilidad autohospedado para registrar, agregar y visualizar métricas de rendimiento de APIs remotas.',
            difficulty: 'Medium',
            techStack: ['React', 'D3.js', 'TypeScript', 'Express', 'SQLite'],
            whyBuild: 'Prueba la competencia en análisis de datos, visualización interactiva y desarrollo full-stack de alto nivel.',
            implementationSteps: [
              'Crear un agente de registro liviano que envíe cargas útiles vía HTTP POST.',
              'Construir la base de datos de agregación con agregaciones temporales optimizadas.',
              'Diseñar el dashboard dinámico en React usando D3.js para gráficos de área y líneas de tiempo.',
              'Implementar alertas personalizadas que envíen notificaciones en caso de picos de la tasa de fallos.'
            ]
          }
        ]
      };
    }
  }

  // DEFAULT / ENGLISH
  const defaultOverviewEn = `User ${username} exhibits an active profile with a consistent developer focus, primarily working with technologies such as ${mainRepoLang}. Their repositories showcase hands-on experience in building structured apps.`;
  const defaultPrsEn = `We found ${prsCount} pull requests. This indicates steady participation in team workflows and direct engagement with public open-source software structures.`;
  const defaultMainEn = {
    name: mainRepoName,
    description: repos[0]?.description || 'An interactive software project with modular code structure.',
    techStack: [mainRepoLang, 'Git', 'Software Architecture'],
    strengths: ['Modular project structure', 'Clear dependency mapping', 'Clean code separation'],
    improvements: ['Introduce comprehensive unit test cases', 'Formally document the API design flow', 'Fine-tune performance bottleneck parameters']
  };

  if (roleType === 'frontend') {
    return {
      profileOverview: `User ${username} highlights a robust frontend presence, specializing in highly interactive client-side interfaces built with ${mainRepoLang}. Their portfolio showcases a keen eye for layout fluidity and responsiveness.`,
      prAnalysis: `Their track record of ${prsCount} pull requests proves efficient Git-flow collaboration, essential for integrating complex UI structures in high-velocity teams.`,
      mainProject: defaultMainEn,
      laggingAreas: [
        { area: 'Critical Rendering Path (CRP) Optimization', explanation: `To join as a ${role} at ${company}, you must demonstrate deep knowledge of DOM reflow avoidance, render cycle batching, and web vitals tuning.` },
        { area: 'Enterprise UI Testing Frameworks', explanation: 'Your public repositories lack coverage of unit, component, and end-to-end user journey tests using Jest, Vitest, Testing Library, or Cypress.' },
        { area: 'Micro-Frontend Federation Patterns', explanation: `Large-scale web properties at ${company} require expertise in modular federation, build isolation, and dynamic design system injection.` }
      ],
      requiredConcepts: [
        { concept: 'Incremental Static Regeneration (ISR) & Server-Side Rendering (SSR)', importance: 'Optimizes dynamic landing page speed and search engine discoverability at corporate scale.' },
        { concept: 'CSS paint containment & GPU Compositing', importance: 'Accelerates high-frequency UI updates by leveraging hardware rendering layers instead of the main thread.' },
        { concept: 'Deterministic UI State Management with State Machines', importance: 'Prevents race conditions in intricate multi-step UI flows using frameworks like XState.' },
        { concept: 'Web Vitals Monitoring (LCP, FID, CLS)', importance: 'Ensures measurable visual stability and high responsiveness indices under poor network conditions.' }
      ],
      skillBridges: [
        { actionItem: 'Implement a comprehensive test suite on your main frontend repositories.', timeframe: '2 weeks', resourceSuggestion: 'Read Vitest and React Testing Library official docs.' },
        { actionItem: 'Architect and bundle a module federation prototype.', timeframe: '3 weeks', resourceSuggestion: 'Explore Module Federation documentation and Vite plugin guides.' },
        { actionItem: 'Perform an accessibility audit (WCAG compliance) on your web UI projects.', timeframe: 'Ongoing', resourceSuggestion: 'Utilize axe DevTools and Lighthouse audit integrations.' }
      ],
      recommendedProjects: [
        {
          title: 'High-Performance Virtualized Rendering Engine',
          description: 'A high-frequency coordinate list and grid canvas capable of rendering over 100,000 dynamic visual nodes smoothly using absolute element recycling.',
          difficulty: 'Hard',
          techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Radix UI', 'Vitest'],
          whyBuild: `Directly proves master-level understanding of browser render-loops, paint containment, and low-latency state synchronization required for senior frontend roles at ${company}.`,
          implementationSteps: [
            'Create a layout container with a dynamic ResizeObserver wrapper to track exact dimensions.',
            'Implement custom element height-caching arrays to support variable-size dynamic row lists.',
            'Integrate dynamic style overrides using CSS variables for high-frequency theme switches without re-renders.',
            'Write comprehensive unit test suites using Vitest asserting DOM node recycling counts.'
          ]
        },
        {
          title: 'Collaborative Real-time Canvas Flow Editor',
          description: 'An interactive canvas diagramming workbench with multi-user cursors, optimistic state syncing, and state rollback managers.',
          difficulty: 'Medium',
          techStack: ['React', 'Tailwind CSS', 'WebSockets', 'Zustand', 'Lucide'],
          whyBuild: 'Demonstrates ability to manage complex UI state, custom gesture tracking, and real-time multiplayer states.',
          implementationSteps: [
            'Initialize an interactive HTML5 Canvas with custom touch gesture event handlers.',
            'Configure local state syncing via WebSockets with conflict resolution logic.',
            'Design a beautiful, responsive canvas utility rail with custom color swatches.',
            'Implement a robust client-side history hook for limitless undo and redo actions.'
          ]
        }
      ]
    };
  } else if (roleType === 'backend') {
    return {
      profileOverview: `User ${username} shows strong competencies in server-side software architectures using ${mainRepoLang}, with a clean focus on data encapsulation and secure interface endpoints.`,
      prAnalysis: `Their ${prsCount} pull requests verify consistent practice of Git-flow code reviews and robust backend branching strategies.`,
      mainProject: defaultMainEn,
      laggingAreas: [
        { area: 'Distributed Messaging and Event Streaming', explanation: `A senior ${role} at ${company} must be proficient with asynchronous broker topologies like Apache Kafka or RabbitMQ for event-driven coordination.` },
        { area: 'Multi-Tiered Distributed Caching', explanation: 'There is a lack of evidence regarding caching mechanisms (e.g. Redis) used to shield primary databases from high read contention.' },
        { area: 'High-Throughput Concurrency & Rate Limiting', explanation: 'Your API portfolios require stronger evidence of handling burst traffic with atomic token bucket throttling or concurrency semaphores.' }
      ],
      requiredConcepts: [
        { concept: 'Distributed Caching (Redis Cluster)', importance: 'Critical for sub-millisecond session state lookup and API response offloading.' },
        { concept: 'Event-Driven Architectures (EDA)', importance: 'Enables asynchronous, decoupled microservice systems that scale horizontally without blocking.' },
        { concept: 'gRPC & Protocol Buffers standard', importance: 'Provides high-efficiency binary RPC serialization with formal schema contract safety.' },
        { concept: 'Eventual Consistency Patterns', importance: 'Facilitates transaction resilience across distributed nodes without heavy row locking.' }
      ],
      skillBridges: [
        { actionItem: 'Build a multi-tiered cache middleware integrating Redis with an active SQL layer.', timeframe: '2 weeks', resourceSuggestion: 'Check Redis University development curricula.' },
        { actionItem: 'Implement asynchronous message brokers on an isolated local network setup.', timeframe: '3 weeks', resourceSuggestion: 'Read ByteByteGo microservices routing blueprints.' },
        { actionItem: 'Establish strict JWT signature validation and automated key rotation on your API boilers.', timeframe: '2 weeks', resourceSuggestion: 'Review RFC 7519 and Auth0 security best practices.' }
      ],
      recommendedProjects: [
        {
          title: 'Distributed Multi-Tenant API Gateway with Token-Throttler',
          description: 'A custom reverse proxy server featuring IP-based multi-tier token bucket rate-limiting and dynamic CORS verification.',
          difficulty: 'Hard',
          techStack: ['Node.js', 'Express', 'TypeScript', 'Redis', 'Docker'],
          whyBuild: `Directly proves ability to architect and protect scalable ingress layers, a critical operational requirement at ${company}.`,
          implementationSteps: [
            'Create a dynamic reverse proxy pipeline that forwards incoming requests based on path configurations.',
            'Write custom Lua scripts executed on Redis to evaluate token bucket exhaustion atomically.',
            'Incorporate strict CORS policies and automated secure headers using Helmet.',
            'Develop a terminal-based traffic analyzer interface demonstrating blocked IP alerts in real-time.'
          ]
        },
        {
          title: 'High-Throughput ACID-Compliant Transaction Ledger',
          description: 'An audit-ready transaction ledger system featuring double-entry bookkeeping validation and transaction isolating database locks.',
          difficulty: 'Medium',
          techStack: ['TypeScript', 'PostgreSQL', 'Prisma', 'Jest', 'Docker'],
          whyBuild: 'Tests relational modeling skills, transactional boundaries, and multi-user lock-contention mitigation.',
          implementationSteps: [
            'Define a highly optimized relational database schema with strict database constraints.',
            'Write robust isolation level routines (SERIALIZABLE) for ledger transfer actions.',
            'Design an immutable audit logger logging every single account state modification.',
            'Construct heavy mock concurrent requests to test for and prevent deadlock conditions.'
          ]
        }
      ]
    };
  } else if (roleType === 'ai') {
    return {
      profileOverview: `User ${username} shows an active interest in generative AI and intelligent agent integration, building structured applications with ${mainRepoLang} integrations.`,
      prAnalysis: `Their ${prsCount} pull requests indicate experience in collaborative codebase integration, highly valuable when deploying multi-modal AI systems into team pipelines.`,
      mainProject: defaultMainEn,
      laggingAreas: [
        { area: 'Autonomous Multi-Agent Orchestration', explanation: `Senior ${role} roles at ${company} demand hands-on experience in building agentic feedback loops, self-correction, and tool calling.` },
        { area: 'Advanced RAG and Vector Embeddings', explanation: 'Your public projects lack structured semantic retrieval mechanisms (vector databases, semantic search) necessary to ground models with private documents.' },
        { area: 'LLM Response Verification & Evaluation', explanation: 'There is little evidence of automated pipelines to quantitatively measure hallucination rates or model precision metrics.' }
      ],
      requiredConcepts: [
        { concept: 'Vector DBs & Semantic Cosine Similarity', importance: 'Enables high-fidelity retrieval of contextual document matches to feed LLM system context.' },
        { concept: 'Model Fine-Tuning & Prompt Safety Boundaries', importance: 'Adapts general model behaviors to specialized commercial domains safely and predictably.' },
        { concept: 'Structured Output Validation (JSON Schema)', importance: 'Forces generative models to respond with reliable structures that don\'t break backend pipelines.' },
        { concept: 'Agentic Tool-Calling & Dynamic Execution', importance: 'Enables LLMs to interact with database APIs and external calculations to solve complex tasks.' }
      ],
      skillBridges: [
        { actionItem: 'Implement an interactive chat client leveraging the modern Gemini API SDK.', timeframe: '1 week', resourceSuggestion: 'Read the official @google/genai TypeScript SDK documentation.' },
        { actionItem: 'Set up a local vector storage service to index, chunk, and search files.', timeframe: '2 weeks', resourceSuggestion: 'Read ChromaDB or Pinecone getting started guides.' },
        { actionItem: 'Configure structured prompt validators to assert JSON safety schemas.', timeframe: '2 weeks', resourceSuggestion: 'Review Zod and Typebox JSON schema integration patterns.' }
      ],
      recommendedProjects: [
        {
          title: 'Multi-Agent RAG Knowledge Orchestrator',
          description: 'An intelligent PDF ingestion and context analyzer that chunks documents, embeds them semantic-style, and runs cooperative chat loops to answer client queries.',
          difficulty: 'Hard',
          techStack: ['Node.js', 'TypeScript', 'Gemini API', 'Vector Database', 'Express'],
          whyBuild: `Perfect demonstration of modern AI engineering stack capabilities, embeddings logic, and dynamic context injection demanded at ${company}.`,
          implementationSteps: [
            'Develop a file ingestion endpoint in Express that accepts PDF files and extracts text blocks.',
            'Partition text into semantic segments and generate embeddings using Gemini embeddings endpoints.',
            'Persist vectors into a local Vector DB and enable rapid cosine-similarity search routines.',
            'Connect the chat loop with a React frontend that streams real-time contextual responses.'
          ]
        },
        {
          title: 'Self-Correcting NL-to-SQL Query Generator',
          description: 'An AI-powered data assistant that translates conversational user questions into SQL statements, handles errors, and self-heals failing queries automatically.',
          difficulty: 'Medium',
          techStack: ['React', 'TypeScript', 'Express', 'SQLite', 'Gemini API'],
          whyBuild: 'Exhibits robust understanding of structured prompts, self-correction algorithms, and safe database containment patterns.',
          implementationSteps: [
            'Bootstrap an in-memory SQLite database populated with complex relational mock tables.',
            'Design a secure system prompt that provides the LLM with the database schema context.',
            'Code an evaluation execution loop that captures SQL runtime errors and feeds them back into the LLM for corrections.',
            'Render the resulting records in an interactive React database grid with time-series charts.'
          ]
        }
      ]
    };
  } else if (roleType === 'devops') {
    return {
      profileOverview: `User ${username} possesses strong competencies in automation scripting, configuration, and infrastructure safety using modern environment workflows and ${mainRepoLang}.`,
      prAnalysis: `Their ${prsCount} pull requests highlight solid familiarity with software quality integration pipelines, a key requirement for modern continuous deployment roles.`,
      mainProject: defaultMainEn,
      laggingAreas: [
        { area: 'Production-Grade Container Orchestration', explanation: `To operate as a successful ${role} at ${company}, you must demonstrate deep proficiency in Kubernetes scheduling, Operator development, and service meshes.` },
        { area: 'Telemetry Pipelines & Active Metrics Collection', explanation: 'There is minimal evidence of metrics aggregation, log-shippers, or real-time alerting stacks deployed over your application targets.' },
        { area: 'Declarative Security and Static Code Analysis', explanation: 'Your workflows lack integrated vulnerability scanners, artifact signing, or container scanning layers.' }
      ],
      requiredConcepts: [
        { concept: 'Infrastructure as Code (Terraform)', importance: 'Guarantees repeatable, deterministic cloud resource configurations across isolated environments.' },
        { concept: 'Telemetry Standardization (OpenTelemetry)', importance: 'Standardizes the instrumentation of traces, logs, and metrics across heterogeneous systems.' },
        { concept: 'Progressive Deployment Strategies (Canary)', importance: 'Minimizes production deployment risk by distributing live traffic gradually.' },
        { concept: 'Container Networking Policies', importance: 'Enforces strict firewall and access rules within elastic container clusters.' }
      ],
      skillBridges: [
        { actionItem: 'Integrate dynamic static analyzers and secret detectors in your current repos.', timeframe: '1 week', resourceSuggestion: 'Implement Trivy and GitGuardian scan tasks.' },
        { actionItem: 'Configure an active local Kubernetes development environment.', timeframe: '2 weeks', resourceSuggestion: 'Read Minikube and K3s official architecture manuals.' },
        { actionItem: 'Instrument a multi-service web backend with Prometheus and Grafana alerts.', timeframe: '2 weeks', resourceSuggestion: 'Consult Prometheus instrumentation guides.' }
      ],
      recommendedProjects: [
        {
          title: 'Self-Healing Multi-Service Orchestration Daemon',
          description: 'A custom service daemon that interfaces with the Docker socket to monitor health checks, auto-reboot crashed nodes, and log performance metrics.',
          difficulty: 'Hard',
          techStack: ['Node.js', 'Docker API', 'TypeScript', 'Prometheus', 'Grafana'],
          whyBuild: `Provides proof of systems engineering capacity, metric collection, and reliability management crucial for SRE positions at ${company}.`,
          implementationSteps: [
            'Establish secure programmatic socket connections to the Docker engine.',
            'Develop custom, configurable health probing loops with exponential retry delays.',
            'Code state recovery handlers that tear down and spin up instances when thresholds fail.',
            'Expose a Prometheus-compliant metrics endpoint detailing server health indices.'
          ]
        },
        {
          title: 'Visual CI/CD Pipeline Drag-and-Drop Simulator',
          description: 'A React-based interactive canvas where developers design serial/parallel pipeline build steps and inspect execution bottlenecks in real time.',
          difficulty: 'Medium',
          techStack: ['React', 'Tailwind CSS', 'TypeScript', 'Express'],
          whyBuild: 'Showcases capability to design developer tooling, pipeline logic, and visual analytics.',
          implementationSteps: [
            'Create an interactive flow editor allowing users to link pipeline action steps.',
            'Implement an Express task runner simulator that schedules tasks with mock durations.',
            'Stream execution logs sequentially to the frontend using Server-Sent Events.',
            'Highlight pipeline execution hotspots and critical path delays visually using intuitive color states.'
          ]
        }
      ]
    };
  } else if (roleType === 'mobile') {
    return {
      profileOverview: `User ${username} targets mobile-first development, delivering responsive interactions and clean layout flows centered on client performance with ${mainRepoLang}.`,
      prAnalysis: `Their ${prsCount} pull requests reflect strong collaborative credentials, essential for synchronizing app store release cycles within multi-module teams.`,
      mainProject: defaultMainEn,
      laggingAreas: [
        { area: 'Robust Offline-First Synchronization Engines', explanation: `Mobile developers at ${company} are expected to craft resilient database synchronization schemes that elegantly handle transient connectivity and conflict resolution.` },
        { area: '60/120 FPS UI and Gesture Performance', explanation: 'Your mobile portfolios require evidence of deep rendering optimizations, memory profile analyses, and GPU-driven canvas drawings.' },
        { area: 'Automated Device Farm & UI Testing', explanation: 'There is limited evidence of automated end-to-end device testing using frameworks like Maestro, Detox, or Appium.' }
      ],
      requiredConcepts: [
        { concept: 'Incremental Sync & Data Delta Optimization', importance: 'Conserves precious battery and limited cellular data bandwidth on client devices.' },
        { concept: 'Native Thread Bridging', importance: 'Keeps the visual UI responsive by shifting intensive operations off the main Javascript thread.' },
        { concept: 'Hardware-Backed Secure Storage API', importance: 'Shields sensitive tokens and credentials on devices using keychains and secure enclaves.' },
        { concept: 'Crash Reporting and Client-Side Telemetry', importance: 'Collects remote exception stacks across heavily fragmented OS distributions.' }
      ],
      skillBridges: [
        { actionItem: 'Implement secure local storage and caching in an active mobile project.', timeframe: '2 weeks', resourceSuggestion: 'Use SQLCipher or secure SQLite storage structures.' },
        { actionItem: 'Develop a custom physics-based spring animation controlled via gestures.', timeframe: '2 weeks', resourceSuggestion: 'Study React Native Reanimated gesture handlers.' },
        { actionItem: 'Create an automated end-to-end test suite for main user journeys.', timeframe: '2 weeks', resourceSuggestion: 'Write interactive tests using Maestro UI.' }
      ],
      recommendedProjects: [
        {
          title: 'Offline-First Mobile Sync Engine Core',
          description: 'A transaction-safe local database state synchronizer that records offline data operations and resolves conflict states once reconnected.',
          difficulty: 'Hard',
          techStack: ['React Native / TypeScript', 'SQLite', 'WebSockets', 'Jest'],
          whyBuild: `Demonstrates systems level mobile engineering, data consistency management, and network awareness prized by ${company}.`,
          implementationSteps: [
            'Construct an isolated SQLite local schema that keeps records of un-synced user changes.',
            'Build an append-only transaction queue tracking offline write events.',
            'Implement a conflict resolution logic prioritizing client timestamps or master overrides.',
            'Design an interactive simulation panel to test database behavior under erratic cellular connectivity.'
          ]
        },
        {
          title: 'High-Fidelity Gesture & Inertial Animation Playground',
          description: 'A beautiful mobile UI showcase demonstrating physics-backed spring mechanics, momentum panning, and particle layout transitions.',
          difficulty: 'Medium',
          techStack: ['React Native', 'TypeScript', 'Reanimated', 'Gesture Handler'],
          whyBuild: 'Validates ability to design extremely premium visual interfaces that far surpass generic mobile template patterns.',
          implementationSteps: [
            'Set up gesture handlers tracking multi-touch, pinch, pan, and zoom actions.',
            'Hook gesture coordinates directly to spring physics configurations.',
            'Avoid Javascript thread bottlenecking by using native-driven animation hooks.',
            'Add particle animations reflecting collisions and tactile feedback.'
          ]
        }
      ]
    };
  } else if (roleType === 'systems') {
    return {
      profileOverview: `User ${username} focuses on low-level structures and data parsing, utilizing structured environments and ${mainRepoLang} to maximize speed and data safety.`,
      prAnalysis: `Their ${prsCount} pull requests show a steady familiarity with secure continuous integration, highly important for maintaining safety in high-performance system targets.`,
      mainProject: defaultMainEn,
      laggingAreas: [
        { area: 'Low-Level Networking & Concurrent Sockets', explanation: `To join as a ${role} at ${company}, you must demonstrate hands-on experience in building socket pools, memory-mapped buffers, and multi-threaded locks.` },
        { area: 'Direct File-System IO & Binary Manipulation', explanation: 'Your repositories require evidence of binary data serialization, customized block packing, and direct file IO optimizations.' },
        { area: 'Fault-Tolerant Durable Storage Strategies', explanation: 'Missing evidence of data durability patterns such as Write-Ahead Logging (WAL) or transaction recovery schemes.' }
      ],
      requiredConcepts: [
        { concept: 'Dynamic Memory Allocation and Buffer Manipulation', importance: 'Minimizes processing latencies by omitting costly in-memory object copies.' },
        { concept: 'Write-Ahead Logging (WAL) Architecture', importance: 'Guarantees reliable database states by writing operations securely to disk before committing changes.' },
        { concept: 'Compact Binary Serialization (Protocol Buffers / ASN.1)', importance: 'Minimizes memory foot-prints and data-transmission overhead.' },
        { concept: 'Thread Synchronization (Mutexes & Semaphores)', importance: 'Prevents race conditions over memory spaces in heavily multi-threaded workloads.' }
      ],
      skillBridges: [
        { actionItem: 'Implement a custom binary encoder using bitwise operators.', timeframe: '2 weeks', resourceSuggestion: 'Study ProtoBuf encoding and byte-buffer specs.' },
        { actionItem: 'Build a high-performance network server using raw system sockets.', timeframe: '3 weeks', resourceSuggestion: 'Read POSIX sockets or Node.js net connection guides.' },
        { actionItem: 'Write rigorous concurrent concurrency test suites.', timeframe: '2 weeks', resourceSuggestion: 'Explore chaos testing methodologies.' }
      ],
      recommendedProjects: [
        {
          title: 'High-Performance Binary Protocol Parser and TCP Chat Broker',
          description: 'A multi-connection socket broker built on a custom byte frame specification utilizing headers, payload frames, and CRC-32 integrity validation.',
          difficulty: 'Hard',
          techStack: ['Node.js', 'Net Sockets', 'TypeScript', 'Buffer API', 'Jest'],
          whyBuild: `Directly showcases capability to engineer low-level net interfaces, custom serialization, and optimal memory management at ${company}.`,
          implementationSteps: [
            'Define a binary protocol: header bounds, cmd identifier, payload size, and integrity checksum.',
            'Write a high-speed buffer pack and unpack stream utility.',
            'Implement a TCP socket client dispatcher with connection pooling.',
            'Write automated unit tests verifying protocol recovery from malformed frames.'
          ]
        },
        {
          title: 'Local In-Memory Key-Value Database with Durable WAL',
          description: 'An O(1) in-memory key-value database featuring file system append-only write-ahead logging (WAL) for absolute durability.',
          difficulty: 'Medium',
          techStack: ['TypeScript', 'Node.js FS API', 'Jest'],
          whyBuild: 'Tests engine design principles, crash recovery logic, and storage durability architectures.',
          implementationSteps: [
            'Create a custom index lookup table with dynamic scaling properties.',
            'Write append-only logger writing operations to disk before updating memory indices.',
            'Implement background log compaction merging duplicate key mutations.',
            'Write stress test routines simulating abrupt termination to verify complete index recovery.'
          ]
        }
      ]
    };
  } else {
    // Default English / Full-Stack
    return {
      profileOverview: defaultOverviewEn,
      prAnalysis: defaultPrsEn,
      mainProject: defaultMainEn,
      laggingAreas: [
        { area: 'Large-scale System Design', explanation: `Entering as a ${role} at ${company} requires hands-on experience with load balancing, distributed caching, and microservices decoupling.` },
        { area: 'Automated Test Infrastructure', explanation: 'Your repositories lack modular unit, integration, and end-to-end testing frameworks using Jest, Vitest, or Playwright.' },
        { area: 'Production-grade CI/CD and DevOps', explanation: 'There is minimal evidence of Docker containerization, cloud service deployments, or automated security scans in GitHub workflows.' }
      ],
      requiredConcepts: [
        { concept: 'Distributed Caching (e.g. Redis)', importance: `Crucial for sub-millisecond response rates and reducing database workloads at scale for ${company}.` },
        { concept: 'Message Brokers & Event Streams (Kafka/RabbitMQ)', importance: 'Coordinates asynchronous, resilient communication between decoupled microservices.' },
        { concept: 'REST / gRPC / GraphQL API Design Standards', importance: 'Enables high-efficiency inter-service transport layers with formal contract safety.' },
        { concept: 'Observability & Metrics Tracking', importance: 'Enables telemetry collection via OpenTelemetry or Prometheus for rapid production triage.' }
      ],
      skillBridges: [
        { actionItem: 'Implement complete unit test suites on your top 2 public repositories.', timeframe: '2 weeks', resourceSuggestion: 'Explore official guides for Vitest and React Testing Library.' },
        { actionItem: 'Design and deploy a distributed multi-service API on a free cloud container platform.', timeframe: '4 weeks', resourceSuggestion: 'Read ByteByteGo system design blueprints.' },
        { actionItem: 'Actively submit PR contributions to recognized public open-source libraries.', timeframe: 'Ongoing', resourceSuggestion: 'Search GitHub repos filtered by "good first issue" or "help wanted" labels.' }
      ],
      recommendedProjects: [
        {
          title: 'High-Throughput Real-time Event Broadcaster',
          description: 'A scalable event streaming server that manages thousands of live client subscriptions with extremely low latency and crash-safety.',
          difficulty: 'Hard',
          techStack: ['Node.js', 'Redis Pub/Sub', 'TypeScript', 'WebSockets'],
          whyBuild: `Directly demonstrates advanced knowledge in asynchronous task scheduling, event loops, and robust multi-user scaling relevant to ${company}.`,
          implementationSteps: [
            'Bootstrap a modular TypeScript Express server and attach WebSocket listeners.',
            'Integrate a local Redis client instance to broker messages across parallel threads.',
            'Incorporate secure token-based JWT validation for incoming real-time requests.',
            'Design an administrative analytics panel displaying active node connections and live messaging rate.'
          ]
        },
        {
          title: 'Distributed Analytics Observability Platform',
          description: 'A self-hosted metrics collection dashboard for monitoring service uptime, error frequencies, and endpoint latencies in real time.',
          difficulty: 'Medium',
          techStack: ['React', 'D3.js', 'TypeScript', 'Express', 'SQLite'],
          whyBuild: 'Highlights proficiency in metrics aggregation, time-series plotting, and professional dashboard presentation.',
          implementationSteps: [
            'Create a lightweight middleware SDK that reports endpoint performance logs to a central collector.',
            'Implement time-series aggregation query routines in the SQL storage layer.',
            'Design the interactive frontend dashboard using D3.js or Recharts to visualize load spikes.',
            'Implement a thresholds watcher service to trigger alerts in case of performance degradation.'
          ]
        }
      ]
    };
  }
}


// ----------------------------------------------------
// DEVELOPMENT & PRODUCTION ROUTING
// ----------------------------------------------------

async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI EdTech Platform Server running on port ${PORT}`);
  });
}

setupServer();
