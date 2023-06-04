const loginMenu = document.querySelector('#login');
const signUpMenu = document.querySelector('#signup');

// Display the login / signup modal
document.getElementById('SignUpButton').addEventListener('click', function () {
    signUpMenu.classList.remove('hidden');
});
document.getElementById('SignInButton').addEventListener('click', function () {
    loginMenu.classList.remove('hidden');
});

// Close the window button
const windowCloseButton = document.querySelector('#close-window-link');

windowCloseButton.addEventListener('click', () => {
    signUpMenu.classList.add('hidden');
    loginMenu.classList.add('hidden');
})
