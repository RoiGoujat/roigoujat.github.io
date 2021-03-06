document.addEventListener('DOMContentLoaded', function() {
  function getParameterByName(name) {
    var res = new RegExp(
        // Parameter names always start after a ? or &.
        '[\?&]' +

        // Make sure any [ or ] are escaped in the name.
        name.replace(/\[/g, '\\\[').replace(/\]/g, '\\\]') +

        // Either match a =... or match an empty value.
        // Values can be terminated by an & a # or the end of the string ($).
        '(?:=([^&#]*))?(?:[&#]|$)'
    ).exec(window.location.search);

    return res ?
      (res[1] ? // res[1] will be undefined for a parameter without value.
        decodeURIComponent(res[1].replace(/\+/g, ' ')) : ''
      ) : null;
  }

  // Get the action to complete.
  var mode = getParameterByName('mode');
  // Get the one-time code from the query parameter.
  var actionCode = getParameterByName('oobCode');
  // (Optional) Get the API key from the query parameter.
  var apiKey = getParameterByName('apiKey');
  // (Optional) Get the continue URL from the query parameter if available.
  var continueUrl = getParameterByName('continueUrl');
  // (Optional) Get the language code if available.
  var lang = getParameterByName('lang') || 'en';

  // Configure the Firebase SDK.
  // This is the minimum configuration required for the API to be used.
  var config = {
    'apiKey': apiKey  // This key could also be copied from the web
                      // initialization snippet found in the Firebase console.
  };
  var app = firebase.initializeApp(config);
  var auth = app.auth();

  // Handle the user management action.
  switch (mode) {
    case 'resetPassword':
      // Display reset password handler and UI.
      handleResetPassword(auth, actionCode, continueUrl, lang);
      break;
    case 'verifyEmail':
      // Display email verification handler and UI.
      handleVerifyEmail(auth, actionCode, continueUrl, lang);
      break;
    default:
      // Error: invalid mode.
  }
}, false);

function handleResetPassword(auth, actionCode, continueUrl, lang) {
  // Localize the UI to the selected language as determined by the lang
  // parameter.
  var accountEmail;
  // Verify the password reset code is valid.
  auth.verifyPasswordResetCode(actionCode).then(function(email) {
    var accountEmail = email;

    document.getElementById('resetPassword').style.display = 'block'
    
    let form = document.getElementById('newPasswordForm')

    form.onsubmit = function(event) {
      event.preventDefault()
      if (form.newPassword.value === form.verifyPassword.value) {
        // Save the new password.
        auth.confirmPasswordReset(actionCode, form.newPassword.value).then(function(resp) {
          // Password reset has been confirmed and new password updated.
          document.getElementById('resetPassword').style.display = 'none'
          showSuccess("Your password has been successfully reset!")
        }).catch(function(error) {
          showError(error.message)
          document.getElementById('newPassword').value = ""
          document.getElementById('verifyPassword').value = ""
        });
      } else {
        showError("Two different passwords received.")
        document.getElementById('newPassword').value = ""
        document.getElementById('verifyPassword').value = ""
      }
    }

  }).catch(function(error) {
    // Invalid or expired action code. Ask user to try to reset the password
    // again.
    showError(error.message)
  });
}

function handleVerifyEmail(auth, actionCode, continueUrl, lang) {
  // Localize the UI to the selected language as determined by the lang
  // parameter.
  // Try to apply the email verification code.
  auth.applyActionCode(actionCode).then(function(resp) {
    // Email address has been verified.

    showSuccess("Thank you!\nYour account has been successfully verified.")
  }).catch(function(error) {
    // Code is invalid or expired. Ask the user to verify their email address
    // again.
    showError(error.message)
  });
}

function showSuccess(message) {
  document.getElementById('successMessage').innerText = message
  document.getElementById('successDisplay').style.display = 'block'
}

function showError(errorMessage) {
  document.getElementById('errorMessage').innerText = errorMessage
  document.getElementById('errorDisplay').style.display = 'block'
}