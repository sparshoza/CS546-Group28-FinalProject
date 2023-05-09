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

document.getElementById("graduationYear").setAttribute("min", currentYear)
document.getElementById("graduationYear").setAttribute("max", currentYear + 5)

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

$(document).ready(function () {
  $('#registration-form').submit(function (event) {
    event.preventDefault();

    var firstName = $('#firstNameInput').val().trim();
    var lastName = $('#lastNameInput').val().trim();
    var email = $('#emailAddressInput').val().trim();
    var username = $('#userNameInput').val().trim();
    var graduationYear = $('#graduationYear').val();
    var password = $('#passwordInput').val().trim();
    var confirmPassword = $('#confirmPasswordInput').val().trim();

    if (!firstName.match(/^[A-Za-z]{2,25}$/)) {
      $('#errorFirstName').show();
      return false;
    } else {
      $('#errorFirstName').hide();
    }

    if (!lastName.match(/^[A-Za-z]{2,25}$/)) {
      $('#errorLastName').show();
      return false;
    } else {
      $('#errorLastName').hide();
    }

    if (!email)
    {
      $('#errorEmail').show();
      return false;
    } else {
      $('#errorEmail').hide();
    }
    
    if (!email.match(/^[\w-\.]+@stevens\.edu$/)) {
      $('#errorEmail').show();
      return false;
    } else {
      $('#errorEmail').hide();
    }

    if (!username.match(/^[A-Za-z0-9]{6,15}$/)) {
      $('#errorUsername').show();
      return false;
    } else {
      $('#errorUsername').hide();
    }


    var currentYear = new Date().getFullYear();
    var minYear = currentYear;
    var maxYear = currentYear + 5;
    var graduationYear = $('#graduationYear').val();

    if (graduationYear < minYear || graduationYear > maxYear || isNaN(graduationYear)) {
      $('#errorGraduationYear').show();
      return false;
    } else {
      $('#errorGraduationYear').hide();
    }

    if (!password) {
      $('#errorPassword').show();
      return false;
    } else {
      $('#errorPassword').hide();
    }

    if (!password.match(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,16}$/)) {
      $('#errorPassword').show();
      return false;
    } else {
      $('#errorPassword').hide();
    }

    if (confirmPassword !== password) {
      $('#errorConfirmPassword').show();
      return false;
    } else {
      $('#errorConfirmPassword').hide();
    }
    event.target.submit();
    // $.ajax({
    //   url: $(this).attr('action'),
    //   method: $(this).attr('method'),
    //   data: new FormData(this),
    //   processData: false,
    //   contentType: false,
    //   success: function (response) {
    //     console.log(response);
    //   },
    //   error: function (error) {
    //     console.log(error);
    //   }
    // });
  });
});

$(document).ready(function () {
  $('#login-form').submit(function (event) {
    event.preventDefault();

    var email = $('#emailAddressInput').val().trim();
    var username = $('#userNameInput').val().trim();
    var password = $('#passwordInput').val().trim();
    console.log(email)

    if (!email)
    {
      $('#errorEmail').show();
      return false;
    } else {
      $('#errorEmail').hide();
    }
    
    if (!email.match(/^[\w-\.]+@stevens\.edu$/)) {
      $('#errorEmail').show();
      return false;
    } else {
      $('#errorEmail').hide();
    }

    // if (!username.match(/^[A-Za-z0-9]{6,15}$/)) {
    //   $('#errorUsername').show();
    //   return false;
    // } else {
    //   $('#errorUsername').hide();
    // }


    if (!password) {
      $('#errorPassword').show();
      return false;
    } else {
      $('#errorPassword').hide();
    }

    if (!password.match(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,16}$/)) {
      $('#errorPassword').show();
      return false;
    } else {
      $('#errorPassword').hide();
    }
    event.target.submit();
    // $.ajax({
    //   url: $(this).attr('action'),
    //   method: $(this).attr('method'),
    //   data: new FormData(this),
    //   processData: false,
    //   contentType: false,
    //   success: function (response) {
    //     console.log(response);
    //   },
    //   error: function (error) {
    //     console.log(error);
    //   }
    // });
  });
});