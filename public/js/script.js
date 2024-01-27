document.addEventListener('DOMContentLoaded', function () {
    const countrySelect = document.getElementById('country');
    const citySelect = document.getElementById('city');
    const hotelSelect = document.getElementById('hotel');
    const adultsInput = document.getElementById('adults');
    const childrenInput = document.getElementById('children');

    // Define city and hotel options based on country
    const cityOptions = {
        usa: ['New York', 'Los Angeles'],
        uk: ['London', 'Manchester'],
        japan: ['Tokyo', 'Osaka'],
    };

    const hotelOptions = {
        usa: ['Sheraton', 'Hilton'],
        uk: ['Marriott', 'Radisson'],
        japan: ['Tokyo Hotel', 'Osaka Resort'],
    };

    // Populate city dropdown based on selected country
    countrySelect.addEventListener('change', function () {
        const selectedCountry = countrySelect.value;
        populateDropdown(citySelect, cityOptions[selectedCountry]);
    });

    // Populate hotel dropdown based on selected city
    citySelect.addEventListener('change', function () {
        const selectedCountry = countrySelect.value;
        const selectedCity = citySelect.value;
        populateDropdown(hotelSelect, hotelOptions[selectedCountry]);
    });

    // Ensure adults input is never less than 1
    adultsInput.addEventListener('input', function () {
        if (adultsInput.value < 1) {
            adultsInput.value = 1;
        }
    });

    // Ensure children input is never less than 0
    childrenInput.addEventListener('input', function () {
        if (childrenInput.value < 0) {
            childrenInput.value = 0;
        }
    });

    // Event listener for the edit tour form
    document.getElementById('editTourForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        // Validate the selected values
        const isValid = validateSelectedValues();

        if (isValid) {
            const formData = new FormData(event.target);
            const response = await fetch('/travelagency', {
                method: 'PUT',
                body: formData,
            });

            const result = await response.json();
            displayTourResult(result);
        } else {
            alert('Invalid selection. Please choose valid values.');
        }
    });

    // Event listener for the delete tour form
    document.getElementById('deleteTourForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const response = await fetch('/travelagency', {
            method: 'DELETE',
            body: formData,
        });

        const result = await response.json();
        alert(result.message);

        // Refresh the page to reflect the changes
        location.reload();
    });
});

// Function to populate a dropdown with options
function populateDropdown(selectElement, options) {
    // Clear existing options
    selectElement.innerHTML = '';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = 'default';
    defaultOption.textContent = 'Choose...';
    selectElement.appendChild(defaultOption);

    // Add options from the provided array
    options.forEach(function (option) {
        const newOption = document.createElement('option');
        newOption.value = option.toLowerCase().replace(' ', '_');
        newOption.textContent = option;
        selectElement.appendChild(newOption);
    });
}

document.getElementById('travelForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevents the default form submission

    // Validate the selected values
    const isValid = validateSelectedValues();

    if (isValid) {
        // If validation passes, continue with the form submission logic
        const formData = new FormData(event.target);
        const response = await fetch('/travelagency', {
            method: 'POST',
            body: formData,
        });

        // Handle the response accordingly
        const result = await response.json();
        displayTourResult(result);
    } else {
        alert('Invalid selection. Please choose valid values.');
    }
});

// Function to validate selected values
function validateSelectedValues() {
    const countrySelect = document.getElementById('country');
    const citySelect = document.getElementById('city');
    const hotelSelect = document.getElementById('hotel');
    const adultsInput = document.getElementById('adults');
    const childrenInput = document.getElementById('children');

    // Check if the selected values are not the default "Choose..." value
    return (
        countrySelect.value !== 'default' &&
        citySelect.value !== 'default' &&
        hotelSelect.value !== 'default' &&
        adultsInput.value >= 1 &&
        childrenInput.value >= 0
    );
}

// Function to display the tour result dynamically
function displayTourResult(result) {
    const availabilityMessage = document.getElementById('availabilityMessage');
    const weatherCondition = document.getElementById('weatherCondition');
    const tourCost = document.getElementById('tourCost');

    // Update the HTML content with the result data
    availabilityMessage.textContent = `Availability: ${result.tourResult.availability}`;
    weatherCondition.textContent = `Weather: ${result.tourResult.weatherConditions}`;
    tourCost.textContent = `Total Cost: $${result.tourResult.tourCost.toFixed(2)}`;

    // Show the result section
    const resultSection = document.getElementById('result');
    resultSection.style.display = 'block';
}
