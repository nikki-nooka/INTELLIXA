/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  FastForward, 
  Rewind, 
  RotateCcw, 
  Cpu, 
  Lock, 
  Shield, 
  Database, 
  Network, 
  Key, 
  Terminal, 
  ArrowRight, 
  User, 
  AlertCircle, 
  Plus, 
  Eye, 
  Zap,
  Globe,
  TrendingUp,
  Flame,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InteractiveSimulatorProps {
  concept: string;
  codeSnippet?: string;
  onClose?: () => void;
}

export default function InteractiveSimulator({ concept, codeSnippet, onClose }: InteractiveSimulatorProps) {
  const lowercaseConcept = concept.toLowerCase();

  // Route to the correct visualizer based on keyword
  if (lowercaseConcept.includes('recursion') || lowercaseConcept.includes('factorial') || lowercaseConcept.includes('fibonacci')) {
    return <RecursionVisualizer concept={concept} />;
  }
  if (lowercaseConcept.includes('big o')) {
    return <BigOVisualizer />;
  }
  if (lowercaseConcept.includes('closure')) {
    return <ClosureVisualizer />;
  }
  if (lowercaseConcept.includes('asymmetric') || lowercaseConcept.includes('encryption') || lowercaseConcept.includes('cryptography')) {
    return <CryptographyVisualizer />;
  }
  if (lowercaseConcept.includes('rest') || lowercaseConcept.includes('graphql')) {
    return <RestVsGraphqlVisualizer />;
  }

  // Fallback to the Universal Console Compiler
  return <UniversalConsoleSimulator concept={concept} code={codeSnippet || ''} />;
}

// ==========================================
// 1. RECURSION STACK VISUALIZER
// ==========================================
function RecursionVisualizer({ concept }: { concept: string }) {
  const [valN, setValN] = useState<number>(4);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [mode, setMode] = useState<'factorial' | 'fibonacci'>('factorial');

  // Set default mode based on concept
  useEffect(() => {
    if (concept.toLowerCase().includes('fib')) {
      setMode('fibonacci');
    } else {
      setMode('factorial');
    }
  }, [concept]);

  // Generate steps of the Call Stack
  // For Factorial(n):
  // Step 0: Initial state, stack empty.
  // Step 1..n: calling factorial(n), factorial(n-1) etc.
  // Step n+1: hitting base case factorial(1)
  // Step n+2..2n: popping and computing results
  interface StackFrame {
    name: string;
    n: number;
    status: 'active' | 'waiting' | 'resolved';
    returnValue?: number;
    formula?: string;
  }

  interface StepState {
    stack: StackFrame[];
    description: string;
    explanation: string;
    highlightedLine: number; // 1-indexed
    currentValue?: number;
  }

  const getFactorialSteps = (n: number): StepState[] => {
    const steps: StepState[] = [];
    
    // Step 0: Calling factorial(N)
    steps.push({
      stack: [
        { name: `factorial(${n})`, n, status: 'active', formula: `${n} * factorial(${n-1})` }
      ],
      description: `Starting: factorial(${n}) is called from global context.`,
      explanation: `Checks base case: is ${n} == 0 or 1? No. It must make a recursive call and wait for the result of factorial(${n-1}).`,
      highlightedLine: 5
    });

    // Pushing states
    let currentStack: StackFrame[] = [
      { name: `factorial(${n})`, n, status: 'waiting', formula: `${n} * factorial(${n-1})` }
    ];

    for (let i = n - 1; i >= 1; i--) {
      const isBaseCase = i === 1;
      const stackFrame: StackFrame = {
        name: `factorial(${i})`,
        n: i,
        status: isBaseCase ? 'active' : 'waiting',
        formula: isBaseCase ? '1 (Base Case!)' : `${i} * factorial(${i-1})`
      };

      // Create a snapshot of the stack
      const snapshot = [...currentStack.map(f => ({ ...f, status: 'waiting' as const })), stackFrame];
      currentStack = snapshot;

      steps.push({
        stack: [...snapshot],
        description: isBaseCase 
          ? `Base Case reached: factorial(${i}) is called.` 
          : `Recursive step: factorial(${i}) is called.`,
        explanation: isBaseCase
          ? `We hit the base case: n is 1! We can resolve this immediately without calling any further functions.`
          : `Checking if ${i} == 1. No, so we must calculate ${i} * factorial(${i-1}). We push a new frame onto the call stack.`,
        highlightedLine: isBaseCase ? 3 : 5
      });
    }

    // Resolving states (Popping)
    let currentVal = 1;
    // Walk back up the stack
    for (let i = 2; i <= n; i++) {
      const prevVal = currentVal;
      currentVal = i * prevVal;

      // Update stack: remove resolved frame, mark next as active with computed value
      const updatedStack: StackFrame[] = [];
      for (let j = 0; j < currentStack.length; j++) {
        const frame = currentStack[j];
        if (frame.n >= i) {
          if (frame.n === i) {
            updatedStack.push({
              ...frame,
              status: 'active',
              returnValue: currentVal,
              formula: `${i} * ${prevVal} = ${currentVal}`
            });
          } else {
            updatedStack.push({ ...frame, status: 'waiting' });
          }
        }
      }
      currentStack = updatedStack;

      steps.push({
        stack: [...updatedStack],
        description: `Popping Frame: factorial(${i}) completes.`,
        explanation: `With factorial(${i-1}) resolved to ${prevVal}, we can now compute the product: ${i} * ${prevVal} = ${currentVal}. This frame pops off, returning ${currentVal} to the caller.`,
        highlightedLine: 5,
        currentValue: currentVal
      });
    }

    // Final result step
    steps.push({
      stack: [],
      description: `Task Complete! Result is ${currentVal}.`,
      explanation: `All stack frames have completed execution and popped off the stack. The final answer of factorial(${n}) is ${currentVal}.`,
      highlightedLine: 8,
      currentValue: currentVal
    });

    return steps;
  };

  const getFibonacciSteps = (n: number): StepState[] => {
    // A simplified illustrative sequential trace for fibonacci (Tree traversal)
    // To keep it simple and easy to digest, we trace fib(n) call stack sequential resolution
    const steps: StepState[] = [];
    
    steps.push({
      stack: [{ name: `fib(${n})`, n, status: 'active', formula: `fib(${n-1}) + fib(${n-2})` }],
      description: `Starting: fib(${n}) is called.`,
      explanation: `To solve fib(${n}), we need the sum of fib(${n-1}) and fib(${n-2}). We branch left first to compute fib(${n-1}).`,
      highlightedLine: 5
    });

    if (n <= 2) {
      steps.push({
        stack: [{ name: `fib(${n})`, n, status: 'active', returnValue: 1, formula: `Base Case: 1` }],
        description: `Base Case reached: fib(${n}) returns 1.`,
        explanation: `For n <= 2, we immediately return 1 as defined by the fibonacci base rules.`,
        highlightedLine: 3
      });
      return steps;
    }

    // Let's create an illustrative stack growth trace
    steps.push({
      stack: [
        { name: `fib(${n})`, n, status: 'waiting', formula: `fib(${n-1}) + fib(${n-2})` },
        { name: `fib(${n-1})`, n: n-1, status: 'active', formula: `fib(${n-2}) + fib(${n-3})` }
      ],
      description: `Recursing Left: Computing fib(${n-1}).`,
      explanation: `The system holds the main execution and spins up a child frame to compute fib(${n-1}) first.`,
      highlightedLine: 5
    });

    steps.push({
      stack: [
        { name: `fib(${n})`, n, status: 'waiting', formula: `fib(${n-1}) + fib(${n-2})` },
        { name: `fib(${n-1})`, n: n-1, status: 'waiting', formula: `fib(${n-2}) + fib(${n-3})` },
        { name: `fib(${n-2})`, n: n-2, status: 'active', formula: `Base case / simpler branch` }
      ],
      description: `Recursing Deeper: Computing fib(${n-2}).`,
      explanation: `The recursion deepens down the left subtree until it hits base values.`,
      highlightedLine: 5
    });

    // Solve and unwind trace
    steps.push({
      stack: [
        { name: `fib(${n})`, n, status: 'waiting', formula: `fib(${n-1}) + fib(${n-2})` },
        { name: `fib(${n-1})`, n: n-1, status: 'active', returnValue: n-1 === 2 ? 1 : n-1 === 3 ? 2 : 3, formula: `Left branch resolved` }
      ],
      description: `Left subtree completed.`,
      explanation: `The left branch fib(${n-1}) finishes computing. We now start computing the right branch.`,
      highlightedLine: 5
    });

    steps.push({
      stack: [
        { name: `fib(${n})`, n, status: 'waiting', formula: `fib(${n-1}) + fib(${n-2})` },
        { name: `fib(${n-1})`, n: n-1, status: 'resolved', returnValue: n-1 === 2 ? 1 : n-1 === 3 ? 2 : 3 },
        { name: `fib(${n-2})`, n: n-2, status: 'active', formula: `Right branch` }
      ],
      description: `Recursing Right: Computing fib(${n-2}).`,
      explanation: `Now we evaluate the right subtree of the original call, which is fib(${n-2}).`,
      highlightedLine: 5
    });

    const leftVal = n === 3 ? 1 : n === 4 ? 2 : n === 5 ? 3 : 5; // fib(n-1)
    const rightVal = n === 3 ? 1 : n === 4 ? 1 : n === 5 ? 2 : 3; // fib(n-2)
    const finalFib = leftVal + rightVal;

    steps.push({
      stack: [
        { name: `fib(${n})`, n, status: 'active', returnValue: finalFib, formula: `${leftVal} + ${rightVal} = ${finalFib}` }
      ],
      description: `Unwinding: Summing results.`,
      explanation: `We have both branches: fib(${n-1}) = ${leftVal}, and fib(${n-2}) = ${rightVal}. Summing them yields the final answer of ${finalFib}.`,
      highlightedLine: 5
    });

    steps.push({
      stack: [],
      description: `Success! fib(${n}) = ${finalFib}.`,
      explanation: `Execution stack cleared. The Fibonacci number at position ${n} is resolved to ${finalFib}!`,
      highlightedLine: 8
    });

    return steps;
  };

  const steps = mode === 'factorial' ? getFactorialSteps(valN) : getFibonacciSteps(valN);
  const currentStep = steps[stepIndex] || steps[steps.length - 1];

  // Auto-play control loop
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setStepIndex(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  const handleReset = () => {
    setStepIndex(0);
    setIsPlaying(false);
  };

  const codeString = mode === 'factorial' 
    ? `def factorial(n):
    # 1. Base Case
    if n <= 1:
        return 1
    # 2. Recursive Step
    else:
        return n * factorial(n - 1)`
    : `def fib(n):
    # 1. Base Case
    if n <= 2:
        return 1
    # 2. Recursive Step
    else:
        return fib(n - 1) + fib(n - 2)`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-100 flex flex-col lg:flex-row gap-5" id="recursion-visualizer-card">
      {/* Visual Controls & Call Stack visualizer (Left/Main) */}
      <div className="flex-1 space-y-4">
        {/* Toggle between Factorial / Fibonacci */}
        <div className="flex justify-between items-center bg-slate-950 p-2 rounded-xl border border-slate-850">
          <div className="flex gap-1.5">
            <button
              onClick={() => { setMode('factorial'); handleReset(); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'factorial' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Factorial (n!)
            </button>
            <button
              onClick={() => { setMode('fibonacci'); handleReset(); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'fibonacci' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Fibonacci Series
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 font-bold">Value N:</span>
            <input 
              type="range" 
              min="1" 
              max="6" 
              value={valN} 
              onChange={(e) => { setValN(parseInt(e.target.value)); handleReset(); }}
              className="w-20 accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-indigo-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{valN}</span>
          </div>
        </div>

        {/* Stack Box Visual Stage */}
        <div className="bg-slate-950 rounded-2xl p-5 border border-slate-850 h-72 flex flex-col-reverse justify-start items-center relative overflow-hidden">
          {/* Depth guidelines */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-5">
            <div className="border-t border-dashed border-slate-500 w-full text-[9px] font-mono text-right">STACK LEVEL 5 (MAX)</div>
            <div className="border-t border-dashed border-slate-500 w-full text-[9px] font-mono text-right">STACK LEVEL 3</div>
            <div className="border-t border-dashed border-slate-500 w-full text-[9px] font-mono text-right">STACK LEVEL 1</div>
          </div>

          <AnimatePresence mode="popLayout">
            {currentStep.stack.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 0.6, scale: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col justify-center items-center text-center space-y-2 text-slate-500"
              >
                <Database className="w-10 h-10 text-slate-600" />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">Call Stack Empty</span>
                  <span className="text-[10px] text-slate-500">Execution inactive or finished.</span>
                </div>
              </motion.div>
            ) : (
              currentStep.stack.map((frame, index) => {
                const isActive = frame.status === 'active';
                const isWaiting = frame.status === 'waiting';

                return (
                  <motion.div
                    key={`${frame.n}-${index}`}
                    initial={{ opacity: 0, y: -40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`w-full max-w-sm mb-2 rounded-xl border p-3 flex flex-col justify-between shadow-md transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-900/90 to-indigo-850/90 border-indigo-500 shadow-indigo-500/10' 
                        : isWaiting
                        ? 'bg-slate-900/80 border-slate-800 text-slate-400 opacity-60'
                        : 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`} />
                        {frame.name}
                      </span>
                      <span className="text-[9px] font-mono font-bold uppercase bg-slate-950/60 px-2 py-0.5 rounded">
                        Level {index + 1}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-850/40 text-[10px] font-mono">
                      <span className="text-slate-400">Formula: <code className="text-slate-200">{frame.formula}</code></span>
                      {frame.returnValue !== undefined && (
                        <span className="text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-900/30">
                          returns {frame.returnValue}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              }).reverse() // render top of stack at top visually
            )}
          </AnimatePresence>

          {/* Stack Base Platform */}
          <div className="w-44 h-1 bg-slate-700 rounded-t-full shadow-inner mt-4 shrink-0" />
        </div>

        {/* Navigation Step controls */}
        <div className="flex items-center justify-between gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              disabled={stepIndex === 0}
              className="p-2 bg-slate-900 border border-slate-850 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
              title="Reset Trace"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setStepIndex(p => Math.max(0, p - 1))}
              disabled={stepIndex === 0}
              className="p-2 bg-slate-900 border border-slate-850 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
              title="Step Backward"
            >
              <Rewind className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
            >
              <Play className={`w-3.5 h-3.5 ${isPlaying ? 'fill-white' : ''}`} />
              {isPlaying ? 'Pause' : 'Auto Play'}
            </button>
            <button
              onClick={() => setStepIndex(p => Math.min(steps.length - 1, p + 1))}
              disabled={stepIndex === steps.length - 1}
              className="p-2 bg-slate-900 border border-slate-850 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
              title="Step Forward"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-850">
            Step {stepIndex + 1} / {steps.length}
          </span>
        </div>
      </div>

      {/* Narrative & Code Trace panel (Right) */}
      <div className="w-full lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-5 space-y-4">
        {/* Dynamic code highlighted area */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Socratic Code Trace</span>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 font-mono text-xs text-indigo-300 space-y-1 overflow-x-auto leading-relaxed">
            {codeString.split('\n').map((line, idx) => {
              const isHighlighted = 
                (currentStep.highlightedLine === 3 && (idx === 1 || idx === 2 || idx === 3)) ||
                (currentStep.highlightedLine === 5 && (idx === 4 || idx === 5 || idx === 6)) ||
                (currentStep.highlightedLine === 8 && idx === 0);

              return (
                <div 
                  key={idx} 
                  className={`px-1.5 rounded-sm transition-all duration-300 flex ${
                    isHighlighted ? 'bg-indigo-900/60 text-white font-bold border-l-2 border-indigo-400 pl-1' : 'opacity-55'
                  }`}
                >
                  <span className="w-5 text-slate-600 select-none text-[10px]">{idx + 1}</span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explainer card block */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-850 space-y-2 flex-1 flex flex-col justify-between">
          <div>
            <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono">Current Action</h5>
            <h4 className="text-xs font-bold text-slate-200 mt-0.5">{currentStep.description}</h4>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-medium">
              {currentStep.explanation}
            </p>
          </div>
          
          <div className="bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-900/20 flex gap-2 items-start mt-3">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span className="text-[10px] text-indigo-300 leading-normal font-medium">
              <strong>Takeaway:</strong> Recursion matches subproblems. The <strong>Base Case</strong> stops infinite loops, allowing values to unwind!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. BIG O NOTATION VISUALIZER
// ==========================================
function BigOVisualizer() {
  const [dataSize, setDataSize] = useState<number>(100);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [opsData, setOpsData] = useState({
    o1: 1,
    ologN: 7,
    oN: 100,
    oNlogN: 664,
    oN2: 10000
  });

  const handleRunBenchmark = () => {
    setIsRunning(true);
    setTimeout(() => {
      // Calculate complexity operations
      const n = dataSize;
      setOpsData({
        o1: 1,
        ologN: Math.max(1, Math.round(Math.log2(n))),
        oN: n,
        oNlogN: Math.max(1, Math.round(n * Math.log2(n))),
        oN2: n * n
      });
      setIsRunning(false);
    }, 850);
  };

  useEffect(() => {
    handleRunBenchmark();
  }, [dataSize]);

  const complexities = [
    { label: 'O(1) - Constant Time', value: opsData.o1, color: 'bg-emerald-500 text-emerald-300 border-emerald-900', desc: 'Instant search / direct index lookup (HashMap, Array Index).' },
    { label: 'O(log N) - Logarithmic Time', value: opsData.ologN, color: 'bg-blue-500 text-blue-300 border-blue-900', desc: 'Dividing data size in half at each step (Binary Search).' },
    { label: 'O(N) - Linear Time', value: opsData.oN, color: 'bg-yellow-500 text-yellow-300 border-yellow-900', desc: 'Iterating through every element once (Sequential scan).' },
    { label: 'O(N log N) - Log-Linear Time', value: opsData.oNlogN, color: 'bg-orange-500 text-orange-300 border-orange-900', desc: 'Highly optimized comparisons (Merge Sort, Quick Sort).' },
    { label: 'O(N²) - Quadratic Time', value: opsData.oN2, color: 'bg-rose-500 text-rose-300 border-rose-900', desc: 'Nested loops traversing the dataset twice (Bubble Sort).' },
  ];

  // Get max operations to compute percentage widths
  const maxOps = opsData.oN2;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-100 space-y-4" id="bigo-visualizer-card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Big O Complexity Benchmarker
          </h4>
          <span className="text-[10px] text-slate-400">Benchmark code performance scales as dataset elements increase.</span>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto bg-slate-950 p-2 rounded-xl border border-slate-850">
          <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">Dataset Elements (N):</span>
          <input 
            type="range" 
            min="10" 
            max="1000" 
            step="10"
            value={dataSize} 
            onChange={(e) => setDataSize(parseInt(e.target.value))}
            className="w-28 md:w-36 accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-indigo-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">{dataSize} items</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Visual benchmark bars */}
        <div className="lg:col-span-2 space-y-3.5 bg-slate-950 p-4 rounded-xl border border-slate-850">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Estimated Operations Count</span>
          
          <div className="space-y-4 pt-1">
            {complexities.map((item, idx) => {
              // Calculate responsive width on log scale to look good visually
              const percent = maxOps > 0 ? (item.value / maxOps) * 100 : 0;
              // Make sure low values are still visible by using logarithmic presentation
              const logWidth = Math.max(2, Math.min(100, item.value === 1 ? 2 : (Math.log10(item.value) / Math.log10(maxOps)) * 100));

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 font-medium">{item.label}</span>
                    <span className="text-indigo-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded">
                      {isRunning ? '...' : `${item.value.toLocaleString()} ops`}
                    </span>
                  </div>
                  <div className="h-5 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800/40 relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: isRunning ? '0%' : `${logWidth}%` }}
                      transition={{ duration: 0.6 }}
                      className={`h-full rounded-r-lg ${item.color.split(' ')[0]} opacity-80`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Narrative comparison card */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 flex-1 overflow-y-auto">
            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">Complexity Takeaways</span>
            <div className="space-y-2.5">
              {complexities.map((item, idx) => (
                <div key={idx} className="text-[11px] leading-relaxed border-l-2 border-slate-800 pl-2">
                  <strong className="text-slate-200 block font-semibold">{item.label.split(' - ')[0]}</strong>
                  <span className="text-slate-400 font-medium">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-indigo-950/20 p-3 rounded-xl border border-indigo-900/20 text-[10px] text-indigo-300 leading-normal font-medium flex gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Performance Alert:</strong> As N increases, <strong>O(N²) quadratic scaling</strong> spikes operations catastrophically. Always aim to optimize loops to O(N log N) or O(N)!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. CLOSURE VISUALIZER
// ==========================================
function ClosureVisualizer() {
  const [counters, setCounters] = useState<{ id: number; count: number }[]>([]);
  const [activeCallId, setActiveCallId] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleCreateCounter = () => {
    const nextId = counters.length + 1;
    setCounters(prev => [...prev, { id: nextId, count: 0 }]);
    setLogs(prev => [`[Closure Engine] Created independent closure instance: counter${nextId}()`, ...prev]);
  };

  const handleInvokeCounter = (id: number) => {
    setActiveCallId(id);
    setCounters(prev => prev.map(c => c.id === id ? { ...c, count: c.count + 1 } : c));
    const finalVal = (counters.find(c => c.id === id)?.count || 0) + 1;
    setLogs(prev => [`counter${id}() invoked -> returned: ${finalVal} (Private environment count incremented)`, ...prev]);
    setTimeout(() => setActiveCallId(null), 800);
  };

  const handleReset = () => {
    setCounters([]);
    setLogs([]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-100 space-y-4" id="closures-visualizer-card">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" />
            JavaScript Counter Closure Sandbox
          </h4>
          <span className="text-[10px] text-slate-400">Closures preserve the surrounding lexical scope environment record even after the outer function finishes executing.</span>
        </div>
        <div className="flex gap-2">
          {counters.length > 0 && (
            <button
              onClick={handleReset}
              className="px-2.5 py-1 text-[10px] font-bold border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-400 rounded-lg cursor-pointer transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleCreateCounter}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-indigo-600/15"
          >
            <Plus className="w-3 h-3" />
            counterInstance()
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visual Closure Blocks */}
        <div className="lg:col-span-8 bg-slate-950 p-4 rounded-xl border border-slate-850 min-h-[220px] flex flex-wrap gap-4 items-center justify-center relative">
          {counters.length === 0 ? (
            <div className="text-slate-500 text-center space-y-2">
              <Cpu className="w-8 h-8 text-slate-700 mx-auto animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wider">No closures spawned yet</p>
              <p className="text-[10px] text-slate-600 max-w-xs leading-normal">Click "counterInstance()" above to allocate a private enclosed environment block in memory.</p>
            </div>
          ) : (
            <AnimatePresence>
              {counters.map((c) => {
                const isCalling = activeCallId === c.id;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`border rounded-2xl p-4 w-44 bg-slate-900 shadow-lg relative flex flex-col justify-between transition-all duration-300 ${
                      isCalling ? 'border-amber-400 shadow-amber-400/10 scale-102' : 'border-indigo-950 hover:border-slate-800'
                    }`}
                  >
                    {/* Environment frame heading */}
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 border-b border-slate-850 pb-1.5">
                      <span className="font-bold text-indigo-400">LexicalEnv #{c.id}</span>
                      <span className="bg-slate-950 px-1 py-0.5 rounded">isolated</span>
                    </div>

                    {/* Closed Over Private State bubble */}
                    <div className="my-3 text-center bg-slate-950 py-3 px-2 rounded-xl border border-slate-850">
                      <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Closed variable state</span>
                      <div className="flex justify-center items-baseline gap-1 mt-1">
                        <span className="text-xs font-mono text-indigo-300">let count =</span>
                        <motion.span 
                          key={c.count}
                          initial={{ scale: 1.4, color: '#f59e0b' }}
                          animate={{ scale: 1, color: '#a5b4fc' }}
                          className="text-lg font-bold font-mono"
                        >
                          {c.count}
                        </motion.span>
                      </div>
                    </div>

                    {/* Trigger invocation */}
                    <button
                      onClick={() => handleInvokeCounter(c.id)}
                      className="w-full py-1.5 bg-slate-950 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-900 rounded-lg text-[10px] font-mono font-bold text-indigo-400 hover:text-white cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      counter{c.id}()
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Live console logging */}
        <div className="lg:col-span-4 bg-slate-950 p-3.5 rounded-xl border border-slate-850 flex flex-col justify-between h-[220px]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Execution Output Console</span>
            <div className="space-y-1.5 overflow-y-auto max-h-32 text-[10px] font-mono scrollbar-thin select-text">
              {logs.length === 0 ? (
                <span className="text-slate-600 block italic pt-2">Console waiting for invocations...</span>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={`leading-normal border-l border-slate-800 pl-1.5 ${log.startsWith('[') ? 'text-indigo-400' : 'text-slate-300'}`}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="bg-amber-950/20 p-2 border border-amber-900/20 rounded-lg text-[9px] text-amber-400 leading-normal font-medium flex gap-1.5 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>Each instance maintains its <strong>own independent environment record</strong> containing count. Scope isolation prevents variables cross-contamination!</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. CRYPTOGRAPHY / ASYMMETRIC ENCRYPTION
// ==========================================
function CryptographyVisualizer() {
  const [plainText, setPlainText] = useState('Secret Token');
  const [step, setStep] = useState<number>(0);
  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [activeLane, setActiveLane] = useState<'alice' | 'bob' | 'transit'>('alice');

  const handleStepForward = () => {
    if (step === 0) {
      // Bob sends public key
      setStep(1);
      setActiveLane('transit');
    } else if (step === 1) {
      // Alice encrypts message with Bob's public key
      setStep(2);
      setActiveLane('alice');
      // Generate a mock hash
      setEncryptedText('🔑_0x' + plainText.split('').map(c => c.charCodeAt(0).toString(16)).join('').slice(0, 14) + '...');
    } else if (step === 2) {
      // Send ciphertext
      setStep(3);
      setActiveLane('transit');
    } else if (step === 3) {
      // Bob decrypts with private key
      setStep(4);
      setActiveLane('bob');
      setDecryptedText(plainText);
    }
  };

  const handleReset = () => {
    setStep(0);
    setEncryptedText('');
    setDecryptedText('');
    setActiveLane('alice');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-100 space-y-4" id="crypto-visualizer-card">
      <div className="flex justify-between items-start pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            Asymmetric Cryptography Playground
          </h4>
          <span className="text-[10px] text-slate-400">How public/private key cryptography secures channels without exchanging secrets.</span>
        </div>
        <button
          onClick={handleReset}
          className="p-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded-lg text-[10px] font-mono cursor-pointer transition-colors text-slate-400 hover:text-white"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Input plain text */}
      {step === 0 && (
        <div className="flex gap-2 items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850">
          <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">Enter Message:</span>
          <input
            type="text"
            value={plainText}
            onChange={(e) => setPlainText(e.target.value.slice(0, 24))}
            placeholder="Type secret message..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-indigo-300 focus:outline-hidden font-medium"
          />
        </div>
      )}

      {/* Interactive crypto track lanes */}
      <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-850 min-h-[180px] relative items-center">
        {/* Lane 1: Alice */}
        <div className={`space-y-2 text-center p-3 rounded-xl border transition-all ${
          activeLane === 'alice' ? 'bg-indigo-950/40 border-indigo-500 shadow-lg' : 'bg-slate-900/60 border-slate-850'
        }`}>
          <div className="flex items-center justify-center gap-1 font-mono text-xs font-bold text-slate-300">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            Alice (Sender)
          </div>
          
          <div className="bg-slate-950 py-2 px-1 rounded-lg border border-slate-850">
            <span className="text-[8px] font-mono text-slate-500 uppercase block">Plaintext Message</span>
            <span className="text-xs font-mono font-bold text-slate-200 mt-1 block max-w-[100px] truncate mx-auto">{plainText}</span>
          </div>

          {step >= 2 && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-950 py-2 px-1 rounded-lg border border-red-950 text-red-400"
            >
              <span className="text-[8px] font-mono text-slate-500 uppercase block">Ciphertext</span>
              <span className="text-[9px] font-mono font-bold tracking-wide mt-1 block truncate max-w-[100px] mx-auto">{encryptedText}</span>
            </motion.div>
          )}
        </div>

        {/* Lane 2: Transit Channel */}
        <div className={`space-y-2 text-center p-3 rounded-xl border transition-all h-full flex flex-col justify-center ${
          activeLane === 'transit' ? 'bg-indigo-950/40 border-indigo-500 shadow-lg' : 'bg-slate-900/60 border-slate-850'
        }`}>
          <div className="flex items-center justify-center gap-1 font-mono text-xs font-bold text-slate-300">
            <Network className="w-3.5 h-3.5 text-indigo-400" />
            Network Channel
          </div>

          <div className="h-20 flex flex-col justify-center items-center relative">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: -50, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="flex flex-col items-center gap-1 text-emerald-400 text-[10px]"
                >
                  <Key className="w-5 h-5 fill-emerald-950" />
                  <span className="font-mono text-[8px] font-bold">Public Key sent</span>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 50, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="flex flex-col items-center gap-1 text-red-400 text-[10px]"
                >
                  <Lock className="w-5 h-5" />
                  <span className="font-mono text-[8px] font-bold">Ciphertext Transiting</span>
                </motion.div>
              )}

              {step !== 1 && step !== 3 && (
                <span className="text-slate-600 font-mono text-[9px] italic block">Channel Secure</span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Lane 3: Bob */}
        <div className={`space-y-2 text-center p-3 rounded-xl border transition-all ${
          activeLane === 'bob' ? 'bg-indigo-950/40 border-indigo-500 shadow-lg' : 'bg-slate-900/60 border-slate-850'
        }`}>
          <div className="flex items-center justify-center gap-1 font-mono text-xs font-bold text-slate-300">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            Bob (Recipient)
          </div>

          <div className="flex justify-center gap-1">
            <div className="bg-emerald-950/50 p-1.5 rounded border border-emerald-900 text-emerald-400 flex flex-col items-center" title="Bob's Public Key">
              <Key className="w-3.5 h-3.5" />
              <span className="text-[7px] font-mono uppercase block mt-0.5">Public</span>
            </div>
            <div className="bg-amber-950/50 p-1.5 rounded border border-amber-900 text-amber-400 flex flex-col items-center" title="Bob's Private Key">
              <Key className="w-3.5 h-3.5" />
              <span className="text-[7px] font-mono uppercase block mt-0.5">Private</span>
            </div>
          </div>

          {step >= 4 && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-950 py-2 px-1 rounded-lg border border-emerald-950 text-emerald-400"
            >
              <span className="text-[8px] font-mono text-slate-500 uppercase block">Decrypted Msg</span>
              <span className="text-xs font-mono font-bold tracking-wide mt-1 block truncate max-w-[100px] mx-auto">{decryptedText}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Narrative & action button */}
      <div className="flex items-center justify-between gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
        <p className="text-[10px] text-slate-300 leading-relaxed font-medium max-w-md">
          <strong>Step {step + 1}:</strong> {
            step === 0 ? "Bob makes his public key available. Alice enters her plaintext message to secure." :
            step === 1 ? "Bob publishes his public key. Anyone can view and use it to encrypt messages." :
            step === 2 ? "Alice encrypts her message with Bob's Public Key. This creates ciphertext that only Bob's private key can reverse." :
            step === 3 ? "Alice sends the cipher text across the insecure web channel. Eavesdroppers only see gibberish hashes." :
            "Bob receives the encrypted block and decodes it safely using his private key. Secure communication complete!"
          }
        </p>
        {step < 4 ? (
          <button
            onClick={handleStepForward}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-md hover:shadow-indigo-600/25 shrink-0"
          >
            Advance Step
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-md hover:shadow-emerald-600/25 shrink-0"
          >
            Restart Sandbox
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 5. REST VS GRAPHQL WATERFALL
// ==========================================
function RestVsGraphqlVisualizer() {
  const [mode, setMode] = useState<'rest' | 'graphql'>('rest');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<{ label: string; size: string; status: string }[]>([]);

  const handleFetch = () => {
    setIsRunning(true);
    setLogs([]);
    setTimeline([]);

    if (mode === 'rest') {
      // Trace 3 sequential calls
      setTimeout(() => {
        setLogs(prev => [...prev, "HTTP GET /api/users/12 -> Status 200 OK"]);
        setTimeline(prev => [...prev, { label: "GET /api/users/12 (User Profile)", size: "4.5 KB", status: "Loaded - Overfetched 12 unused fields" }]);
        
        setTimeout(() => {
          setLogs(prev => [...prev, "HTTP GET /api/users/12/posts -> Status 200 OK"]);
          setTimeline(prev => [...prev, { label: "GET /api/users/12/posts (Articles)", size: "8.2 KB", status: "Loaded" }]);
          
          setTimeout(() => {
            setLogs(prev => [...prev, "HTTP GET /api/posts/4/comments -> Status 200 OK"]);
            setTimeline(prev => [...prev, { label: "GET /api/posts/4/comments (Feedback)", size: "12.0 KB", status: "Loaded" }]);
            setIsRunning(false);
          }, 600);
        }, 600);
      }, 600);
    } else {
      // 1 tailored GraphQL query
      setTimeout(() => {
        setLogs(prev => [...prev, "HTTP POST /graphql -> Status 200 OK"]);
        setTimeline(prev => [...prev, { label: "POST /graphql (Profile, Posts, and Comments in 1 payload)", size: "1.8 KB", status: "Loaded - Tailored exact data request" }]);
        setIsRunning(false);
      }, 700);
    }
  };

  useEffect(() => {
    handleFetch();
  }, [mode]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-100 space-y-4" id="rest-graphql-visualizer-card">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            Network Architecture: REST vs GraphQL Waterfall
          </h4>
          <span className="text-[10px] text-slate-400">Comparing roundtrips, network overfetching, and waterfall latencies.</span>
        </div>
        <div className="flex gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-850">
          <button
            onClick={() => setMode('rest')}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
              mode === 'rest' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            REST API
          </button>
          <button
            onClick={() => setMode('graphql')}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
              mode === 'graphql' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            GraphQL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Waterfall list */}
        <div className="lg:col-span-8 bg-slate-950 p-4 rounded-xl border border-slate-850 min-h-[180px] space-y-3 flex flex-col justify-center">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-850 pb-1.5 mb-1">
            <span>HTTP Request Waterfall</span>
            <span className="text-slate-500">Latency Simulation</span>
          </div>

          <div className="space-y-3">
            {timeline.length === 0 ? (
              <span className="text-xs text-slate-500 italic text-center block py-6">Connecting to mock API...</span>
            ) : (
              timeline.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-1 bg-slate-900 border border-slate-850 p-2.5 rounded-xl"
                >
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="font-bold text-slate-200">{item.label}</span>
                    <span className="text-indigo-400 font-bold bg-slate-950 px-1.5 py-0.5 rounded">{item.size}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                    <span className="font-medium text-slate-400">{item.status}</span>
                    <span className="text-emerald-400 font-mono font-bold">200 OK</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Network Metrics card */}
        <div className="lg:col-span-4 bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">Network Overheads</span>
            
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                <span className="text-[8px] font-mono text-slate-500 uppercase block">Total Roundtrips</span>
                <span className="text-lg font-bold text-slate-100 font-mono block mt-0.5">{mode === 'rest' ? '3 calls' : '1 call'}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                <span className="text-[8px] font-mono text-slate-500 uppercase block">Data Transferred</span>
                <span className="text-lg font-bold text-slate-100 font-mono block mt-0.5">{mode === 'rest' ? '24.7 KB' : '1.8 KB'}</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-950/20 p-2.5 border border-indigo-900/20 rounded-lg text-[10px] text-indigo-300 leading-normal font-medium flex gap-1.5 shrink-0 mt-3">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              {mode === 'rest' 
                ? <strong>REST Alert:</strong> 
                : <strong>GraphQL Advantage:</strong> 
              }
              {mode === 'rest' 
                ? " REST suffers from sequential waterfalls and over-fetching extra client data." 
                : " GraphQL eliminates over-fetching by fetching exactly what is requested in a single query!"
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. UNIVERSAL CONSOLE SIMULATOR
// ==========================================
function UniversalConsoleSimulator({ concept, code }: { concept: string; code: string }) {
  const [isRunning, setIsRunning] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  const handleRunSim = () => {
    setIsRunning(true);
    setConsoleLogs([
      `[academi-compiler] Initializing Socratic environment context for: "${concept}"...`,
    ]);

    setTimeout(() => {
      setConsoleLogs(prev => [...prev, `[academi-compiler] Resolving local scope linkages & parsing parameters...`]);
      
      setTimeout(() => {
        setConsoleLogs(prev => [...prev, `[academi-linker] Checking syntax integrity... All checks GREEN.`]);
        
        setTimeout(() => {
          // Generate customized outputs
          const lines = [
            `[sandbox-runtime] Executing compiled algorithm...`,
            `----------------------------------------------------`,
            `[sandbox-runtime] SUCCESSFUL RUN COMPLETED.`,
            `[academi-mentor] Socratic Guidance Note: Notice how the structural variables are declared. Try copying and altering the inputs in your IDE to observe behavioral changes!`
          ];
          setConsoleLogs(prev => [...prev, ...lines]);
          setIsRunning(false);
        }, 500);
      }, 500);
    }, 500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-100 space-y-4" id="universal-console-simulator-card">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
            Universal Concept Sandbox Runner
          </h4>
          <span className="text-[10px] text-slate-400">Trace and run Socratic compilation simulations directly inline.</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopyCode}
            className="px-2.5 py-1 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-[10px] font-bold text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            {isCopied ? 'Copied Code!' : 'Copy Code'}
          </button>
          <button
            onClick={handleRunSim}
            disabled={isRunning}
            className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 shadow-md shadow-indigo-600/15"
          >
            <Play className="w-3 h-3 fill-current" />
            {isRunning ? 'Running...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      <div className="bg-slate-950 rounded-xl p-4 border border-slate-850 font-mono text-xs text-indigo-300 min-h-[140px] space-y-2 select-text overflow-y-auto max-h-48 scrollbar-thin">
        {consoleLogs.length === 0 ? (
          <span className="text-slate-600 block italic">Console idle. Click "Run Simulation" above to parse and run code trace.</span>
        ) : (
          consoleLogs.map((log, idx) => (
            <div key={idx} className={`leading-relaxed border-l border-slate-850 pl-2 ${
              log.includes('SUCCESS') ? 'text-emerald-400' : log.includes('Socratic') ? 'text-amber-400' : 'text-slate-300'
            }`}>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
