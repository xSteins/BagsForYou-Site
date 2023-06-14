// Retrieve user information from the server and store it in localStorage
function storeUserData() {
    fetch('/login', {
        method: 'POST',
        body: new URLSearchParams({
            usernameOrEmail: 'your_username_or_email',
            password: 'your_password'
        })
    })
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('userData', JSON.stringify(data)); // Store user data as a string
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
}

// Get user information from localStorage
function getUserData() {
    const userDataString = localStorage.getItem('userData');
    return JSON.parse(userDataString); // Parse the stored string back to an object
}

// Usage example:
// Call the storeUserData function to retrieve and store user information from the server
storeUserData();

// Access user information from localStorage
const userData = getUserData();
console.log(userData.username); // Access the username property from the stored user data
