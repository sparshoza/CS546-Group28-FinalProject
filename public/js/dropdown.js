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
}function showPassword2() {
  var tempPass1 = document.getElementById("confirmPasswordInput");
  if (tempPass1.type === "password") {
    tempPass1.type = "text";
  } else {
    tempPass1.type = "password";
  }
}