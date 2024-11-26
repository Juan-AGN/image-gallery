let tosearch = "A nice view";

let images = "";

let token = localStorage.getItem('thetoken');

let username = localStorage.getItem('user');

let onfavs = 0;

let fav_page = 0;

let like = "";

let fav_counter = 0;

let client_key = 'O1P8GbXZsQ1GxE4YY7LCcFqICU8RLtW3-FmCUI7KIys';

let client_secret = 'ue5EHHjlVfwFS_qB2B1F4wOKu4lQodQ0ZM3mTbR2TW8';

function login() {
  const params = new URLSearchParams();
  let url = 'https://unsplash.com/oauth/authorize?';
  params.append('client_id', client_key);
  params.append('redirect_uri', 'http://localhost:3000');
  params.append('response_type', 'code');
  window.location.href = `${url}${params.toString()}&scope=public+read_user+write_likes`;
}

function logout() {
  localStorage.removeItem('thetoken');
  localStorage.removeItem('user');
  console.log(localStorage.getItem('thetoken'));
  token = "";
  user = "";
  window.location.href = 'http://localhost:3000';
}

async function get_user() {
  console.log(token);
  try {
    const response = await fetch("https://api.unsplash.com/me", {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log(result);
    return result.username;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

async function get_favs(counter, number) {
  try {
    const response = await fetch(`https://api.unsplash.com/users/${username}/likes?${new URLSearchParams({
          username: username,
          page: counter,
          per_page: number,
          }).toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log(result);
    return result;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
}

async function search_liked() {
  let photos = await get_favs(0, 30);
  let str = "";
  let page = 0;

  if (!username || !token || !photos)
    return "";
  while (photos.length != 0) {
    while (fav_counter < photos.length) {
      str += `${photos[fav_counter].id} |`;
      fav_counter ++;
    }
    page ++;
    fav_counter = 0;
    photos = await get_favs(page, 30);
  }
  console.log(str);
  return str;
}

async function is_liked(image) {
  let aux;
  if (like == "")
  {
    console.log("getting");
    aux = await search_liked();
    like = `${aux}`;
  }
  if (like.search(image) == -1)
    return 0;
  return 1;
}

async function download_id_photo(id) {
  let image;
  const baseUrl = `https://api.unsplash.com/photos/${id}`;
  const params = new URLSearchParams();
  params.append('client_id', client_key);
  const url = `${baseUrl}?${params.toString()}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(data.id);
  console.log(data);
  if (images.search(data.id) == -1) {
    images += data.id + ' |';
    const imageUrl = data.urls.regular;
    const responseImage = await fetch(imageUrl);
    const blob = await responseImage.blob();
    const objectURL = URL.createObjectURL(blob);
    image = `<div onclick="save_favorite('${data.id}')" id=${data.id} class="imagediv_liked"><img class="boxed_image" src="${objectURL}"></div>`;
    document.getElementById('Image_container').innerHTML += image;
  }
}

async function display_favs() {
  let favs;
  let fav_counter = 0;

  onfavs = 0;
  favs = await get_favs(fav_page, 10);
  if (favs == null)
    return -1;
  while (fav_counter < favs.length) {
    download_id_photo(favs[fav_counter].id);
    fav_counter ++;
  }
  if (fav_counter == 5)
    fav_page ++;
  else
    fav_page = 0;
  document.getElementById('load_button').style.display = 'block';
}

async function get_token_from_url() {
  const urlparams = new URLSearchParams(window.location.search);
  const codi = urlparams.get('code');
  
  try {
    const response = await fetch("https://unsplash.com/oauth/token", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: client_key,
        client_secret: client_secret,
        redirect_uri: 'http://localhost:3000',
        code: codi,
        grant_type: 'authorization_code'
      }).toString()
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.access_token;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

async function save_favorite(id) {
  let aux = await is_liked(id);

  console.log("aux")
  console.log(aux);
  if (aux == 1)
  {
    try {
      const response = await fetch(`https://api.unsplash.com/photos/${id}/like?${new URLSearchParams({
          id: id,
          }).toString()}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log(result);
      like.replace(`/${id}/g`, "");
      document.getElementById(id).classList.add('imagediv');
      document.getElementById(id).classList.remove('imagediv_liked');
      return result;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  } else if (aux == 0) {
    try {
      const response = await fetch(`https://api.unsplash.com/photos/${id}/like?${new URLSearchParams({
          id: id,
          }).toString()}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log(result);
      document.getElementById(id).classList.add('imagediv_liked');
      document.getElementById(id).classList.remove('imagediv');
      like += `${id} |`;
      return result;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
}

async function handle_redirect() {
  token = await get_token_from_url();
  if (token) {
    localStorage.setItem('thetoken', token);
    window.location.hash = '';;
    username = await get_user();
    console.log(username);
    localStorage.setItem('user', username);
    window.location.href = 'http://localhost:3000';
  } else {
    console.log("No se encontró el token en la URL.");
    window.location.href = 'http://localhost:3000';
  }
}

async function downloadRandomPhoto(prompt) {
  let image;

  const baseUrl = 'https://api.unsplash.com/search/photos';
  const params = new URLSearchParams();
  params.append('query', prompt);
  params.append('client_id', client_key);
  const url = `${baseUrl}?${params.toString()}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.results.length === 0) {
    console.error('No results found for your prompt.');
    return;
  }
  const randomPhoto = data.results[Math.floor(Math.random() * data.results.length)];
  console.log(randomPhoto.id);
  console.log(images);data
  if (images.search(randomPhoto.id) == -1) {
    images += randomPhoto.id + ' |';
    const imageUrl = randomPhoto.urls.regular;
    const responseImage = await fetch(imageUrl);
    const blob = await responseImage.blob();
    const objectURL = URL.createObjectURL(blob);
    let liked = await is_liked(randomPhoto.id);
    console.log(liked);
    if (liked == 0) {
      image = `<div onclick="save_favorite('${randomPhoto.id}')" id="${randomPhoto.id}" class="imagediv"><img class="boxed_image" src="${objectURL}"></div>`;
    } else {
      image = `<div onclick="save_favorite('${randomPhoto.id}')" id="${randomPhoto.id}" class="imagediv_liked"><img class="boxed_image" src="${objectURL}"></div>`;
    }
    document.getElementById('Image_container').innerHTML += image;
  }
}

function photos_generator_searcher() {
  let counter = 0;

  fav_page = 0;
  images = "";
  tosearch = document.getElementById("searcher").value;
  console.log(tosearch);
  if (tosearch == "")
    tosearch = "A nice view"
  document.getElementById('Image_container').innerHTML = "";
  while (counter != 15)
  {
    downloadRandomPhoto(tosearch);
    counter ++;
  }
  document.getElementById('load_button').style.display = 'block';
}

function generate_favorites() {
  onfavs = 1;
  fav_page = 0;
  images = "";
  like = "";
  document.getElementById('Image_container').innerHTML = "";
  display_favs();
}

function photos_generator() {
  let counter = 0;
  
  if (onfavs == 0)
  {
    while (counter != 10)
    {
      downloadRandomPhoto(tosearch);
      counter ++;
    }
  }
  else
  {
    display_favs();
  }
  document.getElementById('load_button').style.display = 'block';
}

window.addEventListener('load', () => {
  let urlparams = new URLSearchParams(window.location.search);

  if (urlparams.has("code")) {
    document.getElementById('logout').style.display = 'block';
    document.getElementById('login').style.display = 'none';
    document.getElementById('favorite').style.display = 'block';
    document.getElementById('no_favorite').style.display = 'none';
    handle_redirect();
  } else if (token != null && username != null ) {
    document.getElementById('logout').style.display = 'block';
    document.getElementById('login').style.display = 'none';
    document.getElementById('favorite').style.display = 'block';
    document.getElementById('no_favorite').style.display = 'none';
    photos_generator();
  } else {
    document.getElementById('logout').style.display = 'none';
    document.getElementById('login').style.display = 'block';
    document.getElementById('favorite').style.display = 'none';
    document.getElementById('no_favorite').style.display = 'block';
    photos_generator();
  }
});
