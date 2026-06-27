// === CONFIG - Use GitHub Secrets + Vite or manual replacement ===
const CONFIG = {
  HIBP_API_KEY: import.meta.env?.VITE_HIBP_KEY || 'YOUR_HIBP_KEY_HERE', // Replace or use env
  USER_AGENT: 'Defensive-OSINT-Checker-Personal'
};

let currentTab = 0;

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('tab-active', i === tab);
  });
  document.querySelectorAll('.tab-content').forEach((f, i) => {
    f.classList.toggle('hidden', i !== tab);
  });
}

async function performSearch() {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `<div class="text-center py-12"><i class="fas fa-spinner fa-spin text-4xl"></i><p class="mt-4">Performing secure check...</p></div>`;

  try {
    let query = '';
    let type = '';

    switch(currentTab) {
      case 0:
        query = document.getElementById('email-input').value.trim();
        type = 'email';
        if (!query || !query.includes('@')) throw new Error('Valid email required');
        break;
      case 1:
        query = document.getElementById('username-input').value.trim();
        type = 'username';
        if (!query) throw new Error('Username required');
        break;
      case 2:
        query = document.getElementById('domain-input').value.trim();
        type = 'domain';
        if (!query) throw new Error('Domain required');
        break;
      case 3:
        const file = document.getElementById('image-upload').files[0];
        if (!file) throw new Error('Please select an image');
        await handleImageUpload(file);
        return;
    }

    await runHIBPCheck(query, type, resultsDiv);

  } catch (err) {
    showError(resultsDiv, err.message);
  }
}

async function runHIBPCheck(query, type, resultsDiv) {
  if (type !== 'email') {
    resultsDiv.innerHTML = `
      <div class="bg-white dark:bg-gray-900 rounded-3xl p-8">
        <h2 class="text-2xl font-semibold mb-6">Results for ${query}</h2>
        <div class="space-y-6">
          <div class="result-card bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl">
            <p class="font-medium">HIBP supports email checks primarily.</p>
            <p class="mt-3 text-sm">Recommended tools:</p>
            <ul class="mt-4 space-y-2 text-blue-600">
              <li><a href="https://haveibeenpwned.com/" target="_blank" class="hover:underline">→ Have I Been Pwned</a></li>
              <li><a href="https://intelx.io/" target="_blank" class="hover:underline">→ Intelligence X</a></li>
              <li><a href="https://osint.industries/" target="_blank" class="hover:underline">→ OSINT Industries</a></li>
            </ul>
          </div>
        </div>
      </div>`;
    return;
  }

  try {
    const res = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(query)}`, {
      headers: {
        'hibp-api-key': CONFIG.HIBP_API_KEY,
        'User-Agent': CONFIG.USER_AGENT
      }
    });

    if (res.status === 404) {
      resultsDiv.innerHTML = `<div class="bg-green-50 dark:bg-green-900/30 p-8 rounded-3xl text-center"><p class="text-2xl">✅ No breaches found for this email.</p></div>`;
      return;
    }

    if (!res.ok) throw new Error(`API Error: ${res.status}`);

    const breaches = await res.json();

    let html = `<div class="bg-white dark:bg-gray-900 rounded-3xl p-8"><h2 class="text-2xl font-semibold mb-6">Breaches Found (${breaches.length})</h2>`;
    breaches.forEach(b => {
      html += `
        <div class="result-card bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl mb-6">
          <h3 class="font-bold text-xl">${b.Title}</h3>
          <p class="text-sm text-gray-500">${new Date(b.BreachDate).toLocaleDateString()}</p>
          <p class="mt-3">${b.Description}</p>
          <p class="text-xs mt-4 text-red-600">Data compromised: ${b.DataClasses.join(', ')}</p>
        </div>`;
    });
    html += `</div>`;
    resultsDiv.innerHTML = html;

  } catch (err) {
    console.error(err);
    if (err.message.includes('429')) {
      showError(resultsDiv, "Rate limit reached. Please wait a few minutes.");
    } else {
      showError(resultsDiv, err.message || "Check failed. Try again later.");
    }
  }
}

async function handleImageUpload(file) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `<div class="text-center py-12"><i class="fas fa-spinner fa-spin text-4xl"></i><p class="mt-4">Analyzing image metadata...</p></div>`;

  try {
    const exif = await extractExif(file);
    resultsDiv.innerHTML = `
      <div class="bg-white dark:bg-gray-900 rounded-3xl p-8">
        <h2 class="text-2xl font-semibold mb-6">Image Metadata (EXIF)</h2>
        <pre class="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl overflow-auto text-sm">${JSON.stringify(exif, null, 2)}</pre>
        <div class="mt-8">
          <p class="font-medium">Reverse Image Search:</p>
          <div class="flex gap-4 mt-4">
            <a href="https://www.google.com/searchbyimage?image_url=${URL.createObjectURL(file)}" target="_blank" class="bg-blue-600 text-white px-6 py-3 rounded-xl">Google Lens</a>
            <a href="https://tineye.com/search?url=${URL.createObjectURL(file)}" target="_blank" class="bg-blue-600 text-white px-6 py-3 rounded-xl">TinEye</a>
          </div>
        </div>
      </div>`;
  } catch (e) {
    showError(resultsDiv, "Failed to read image metadata.");
  }
}

// Simple client-side EXIF reader (using browser)
async function extractExif(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      // Basic metadata (full EXIF needs external lib, but for demo this works)
      const img = new Image();
      img.onload = () => {
        resolve({
          fileName: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB',
          type: file.type,
          lastModified: new Date(file.lastModified).toISOString(),
          width: img.width,
          height: img.height,
          note: "Full EXIF extraction can be enhanced with exif-js library if needed."
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function showError(container, message) {
  container.innerHTML = `
    <div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-8 rounded-3xl text-center">
      <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
      <p class="text-red-600 dark:text-red-400 font-medium">${message}</p>
      <button onclick="location.reload()" class="mt-6 text-blue-600 underline">Try Again</button>
    </div>`;
}

// Keyboard support
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') performSearch();
});
