const appid = "88e6d976543dacc37924cf1cde399684";

async function searchCity(cityName) {
  if (!cityName) cityName = $("#city_title").val();
  if (cityName) {
    const coordURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${appid}`;
    const coordResponse = await fetch(coordURL);

    if (coordResponse.status === 404) {
      $("#city_name").text("City not found");
      return;
    }
    const coorData = await coordResponse.json();

    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${coorData.coord.lat}&lon=${coorData.coord.lon}&appid=${appid}&exclude=minutely,hourly,alerts&units=imperial`;
    const response = await fetch(url);
    const data = await response.json();

    // Add to localstorage
    let history = localStorage.history ? JSON.parse(localStorage.history) : [];
    // Dont add if already in history
    if (history.includes(coorData.name)) {
      history = [coorData.name, ...history.filter((e) => e !== coorData.name)];
    } else {
      history = [coorData.name, ...history];
      $("#search_history").prepend(`
        <input
            type="button"
            class="btn btn-primary history-city"
            value="${coorData.name}"
            onclick="reloadCity(this)"
        />
      `);
    }

    localStorage.history = JSON.stringify(history);

    const processedData = {
      cityName: coorData.name,
      date: new Date(parseInt(data.current.dt.toString() + "000")),
      iconURL:
        "http://openweathermap.org/img/w/" +
        data.current.weather[0].icon +
        ".png",
      temp: Math.round(data.current.temp),
      wind: data.current.wind_speed,
      humidity: data.current.humidity,
      uv: parseFloat(data.current.uvi)
    };

    $("#wicon").attr("src", processedData.iconURL);
    $("#wicon").css("display", "");
    $("#city_name").text(
      `${processedData.cityName} (${
        processedData.date.getMonth() +
        1 +
        "/" +
        processedData.date.getDate() +
        "/" +
        processedData.date.getFullYear()
      })`
    );
    $("#temp_val").text(processedData.temp);
    $("#wind_val").text(processedData.wind);
    $("#humidity_val").text(processedData.humidity);
    $("#humidity_val").text(processedData.humidity);
    $("#uv_val").text(processedData.uv);
    $("#uv_val").removeClass();
    $("#uv_val").addClass("w_info_uv");
    if (processedData.uv < 3) {
      $("#uv_val").addClass("bg_green");
    } else if (processedData.uv < 6) {
      $("#uv_val").addClass("bg_yellow");
    } else if (processedData.uv < 8) {
      $("#uv_val").addClass("bg_orange");
    } else if (processedData.uv < 11) {
      $("#uv_val").addClass("bg_red");
    } else {
      $("#uv_val").addClass("bg_violet");
    }

    let foreCastHtml = "";
    for (let i = 0; i < 5; i++) {
      const currData = data.daily[i + 1];
      const currDate = new Date(parseInt(currData.dt.toString() + "000"));

      foreCastHtml += `
            <div class="col-2 forecast_container">
                <h3 class="display-6 f_info">${
                  currDate.getMonth() +
                  1 +
                  "/" +
                  currDate.getDate() +
                  "/" +
                  currDate.getFullYear()
                }</h3>
                <h3 class="display-6 f_info">
                  <img
                    id="wicon"
                    src=${
                      "http://openweathermap.org/img/w/" +
                      currData.weather[0].icon +
                      ".png"
                    }
                    alt="Weather icon"
                  />
                </h3>
                <h4 class="display-6 f_info">Temp: ${Math.round(
                  currData.temp.day
                )} &#176;F</h4>
                <h4 class="display-6 f_info">Wind: ${
                  currData.wind_speed
                } MPH</h4>
                <h4 class="display-6 f_info">Humidity: ${
                  currData.humidity
                } %</h4>
            </div>
        `;
    }

    $("#forecast_container").css("display", "");
    $("#forecast_data").html(foreCastHtml);
  }
}

$(document).ready(function () {
  // Sync history with localstorage
  let historyHTML = "";
  const cityNames = localStorage.history
    ? JSON.parse(localStorage.history)
    : [];
  cityNames.forEach((city) => {
    historyHTML += `
        <input
            type="button"
            class="btn btn-primary history-city"
            value="${city}"
            onclick="reloadCity(this)"
        />
        `;
  });
  $("#search_history").html(historyHTML);
});

async function reloadCity(e) {
  await searchCity(e.value);
}
