const axios = require('axios')

const getExchange = async (uri, currency2) => {
    try {
        const response = await axios(uri)
        const {data} = response.data
        //console.log(data);
        const rates = data.rates
        let exchangeValue
        for(const key in rates){
            if(key === currency2){
                exchangeValue = rates[key]
            }
        }
        //console.log(exchangeValue)
        return exchangeValue
    } catch (error) {
        //console.log(error)
        return error.response
    }
}



module.exports = (getExchange)