// Get the form and the alert element
const form = document.getElementById('loginForm');
const alertElement = document.getElementById('Alert');

// Add event listener to the form submission
form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent form submission

    // Get the form inputs
    const usernameInput = document.getElementById('signupUsername');
    const namaInput = document.getElementById('signupNama');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPass');

    // Clear previous alert messages
    alertElement.textContent = '';

    // Validate username
    if (usernameInput.value.trim() === '') {
        displayAlert('Username cannot be empty');
        return;
    }
    if (usernameInput.value.length > 20) {
        displayAlert('Username must be maximum 20 characters long');
        return;
    }
    if (usernameInput.value.includes(' ')) {
        displayAlert('Username cannot have spaces');
        return;
    }

    // Validate nama
    if (namaInput.value.trim() === '') {
        displayAlert('Nama cannot be empty');
        return;
    }
    if (namaInput.value.length > 50) {
        displayAlert('Nama must be maximum 50 characters long');
        return;
    }

    // Validate email
    if (emailInput.value.trim() === '') {
        displayAlert('Email cannot be empty');
        return;
    }
    if (emailInput.value.length > 20) {
        displayAlert('Email must be maximum 20 characters long');
        return;
    }

    // Validate password
    if (passwordInput.value.trim() === '') {
        displayAlert('Password cannot be empty');
        return;
    }
    if (passwordInput.value.length > 20) {
        displayAlert('Password must be maximum 20 characters long');
        return;
    }

    // If all validations pass, submit the form
    form.submit();
});

// Function to display the alert message
function displayAlert(message) {
    alertElement.textContent = message;
}
