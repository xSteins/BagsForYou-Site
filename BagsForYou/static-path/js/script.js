// Function to get the value of a cookie
function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].split("=");
        if (cookie[0] === name) {
            return decodeURIComponent(cookie[1]);
        }
    }
    return "";
}

document.addEventListener('DOMContentLoaded', () => {
    // Halaman edit profile
    document.getElementById("profile-username").textContent = getCookie("username");
    document.getElementById("profile-email").textContent = getCookie("email");
    document.getElementById("profile-name").textContent = getCookie("nama_lengkap");

    // Halaman profile
    document.querySelector("#profile-username2").textContent = getCookie("username");

    // Display the hidden input fields when the corresponding edit button is clicked
    document.getElementById("usernameEditButton").addEventListener("click", function () {
        document.getElementById("profile-username").classList.add("hidden");
        document.getElementById("usernameUpdated").classList.remove("hidden");
    });

    document.getElementById("emailEditButton").addEventListener("click", function () {
        document.getElementById("profile-email").classList.add("hidden");
        document.getElementById("emailUpdated").classList.remove("hidden");
    });

    document.getElementById("nameEditButton").addEventListener("click", function () {
        document.getElementById("profile-name").classList.add("hidden");
        document.getElementById("nameUpdated").classList.remove("hidden");
    });
})