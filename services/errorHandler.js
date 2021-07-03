const errorHandler = (status, error, currency) => {
    
    if(status == 400){
        return error === `Invalid currency (${currency})` ?
        'No, fijate si capaz me dijiste mal el nombre.'
        :
        'Otro problema'
    }

    if(status == 404){
        return error === `Invalid base currency` ?
        `No puedo encontrar ${currency}, fijate si me dijiste bien el nombre o si es una crypto.`
        :
        'Otro problema'
    }

    return 'Hubo un problema que supera mis capacidades, el creador tiene que revisar esto'

}


module.exports = (errorHandler)