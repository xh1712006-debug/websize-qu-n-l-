document.addEventListener('DOMContentLoaded', () => {

    const currentPassword = document.querySelector('#currentPassword')
    const newPassword = document.querySelector('#newPassword')
    const confirmPassword = document.querySelector('#confirmPassword')
    const changePassMessage = document.querySelector('#changePassMessage')

    // Note: The logic for updating contact info and password is now mostly handled inline in account.hbs 
    // to leverage the unified aesthetic and simplify the script management.
    
    // We can keep this file for additional student-specific account logic if needed,
    // but the core update handlers are now integrated into the view scripts for immediate feedback.

    console.log('Student account module initialized');
})
