const getTotal = async (jwt) => {
  try {
    const response = await fetch('http://localhost:3000/api/total', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    })
    const { data } = await response.json()
    const firstData = data.filter((e, i) => i < 10)
    const ctx1 = document.getElementById('Chart1')
    totalCasesChart(ctx1, firstData)
    table(data, jwt)
  } catch (err) {
    localStorage.clear()
    console.error(`Error: ${err}`);
  }
};

const getChile = async (jwt) => {
  try {
    const fetchOptions = {
      method: "GET",
      headers: {
        authorization: `Bearer ${jwt}`,
      }
    }
    const [responseConfirmed, responseDeaths, responseRecovered] = await Promise.all(
      [
        fetch("http://localhost:3000/api/confirmed", fetchOptions),
        fetch("http://localhost:3000/api/deaths", fetchOptions),
        fetch("http://localhost:3000/api/recovered", fetchOptions),
      ],
    );
    let dataConfirmed = await responseConfirmed.json();
    let dataDeaths = await responseDeaths.json();
    let dataRecovered = await responseRecovered.json();
    let ctx3 = document.getElementById("Chart3");
    if (dataConfirmed && dataDeaths && dataRecovered) {
      chileCasesChart(ctx3, dataConfirmed, dataDeaths, dataRecovered)
    }
  } catch (err) {
    localStorage.clear();
    console.error(`Error: ${err}`);
  }
};

const toggleLogsAndCharts = (logIn, logOut, chartMundial, chartCountry, informationalTable) => {
  $(`#${logIn}`).toggle();
  $(`#${logOut}`).toggle();
  $(`#${chartMundial}`).toggle();
  $(`#${chartCountry}`).toggle();
  $(`#${informationalTable}`).toggle();
}

const init = () => {
  const token = localStorage.getItem('jwt-token');
  if (token) {
    getTotal(token)
    getChile(token)
    toggleLogsAndCharts('logIn', 'logOut', 'chartMundial', 'chartChile', 'informationalTable')
  };
}

init()

$('#js-form').submit(async (event) => {
  event.preventDefault()
  const email = document.getElementById('js-input-email').value
  const password = document.getElementById('js-input-password').value
  const JWT = await postData(email, password)
  getTotal(JWT)
  getChile(JWT)
  toggleLogsAndCharts('logIn', 'logOut', 'chartMundial', 'chartChile', 'informationalTable')
})

const postData = async (email, password) => {
  try {
    const response = await fetch('http://localhost:3000/api/login',
      {
        method: 'POST',
        body: JSON.stringify({ email: email, password: password })
      })
    const { token } = await response.json()
    localStorage.setItem('jwt-token', token)
    return token
  } catch (err) {
    console.error(`Error: ${err}`)
  }
}

const totalCasesChart = (ctx, data) => {
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(e => e.location),
      datasets: [
        {
          label: 'Confirmados',
          data: data.map(e => e.confirmed),
          backgroundColor: ['rgba(255, 99, 132, 0.2)'],
          borderColor: ['rgb(255, 99, 132)'],
          borderWidth: 1
        },
        {
          label: 'Muertes',
          data: data.map(e => e.deaths),
          backgroundColor: ['rgba(255, 159, 64, 0.2)'],
          borderColor: ['rgb(255, 159, 64)'],
          borderWidth: 1
        },
        {
          label: 'Recuperados',
          data: data.map(e => e.recovered),
          backgroundColor: ['rgba(255, 205, 86, 0.2)'],
          borderColor: ['rgb(255, 205, 86)'],
          borderWidth: 1
        },
        {
          label: 'Activos',
          data: data.map(e => e.active),
          backgroundColor: ['rgba(75, 192, 192, 0.2)'],
          borderColor: ['rgb(75, 192, 192)'],
          borderWidth: 1
        }
      ]
    }
  })
}

let chileCasesChart = (ctx3, dataConfirmed, dataDeaths, dataRecovered) => {
  new Chart(ctx3, {
    type: 'line',
    data: {
      labels: dataConfirmed.data.map(item => item.date),
      datasets: [
        {
          label: 'Confirmados',
          data: dataConfirmed.data.map(item => item.total),
          fill: false,
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        },
        {
          label: 'Muertes',
          data: dataDeaths.data.map(item => item.total),
          fill: false,
          borderColor: 'rgb(255, 159, 64)',
          tension: 0.1
        },
        {
          label: 'Recuperados',
          data: dataRecovered.data.map(item => item.total),
          fill: false,
          borderColor: 'rgb(255, 205, 86)',
          tension: 0.1
        }
      ]
    }
  })
}

const table = (data, jwt) => {
  let cuerpoTabla = '';
  $.each(data, (i, value) => {
    cuerpoTabla += `
    <tr>
      <td>${value.location}</td>
      <td>${value.confirmed}</td>
      <td>${value.death}</td>
      <td>${Math.floor((value.confirmed - value.death) * 0.7)}</td>
      <td>${Math.floor((value.confirmed - value.death) * 0.3)}</td>
      <td><button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalMasInfo" onclick="getCountry('${value.location}', '${jwt}')">
      Más información
      </button></td>
    </tr>
    `
  })
  $(`#tbody`).append(cuerpoTabla);
}

const getCountry = async (country, jwt) => {
  try {
    const response = await fetch(`http://localhost:3000/api/countries/${country}`, {
      method: "GET",
      headers: {
        "authorization": `Bearer ${jwt}`
      }
    })
    const { data } = await response.json()
    const ctx2 = document.getElementById('Chart2').getContext("2d")
    ubicationCasesChart(ctx2, data)
    let tituloPais = document.getElementById("exampleModalLabel");
    tituloPais.innerHTML = data.location
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

let chart2 = null;

function ubicationCasesChart(ctx2, data) {
  if(chart2) {
    chart2.destroy()
  }
  chart2 = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: [
        'Confirmados',
        'Muertes',
        'Recuperados',
        'Activos'
      ],
      datasets: [{
        label: `${data.location}`,
        data: [data.confirmed, data.deaths, data.recovered, data.active],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(75, 192, 192)',
          'rgb(255, 205, 86)',
          'rgb(201, 203, 207)',
          'rgb(54, 162, 235)'
        ],
        hoverOffset: 4
      }]
    }
  })
}

document.getElementById("logOut").addEventListener("click", () => {
  localStorage.clear();
  window.location.reload();
});

