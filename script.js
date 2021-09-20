const meals = document.getElementById("meals");   

const favContainer = document.getElementById("fav-meals")

const searchTerm = document.getElementById("search-term");

const searchBtn = document.getElementById("search");

//const mealPopup = document.getElementById("meal-popup");

const mealInfoEle = document.getElementById("meal-info");

//const popupClose = document.getElementById("close-btn");

const openBtn = document.querySelectorAll("[data-popup-target]");

const closeBtn = document.querySelectorAll("[data-close-button]");

const overlay = document.getElementById("overlay");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal(){
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');    

    const resData = await res.json();

    const randomMeal = resData.meals[0];

    console.log(randomMeal);

    addMeal(randomMeal, true); 
}

async function getMealById(id){
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);

    const resData = await res.json();

    const meal = resData.meals[0];

    return meal;
}

async function getMealsBySearch(term){
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);

    const resData = await res.json();

    const meals = resData.meals;

    return meals;
}

function addMeal(mealData, random = false){
    const meal = document.createElement("div"); 

    meal.classList.add("meal");

    meal.innerHTML = ` 
        <div class="meal-header">
            ${random ? `
                <span class="random">Random Recipe</span>
            ` : ""}

            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        </div>

        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn"><i class="fas fa-heart"></i></button>
        </div>    
    `;

    const btn = meal.querySelector(".meal-body .fav-btn");

    btn.addEventListener("click", () => {
        if(btn.classList.contains("active")){
            removeMealFromLS(mealData.idMeal);

            btn.classList.remove("active");
        }
        else{
            addMealToLS(mealData.idMeal);

            btn.classList.add("active");
        }

        
        fetchFavMeals();
    });

    meal.addEventListener("click", () => {
        showInfo(mealData);
    });

    meals.appendChild(meal);
}

function getMealsFromLS(){
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));

    return mealIds === null ? [] : mealIds;
}

function addMealToLS(mealId){
    const mealIds = getMealsFromLS();

    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealFromLS(mealId){
    const mealIds = getMealsFromLS();

    localStorage.setItem("mealIds", JSON.stringify(mealIds.filter(id => id !== mealId)));
}

async function fetchFavMeals(){
    favContainer.innerHTML = "";

    const mealIds = getMealsFromLS();

    const meals = [];

    for(let i = 0; i < mealIds.length; i++){
        const mealId = mealIds[i];

        meal = await getMealById(mealId);

        addMealToFav(meal);
    }

    console.log(meals);
}

function addMealToFav(mealData){
    const favMeal = document.createElement("li"); 

    favMeal.innerHTML = ` 
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
            
        <span>${mealData.strMeal}</span> 
        
        <button class="remove"><i class="fas fa-times-circle"></i></button>
    `;

    const btn = favMeal.querySelector(".remove");

    btn.addEventListener("click", () => {
        removeMealFromLS(mealData.idMeal);

        fetchFavMeals();
    });

    favMeal.addEventListener("click", () => {
        showInfo(mealData);
    });

    favContainer.appendChild(favMeal);
}

searchBtn.addEventListener("click", async () => {
    const search = searchTerm.value;

    const meals = await getMealsBySearch(search);

    if(meals){
        meals.forEach(meal => {
            addMeal(meal);
        });
    }

    
});

/*function showInfo(mealData){
    const mealEle = document.createElement("div");

    mealEle.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}"
                    alt="${mealData.strMeal}">
                
        <p>${mealData.strInstructions}</p>
                
        
    `; 

    mealInfoEle.appendChild(mealEle);

    mealPopup.classList.remove("hidden");
}

popupClose.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
});*/

function showInfo(mealData){
    //clean it
    mealInfoEle.innerHTML = "";

    const mealEle = document.createElement("div");

    const ingredients = [];

    for(let i = 1; i <= 20; i++){
        if(mealData["strIngredient" + i]){
            ingredients.push(
                `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + 1]}`
            );
        }
        else{
            break;
        }
    }

    mealEle.innerHTML = `
        <div class="popup-header">
            <h1>${mealData.strMeal}</h1>
        </div>
    
        <img src="${mealData.strMealThumb}"
                    alt="${mealData.strMeal}">
    
        <p>${mealData.strInstructions}</p>
                
        <h3>Ingredients</h3>
        <ul>
        ${ingredients.map((ing) =>
            `<li>${ing}</li>`
            ).join("")}
        </ul>
        
    `; 

    mealInfoEle.appendChild(mealEle);

    openBtn.forEach(div => {
        div.addEventListener("click", () => {
            const popup = document.querySelector(div.dataset.popupTarget)

            openPopup(popup)
        });
    });

    function openPopup(popup){
        if(popup == null) return
        popup.classList.add("active");
        overlay.classList.add("active")
        }
}



closeBtn.forEach(div => {
    div.addEventListener("click", () => {
        const popup = div.closest(".popup-container")

        closePopup(popup)
    });
});

function closePopup(popup){
    if(popup == null) return
    popup.classList.remove("active")
    overlay.classList.remove("active")
}