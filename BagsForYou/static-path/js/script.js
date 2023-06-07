const loginMenu = document.querySelector('#login');
const signUpMenu = document.querySelector('#signup');

// Display the login / signup modal is disabled for now.
document.getElementById('SignUpButton').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/signup';
    // signUpMenu.classList.remove('hidden');
});
document.getElementById('SignInButton').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/login';
    // loginMenu.classList.remove('hidden');
});

// Close the window button
const windowCloseButton = document.querySelector('#close-window-link');

windowCloseButton.addEventListener('click', (e) => {
    e.preventDefault();
    signUpMenu.classList.add('hidden');
    loginMenu.classList.add('hidden');
})

