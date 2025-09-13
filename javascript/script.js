const apiKey = "78af3b180bcc77f9aea1fd5c35db0947";
const apiCountryURL = "https://flagsapi.com/";
const apiUnsplash = "https://source.unsplash.com/1600x900/";

const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search");

const cityElement = document.querySelector("#city");
const tempElement = document.querySelector("#temperature span");
const descElement = document.querySelector("#description");
const weatherIconElement = document.querySelector("#weather-icon");
const countryElement = document.querySelector("#country");
const umidityElement = document.querySelector("#umidity span");
const windElement = document.querySelector("#wind span");

const weatherContainer = document.querySelector("#weather-data");

const errorMessageContainer = document.querySelector("#error-message");
const loader = document.querySelector("#loader");

const suggestionContainer = document.querySelector("#suggestions");
const suggestionButtons = document.querySelectorAll("#suggestions button");

// Loader
const toggleLoader = () => {
  loader.classList.toggle("hide");
};

const getWeatherData = async (city) => {
  toggleLoader();

  const apiWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=pt_br`;

  try {
    const res = await fetch(apiWeatherURL);
    const data = await res.json();
    
    toggleLoader();
    return data;
  } catch (error) {
    console.error("Erro ao buscar dados do clima:", error);
    toggleLoader();
    return null;
  }
};

// Tratamento de erro
const showErrorMessage = () => {
  errorMessageContainer.classList.remove("hide");
};

const hideInformation = () => {
  errorMessageContainer.classList.add("hide");
  weatherContainer.classList.add("hide");
  suggestionContainer.classList.add("hide");
};

// Função para carregar imagem com fallback
const loadImageWithFallback = (element, primarySrc, fallbackSrc = null) => {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      element.setAttribute("src", primarySrc);
      resolve(true);
    };
    
    img.onerror = () => {
      if (fallbackSrc) {
        element.setAttribute("src", fallbackSrc);
      } else {
        element.style.display = "none";
      }
      resolve(false);
    };
    
    img.src = primarySrc;
  });
};

const showWeatherData = async (city) => {
  hideInformation();

  const data = await getWeatherData(city);

  if (!data || data.cod === "404") {
    showErrorMessage();
    return;
  }

  cityElement.innerText = data.name;
  tempElement.innerText = parseInt(data.main.temp);
  descElement.innerText = data.weather[0].description;
  
  // Carrega ícone do tempo com fallback
  const weatherIconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
  await loadImageWithFallback(weatherIconElement, weatherIconUrl);

  // Carrega bandeira do país com múltiplas opções de API
  const countryCode = data.sys.country.toLowerCase();
  const flagUrl1 = `https://flagsapi.com/${data.sys.country}/flat/64.png`;
  const flagUrl2 = `https://flagcdn.com/w80/${countryCode}.png`;
  const flagUrl3 = `https://www.countryflags.io/${countryCode}/flat/64.png`;
  
  // Tenta carregar a bandeira com diferentes APIs
  const flagLoaded = await loadImageWithFallback(countryElement, flagUrl1);
  if (!flagLoaded) {
    await loadImageWithFallback(countryElement, flagUrl2, flagUrl3);
  }

  umidityElement.innerText = `${data.main.humidity}%`;
  windElement.innerText = `${data.wind.speed}km/h`;

  // Carrega imagem de fundo com tratamento de erro
  try {
    const backgroundUrl = `${apiUnsplash}${encodeURIComponent(city)}`;
    document.body.style.backgroundImage = `url("${backgroundUrl}")`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
  } catch (error) {
    console.error("Erro ao carregar imagem de fundo:", error);
    // Mantém o fundo padrão se houver erro
  }

  weatherContainer.classList.remove("hide");
};

searchBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const city = cityInput.value.trim();
  
  if (city) {
    showWeatherData(city);
  }
});

cityInput.addEventListener("keyup", (e) => {
  if (e.code === "Enter") {
    const city = e.target.value.trim();
    
    if (city) {
      showWeatherData(city);
    }
  }
});

// Sugestões
suggestionButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const city = btn.getAttribute("id");

    showWeatherData(city);
  });
});