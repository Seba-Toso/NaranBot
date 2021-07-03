require('dotenv').config()
const express = require('express')
const {Telegraf} = require('telegraf')
const axios = require('axios')
const errorHandler = require('./services/errorHandler')
const getPrice = require('./services/getPrice')
const getExchange = require('./services/getExchange')
const checkCrypto = require('./services/checkCrypto')

const {TOKEN} = process.env;

const App = express()
const Naranbot = new Telegraf(TOKEN)
App.use(Naranbot.webhookCallback(TOKEN))

let errorMessage = errorHandler()

Naranbot.start((ctx) => {
    //console.log(ctx);
    const user = ctx.from.first_name
    ctx.replyWithHTML(`
    Hola <b>${user}</b>!
        
Para comenzar te recomiendo que uses alguno de los siguientes comandos para ver las opciones que tenes disponibles:
    <b>/help</b> 
    <b>/naranbothelp</b> 

<b>Algunas cosas para que tengas en cuenta:</b>
    ► Uso la API de Coinbase para mostrarte los datos que me puedas llegar a pedir, si algo no lo encuentro puede que sea porque no está disponible en Coinbase.
    ► Puede pasar que me consultes sobre alguna crypto y aunque trabaje con ella no pueda darte lo que me pidas. F por Coinbase (Sorry not sorry).
    ► Por ahora trabajo con cryptomonedas, aunque puedo decirte el cambio entre divisas.
    ► Cualquier sugerencia es bienvenida y deberías decírsela a mi creador.
    `
    )
})

Naranbot.help((ctx)=>{
    const user = ctx.from.first_name
    ctx.replyWithHTML(
        `Hola ${user}! estos son los comandos que tenés disponibles:
        <b>/start</b>   | Inicia contacto conmigo.
        <b>/help</b>    | Te muestro los comandos disponibles.
        <b>/decime</b>  | Te digo el valor en usd de la crypto que pidas.
        <b>/manejas</b> | Te digo si puedo encontrarte ese activo.
        <b>/cambio</b>  | Te digo la relación de precio entre dos divisas.
        <b>/listame</b> | Te digo todos los activos que manejo.

        <b>/[comando]help</b>  | Te explico más detallado el comando.
        Ejemplo -> /cambiohelp
        `
    )
})

Naranbot.command(['naranbothelp', 'Naranbothelp', 'naranboth', 'Naranboth'],(ctx)=>{
    const user = ctx.from.first_name
    ctx.replyWithHTML(
        `Hola ${user}! estos son los comandos que tenés disponibles:
        <b>/start</b>   | Inicia contacto conmigo.
        <b>/help</b>    | Te muestro los comandos disponibles.
        <b>/decime</b>  | Te digo el valor en usd de la crypto que pidas.
        <b>/manejas</b> | Te digo si puedo encontrarte ese activo.
        <b>/cambio</b>  | Te digo la relación de precio entre dos divisas.
        <b>/listame</b> | Te digo todos los activos que manejo.

        <b>/[comando]help</b>  | Te explico más detallado el comando.
        Ejemplo -> /cambiohelp
        `
    )
})

Naranbot.command(['Manejas', 'manejas', 'Workwith', 'workwith'], (ctx) => {
    const user = ctx.from.first_name
    const message = ctx.message.text.split(' ')
    const currency = message[1]?.toUpperCase() || 'USD'
    const uri = `https://api.coinbase.com/v2/exchange-rates?currency=${currency}`

    checkCrypto(uri)
    .then(res => {
        //console.log(res);
        if(res.status === 400){
            errorMessage = errorHandler(res.status, res.data.errors[0].message, currency)
            return ctx.reply(errorMessage)
        }

        ctx.replyWithHTML(`Si ${user}, manejo <b>${currency}</b>. 
        - Si es una crypto y queres que te diga el valor de usá <b>'/decime' [crypto] [moneda -opcional]</b> 
        - Si es una moneda usá <b>'/cambio' [moneda de origen] [moneda de destino]</b>
        `
        )
    })
    .catch(err => {
        console.log(err);
        errorMessage = errorHandler(500, 'Hay un problema con la API y no puedo conseguirte lo que pediste')
        return ctx.reply(errorMessage)
    })
})

Naranbot.command(['Decime', 'decime', 'get', 'Get'], (ctx)=>{

    const message = ctx.message.text.split(' ')
    const crypto = message[1]?.toUpperCase() || 'BTC'
    const currency = message[2]?.toUpperCase() || 'USD' 
    const uri = `https://api.coinbase.com/v2/prices/${crypto}-${currency}/buy`
    
    //console.log(currency); 

    getPrice(uri)
    .then( res => {
        //console.log(res)

        if(!res.data && res.response.status === 404){
            errorMessage = errorHandler(res.response.status, res.response.data.errors[0].message, crypto)
            return ctx.reply(errorMessage)
        }

        const {amount} = res.data
        return ctx.replyWithHTML(`1 <b>${crypto}</b> -- <b>${amount}</b> ${currency}`)
    })
    .catch(err => {
        console.log(err);
        errorMessage = errorHandler(500, 'Hay un problema con la API y no puedo conseguirte lo que pediste')
        return ctx.reply(errorMessage)
    })
})

Naranbot.command(['Cambio', 'cambio', 'Change', 'change'], (ctx) => {
    const message = ctx.message.text.split(' ')
    const currency1 = message[1]?.toUpperCase()  || 'USD'
    const currency2 = message[2]?.toUpperCase() || 'ARS'
    const uri = `https://api.coinbase.com/v2/exchange-rates?currency=${currency1}`

    getExchange(uri, currency2)
    .then(res => {
        //console.log(res);
        if(res.status === 400){
            errorMessage = errorHandler(res.status, res.data.errors[0].message, currency)
            return ctx.reply(errorMessage)
        }

        ctx.replyWithHTML(`1 <b>${currency1}</b> -- <b>${res}</b> ${currency2}`)
    })
    .catch(err => {
        console.log(err);
        errorMessage = errorHandler(500, 'Hay un problema con la API y no puedo conseguirte lo que pediste')
        return ctx.reply(errorMessage)
    })
})

Naranbot.command(['Listame', 'listame', 'List', 'list'], async (ctx) => {
    const uri = `https://api.coinbase.com/v2/exchange-rates?currency`

    await axios(uri)
    .then(res => {
        //console.log(res);
        if(res.status === 400){
            errorMessage = errorHandler(res.status, res.data.errors[0].message, currency)
            return ctx.reply(errorMessage)
        }
        const {rates} = res.data.data
        let currencyList = Object.keys(rates).sort()
        let formatedList = currencyList.map(rate => `▸ ${rate} \n`).join('')
        ctx.replyWithHTML(`${formatedList}`)
    })
    .catch(err => {
        console.log(err);
        errorMessage = errorHandler(500, 'Hay un problema con la API y no puedo conseguirte lo que pediste')
        return ctx.reply(errorMessage)
    })
})


Naranbot.command(['Cambiohelp', 'cambiohelp', 'Cambioh', 'cambioh'], (ctx) => {
    ctx.replyWithHTML(`El comando cambio te devuelve la relación de precios entre dos monedas:

    Sintaxis:
        '/cambio divisa-1 divisa-2'

    Respuesta:
        '1 <b>divisa-1</b> -- <b>X</b> divisa-2'

    Llamado:
        -El comando puede ser lanzado como '/cambio', '/Cambio', '/change' o '/Change'.
        -Si no recibe divisas, por defecto toma los valores de USD y ARS.
    `)
})

Naranbot.command(['Manejashelp', 'manejashelp', 'Manejash', 'manejash'], (ctx) => {
    ctx.replyWithHTML(`El comando manejas verifica que puedas consultar respecto al activo consultado:

    Sintaxis:
        '/manejas activo'

    Respuesta:
        'Si [nombre del usuario]. 
        - Si es una crypto y queres que te diga el valor de usá <b>'/decime' [crypto] [moneda -opcional]</b> 
        - Si es una moneda usá <b>'/cambio' [moneda de origen] [moneda de destino]</b>
        '

    Llamado:
        -El comando puede ser lanzado como '/manejas', '/Manejas', '/Workwith' o '/workwith'.
        -Si no recibe activo, por defecto toma el valor de USD.
    `)
})

Naranbot.command(['Decimehelp', 'decimehelp', 'Decimeh', 'decimeh'], (ctx) => {
    ctx.replyWithHTML(`El comando decime te devuelve el valor de la crypto consultada. Por defecto lo devuelve en USD, pero se puede brindar un segundo dato para cambiar de divisa:

    Sintaxis:
        '/decime crypto divisa(opcional)'

    Respuesta:
        '1 <b>crypto</b> -- <b>X</b> divisa'

    Llamado:
        -El comando puede ser lanzado como '/decime', '/Decime', '/get' o '/Get'.
        -Si no recibe crypos y/o divisa, por defecto toma los valores de BTC y USD.
    `)
})

Naranbot.command(['Listamehelp', 'listamehelp', 'Listh', 'listh'], (ctx) => {
    ctx.replyWithHTML(`El comando listame te devuelve todos los activos con los que se puede trabajar:

    Sintaxis:
        '/listame'

    Respuesta:
        '
        AED 
        AFN 
        ALL 
        AMD 
        ANG 
        ...
        ...
        '

    Llamado:
        -El comando puede ser lanzado como '/listame', '/Listame', '/list' o '/List'.
    `)
})


//Naranbot.launch()

const PORT = process.env.PORT || 3001

Naranbot.telegram.setWebhook('https://fierce-mountain-87846.herokuapp.com/' + TOKEN)
// Http webhook, for nginx/heroku users.
Naranbot.startWebhook(TOKEN, null, PORT)

App.get('/', (req, res) => {
    res.send('Hello World!')
})
  
App.listen(3000, () => {
    console.log('Example app listening on port 3000!')
})