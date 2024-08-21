const URLCAT = "https://www.themealdb.com/api/json/v1/1/categories.php";
let selectForm = document.querySelector("select");

let arrayFavoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
// esto lo selecciono aqui o en la funcion añadir a favoritos?
let listaFavoritos = document.querySelector("#favoritos");

//////////////////////////////////////////////////////////////////////OBTENER CATEGORIAS SELECCT//////////////////////////////////////////////// 
let getCategorias = async () => {
  let datos = await fetch(URLCAT);
  let resultados = await datos.json();

  resultados.categories.forEach((cat) => {
    selectForm.innerHTML += `<option value="${cat.strCategory}">${cat.strCategory}</option>`;
  });

  selectForm.addEventListener("change", pintarRecetas);
};

if (document.querySelector("#home")) {
    getCategorias();
}
/////////////////////////////////////////////////////////////////////////PINTAR RECETA POR CATEGORÍA/////////////////////////////////////////////////////
async function pintarRecetas(e) {
  let recetasFiltradas = document.querySelector("#recetasFiltradas");
  recetasFiltradas.innerHTML = ``;

  let datos = await fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${e.target.value}`
  );
  let resultados = await datos.json();

  resultados.meals.forEach((meal) => {
    recetasFiltradas.innerHTML += `
        <div class="col-md-4">
        <div class="card border-primary mb-3">
            <div class="card-header"><img src="${meal.strMealThumb}" class="img-fluid"></div>
            <div class="card-body">
                <h4 class="card-title">${meal.strMeal}</h4>
                
                <button type="button" class="btn btn-primary" onclick="mostrarReceta(this,${meal.idMeal})">Ver receta</button>
            </div>
        </div>
        </div>
        `;
  });
}
/////////////////////////////////////////////////////////////////////////MODAL//////////////////////////////////////////////////////////////
async function mostrarReceta(element, id) {
  let datos = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  );
  let resultado = await datos.json();

  let popup = document.querySelector(".popup");

  let botonFavorito=`<button type="button" class="btn btn-primary" id="btnFavoritos" onclick="guardarFavoritos(this,${resultado.meals[0].idMeal})">Añadir a favoritos</button>`;
  if (existeFavorito(resultado.meals[0].idMeal)) {
    botonFavorito=`<button type="button" class="btn btn-primary" id="btnFavoritos" onclick="quitarDeFavoritos(this, ${resultado.meals[0].idMeal})">Eliminar de favoritos</button>`;
  }

  popup.innerHTML = `
        <div class="modal fade" id="verReceta" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="exampleModalLabel">${resultado.meals[0].strMeal}</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>${resultado.meals[0].strInstructions}</p>
                        <ul class="list-group"></ul>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        ${botonFavorito};
                    </div>
                </div>
            </div>
        </div>
    `;

  let ul = document.querySelector("ul.list-group");
  for (let i = 0; i < 20; i++) {
    if (
      resultado.meals[0][`strIngredient${i}`] &&
      resultado.meals[0][`strMeasure${i}`]
    ) {
      ul.innerHTML += `
                <li class="list-group-item">
                ${resultado.meals[0][`strIngredient${i}`]} / 
                ${resultado.meals[0][`strMeasure${i}`]}
                </li>
            `;
    }
  }

  const myModal = new bootstrap.Modal("#verReceta");
  myModal.show();
}
/////////////////////////////////////////////////////////////////////////AÑADIR A FAVORITO////////////////////////////////////////////////////////
function existeFavorito(id){
  let existe=false;
    arrayFavoritos.forEach(element => {
        if (element==id) {
            existe=true;
        }
    });
    return existe;
}

function guardarFavoritos(boton, id) {
    if (!existeFavorito(id)) {
        arrayFavoritos.push(id);
        localStorage.setItem("favoritos", JSON.stringify(arrayFavoritos));
        mostrarMensaje();
        boton.parentElement.innerHTML= `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="btnFavoritos" onclick="quitarDeFavoritos(this, ${id})">Eliminar de favoritos</button> `;
    }
}
/////////////////////////////////////////////////////////////////////////MENSAJES FLOTANTES///////////////////////////////////
function mostrarMensaje() {
  let mensajeDiv = document.getElementById('mensajeDiv');
  mensajeDiv.style.display = 'block';

  setTimeout(function () {
      mensajeDiv.style.display = 'none';
  }, 3000);
}
function mostrarMensajeEliminado(){
  let mensajeDiv2 = document.getElementById('mensajeEliminado');
  mensajeDiv2.style.display = 'block';

  setTimeout(() => mensajeDiv2.style.display = 'none' , 3000);
}
/////////////////////////////////////////////////////////////////////////MOSTRAR FAVORITOS//////////////////////////////////////////////////////
function cargarFavoritos() {
  arrayFavoritos.forEach((favorito) => {
    pintarFavorito();
    async function pintarFavorito() {
      let datos = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${favorito}`
      );
      let resultado = await datos.json();

      listaFavoritos.innerHTML += `
            <div class="col-md-4">
                <div class="card border-primary mb-3">
                    <div class="card-header"><img src="${resultado.meals[0].strMealThumb}" class="img-fluid"></div>
                    <div class="card-body">
                        <h4 class="card-title">${resultado.meals[0].strMeal}</h4>
                        <button type="button" class="btn btn-primary" onclick="quitarDeFavoritos(this, ${resultado.meals[0].idMeal})">Quitar de favoritos</button>
                        <button type="button" class="btn btn-danger" onclick="mostrarReceta(this, ${resultado.meals[0].idMeal})">Ver receta</button>
                    </div>
                </div>
            </div>
              `;
    }
  });
}
if (document.querySelector("#indexFavoritos")) {
    cargarFavoritos();
}

/////////////////////////////////////////////////////////////////////////ELIMINAR FAVORITO//////////////////////////////////////////////////
function quitarDeFavoritos(boton, id) {
  if (document.querySelector("#indexFavoritos")) {
    boton.parentElement.parentElement.parentElement.remove();
  }
  arrayFavoritos = arrayFavoritos.filter((idFavorito) => idFavorito != id);
  localStorage.setItem("favoritos", JSON.stringify(arrayFavoritos));
  mostrarMensajeEliminado();
  boton.parentElement.innerHTML= `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="btnFavoritos" onclick="guardarFavoritos(this, ${id})">Añadir de favoritos</button> `;
}
