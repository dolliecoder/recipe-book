// Shared JavaScript logic for Recipe App
// This file detects which page is open and runs the right code.

// Helper: get query parameters from URL
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// CATEGORY PAGE LOGIC
if (window.location.pathname.includes("category.html")) {
  const category = getQueryParam("c");
  const titleEl = document.getElementById("categoryTitle");
  const dishList = document.getElementById("dishList");

  if (category && titleEl && dishList) {
    titleEl.textContent = category;

    // ✅ Condition fix for Drink and Meal
    let apiUrl;
    if (category.toLowerCase() === "drink") {
      // Use CocktailDB for drinks
      apiUrl = "https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=Cocktail";
    } else if (category.toLowerCase() === "meal") {
      // Map "Meal" to a valid MealDB category (e.g. Beef)
      apiUrl = "https://www.themealdb.com/api/json/v1/1/filter.php?c=Beef";
    } else {
      // Default: use MealDB
      apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
    }

    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        dishList.innerHTML = ""; // clear any previous

        const items = data.meals || data.drinks; // CocktailDB returns drinks
        if (!items) {
          dishList.innerHTML = "<p style='color:red;'>No recipes found for this category.</p>";
          return;
        }

        items.forEach(item => {
          const link = document.createElement("a");
          link.className = "btn";
          link.textContent = item.strMeal || item.strDrink;
          link.href = `recipe.html?id=${item.idMeal || item.idDrink}`;
          dishList.appendChild(link);
        });
      })
      .catch(err => {
        console.error("Error fetching category:", err);
        dishList.innerHTML = "<p style='color:red;'>Failed to load dishes.</p>";
      });
  }
}

// RECIPE PAGE LOGIC
if (window.location.pathname.includes("recipe.html")) {
  const id = getQueryParam("id");
  const recipeDiv = document.getElementById("recipe");

  if (id && recipeDiv) {
    // Try MealDB first, fallback to CocktailDB if not found
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.meals) {
          // If not a meal, try CocktailDB
          return fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`)
            .then(res => res.json())
            .then(drinkData => {
              const drink = drinkData.drinks[0];
              recipeDiv.innerHTML = `
                <h1>${drink.strDrink}</h1>
                <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" style="max-width:400px;border-radius:10px;">
                <p><strong>Category:</strong> ${drink.strCategory}</p>
                <p><strong>Alcoholic:</strong> ${drink.strAlcoholic}</p>
                <h3>Instructions:</h3>
                <p>${drink.strInstructions}</p>
                <h3>Ingredients:</h3>
                <ul>
                  ${Array.from({length:15}, (_,i) => {
                    const ingredient = drink[`strIngredient${i+1}`];
                    const measure = drink[`strMeasure${i+1}`];
                    return ingredient ? `<li>${ingredient} - ${measure || ""}</li>` : "";
                  }).join("")}
                </ul>
              `;
            });
        }

        const meal = data.meals[0];
        recipeDiv.innerHTML = `
          <h1>${meal.strMeal}</h1>
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="max-width:400px;border-radius:10px;">
          <p><strong>Category:</strong> ${meal.strCategory}</p>
          <p><strong>Area:</strong> ${meal.strArea}</p>
          <h3>Instructions:</h3>
          <p>${meal.strInstructions}</p>
          <h3>Ingredients:</h3>
          <ul>
            ${Array.from({length:20}, (_,i) => {
              const ingredient = meal[`strIngredient${i+1}`];
              const measure = meal[`strMeasure${i+1}`];
              return ingredient ? `<li>${ingredient} - ${measure}</li>` : "";
            }).join("")}
          </ul>
        `;
      })
      .catch(err => {
        console.error("Error fetching recipe:", err);
        recipeDiv.innerHTML = "<p style='color:red;'>Failed to load recipe.</p>";
      });
  }
}