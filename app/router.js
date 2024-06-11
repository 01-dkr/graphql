import { signIn, signOut } from "./custom/handlers.js";
import { surfTo } from "./custom/routing.js";

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', event => {
        event.preventDefault();
        if (event.target.tagName === 'A') {
            if (event.target.getAttribute('id') === 'submit-button') signIn();
            else surfTo(event.target.getAttribute('href'));
        } else if (event.target.tagName === 'BUTTON') signOut();
    });
    surfTo(window.location.pathname);
});
