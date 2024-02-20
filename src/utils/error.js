export const handleError = (message, code) => {
 const error =  new Error(message);
 error.satusCode = code;
 throw error;
}