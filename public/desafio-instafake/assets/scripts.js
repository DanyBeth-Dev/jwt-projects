$('#js-form').submit(async (event) => {
  event.preventDefault()
  const email = document.getElementById('js-input-email').value
  const password = document.getElementById('js-input-password').value
  const JWT = await postData(email, password)
  getPosts(JWT)
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

const getPosts = async (jwt) => {
  try {
    const response = await fetch('http://localhost:3000/api/photos', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    })
    const { data } = await response.json()
    if (data) {
      fillFeed(data, 'js-feed-wrapper')
      toggleFormAndFeed('js-form-wrapper', 'js-feed-wrapper')
    }
  } catch (err) {
    localStorage.clear()
    console.error(`Error: ${err}`)
  }
}

const fillFeed = (data, contenedores) => {
  let divs = "";
  $.each(data, (i, value) => {
      divs += `
      <div class="card col-md-12 cuadrito" style="width: 18rem; display:none; margin: 2rem; padding: 1rem">
          <img src="${value.download_url}" class="card-img-top" alt="...">
          <div class="card-body">
              <p class="card-text">Autor: ${value.author}</p>
          </div>
      </div>
      `
  })
  $(`#${contenedores} #foto-autor`).append(divs);
  $('div.cuadrito:lt(10)').show();
};

const toggleFormAndFeed = (form, feed) => {
  $(`#${form}`).toggle();
  $(`#${feed}`).toggle();
};

const init = async () => {
  const token = localStorage.getItem('jwt-token');
  if (token) {
    getPosts(token)
  };
};

init();

document.getElementById("cerrar-sesion").addEventListener("click", function () {
  localStorage.clear();
  window.location.reload();
});

var items = 100;
var shown = 5;

$('.more').click(function () {
  shown = $('div.cuadrito:visible').length + 5;
  if (shown < items) {
    $('div.cuadrito:lt(' + shown + ')').show();
  } else {
    $('div.cuadrito:lt(' + items + ')').show();
    $('.more').hide();
  }
});

