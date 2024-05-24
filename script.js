let array = [];
let numElements = 40;
let speed = 30;
let audioCtx = null;

document.getElementById("numElements").addEventListener("input", (e) => {
  numElements = parseInt(e.target.value);
  randomizeArray();
});

document.getElementById("randomize").addEventListener("click", randomizeArray);
document.getElementById("run").addEventListener("click", runSorting);

document.getElementById("speed").addEventListener("input", (e) => {
  speed = 101 - parseInt(e.target.value);
});

function randomizeArray() {
  array = Array.from({ length: numElements }, () => Math.random());
  showBars();
}

function runSorting() {
  const algo = document.getElementById("sortAlgo").value;
  const sortFunction = window[algo];
  if (sortFunction) {
    const swaps = sortFunction([...array]);
    animate(swaps);
  }
}

async function animate(swaps) {
    if (swaps.length == 0) {
      showBars(true);
      return;
    }
    const [i, j] = swaps.shift();
    [array[i], array[j]] = [array[j], array[i]];
    showBars(false, [i, j]);
    await playSwapSound(Math.max(array[i], array[j]));
  
    // Introduce a delay based on the speed variable
    await new Promise(resolve => setTimeout(resolve, speed));
  
    animate(swaps); // Continue with the next iteration
  }
  

function showBars(sorted = false, indices = []) {
  const container = document.getElementById("container");
  container.style.setProperty("--num-bars", numElements);
  container.innerHTML = "";
  array.forEach((value, index) => {
    const bar = document.createElement("div");
    bar.style.height = `${value * 100}%`;
    bar.classList.add("bar");
    if (sorted) {
      bar.classList.add("sorted");
    } else if (indices.includes(index)) {
      bar.classList.add("swap");
    }
    const label = document.createElement("span");
    label.classList.add("bar-label");
    label.textContent = Math.round(value * 100); // Displaying height value
    bar.appendChild(label);
    container.appendChild(bar);
  });
}

function playSwapSound(height) {
  return new Promise((resolve, reject) => {
    if (audioCtx == null) {
      audioCtx = new (AudioContext ||
        webkitAudioContext ||
        window.webkitAudioContext)();
    }
    const baseFreq = 100; // Base frequency
    const freqRange = 2000; // Frequency range to vary
    const maxBarHeight = 1; // Maximum height of the bar

    // Calculate frequency based on bar height
    const freq = baseFreq + (height / maxBarHeight) * freqRange;

    const dur = 0.1;
    const osc = audioCtx.createOscillator();
    osc.frequency.value = freq;
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
    const node = audioCtx.createGain();
    node.gain.value = 0.1;
    node.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);
    osc.connect(node);
    node.connect(audioCtx.destination);

    // Resolve the Promise after the sound finishes playing
    setTimeout(resolve, dur * 1000); // Convert seconds to milliseconds
  });
}

// Sorting Algorithms

function bubbleSort(array) {
  const swaps = [];
  do {
    var swapped = false;
    for (let i = 1; i < array.length; i++) {
      if (array[i - 1] > array[i]) {
        swaps.push([i - 1, i]);
        [array[i - 1], array[i]] = [array[i], array[i - 1]];
        swapped = true;
      }
    }
  } while (swapped);
  return swaps;
}

function selectionSort(array) {
  const swaps = [];
  for (let i = 0; i < array.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < array.length; j++) {
      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx != i) {
      swaps.push([i, minIdx]);
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
    }
  }
  return swaps;
}

function insertionSort(array) {
  const swaps = [];
  for (let i = 1; i < array.length; i++) {
    for (let j = i; j > 0 && array[j - 1] > array[j]; j--) {
      swaps.push([j - 1, j]);
      [array[j - 1], array[j]] = [array[j], array[j - 1]];
    }
  }
  return swaps;
}

function quickSort(array) {
  const swaps = [];
  function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (arr[j] < pivot) {
        i++;
        swaps.push([i, j]);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    swaps.push([i + 1, high]);
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
  }
  function sort(arr, low, high) {
    if (low < high) {
      const pi = partition(arr, low, high);
      sort(arr, low, pi - 1);
      sort(arr, pi + 1, high);
    }
  }
  sort(array, 0, array.length - 1);
  return swaps;
}

// Initialize the array
randomizeArray();
