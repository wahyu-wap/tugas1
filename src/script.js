const baseUrl = "https://api.quran.gading.dev/surah";
// element variable
const sidebar = document.querySelector("#sidebar");
const sidebarToggle = document.querySelector("#sidebar-toggle");
const ayatList = document.querySelector("#ayat-list");
const surahHeader = document.querySelector("#surah-header");
const surahList = document.querySelector("#surah-list");
const searchInputs = document.querySelectorAll(".search input");

let allSurahData = [];
let surahNumber = localStorage.getItem("lastSurah") || "1";

sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("translate-x-0");
  sidebar.classList.toggle("-translate-x-72");
});

function renderSurahList(list, current) {
  if (!list.length) {
    surahList.innerHTML =
      '<p class="text-center text-gray-500">Surah tidak ditemukan</p>';
    return;
  }

  surahList.innerHTML = list
    .map(
      (surah) => `
      <div class="flex items-center gap-1 cursor-pointer">
        <span class="text-sm h-8 w-8 font-medium ${
          surah.number != current
            ? "border border-blue-600 text-blue-600"
            : "bg-blue-600 text-white"
        } rounded-md flex justify-center items-center">
          ${surah.number}
        </span>
        <button 
          class="surah-item block font-medium hover:bg-gray-100 text-gray-800 w-full py-1 px-2 rounded-md transition-all duration-300 text-left"
          data-surah="${surah.number}">
          ${surah.name.transliteration.id}
        </button>
      </div>`
    )
    .join("");

  surahList.querySelectorAll(".surah-item").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const number = event.target.dataset.surah;
      surahNumber = number;
      localStorage.setItem("lastSurah", number);

      await loadSurah(number);
      renderSurahList(allSurahData, number);

      sidebar.classList.add("-translate-x-72");
      sidebar.classList.remove("translate-x-0");

      const mainContent = document.querySelector("#main-content");
      if (mainContent) {
        mainContent.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });
}

function renderAyat(surahData) {
  const versesHTML = surahData.verses
    .map(
      (verse, index) => `
      <div class="space-y-3 bg-blue-50 p-5 rounded-xl shadow-sm border border-blue-100">
        <div class="flex justify-between items-center">
          <span class="uppercase tracking-widest font-semibold text-xs text-blue-600">
            Ayat ${verse.number.inSurah}
          </span>
          <audio
            controls
            src="${verse.audio.primary}"
            data-index="${index}"
            class="h-8"
          ></audio>
        </div>

        <h2 class="font-naskh text-3xl md:text-4xl text-gray-900 text-right leading-relaxed tracking-wide">
          ${verse.text.arab}
        </h2>

        <p class="text-blue-950 text-sm leading-relaxed">
          ${verse.translation.id}
        </p>
      </div>`
    )
    .join("");

  ayatList.innerHTML = versesHTML;

  const audioList = ayatList.querySelectorAll("audio");
  audioList.forEach((audio, index) => {
    audio.addEventListener("ended", () => {
      const next = audioList[index + 1];
      if (next) {
        next.scrollIntoView({ behavior: "smooth", block: "center" });
        next.play();
      }
    });
  });
}

async function loadSurah(number) {
  const res = await fetch(`${baseUrl}/${number}`);
  const { data } = await res.json();

  surahHeader.querySelector("h1").innerHTML = data.name.transliteration.id;
  surahHeader.querySelector(
    "p"
  ).innerHTML = `${data.name.translation.id}. Surah ke-${data.number}. ${data.revelation.id}`;

  renderAyat(data);

  const mainContent = document.querySelector("#main-content");
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior: "smooth" });
  }
}

async function loadAllSurah() {
  const res = await fetch(baseUrl);
  const { data } = await res.json();

  allSurahData = data;
  renderSurahList(allSurahData, surahNumber);
}

searchInputs.forEach((input) => {
  input.addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = allSurahData.filter((s) =>
      s.name.transliteration.id.toLowerCase().includes(keyword)
    );
    renderSurahList(filtered, surahNumber);
  });
});

loadAllSurah();
loadSurah(surahNumber);
