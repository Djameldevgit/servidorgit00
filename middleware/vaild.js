 
 // Definir las funciones
function validPhone(phone) {
  const re = /^[+]/g;
  return re.test(phone);
}

function validateAccount(account) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|((([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})))$/;
  return re.test(account.toLowerCase());
}


// Exportar las funciones
module.exports = {
  validPhone,
  validateAccount,
};

 
 
