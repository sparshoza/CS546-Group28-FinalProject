
// Connect to the Socket.IO server

// Listen for events from the server

(function () {
    const checkPassword = (password) => {
        const minLength = 8;
        const hasSpaces = password.indexOf(' ') !== -1;
        const hasUppercase = /[A-Z]/.test(password);
        const hasDigits = /\d/.test(password);
        const hasSymbols = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.#\/]/.test(password);
      
        return (
          password.length >= minLength &&
          !hasSpaces &&
          hasUppercase &&
          hasDigits &&
          hasSymbols
        );
      };
      
      const checkEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      }
      
      const loginForm = document.getElementById('login-form');

      if (loginForm){
        loginForm.addEventListener('submit', (event) => {
          const emailAddressInput = document.getElementById('emailAddressInput').value.trim();
          const passwordInput = document.getElementById('passwordInput').value.trim();
          const errorDiv = document.getElementById('error');
          const missingDiv = document.getElementById('missing');
      
          let isValid = true;
          let missingFields = [];
          let invalidFields = [];
      
          if (email === '') {
            isValid = false;
            missingFields.push('Missing Email Address');
          }
        
          if (password === '') {
            isValid = false;
            missingFields.push('Missing Password');
            }
          
          if(!checkEmail(email)) {
            isValid = false;
            invalidFields.push('Error 1')
          };
          if(!checkPassword(password)){
            isValid = false;
            invalidFields.push('Error 2')
          };
      
          missingFields = missingFields.join(', ');
          invalidFields = invalidFields.join(', ');
      
          if (!isValid) {
            event.preventDefault();
      
            if (missingFields.length > 0) {
              missingDiv.innerHTML = `<p>${missingFields}</p>`
            }
        
            if (invalidFields.length > 0) {
              errorDiv.innerHTML = '<p>Either the email address or password is invalid</p>';
              }
          }
          emailAddressInput.value = email;
        });
      }
    
      const registerForm = document.getElementById('register-form');
      if(registerForm){
        registerForm.addEventListener('submit', (event) => {
          const firstNameInput = document.getElementById('firstNameInput').value.trim();
          const lastNameInput = document.getElementById('lastNameInput').value.trim();
          const emailAddressInput = document.getElementById('emailAddressInput').value.trim();
          const passwordInput = document.getElementById('passwordInput').value.trim();
          const confirmPasswordInput = document.getElementById('confirmPasswordInput').value.trim();
          const courseField = document.getElementById('courseField').value;
          const errorDiv = document.getElementById('error');
          const missingDiv = document.getElementById('missing');
        
          let isValid = true;
          let missingFields = [];
          let invalidFields = [];
        
          if (firstName === '') {
            isValid = false;
            alert('Missing First Name');
          }
          if (lastName === '') {
            isValid = false;
            missingFields.push('Missing Last Name');
          }
          if (email === '') {
            isValid = false;
            missingFields.push('Missing Email Address');
          }
          if (password === '') {
            isValid = false;
            missingFields.push('Missing Password');
          }
          if (confirmPassword === '') {
            isValid = false;
            missingFields.push('Missing Confirm Password');
          }
          if (course === '') {
            isValid = false;
            missingFields.push('Missing Course');
          }
          if (!/^[a-zA-Z]+$/.test(firstName)) invalidFields.push('First name must only contain letters');
          if (firstName.length < 2 || firstName.length > 25) invalidFields.push('First name must be between 2 and 25 characters');
          if (typeof lastName !== 'string') invalidFields.push('Last name must be a string');
          if (!/^[a-zA-Z]+$/.test(lastNameInput)) invalidFields.push('Last name must only contain letters');
          if (lastNameInput.length < 2 || lastNameInput.length > 25) invalidFields.push('Last name must be between 2 and 25 characters');
          if (password !== confirmPassword) {
            isValid = false;
            invalidFields.push('Passwords do not match');
          }
          if(!checkEmail(email)) {
            isValid = false;
            invalidFields.push('Invalid Email Format')
          }
          if (!checkPassword(password)) {
            isValid = false;
            invalidFields.push('Invalid Password Format')
          }
        
          missingFields = missingFields.join(", ");
          invalidFields = invalidFields.join(", ");
        
          if (!isValid) {
            event.preventDefault();
        
            if (missingFields.length > 0) {
              missingDiv.innerHTML = `<p>${missingFields}</p>`;
          }
            if (invalidFields.length > 0) {
              errorDiv.innerHTML = `<p>${invalidFields}</p>`;
            }
        }})
      }
})

function showFields() {
	var courseFields = document.getElementById("courseFields").value;
	var fieldsContainer = document.getElementById("fieldsContainer");
	fieldsContainer.innerHTML = "";
	for (var i = 1; i <= courseFields; i++) {
		fieldsContainer.innerHTML += "Field " + i + ": <input type='text'  name='field" + i + "'><br>";
	}
  document.getElementById("courseFieldsInput").value = courseFields;
}


let currentDate = new Date();
let currentYear = currentDate.getFullYear();

document.getElementById("graduationYear").setAttribute("min", currentYear )
document.getElementById("graduationYear").setAttribute("max", currentYear+5 )

function showPassword1() {
  var tempPass = document.getElementById("passwordInput");
  if (tempPass.type === "password") {
    tempPass.type = "text";
  } else {
    tempPass.type = "password";
  }
}
function showPassword2() {
  var tempPass1 = document.getElementById("confirmPasswordInput");
  if (tempPass1.type === "password") {
    tempPass1.type = "text";
  } else {
    tempPass1.type = "password";
  }
}

// Lab 10 user registration examples
let loginForm = document.getElementById("login-form");
let error = document.getElementById("error");
let registerForm = document.getElementById('registration-form');
if(registerForm){
    registerForm.addEventListener("submit", (event)=>{
        error.hidden = true;
        let errorText = '';
        let firstNameInput = document.getElementById('firstNameInput');
        let lastNameInput = document.getElementById('lastNameInput');
        let emailAddressInput = document.getElementById('emailAddressInput');
        let passwordInput = document.getElementById('passwordInput');
        let confirmPasswordInput = document.getElementById('confirmPasswordInput');
        let roleInput = document.getElementById('roleInput');
        if(firstNameInput.value.trim().length !== 0 && lastNameInput.value.trim().length !== 0 && emailAddressInput.value.trim().length !== 0 && passwordInput.value.trim().length !== 0 && confirmPasswordInput.value.trim().length){
            //trim them
            let firstName = firstNameInput.value.trim();
            let lastName = lastNameInput.value.trim();
            let email = emailAddressInput.value.trim();
            let password = passwordInput.value.trim();
            let confirmPassword = confirmPasswordInput.value.trim();
            let role = roleInput.trim();
            if(firstName.length < 2 || lastName.length > 25){errorText = 'first name must be between 2 and 25 characters!';}
            if(lastName.length < 2 || firstName.length > 25){errorText = 'last name must be between 2 and 25 characters!';}
            let check = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/; //regex I found that fulfills email address requirements
            if(!email.match(check)){errorText = 'emailaddress input must follow the standard email address pattern';}
            if(password.includes(' ') || password.length < 8){errorText= 'password must be at least 8 characters and cannot contain spaces';}
            //now to check for the password contents
            let upperCheck = /[A-Z]/;
            let numberCheck = /[0-9]/;
            let specialCheck = /[!@#$%^&*-?]/ //allows for the special characters in number row and ?
            if(!password.match(upperCheck) || !password.match(numberCheck) || !password.match(specialCheck) || password.match(' ')){errorText= 'password must contain at least one uppercase letter, one number and one special character and no spaces';}
            if(password !== confirmPassword){errorText= 'password must match the confirm password';}
            if(role !== "admin" || role !== "user"){errorText= 'role must be either admin or user';}

            if (errorText !== ''){
                event.preventDefault(); //prevent form from submitting
                error.hidden = false; //show error on client side
                error.innerHTML = errorText;
                error.focus();
            }
        } else {
            event.preventDefault(); //prevent form from submitting
            error.hidden = false; //show error on client side
            error.innerHTML = 'You must enter values for all fields!';
            //error
            error.focus();
        }
    });
}

if(loginForm){
    loginForm.addEventListener("submit", (event)=>{
    error.hidden = true;
    let errorText = '';
    let emailInput = document.getElementById("emailAddressInput");
    let passwordInput = document.getElementById("passwordInput");
    if(emailInput.value.trim().length !== 0 && passwordInput.value.trim().length !== 0){
    let emailAddress = emailInput.value.trim();
    let password= passwordInput.value.trim();
    let check = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/; //regex I found that fulfills email address requirements
    if(!emailAddress.match(check)){errorText = 'emailaddress input must follow the standard email address pattern';}
    if(password.includes(' ') || password.length < 8){errorText = 'password must be at least 8 characters and cannot contain spaces';}
    //now to check for the password contents
    let upperCheck = /[A-Z]/;
    let numberCheck = /[0-9]/;
    let specialCheck = /[!@#$%^&*-?]/ //allows for the special characters in number row and ?
    if(!password.match(upperCheck) || !password.match(numberCheck) || !password.match(specialCheck) || password.match(' ')){errorText =  'password must contain at least one uppercase letter, one number and one special character and no spaces';}

    if(errorText !== ''){
        event.preventDefault(); //prevent form from submitting
        error.hidden = false;
        error.innerHTML = errorText;
        error.focus();
    }
} else {
    event.preventDefault(); //prevent form from submitting
    error.hidden = false; //show error on client side
    error.innerHTML = 'You must enter values for both email and password!';
    //error
    error.focus();
    }
    });
}
// event.preventDefault(); //prevent form from submitting